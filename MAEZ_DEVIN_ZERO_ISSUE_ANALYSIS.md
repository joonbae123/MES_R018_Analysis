# 🔍 MAEZ, DEVIN 0% 문제 분석 및 해결 방안

## 📌 문제 상황
- **증상**: MAEZ, DEVIN의 Detailed Work Records는 표시되지만, 상단 KPI 카드가 0 hr, 0%로 표시됨
- **영향**: 메인 페이지에서도 0% 표시, Performance Band: Critical

## 🔎 원인 분석

### 1. 코드 분석 (app.js line 2234-2249)
```javascript
const st = record['Worker S/T'] || 0;  // ⚠️ 만약 이 값이 0이면
const rate = record['Worker Rate(%)'] || 0;  // ⚠️ 이 값도 0이면
const assigned = (st * rate / 100);  // → assigned = 0

aggregated[key]['Worker S/T'] += st;  // → 0 누적
aggregated[key].assignedStandardTime += assigned;  // → 0 누적
```

### 2. 집계 로직
```javascript
// aggregateByWorkerOnly (line 1897-1900)
byWorker[workerName].totalMinutes += item.totalMinutes || 0;  // ⚠️ 0이면
byWorker[workerName].assignedStandardTime += item.assignedStandardTime || 0;  // ⚠️ 0이면

// KPI 계산
const utilizationRate = (worker.totalMinutes / (660 * shiftCount)) * 100;  // → 0%
const efficiencyRate = (worker.assignedStandardTime / shiftTime) * 100;  // → 0%
```

### 3. 문제 원인
**MAEZ, DEVIN의 데이터에 다음 필드가 누락되거나 0:**
- `Worker S/T` (Standard Time) = 0 또는 NULL
- `Worker Rate(%)` = 0 또는 NULL
- 또는 `Worker Act` (작업 시간) = 0

**결과:**
- Efficiency 계산: 0 ÷ 660 × 100 = 0%
- Utilization 계산: 0 ÷ 660 × 100 = 0%

---

## 🛠️ 해결 방안

### 방안 1: 데이터베이스 확인 및 수정 (근본 해결)

**1.1 데이터 확인**
```sql
-- MAEZ, DEVIN 데이터 조회
SELECT 
    worker_name,
    fo_desc,
    working_day,
    worker_st,
    worker_rate_pct,
    worker_act,
    start_datetime,
    end_datetime
FROM raw_data
WHERE worker_name = 'MAEZ, DEVIN'
ORDER BY working_day DESC
LIMIT 10;
```

**1.2 데이터 패턴 확인**
- `worker_st`이 NULL 또는 0인가?
- `worker_rate_pct`이 NULL 또는 0인가?
- `worker_act`이 NULL 또는 0인가?

**1.3 데이터 수정 (필요 시)**
```sql
-- 만약 worker_st가 NULL이지만 다른 필드에서 추정 가능하다면
UPDATE raw_data
SET 
    worker_st = CASE 
        WHEN worker_st IS NULL OR worker_st = 0 THEN [추정값]
        ELSE worker_st
    END,
    worker_rate_pct = CASE 
        WHEN worker_rate_pct IS NULL OR worker_rate_pct = 0 THEN 100
        ELSE worker_rate_pct
    END
WHERE worker_name = 'MAEZ, DEVIN'
AND (worker_st IS NULL OR worker_st = 0 OR worker_rate_pct IS NULL OR worker_rate_pct = 0);
```

---

### 방안 2: Frontend 코드 수정 (임시 대응)

**2.1 Worker Act 기반 Fallback**
```javascript
// app.js line 2228-2249 수정
if (record.validFlag === 1) {
    aggregated[key].totalMinutes += record.workerActMins || 0;
    aggregated[key].validCount += 1;
    validRecords++;
    
    const st = record['Worker S/T'] || 0;
    const rate = record['Worker Rate(%)'] || 0;
    const workerActMins = record.workerActMins || 0;  // ✅ NEW
    
    // ✅ FIX: Fallback logic
    let assigned = (st * rate / 100);
    
    // 만약 S/T가 0이고 Worker Act가 있으면 Act를 사용
    if (assigned === 0 && workerActMins > 0) {
        assigned = workerActMins;  // Fallback to actual work time
        console.warn(`⚠️ No S/T for ${record.workerName} ${record.workingDay} ${record.foDesc3}, using Worker Act: ${workerActMins}`);
    }
    
    aggregated[key]['Worker S/T'] += st;
    aggregated[key].assignedStandardTime += assigned;  // ✅ Fallback applied
    aggregated[key].totalMinutesOriginal += record['Worker Act'] || 0;
}
```

**2.2 Warning 메시지 추가**
```javascript
// KPI 카드에 경고 표시
if (worker.assignedStandardTime === 0 && worker.totalMinutes > 0) {
    console.warn(`⚠️ ${worker.workerName}: Missing S/T data, showing 0% efficiency`);
    // UI에 경고 아이콘 표시 가능
}
```

---

### 방안 3: 동일 케이스 찾기 (전체 점검)

**3.1 0% 작업자 찾기 쿼리**
```sql
-- S/T가 0인 작업자 찾기
SELECT DISTINCT worker_name, COUNT(*) as zero_st_count
FROM raw_data
WHERE (worker_st IS NULL OR worker_st = 0)
GROUP BY worker_name
ORDER BY zero_st_count DESC;
```

**3.2 Frontend에서 감지**
```javascript
// updateReport 함수에 추가
const workersWithZeroST = workerSummary.filter(w => 
    w.assignedStandardTime === 0 && w.validCount > 0
);

if (workersWithZeroST.length > 0) {
    console.warn(`⚠️ ${workersWithZeroST.length} workers with missing S/T data:`, 
        workersWithZeroST.map(w => w.workerName)
    );
    
    // UI에 경고 배너 표시
    showWarningBanner(`${workersWithZeroST.length} workers have missing S/T data. Contact admin.`);
}
```

---

## 🎯 권장 해결 순서

### 단계 1: 데이터 확인 (우선)
```bash
# 프로덕션 D1 데이터베이스 확인
npx wrangler d1 execute mes-r018-analysis-production \
  --command="SELECT worker_name, COUNT(*) as records, 
    SUM(CASE WHEN worker_st IS NULL OR worker_st = 0 THEN 1 ELSE 0 END) as zero_st_count 
    FROM raw_data 
    WHERE worker_name LIKE 'MAEZ%' 
    GROUP BY worker_name;"
```

### 단계 2: 데이터 품질 확인
```sql
-- 전체 데이터 품질 점검
SELECT 
    COUNT(*) as total_records,
    SUM(CASE WHEN worker_st IS NULL OR worker_st = 0 THEN 1 ELSE 0 END) as missing_st,
    SUM(CASE WHEN worker_rate_pct IS NULL OR worker_rate_pct = 0 THEN 1 ELSE 0 END) as missing_rate,
    SUM(CASE WHEN worker_act IS NULL OR worker_act = 0 THEN 1 ELSE 0 END) as missing_act
FROM raw_data;
```

### 단계 3: 코드 수정 (Fallback 로직)
- `app.js` 2234-2249 라인에 Fallback 로직 추가
- Worker Act를 S/T 대체값으로 사용

### 단계 4: 테스트
- MAEZ, DEVIN 데이터로 테스트
- 다른 0% 작업자들도 확인

### 단계 5: 배포
- dist/js/app.js 업데이트
- Cloudflare Pages 배포

---

## 📊 예상 결과

**Before:**
- Total Work Time: 0.0 hr
- Work Rate: 0.0%
- Performance Band: Critical

**After (Fallback 적용 시):**
- Total Work Time: [실제 작업 시간]
- Work Rate: [Worker Act 기반 계산]
- Performance Band: [정상 밴드]

**After (데이터 수정 시):**
- Total Work Time: [정상]
- Work Rate: [S/T 기반 정확한 계산]
- Performance Band: [정상 밴드]

---

## 🚨 주의사항

1. **데이터 무결성**
   - Excel 업로드 시 Worker S/T, Worker Rate(%) 컬럼이 포함되어야 함
   - 누락 시 업로드 경고 표시

2. **Fallback 로직의 한계**
   - Worker Act를 S/T 대체값으로 사용하면 Efficiency 계산이 부정확
   - 100%로 계산될 가능성 (Act = S/T인 경우)

3. **장기 해결책**
   - 데이터 입력 프로세스 개선
   - Excel 템플릿에 필수 컬럼 표시
   - 업로드 시 데이터 검증 강화

---

## 📝 체크리스트

- [ ] MAEZ, DEVIN 데이터베이스 데이터 확인
- [ ] 동일 케이스 (0% 작업자) 전체 리스트 추출
- [ ] 데이터 품질 리포트 생성
- [ ] Fallback 로직 구현 (app.js 수정)
- [ ] 테스트 (로컬 환경)
- [ ] 배포 (프로덕션)
- [ ] 사용자에게 데이터 입력 가이드 제공

---

**다음 단계**: 
1. 데이터베이스에서 MAEZ, DEVIN의 실제 데이터 확인 필요
2. 확인 후 적절한 해결 방안 선택
