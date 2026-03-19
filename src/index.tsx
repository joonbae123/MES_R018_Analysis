import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// 업로드 진행 상황 추적 (메모리)
const uploadProgress = new Map<string, {
  current: number;
  total: number;
  startTime: number;
  status: 'processing' | 'completed' | 'error';
  error?: string;
}>();

// CORS 설정
app.use('/api/*', cors())

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }))

// Root route - serve the main HTML
app.get('/', serveStatic({ path: './public/index.html' }))

// API: 엑셀 데이터 저장 (백그라운드)
app.post('/api/upload', async (c) => {
  try {
    const { env } = c
    const body = await c.req.json()
    
    const { filename, fileSize, rawData, processedData, processMapping, shiftCalendar } = body
    
    console.log('Received upload request:', {
      filename,
      fileSize,
      processedDataCount: processedData?.length,
      processMappingCount: processMapping?.length,
      shiftCalendarCount: shiftCalendar?.length
    })
    
    // 업로드 기록 생성 (진행 상태 포함)
    const uploadResult = await env.DB.prepare(`
      INSERT INTO excel_uploads (filename, file_size, total_records, unique_workers, date_range_start, date_range_end, upload_status, progress_current, progress_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      filename,
      fileSize,
      processedData?.length || 0,
      new Set(processedData?.map((d: any) => d.workerName)).size || 0,
      processedData?.[0]?.workingDay || null,
      processedData?.[processedData.length - 1]?.workingDay || null,
      'processing',
      0,
      processedData?.length || 0
    ).run()
    
    const uploadId = uploadResult.meta.last_row_id as number
    
    // 진행 상황 초기화
    uploadProgress.set(uploadId.toString(), {
      current: 0,
      total: processedData?.length || 0,
      startTime: Date.now(),
      status: 'processing'
    })
    
    // 🚀 즉시 응답 반환 (백그라운드 처리)
    // 실제 데이터 저장은 비동기로 진행
    // CRITICAL: Cloudflare Workers requires waitUntil() for background tasks
    c.executionCtx.waitUntil((async () => {
      try {
        // Raw 데이터 저장 (processedData 사용)
        if (processedData && processedData.length > 0) {
          // D1 Batch API를 사용하여 효율적으로 저장 (최대 200개씩)
          // Batch 크기 증가: 50 → 200 (성능 개선, 30초 제한 대응)
          const batchSize = 200
          
          console.log(`💾 Background insert started: ${processedData.length} records, ${Math.ceil(processedData.length / batchSize)} batches`)
          
          for (let i = 0; i < processedData.length; i += batchSize) {
            const batch = processedData.slice(i, i + batchSize)
            
            // D1 Batch API: 여러 쿼리를 하나의 트랜잭션으로 실행
            const statements = batch.map((record: any) => {
              const foDescValue = record.foDesc2 || record.foDesc || ''
              const workerST = record['Worker S/T'] || 0
              const workerRatePct = record['Worker Rate(%)'] || 0
              const sectionId = record.sectionId || ''
              const rework = record.rework ? 1 : 0
              const woNumber = record['WO#'] || ''
              
              return env.DB.prepare(`
                INSERT INTO raw_data (upload_id, worker_name, fo_desc, fd_desc, start_datetime, end_datetime, worker_act, result_cnt, working_day, working_shift, actual_shift, work_rate, worker_st, worker_rate_pct, section_id, rework, wo_number)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `).bind(
                uploadId,
                record.workerName || '',
                foDescValue,
                record.fdDesc || '',
                record.startDatetime || '',
                record.endDatetime || '',
                record.workerActMins || record.workerAct || 0,
                record.resultCnt || '',
                record.workingDay || '',
                record.workingShift || '',
                record.actualShift || '',
                record.workRate || 0,
                workerST,
                workerRatePct,
                sectionId,
                rework,
                woNumber
              )
            })
            
            // D1 batch() 실행
            await env.DB.batch(statements)
            
            // 진행 상황 업데이트 (DB에 저장)
            await env.DB.prepare(`
              UPDATE excel_uploads 
              SET progress_current = ?
              WHERE id = ?
            `).bind(i + batch.length, uploadId).run()
            
            // 메모리 Map도 업데이트 (optional, for legacy support)
            const progress = uploadProgress.get(uploadId.toString())
            if (progress) {
              progress.current = i + batch.length
            }
            
            if ((i / batchSize) % 20 === 0) {
              console.log(`  📊 Progress: ${i + batch.length} / ${processedData.length} records`)
            }
          }
        }
        
        // 공정 매핑 저장
        if (processMapping && processMapping.length > 0) {
          for (const mapping of processMapping) {
            await env.DB.prepare(`
              INSERT INTO process_mapping (upload_id, fd_desc, fo_desc, fo_desc_2, fo_desc_3, seq)
              VALUES (?, ?, ?, ?, ?, ?)
            `).bind(
              uploadId,
              mapping.fdDesc || null,
              mapping.foDesc || mapping.fdDesc || null,
              mapping.foDesc2 || null,
              mapping.foDesc3 || null,
              mapping.seq || null
            ).run()
          }
        }
        
        // Shift Calendar 저장
        if (shiftCalendar && shiftCalendar.length > 0) {
          for (const shift of shiftCalendar) {
            await env.DB.prepare(`
              INSERT INTO shift_calendar (upload_id, date, day_shift, night_shift)
              VALUES (?, ?, ?, ?)
            `).bind(
              uploadId,
              shift.date || null,
              shift.dayShift || null,
              shift.nightShift || null
            ).run()
          }
        }
        
        // 완료 처리 (DB에 저장)
        await env.DB.prepare(`
          UPDATE excel_uploads 
          SET upload_status = 'completed', progress_current = progress_total
          WHERE id = ?
        `).bind(uploadId).run()
        
        // 메모리 Map도 업데이트 (optional)
        const progress = uploadProgress.get(uploadId.toString())
        if (progress) {
          progress.status = 'completed'
        }
        console.log(`✅ Background insert completed: ${processedData?.length || 0} records`)
        
      } catch (error: any) {
        console.error('Background upload error:', error)
        const progress = uploadProgress.get(uploadId.toString())
        if (progress) {
          progress.status = 'error'
          progress.error = error.message
        }
      }
    })())
    
    return c.json({ 
      success: true, 
      uploadId,
      message: 'Upload started in background',
      totalRecords: processedData?.length || 0
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: 업로드 진행 상황 조회 (DB에서 읽기)
app.get('/api/upload-progress/:id', async (c) => {
  try {
    const { env } = c
    const uploadId = c.req.param('id')
    
    // DB에서 업로드 정보 조회
    const result = await env.DB.prepare(`
      SELECT upload_status, progress_current, progress_total, upload_date, error_message
      FROM excel_uploads
      WHERE id = ?
    `).bind(uploadId).first()
    
    if (!result) {
      return c.json({ 
        success: false, 
        status: 'not_found',
        message: 'Upload not found' 
      }, 404)
    }
    
    const elapsed = Math.floor((Date.now() - new Date(result.upload_date as string).getTime()) / 1000)
    const percentage = (result.progress_total as number) > 0 
      ? Math.round(((result.progress_current as number) / (result.progress_total as number)) * 100) 
      : 0
    
    return c.json({
      success: true,
      uploadId,
      status: result.upload_status,
      current: result.progress_current,
      total: result.progress_total,
      percentage,
      elapsed,
      error: result.error_message
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: 업로드 목록 조회
app.get('/api/uploads', async (c) => {
  try {
    const { env } = c
    
    // Check if DB is available (local dev without D1 binding)
    if (!env.DB) {
      console.log('DB binding not available, returning empty uploads list')
      return c.json({ 
        success: true, 
        uploads: [],
        message: 'Database not available in local development mode. Use Excel upload instead.'
      })
    }
    
    const { results } = await env.DB.prepare(`
      SELECT id, filename, upload_date, file_size, total_records, unique_workers, date_range_start, date_range_end
      FROM excel_uploads
      ORDER BY upload_date DESC
      LIMIT 50
    `).all()
    
    return c.json({ success: true, uploads: results || [] })
  } catch (error: any) {
    console.error('Error fetching uploads:', error)
    // Return empty array instead of 500 error
    return c.json({ 
      success: true,
      uploads: [],
      error: error.message,
      message: 'Database error. Please use Excel file upload instead.'
    })
  }
})

// API: 특정 업로드 데이터 조회 (메타데이터만, raw_data 제외)
app.get('/api/uploads/:id', async (c) => {
  try {
    const { env } = c
    const uploadId = c.req.param('id')
    
    // 업로드 정보
    const upload = await env.DB.prepare(`
      SELECT * FROM excel_uploads WHERE id = ?
    `).bind(uploadId).first()
    
    if (!upload) {
      return c.json({ success: false, error: 'Upload not found' }, 404)
    }
    
    // 공정 매핑
    const { results: processMapping } = await env.DB.prepare(`
      SELECT * FROM process_mapping WHERE upload_id = ?
    `).bind(uploadId).all()
    
    // Shift Calendar
    const { results: shiftCalendar } = await env.DB.prepare(`
      SELECT * FROM shift_calendar WHERE upload_id = ?
    `).bind(uploadId).all()
    
    return c.json({
      success: true,
      upload,
      rawData: [], // 빈 배열로 반환 (별도 API로 요청)
      processMapping,
      shiftCalendar
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: 특정 업로드의 raw_data를 페이지네이션으로 조회
app.get('/api/uploads/:id/raw-data', async (c) => {
  try {
    const { env } = c
    const uploadId = c.req.param('id')
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '1000')
    const offset = (page - 1) * limit
    
    console.log(`📄 Loading raw_data for upload #${uploadId}, page ${page}, limit ${limit}`)
    
    // 전체 레코드 수
    const countResult = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM raw_data WHERE upload_id = ?
    `).bind(uploadId).first()
    
    // 페이지네이션된 데이터
    const { results: rawData } = await env.DB.prepare(`
      SELECT * FROM raw_data WHERE upload_id = ? LIMIT ? OFFSET ?
    `).bind(uploadId, limit, offset).all()
    
    const total = countResult?.total || 0
    const totalPages = Math.ceil(total / limit)
    
    console.log(`✅ Loaded ${rawData.length} records (page ${page}/${totalPages})`)
    
    return c.json({
      success: true,
      rawData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    })
  } catch (error: any) {
    console.error('Raw data load error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: 업로드 삭제
app.delete('/api/uploads/:id', async (c) => {
  try {
    const { env } = c
    const uploadId = c.req.param('id')
    
    // 업로드 정보 확인
    const upload = await env.DB.prepare(`
      SELECT * FROM excel_uploads WHERE id = ?
    `).bind(uploadId).first()
    
    if (!upload) {
      return c.json({ success: false, error: 'Upload not found' }, 404)
    }
    
    // 관련 데이터 삭제 (순서 중요: 외래 키 제약 고려)
    // 1. raw_data 삭제
    const rawDataResult = await env.DB.prepare(`
      DELETE FROM raw_data WHERE upload_id = ?
    `).bind(uploadId).run()
    
    // 2. process_mapping 삭제
    const mappingResult = await env.DB.prepare(`
      DELETE FROM process_mapping WHERE upload_id = ?
    `).bind(uploadId).run()
    
    // 3. shift_calendar 삭제
    const calendarResult = await env.DB.prepare(`
      DELETE FROM shift_calendar WHERE upload_id = ?
    `).bind(uploadId).run()
    
    // 4. excel_uploads 삭제
    const uploadResult = await env.DB.prepare(`
      DELETE FROM excel_uploads WHERE id = ?
    `).bind(uploadId).run()
    
    return c.json({
      success: true,
      message: `Deleted upload #${uploadId}: ${upload.filename}`,
      deleted: {
        rawData: rawDataResult.meta.changes,
        processMapping: mappingResult.meta.changes,
        shiftCalendar: calendarResult.meta.changes,
        upload: uploadResult.meta.changes
      }
    })
  } catch (error: any) {
    console.error('Delete error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: Process Mapping 조회 (특정 업로드)
app.get('/api/uploads/:id/process-mapping', async (c) => {
  try {
    const { env } = c
    const uploadId = c.req.param('id')
    
    const { results: mappings } = await env.DB.prepare(`
      SELECT * FROM process_mapping 
      WHERE upload_id = ? 
      ORDER BY fo_desc_2, seq
    `).bind(uploadId).all()
    
    return c.json({
      success: true,
      mappings
    })
  } catch (error: any) {
    console.error('Process mapping load error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: 모든 Process Mapping 조회 (최신 업로드 기준)
app.get('/api/process-mapping', async (c) => {
  try {
    const { env } = c
    
    // 최신 업로드 ID 가져오기
    const latestUpload = await env.DB.prepare(`
      SELECT id FROM excel_uploads 
      ORDER BY upload_date DESC 
      LIMIT 1
    `).first()
    
    if (!latestUpload) {
      return c.json({
        success: true,
        mappings: [],
        message: 'No uploads found'
      })
    }
    
    const { results: mappings } = await env.DB.prepare(`
      SELECT * FROM process_mapping 
      WHERE upload_id = ? 
      ORDER BY fo_desc_2, seq
    `).bind(latestUpload.id).all()
    
    return c.json({
      success: true,
      uploadId: latestUpload.id,
      mappings
    })
  } catch (error: any) {
    console.error('Process mapping load error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: Process Mapping 추가/수정
app.post('/api/process-mapping', async (c) => {
  try {
    const { env } = c
    const { uploadId, fd_desc, fo_desc, fo_desc_2, fo_desc_3, seq } = await c.req.json()
    
    // 기존 매핑 확인
    const existing = await env.DB.prepare(`
      SELECT id FROM process_mapping 
      WHERE upload_id = ? AND fd_desc = ? AND fo_desc = ?
    `).bind(uploadId, fd_desc, fo_desc).first()
    
    if (existing) {
      // 수정
      await env.DB.prepare(`
        UPDATE process_mapping 
        SET fo_desc_2 = ?, fo_desc_3 = ?, seq = ?
        WHERE id = ?
      `).bind(fo_desc_2, fo_desc_3, seq, existing.id).run()
      
      return c.json({
        success: true,
        message: 'Mapping updated',
        id: existing.id
      })
    } else {
      // 추가
      const result = await env.DB.prepare(`
        INSERT INTO process_mapping (upload_id, fd_desc, fo_desc, fo_desc_2, fo_desc_3, seq)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(uploadId, fd_desc, fo_desc, fo_desc_2, fo_desc_3, seq).run()
      
      return c.json({
        success: true,
        message: 'Mapping added',
        id: result.meta.last_row_id
      })
    }
  } catch (error: any) {
    console.error('Process mapping save error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: Process Mapping 삭제
app.delete('/api/process-mapping/:id', async (c) => {
  try {
    const { env } = c
    const mappingId = c.req.param('id')
    
    await env.DB.prepare(`
      DELETE FROM process_mapping WHERE id = ?
    `).bind(mappingId).run()
    
    return c.json({
      success: true,
      message: 'Mapping deleted'
    })
  } catch (error: any) {
    console.error('Process mapping delete error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ==========================================
// Scorecard APIs
// ==========================================

// Helper: Calculate grade from score
function getGrade(score: number): string {
  if (score >= 90) return 'S'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  return 'D'
}

// API: 작업자 리스트 조회
app.get('/api/scorecard/workers', async (c) => {
  try {
    const { env } = c
    const uploadId = c.req.query('uploadId')
    const processFilter = c.req.query('process') || ''
    const gradeFilter = c.req.query('grade') || ''
    
    if (!uploadId) {
      return c.json({ success: false, error: 'uploadId is required' }, 400)
    }
    
    // 작업자별 집계 (주 공정, 작업 건수, 점수)
    let query = `
      SELECT 
        worker_name as name,
        fo_desc as main_process,
        COUNT(*) as work_count,
        ROUND((SUM(worker_act) * 100.0 / SUM(CASE 
          WHEN working_shift = 'Day' THEN 660
          WHEN working_shift = 'Night' THEN 600
          ELSE 660
        END) * 0.5) + 
        (SUM(worker_st) * 100.0 / SUM(worker_act) * 0.5), 1) as score,
        ROUND(SUM(worker_act) * 100.0 / SUM(CASE 
          WHEN working_shift = 'Day' THEN 660
          WHEN working_shift = 'Night' THEN 600
          ELSE 660
        END), 1) as utilization,
        ROUND(SUM(worker_st) * 100.0 / SUM(worker_act), 1) as efficiency
      FROM raw_data
      WHERE upload_id = ?
    `
    
    const params: any[] = [uploadId]
    
    if (processFilter) {
      query += ` AND fo_desc = ?`
      params.push(processFilter)
    }
    
    query += `
      GROUP BY worker_name, fo_desc
      HAVING work_count >= 5
      ORDER BY score DESC
    `
    
    const { results: workers } = await env.DB.prepare(query).bind(...params).all()
    
    // 등급 추가 및 필터링
    let workersWithGrade = workers.map((w: any) => ({
      ...w,
      grade: getGrade(w.score)
    }))
    
    if (gradeFilter) {
      workersWithGrade = workersWithGrade.filter((w: any) => w.grade === gradeFilter)
    }
    
    return c.json({
      success: true,
      workers: workersWithGrade
    })
  } catch (error: any) {
    console.error('Workers list error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: 작업자 개별 성적표
app.get('/api/scorecard/worker/:name', async (c) => {
  try {
    const { env } = c
    const name = c.req.param('name')
    const uploadId = c.req.query('uploadId')
    const days = parseInt(c.req.query('days') || '30')
    
    if (!uploadId) {
      return c.json({ success: false, error: 'uploadId is required' }, 400)
    }
    
    // 1. 기본 통계
    const stats = await env.DB.prepare(`
      SELECT 
        COUNT(DISTINCT working_day) as work_days,
        COUNT(*) as total_records,
        SUM(worker_act) as total_work_time,
        SUM(CASE 
          WHEN working_shift = 'Day' THEN 660
          WHEN working_shift = 'Night' THEN 600
          ELSE 660
        END) as total_shift_time,
        SUM(worker_st) as total_st,
        SUM(worker_act) as total_actual_time,
        MIN(working_day) as start_date,
        MAX(working_day) as end_date
      FROM raw_data
      WHERE upload_id = ? AND worker_name = ?
        AND working_day >= date('now', '-' || ? || ' days')
    `).bind(uploadId, name, days).first()
    
    if (!stats || stats.total_records === 0) {
      return c.json({ success: false, error: 'No data found for this worker' }, 404)
    }
    
    const utilization = parseFloat(((stats.total_work_time / stats.total_shift_time) * 100).toFixed(1))
    const efficiency = parseFloat(((stats.total_st / stats.total_actual_time) * 100).toFixed(1))
    const score = parseFloat(((utilization * 0.5) + (efficiency * 0.5)).toFixed(1))
    const grade = getGrade(score)
    
    // 2. 일별 트렌드
    const { results: trend } = await env.DB.prepare(`
      SELECT 
        working_day as date,
        ROUND(SUM(worker_act) * 100.0 / SUM(CASE 
          WHEN working_shift = 'Day' THEN 660
          WHEN working_shift = 'Night' THEN 600
          ELSE 660
        END), 1) as utilization,
        ROUND(SUM(worker_st) * 100.0 / SUM(worker_act), 1) as efficiency
      FROM raw_data
      WHERE upload_id = ? AND worker_name = ?
        AND working_day >= date('now', '-' || ? || ' days')
      GROUP BY working_day
      ORDER BY working_day
    `).bind(uploadId, name, days).all()
    
    // 3. 시프트 분포
    const { results: shiftDist } = await env.DB.prepare(`
      SELECT 
        working_shift as shift, 
        COUNT(*) as count
      FROM raw_data
      WHERE upload_id = ? AND worker_name = ?
      GROUP BY working_shift
    `).bind(uploadId, name).all()
    
    // 4. 공정 분포
    const { results: processDist } = await env.DB.prepare(`
      SELECT 
        fo_desc, 
        COUNT(*) as count
      FROM raw_data
      WHERE upload_id = ? AND worker_name = ?
      GROUP BY fo_desc
      ORDER BY count DESC
      LIMIT 5
    `).bind(uploadId, name).all()
    
    // 5. 최근 작업 기록
    const { results: recentWorks } = await env.DB.prepare(`
      SELECT 
        working_day as date,
        fo_desc,
        working_shift as shift,
        worker_act as work_time,
        CASE 
          WHEN working_shift = 'Day' THEN 660
          WHEN working_shift = 'Night' THEN 600
          ELSE 660
        END as shift_time,
        worker_st as st,
        ROUND(worker_act * 100.0 / CASE 
          WHEN working_shift = 'Day' THEN 660
          WHEN working_shift = 'Night' THEN 600
          ELSE 660
        END, 1) as util_rate,
        ROUND(worker_st * 100.0 / worker_act, 1) as eff_rate,
        section_id,
        rework
      FROM raw_data
      WHERE upload_id = ? AND worker_name = ?
      ORDER BY working_day DESC
      LIMIT 20
    `).bind(uploadId, name).all()
    
    // 6. 전체 순위 계산
    const ranking = await env.DB.prepare(`
      WITH worker_scores AS (
        SELECT 
          worker_name,
          ROUND((SUM(worker_act) * 100.0 / SUM(CASE 
            WHEN working_shift = 'Day' THEN 660
            WHEN working_shift = 'Night' THEN 600
            ELSE 660
          END) * 0.5) + 
          (SUM(worker_st) * 100.0 / SUM(worker_act) * 0.5), 1) as score
        FROM raw_data
        WHERE upload_id = ?
        GROUP BY worker_name
      )
      SELECT 
        COUNT(*) as total_workers,
        SUM(CASE WHEN score > ? THEN 1 ELSE 0 END) as better_count
      FROM worker_scores
    `).bind(uploadId, score).first()
    
    const rank = (ranking?.better_count || 0) + 1
    const percentile = parseFloat((((ranking?.better_count || 0) / (ranking?.total_workers || 1)) * 100).toFixed(1))
    
    // 7. 주 작업 공정
    const mainProcess = processDist[0]?.fo_desc || 'N/A'
    
    // 8. 간단한 인사이트 생성
    const insights = generateSimpleInsights(trend, shiftDist, recentWorks)
    
    return c.json({
      success: true,
      name,
      uploadId,
      period: {
        days,
        start: stats.start_date,
        end: stats.end_date
      },
      header: {
        mainProcess,
        totalWorks: stats.total_records,
        score,
        grade,
        utilization,
        efficiency,
        ranking: {
          rank,
          total: ranking?.total_workers || 0,
          percentile
        }
      },
      trend,
      distribution: {
        shift: shiftDist,
        process: processDist
      },
      recentWorks,
      insights
    })
  } catch (error: any) {
    console.error('Worker card error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Helper: 인사이트 생성
function generateSimpleInsights(trend: any[], shiftDist: any[], recentWorks: any[]) {
  const insights = {
    strengths: [] as string[],
    warnings: [] as string[],
    improvements: [] as string[],
    recommendations: [] as string[]
  }
  
  // 트렌드 분석 (최근 7일 vs 이전 7일)
  if (trend.length >= 14) {
    const recent7 = trend.slice(-7)
    const prev7 = trend.slice(-14, -7)
    const recentAvg = recent7.reduce((sum: number, d: any) => sum + d.efficiency, 0) / 7
    const prevAvg = prev7.reduce((sum: number, d: any) => sum + d.efficiency, 0) / 7
    
    if (recentAvg > prevAvg * 1.05) {
      insights.improvements.push(`지난 주 대비 효율 ${((recentAvg - prevAvg) / prevAvg * 100).toFixed(1)}% 상승`)
    }
  }
  
  // 시프트별 패턴
  const dayWorks = recentWorks.filter((w: any) => w.shift === 'Day')
  const nightWorks = recentWorks.filter((w: any) => w.shift === 'Night')
  
  if (dayWorks.length > 0 && nightWorks.length > 0) {
    const dayAvg = dayWorks.reduce((sum: number, w: any) => sum + w.eff_rate, 0) / dayWorks.length
    const nightAvg = nightWorks.reduce((sum: number, w: any) => sum + w.eff_rate, 0) / nightWorks.length
    
    if (dayAvg > nightAvg * 1.1) {
      insights.warnings.push(`Night 시프트 시 효율 ${((dayAvg - nightAvg) / nightAvg * 100).toFixed(0)}% 하락`)
      insights.recommendations.push('Night 시프트 효율 개선 교육 고려')
    } else if (dayAvg > 85) {
      insights.strengths.push(`Day 시프트 평균 대비 높은 효율 (${dayAvg.toFixed(1)}%)`)
    }
  }
  
  // 재작업 체크
  const reworkCount = recentWorks.filter((w: any) => w.rework === 1).length
  if (reworkCount > 0) {
    insights.warnings.push(`최근 20건 중 재작업 ${reworkCount}회 발생`)
  }
  
  return insights
}

export default app
