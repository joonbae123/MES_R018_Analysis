# IPR - Individual Performance Report & Dashboard 📊

**CS WIND 현장 생산성 분석 및 리포트 웹 애플리케이션**

## 🌐 배포 URL

### 프로덕션
- **메인 URL**: https://mes-r018-analysis-5bz.pages.dev
- **GitHub**: https://github.com/joonbae123/MES_R018_Analysis
- **최신 버전**: v4.3.6 (2026-03-18)
- **최근 수정**: Rework Count 및 Section ID 표시 버그 수정, 프로덕션 데이터베이스 마이그레이션 적용 완료

---

## 📋 목차

1. [프로젝트 개요](#-프로젝트-개요)
2. [핵심 기능](#-핵심-기능)
3. [KPI 정의 및 계산식](#-kpi-정의-및-계산식)
4. [데이터 구조](#️-데이터-구조)
5. [Process Mapping 시스템](#-process-mapping-시스템)
6. [API 엔드포인트](#-api-엔드포인트)
7. [기술 스택](#️-기술-스택)
8. [로컬 개발 가이드](#-로컬-개발-가이드)
9. [배포 가이드](#-배포-가이드)
10. [사용 가이드](#-사용-가이드)
11. [알려진 이슈](#-알려진-이슈)
12. [개발 히스토리](#-개발-히스토리)

---

## 🎯 프로젝트 개요

IPR (Individual Performance Report)는 제조 실행 시스템(MES)의 작업자별 생산 데이터를 분석하고, 직관적인 대시보드로 성과를 시각화하는 웹 애플리케이션입니다.

### 현재 상태
- **베타 버전**: Shop floor에서 시범 운영 중
- **데이터 소스**: MES R018 시스템 Raw 데이터 (Excel 업로드 방식)
- **정식 버전 개발 예정**: MES API 직접 연동을 통한 실시간 데이터 조회

### 핵심 목표
- **작업자 개인별 생산성 추적**: 시간 활용도 및 작업 효율 측정
- **공정별 성과 분석**: FO Desc 3단계 계층 구조로 공정 분류
- **시프트별 비교**: Day/Night 시프트 간 성과 비교
- **데이터 기반 의사결정**: 통계적 이상치 감지 및 성과 밴드 분류

---

## ✨ 핵심 기능

### 🔥 **NEW! Dashboard 페이지 (v4.0.0+)**
- ✅ **AI Insights & Warnings**: 6가지 자동 경고 (저효율, 저가동, 격차, 공정 편중, 샘플 부족)
- ✅ **KPI Trend Overview**: Daily/Weekly 토글, 프로세스별 드릴다운 모달
- ✅ **Process Performance Ranking**: Top 5 / Bottom 5 프로세스 비교
- ✅ **Shift Performance Comparison (v4.3.0)**: BT/WT/IM 그룹별 Shift A/B/C/D 성과 비교 테이블
  - 펼치기/접기 기능, 기간 선택 (7d/14d/30d/전체), 천단위 구분자 표시
  - 컬럼: Workers, Shift Time, Work Time, Utilization (%), Standard Time, Efficiency (%)
- ✅ **Distribution & Outliers**: 가동률/효율 분포 히스토그램 (범위 클릭 시 작업자 목록 모달)

### 1. 데이터 업로드 & 저장
- ✅ **Excel 파일 자동 파싱**: Raw 시트에서 작업 데이터 추출
- ✅ **Cloudflare D1 저장**: 영구 데이터베이스 저장 및 불러오기 (프로덕션 환경 활성화)
- ✅ **백그라운드 업로드**: 상단 미니바로 업로드 상태 표시, 논블로킹 UI
- ✅ **업로드 제한**: 최대 50,000 레코드 (배치 크기 200, 30초 타임아웃 내 처리)
- ✅ **자동 Process Mapping**: 93개 하드코딩 매핑 규칙 자동 적용
- ✅ **중복 제거 & 검증**: 시간 겹침 제거 (13,000+ 분 제거 케이스 처리)
- ✅ **자동 완료 감지**: 추정 시간 기반 자동 완료 + API 폴링 백업

### 2. 두 가지 성과 지표 시스템
#### ⏱️ Time Utilization Rate (시간 활용도)
- **정의**: 실제 작업 시간이 총 시프트 시간 중 몇 %인지 측정
- **목적**: 작업자가 할당된 시간을 얼마나 활용했는지 평가
- **계산식**: `(Total Work Time ÷ Total Shift Time) × 100`

#### ⚡ Work Efficiency Rate (작업 효율)
- **정의**: 표준 시간(S/T) 대비 실제 소요 시간 비율
- **목적**: 작업 속도 및 숙련도 평가
- **계산식**: `(Total Adjusted S/T ÷ Total Actual Time) × 100`
- **Outlier Filter**: 1000% 이상 비정상 데이터 제외 (기본값)

### 3. 고급 필터링 시스템
- 📅 **날짜 필터**: 일별(Day)/주별(Week) 선택
- 🌓 **시프트 필터**: Day/Night/All
- 🏭 **공정 필터**: FO Desc (L1) → FO Desc 2 (L2) → FO Desc 3 (L3) 계층 구조
- 👤 **작업자 필터**: 다중 선택 가능
- 🔄 **실시간 토글**: Utilization ⇄ Efficiency 전환

### 4. 시각화 & 리포트
- 📊 **4개 KPI 카드**: 총 작업자 수, 총 시프트 시간, 총 작업/S/T 시간, 평균 Rate
- 🍩 **Performance Band Donut Chart**: 5단계 밴드 분포
  - Excellent (≥80%), Normal (50-80%), Poor (30-50%), Critical (<30%)
- 📈 **Process Performance Bar Chart**: 공정별 성과 비교 (상위 30개)
- 📋 **Pivot Report**: 날짜별 × 공정별 크로스탭 테이블
- 📄 **Worker Detail Modal**: 작업자별 시간 분포, 이력, 통계

### 5. Process Mapping 탭
- 📝 **매핑 규칙 관리**: FD Desc → FO Desc 2/3 + Seq 관리
- 🔍 **정렬 기능**: 컬럼별 오름차순/내림차순
- 📊 **93개 하드코딩 규칙**: Upload 24 기준 자동 적용

---

## 📊 KPI 정의 및 계산식

### 1. Time Utilization Mode

**KPI Cards:**
```
┌─────────────┬──────────────────┬──────────────────┬────────────────────┐
│ Total       │ Total Shift Time │ Total Work Time  │ Avg Utilization    │
│ Workers     │ (Workers×660min) │ (Actual Work)    │ Rate               │
└─────────────┴──────────────────┴──────────────────┴────────────────────┘
```

**계산식:**
- **Total Shift Time** = `Σ (각 작업자별 660분 × 근무 일수)`
- **Total Work Time** = `Σ (Job On → Job Off 실제 작업 시간, 겹침 제거)`
- **Average Utilization Rate** = `(Total Work Time ÷ Total Shift Time) × 100`

**성과 밴드:**
- **Excellent**: ≥80%
- **Normal**: 50% ~ <80%
- **Poor**: 30% ~ <50%
- **At-Risk**: <30%

---

### 2. Work Efficiency Mode

**KPI Cards:**
```
┌─────────────┬──────────────────┬──────────────────┬────────────────────┐
│ Total       │ Total Adjusted   │ Total Actual     │ Avg Efficiency     │
│ Workers     │ S/T (Assigned)   │ Time             │ Rate               │
└─────────────┴──────────────────┴──────────────────┴────────────────────┘
                    [Outlier Threshold: 1000% ▼ Apply]
```

**계산식:**
- **Total Adjusted S/T** = `Σ (Worker S/T × Result Cnt, Outlier 제외)`
- **Total Actual Time** = `Σ (Worker Act 실제 소요 시간)`
- **Average Efficiency Rate** = `(Total Adjusted S/T ÷ Total Actual Time) × 100`

**Outlier Threshold:**
- **기본값**: 1000% (드롭다운에서 조정 가능)
- **목적**: 비정상적으로 높은 효율(데이터 오류 가능성) 제외
- **적용**: Efficiency 모드에서만 표시

**성과 밴드:**
- **Excellent**: ≥80%
- **Normal**: 50% ~ <80%
- **Poor**: 30% ~ <50%
- **At-Risk**: <30%

---

## 🗄️ 데이터 구조

### Cloudflare D1 Database Schema

#### `excel_uploads` - 업로드 기록
```sql
CREATE TABLE excel_uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  file_size INTEGER,
  total_records INTEGER,
  unique_workers INTEGER,
  date_range_start TEXT,
  date_range_end TEXT,
  upload_status TEXT DEFAULT 'processing',  -- 'processing', 'completed', 'error'
  progress_current INTEGER DEFAULT 0,
  progress_total INTEGER DEFAULT 0,
  error_message TEXT
);
```

#### `raw_data` - 작업 원본 데이터
```sql
CREATE TABLE raw_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  upload_id INTEGER NOT NULL,
  worker_name TEXT NOT NULL,
  fo_desc TEXT,           -- FO Desc (L1)
  fd_desc TEXT,           -- FD Desc
  start_datetime TEXT,
  end_datetime TEXT,
  worker_act INTEGER,     -- 실제 작업 시간 (분)
  result_cnt INTEGER,     -- 작업 결과 수량
  valid_flag INTEGER DEFAULT 1,
  working_day TEXT,
  working_shift TEXT,     -- 'Day' or 'Night'
  actual_shift TEXT,
  work_rate REAL,
  worker_st INTEGER,      -- Worker Standard Time
  worker_rate_pct REAL,   -- Worker Rate (%)
  section_id TEXT DEFAULT '',     -- Section ID (Skirt/Section 번호)
  rework INTEGER DEFAULT 0,       -- Rework 플래그 (0: 정상, 1: 재작업)
  wo_number TEXT DEFAULT '',      -- Work Order 번호
  FOREIGN KEY (upload_id) REFERENCES excel_uploads(id)
);
```

#### `process_mapping` - 공정 매핑 규칙
```sql
CREATE TABLE process_mapping (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  upload_id INTEGER NOT NULL,
  fd_desc TEXT NOT NULL,     -- FD Desc (원본)
  fo_desc TEXT NOT NULL,     -- FO Desc (L1)
  fo_desc_2 TEXT,            -- FO Desc 2 (L2, Category)
  fo_desc_3 TEXT,            -- FO Desc 3 (L3, Sub-process)
  seq INTEGER,               -- 순서
  FOREIGN KEY (upload_id) REFERENCES excel_uploads(id)
);
```

#### `shift_calendar` - 시프트 캘린더
```sql
CREATE TABLE shift_calendar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  upload_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  day_shift TEXT,
  night_shift TEXT,
  FOREIGN KEY (upload_id) REFERENCES excel_uploads(id)
);
```

---

## 🔄 Process Mapping 시스템

### 개요
**FO Desc (공정명)**을 3단계 계층으로 분류:
1. **FO Desc (L1)**: 원본 공정명 (예: `Bevel`, `Cut`, `Blasting`)
2. **FO Desc 2 (L2)**: 카테고리 (예: `BT Process`, `WT`, `IM QC`)
3. **FO Desc 3 (L3)**: 세부 공정 (예: `Bevel`, `FU`, `CS`)

### 하드코딩된 매핑 규칙 (93개)
**Upload 24 기준 자동 생성**

**카테고리 분포:**
- **BT Process**: 43개 (Cut, Bevel, Bend, FU-*, CSO-*, CSI-*)
- **BT Complete**: 12개 (Fitup Bracket, Flange Paint, VT/MT Repair, etc.)
- **WT**: 12개 (Blasting, Metallizing, Wash, Paint1/2, etc.)
- **IM QC**: 11개 (Final IM Inspection, QC VT1, QC UT, etc.)
- **DS**: 5개 (DS-CUT, DS-BEV, DS-BEN, DS-LS, DS-FU)
- **IM**: 4개 (IM Pre-assembly Mounting, Ring on/off, Ovality Repair)
- **WT QC**: 4개 (Final WT Inspection, Paint1 Inspection, etc.)
- **BT QC**: 2개 (Final BT Inspection, Blasting Inspection)

### 자동 매핑 로직
1. **Excel 파일에 Mapping 시트 있음** → DB에 저장 & 사용
2. **Excel 파일에 Mapping 시트 없음** → `DEFAULT_PROCESS_MAPPING` 하드코딩 규칙 자동 적용

**코드 위치:** `public/js/app.js` (Line 20-112)

---

### Dashboard 그룹 분류 기준 (v4.3.0+)

**Shift Performance Comparison 테이블**에서 사용하는 3대 그룹 분류:

#### 🔵 **BT 그룹** (Body Tower - 본체 제작)
- **포함 카테고리**: BT Process, BT Complete, BT QC
- **지원 Shift**: A, B, C, D
- **주요 공정**: Cut, Bevel, Bend, FU (Fitup), CSO/CSI (Corner Seam), Blasting Inspection, Final BT Inspection

#### 🟢 **WT 그룹** (Wind Tower - 표면 처리)
- **포함 카테고리**: WT, WT QC
- **지원 Shift**: A, B, C, D
- **주요 공정**: Blasting, Metallizing, Wash, Paint1/2, Final WT Inspection

#### 🟣 **IM 그룹** (Inner Material - 내부 자재)
- **포함 카테고리**: IM, IM QC
- **지원 Shift**: A, B, C
- **주요 공정**: IM Pre-assembly Mounting, Ring on/off, Ovality Repair, Final IM Inspection

**참고:**
- DS (Door & Stairs) 카테고리는 현재 그룹에 포함되지 않음
- 각 그룹은 `foDesc2` 필드 기준으로 필터링됨
- 코드 위치: `public/js/app.js` (refreshShiftComparison 함수)

---

## 🚀 API 엔드포인트

### POST `/api/upload`
Excel 데이터를 데이터베이스에 저장

**Request Body:**
```json
{
  "filename": "R018Worker_2026-02-27.xlsx",
  "fileSize": 6343038,
  "rawData": [...],
  "processedData": [...],
  "processMapping": [...],
  "shiftCalendar": [...]
}
```

**Response:**
```json
{
  "success": true,
  "uploadId": 47,
  "status": "completed",
  "message": "Data uploaded successfully"
}
```

---

### GET `/api/uploads`
최근 업로드 목록 조회 (최대 50개)

**Response:**
```json
{
  "success": true,
  "uploads": [
    {
      "id": 47,
      "filename": "R018Worker_2026-02-27T20-22-24-262_by_1001435.xlsx",
      "upload_date": "2026-02-28 01:49:50",
      "file_size": 6343038,
      "total_records": 32200,
      "unique_workers": 538,
      "date_range_start": "2026-02-09",
      "date_range_end": "2026-02-27"
    }
  ]
}
```

---

### GET `/api/uploads/:id`
특정 업로드 데이터 조회

**Response:**
```json
{
  "success": true,
  "upload": {...},
  "processMapping": [...],
  "shiftCalendar": [...]
}
```

---

### GET `/api/uploads/:id/raw-data`
특정 업로드의 raw_data 페이지네이션 조회

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 개수 (기본값: 1000)

---

### GET `/api/uploads/:id/process-mapping`
특정 업로드의 Process Mapping 조회

---

### GET `/api/process-mapping`
최신 업로드의 Process Mapping 조회

---

### POST `/api/process-mapping`
Process Mapping 추가/수정

**Request Body:**
```json
{
  "uploadId": 47,
  "fd_desc": "Bevel",
  "fo_desc": "Bevel",
  "fo_desc_2": "BT Process",
  "fo_desc_3": "Bevel",
  "seq": 3
}
```

---

### DELETE `/api/process-mapping/:id`
Process Mapping 삭제

---

### DELETE `/api/uploads/:id`
업로드 데이터 삭제 (관련 raw_data, process_mapping, shift_calendar 모두 삭제)

---

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Backend** | Hono Framework v4.0 (TypeScript) |
| **Database** | Cloudflare D1 (SQLite) |
| **Deployment** | Cloudflare Pages |
| **UI Framework** | Tailwind CSS 3.4 (CDN) |
| **Charts** | Chart.js |
| **Excel Parsing** | SheetJS (xlsx.js) v0.18.5 |
| **Icons** | Font Awesome 6.4.0 |

---

## 💻 로컬 개발 가이드

### 1. 저장소 클론
```bash
git clone https://github.com/joonbae123/MES_R018_Analysis.git
cd MES_R018_Analysis
```

### 2. 의존성 설치
```bash
npm install
```

### 3. D1 데이터베이스 설정
```bash
# 로컬 D1 데이터베이스 마이그레이션
npm run db:migrate:local

# (Optional) 테스트 데이터 시딩
npm run db:seed
```

### 4. 개발 서버 시작
```bash
# 빌드
npm run build

# PM2로 Wrangler Pages Dev 서버 시작
npm run dev:sandbox
# 또는
pm2 start ecosystem.config.cjs
```

### 5. 서비스 확인
```bash
# 서비스 상태 확인
pm2 list

# 로그 확인 (non-blocking)
pm2 logs webapp --nostream

# 서비스 재시작
fuser -k 3000/tcp 2>/dev/null || true
pm2 restart webapp

# 서비스 중지
pm2 delete webapp
```

### 6. 테스트
```bash
curl http://localhost:3000
```

---

## 📦 배포 가이드

### 1. Cloudflare API 키 설정
```bash
# setup_cloudflare_api_key 도구 호출 (AI Assistant가 제공)
# 실패 시: Genspark Deploy 탭에서 API 키 설정
```

### 2. 프로덕션 D1 마이그레이션 (최초 배포 시)
```bash
npm run db:migrate:prod
```

### 3. 프로젝트 빌드
```bash
npm run build
```

### 4. Cloudflare Pages 배포
```bash
# 프로덕션 배포
npm run deploy

# 또는 직접 wrangler 사용
npx wrangler pages deploy dist --project-name mes-r018-analysis
```

### 5. 배포 확인
- **Production URL**: https://mes-r018-analysis.pages.dev
- **Latest Preview**: https://[commit-hash].mes-r018-analysis.pages.dev

---

## 📖 사용 가이드

### 🔥 **NEW! Dashboard 탭 사용법**
1. **Dashboard** 탭 클릭
2. **AI Insights & Warnings** 섹션에서 자동 경고 확인
3. **KPI Trend Overview**: Daily/Weekly 버튼으로 뷰 전환
   - 차트 클릭 → 프로세스 상세 모달 표시
4. **Process Ranking**: Top 5 / Bottom 5 프로세스 카드 클릭 → 프로세스 상세 모달
5. **Shift Comparison**: Day/Night 바 클릭 → 시프트 상세 모달
6. **Distribution**: 히스토그램 막대 클릭 → 해당 범위 작업자 리스트 모달

### 1️⃣ 엑셀 파일 업로드
1. **Data Upload** 탭 클릭
2. Excel 파일 드래그 앤 드롭 또는 선택
3. 자동으로 데이터 처리 및 리포트 표시
4. **"Save to Database"** 버튼 클릭
5. 업로드 완료 메시지 확인: **"Data uploaded successfully! Processing in background..."**

### 2️⃣ 저장된 데이터 불러오기
1. **Saved Uploads** 섹션에서 파일 카드 클릭
2. 자동으로 Report 탭 이동 및 데이터 로드

### 3️⃣ 두 가지 지표 전환
- **⏱️ Time Utilization**: 시간 활용도 (파란색 테마)
- **⚡ Work Efficiency**: 작업 효율 (보라색 테마)
- 우측 상단 **"Switch to Efficiency"** / **"Switch to Utilization"** 버튼 클릭

### 4️⃣ 필터 적용
1. Shift, 날짜, 공정, 작업자 선택
2. **"Apply Filters"** 버튼 클릭
3. **"Reset"** 버튼으로 필터 초기화

### 5️⃣ 작업자 상세 보기
1. Performance Band 차트 또는 테이블에서 작업자 이름 클릭
2. 작업자 상세 모달 표시:
   - **Shift Distribution Chart** (Time Utilization)
   - **Process Distribution Chart** (Work Efficiency)
   - **Work Records Table**: 전체 작업 이력 (정렬 가능)

### 6️⃣ Process Mapping 관리
1. **Process Mapping** 탭 클릭
2. 매핑 규칙 확인/편집
3. 컬럼 헤더 클릭으로 정렬

---

## ⚠️ 알려진 이슈

### 1. Safari Tracking Prevention
- **증상**: "Tracking Prevention blocked access to storage" 경고 (무해)
- **원인**: Safari의 Cross-Site Tracking Prevention
- **해결**: 무시 가능 (기능에 영향 없음)

### 2. Cloudflare Workers Memory Limit
- **증상**: 대용량 파일 업로드 시 메모리 초과
- **해결**: 배치 처리 (50개씩) + `waitUntil` 백그라운드 처리

### 3. Process Mapping 누락
- **증상**: Upload 47번처럼 Mapping 시트가 없으면 필터 안됨
- **해결**: v3.6.0에서 자동 하드코딩 매핑 추가
- **상태**: ✅ 해결됨

---

## 📝 개발 히스토리

### v4.3.6 (2026-03-17) 🐛 **Rework Count 및 Section ID 표시 버그 수정**
- ✅ **데이터베이스 마이그레이션 적용**
  - 프로덕션 D1 데이터베이스에 0003_add_section_and_rework.sql 마이그레이션 적용
  - raw_data 테이블에 section_id, rework, wo_number 컬럼 추가
  - 인덱스 생성으로 조회 성능 최적화
- ✅ **Worker Detail Modal 데이터 표시 수정**
  - Section ID가 모두 '-'로 표시되던 문제 해결
  - Rework 레코드 파란색 배경 표시 정상 작동
  - 데이터베이스 로드 시 sectionId, rework, woNumber 필드 매핑 검증
- ✅ **프로덕션 배포**
  - Cloudflare Pages에 직접 배포
  - 데이터베이스 스키마 업데이트 완료
  - 기존 업로드 데이터와 새 업로드 데이터 모두 정상 표시

### v4.3.5 (2026-03-12) ✅ **DB Save/Load 기능 재활성화 & 백그라운드 업로드**
- ✅ **DB Save/Load 기능 복원 (사용자 요청)**
  - 테스트 환경(localhost, sandbox)에서 "Save to Database" 버튼 재활성화
  - "Saved Uploads" 리스트 기능 복원 및 로드/삭제 버튼 작동
  - 환경 감지: `hostname.includes('sandbox') || hostname.includes('localhost') || port === 3000`
  - 프로덕션(.pages.dev)에서는 계속 비활성화 유지
- ✅ **백그라운드 업로드 구현**
  - 상단 미니바로 업로드 상태 표시 (전체 화면 로딩 오버레이 제거)
  - "Save Database" 버튼 클릭 즉시 미니바 표시 (fetch 응답 전)
  - 파란색 → 초록색/빨간색 상태 표시 (진행중/성공/실패)
  - 업로드 중 다른 탭 이동 가능 (non-blocking UI)
  - 3초 후 자동 숨김, X 버튼으로 수동 닫기 지원
- ✅ **배치 크기 최적화**
  - D1 삽입 배치 크기: 50 → 200 레코드로 증가
  - 42,000 레코드 기준: ~50초 → ~13초로 단축 (30초 타임아웃 내 처리)
  - 최대 안전 업로드: ~50,000 레코드 (버퍼 포함)
- ✅ **User Guide 업데이트**
  - "3. Background Upload & File Size Limits" 섹션 추가
  - 업로드 제한 안내: 최대 50,000 레코드 (Cloudflare Workers 30초 타임아웃)
  - "Processed Records" 숫자 확인 방법 안내
  - 50,000+ 레코드 파일은 브라우저 처리만 사용 권장
- ✅ **로컬 D1 데이터베이스 마이그레이션**
  - `--local` 플래그로 로컬 SQLite 자동 생성 (.wrangler/state/v3/d1/)
  - 3개 마이그레이션 적용: initial_schema, add_efficiency_fields, add_upload_progress
  - 4개 테이블: excel_uploads, raw_data, process_mapping, shift_calendar

### v4.3.5 (2026-03-12) ✅ **Rework 시각적 표시 강화 및 Worker Detail Modal 개선**
- ✅ **Rework Visual Enhancement**
  - Worker Detail Modal에서 Rework 레코드를 파란색 배경으로 강조 표시
  - 🔄 Rework 아이콘 추가 (Date 컬럼 왼쪽에 표시)
  - CSS `!important` 플래그 추가로 배경색 우선순위 보장
  - Total Records 카드 하단에 Rework 카운트 표시 (회색 텍스트)
  - Utilization/Efficiency Rate 하단에 Rework 제외 비율 표시
- ✅ **Worker Detail Modal - Efficiency Mode Enhancement**
  - Start Time, End Time 컬럼 추가 (Utilization Mode와 동일한 위치)
  - Adjusted S/T에 overlap 제거 비율 적용 (동시 작업 시간 조정)
  - Overlap 제거 시 Adjusted S/T를 주황색으로 강조 표시
  - 툴팁에 overlap 조정 상세 정보 표시 (예: "50min → 25min (ratio: 50%)")
- ✅ **Glossary Update**
  - Work Efficiency 및 Time Utilization Glossary에 🔄 Rework 정의 추가
  - Glossary 용어가 테이블 헤더 이름과 정확히 일치하도록 수정
  - Overlap 제거가 Assigned 및 Actual 모두에 적용됨을 명시

### v4.3.4 (2026-03-12) ✅ **Rework 제외 표시 및 Efficiency Overlap 조정**
- ✅ **Rework Exclusion Display**
  - Report 탭 KPI 카드에 Rework 제외 통계 표시 추가
  - 제외된 레코드 수와 비율을 시각적으로 표시
  - 데이터 품질 투명성 향상
- ✅ **Efficiency Rate Overlap Adjustment**
  - Work Efficiency 계산 시 시간 겹침(Overlap) 제거 적용
  - 중복 작업 시간을 정확히 조정하여 효율성 계산
  - Time Utilization과 동일한 겹침 제거 로직 적용
- ✅ **데이터 정확도 개선**
  - 작업자별 실제 작업 시간을 정확히 반영
  - 멀티태스킹 상황에서의 효율성 계산 정확도 향상

### v4.3.3 (2026-03-02) ✅ **Excel Export 기능 완전 수정**
- ✅ **Global Function Registration**
  - `exportToExcel()` 함수를 `window.exportToExcel`로 전역 스코프에 등록
  - HTML `onclick="exportToExcel()"`가 정상 작동
  - 브라우저 콘솔에서 함수 호출 가능
- ✅ **Performance Bands 데이터 검증 완료**
  - Shift Count와 Utilization Rate가 Excel 파일에 정확히 표시됨
  - 모든 5개 시트(KPI Summary, Worker Performance, Shift Comparison, Performance Bands, Raw Data) 정상 동작
  - 데이터 집계 로그 확인: 8,305 worker-day-shift entries, 48,065 records
- ✅ **Console Logging 강화**
  - `🔍 First 3 workers: [...]` 로그로 데이터 확인
  - `📊 Performance Bands count: {...}` 로그로 등급별 분포 확인
  - 데이터 집계 통계 자동 출력 (평균 가동률 47.4%, 평균 효율 51.8%)
- ✅ **Documentation Enhancement**
  - User Guide에 "8. Export to Excel" 섹션 추가
  - 5개 시트별 활용 예시 작성 (KPI Summary, Worker Performance, Shift Comparison, Performance Bands, Raw Data)
  - 실무 활용 워크플로우 예시 제공 (Critical 작업자 식별 → 면담 → 상세 분석)

### v4.3.2 (2026-03-02) 🐛 **Performance Bands W/O Count 표시 수정**
- ✅ **validCount 기반 W/O Count 표시**
  - Excel 파일에 W/O 컬럼이 없을 때 `validCount` (레코드 수)를 W/O Count로 사용
  - Worker Performance Report by Date와 동일한 로직 적용
  - 이제 두 곳의 W/O Count가 일치함
- ✅ **W/O 컬럼 인식 개선**
  - `HEADER_SYNONYMS`에 W/O 관련 동의어 추가
  - 지원 컬럼명: `wo`, `w/o`, `wo#`, `wonumber`, `workorder`, `work_order`, `workordernumber`, `work_order_number`, `orderno`, `order_no`
- ✅ **디버그 로깅 강화**
  - `aggregateByWorkerOnly()` 함수에서 `validCount`, `woNumbers.size`, `final woCount` 출력
  - WO# Set 추적 로그 추가

### v4.3.1 (2026-03-02) 🔧 **Performance Bands에 W/O Count 추가 시도**
- ⚠️ **초기 구현 (작동 안 함)**
  - Performance Band 카드에 "⚙️ Process | 📄 X W/Os" 형식으로 W/O Count 표시 시도
  - Excel 파일에 W/O 컬럼이 없어 항상 0으로 표시되는 문제 발견
  - v4.3.2에서 근본 해결

### v4.3.0 (2026-03-02) 🎯 **Shift Performance Comparison 테이블 추가**
- ✅ **Process Health Matrix → Shift Performance Comparison 교체**
  - Bubble Chart 제거, 테이블 형태로 변경
  - BT (BT Process, BT Complete, BT QC) / WT (WT, WT QC) / IM (IM, IM QC) 3개 그룹 분류
  - Shift A, B, C, D 비교 (그룹별 다른 Shift 지원)
  - 펼치기/접기 기능 (Chevron 아이콘)
- ✅ **기간 선택 기능**
  - 버튼 4개: 최근 7일, 14일, 30일 (기본값), 전체 데이터
  - 실시간 날짜 범위 표시 (예: 2026-02-01 ~ 2026-03-02)
- ✅ **테이블 컬럼**
  - Shift, Workers (명), Shift Time (시간), Work Time (시간), Utilization (%), Standard Time (시간), Efficiency (%)
  - 천단위 구분자(콤마) 표시, 소수점 1자리
- ✅ **색상 코드**
  - Utilization ≥50%: 파란색 bold, <50%: 주황색
  - Efficiency ≥50%: 보라색 bold, <50%: 주황색
- ✅ **디자인**
  - BT: 파란색 그라데이션 헤더
  - WT: 녹색 그라데이션 헤더
  - IM: 보라색 그라데이션 헤더
  - 호버 효과, 반응형 레이아웃

### v4.2.0 (2026-03-02) 🐛 **Dashboard AI Insights 0% 버그 수정**
- ✅ **필드명 불일치 수정**
  - `generateWarnings()` 함수에서 `totalMinutes` → `totalActualMins` 수정
  - `assignedStandardTime` → `totalStandardTime` 수정
  - AI Insights Utilization/Efficiency 이제 정상 표시 (47.4% / 51.8%)
- ✅ **데이터 계산 로그 강화**
  - 데이터 기간, 총 레코드, 작업자, 시프트, 총 작업시간, 총 시프트시간, 총 S/T, Utilization/Efficiency 콘솔 출력

### v4.1.0 (2026-03-02) 🎨 **Dashboard Period Modal 대폭 개선**
- ✅ **Period Detail Modal 레이아웃 개선**
  - Total Records 카드 제거, 6개 주요 KPI 카드를 가로 한 줄 배치
  - Workers, Avg Utilization, Avg Efficiency, Total Shift Time, Total Work Time, Total Adjusted S/T
  - 메인 KPI (Utilization/Efficiency) 강조: 그라데이션 배경, 더 큰 폰트, 아이콘 추가
- ✅ **Process Breakdown 디자인 대폭 개선**
  - 카드 크기 확대 및 폰트 크기 증가 (text-sm → text-base)
  - 파란색 그라데이션 배경 (from-blue-50 to-indigo-50)
  - 호버 효과 강화 (shadow-md, border-blue-400)
  - Workers/Util/Eff 값을 굵은 글씨로 강조
  - 좌우 정렬 레이아웃으로 가독성 향상
- ✅ **Top Performers & Need Attention 개선**
  - 기준 명시: "(Top 3)" / "(Bottom 3)" 표시
  - 영문 설명 추가: "Ranked by combined Utilization + Efficiency score"
  - 섹션별 그라데이션 배경 (녹색/주황색)
  - 아이콘 색상 강조 (트로피/경고)
- ✅ **버그 수정**
  - modalRecords 참조 오류 수정 (제거된 요소 참조 제거)
  - Dashboard 및 Report 모달의 ID 중복 문제 해결
  - Total Shift Time 값 표시 누락 수정
- ✅ **데이터 표시 개선**
  - 모든 시간 값에 천단위 구분자(콤마) 추가
  - 시간 단위를 minutes에서 hours로 변경 (60으로 나눈 값)
  - 콘솔 로그에 분(min)과 시간(hr) 모두 표시

### v4.0.0 (2026-03-01) 🎉 **Dashboard 페이지 구현**
- ✅ **새로운 Dashboard 탭 추가**
  - AI Insights & Warnings (6가지 자동 경고)
  - KPI Trend Overview (Daily/Weekly 토글)
  - Process Performance Ranking (Top 5 / Bottom 5)
  - Shift Comparison (Day vs Night)
  - Distribution & Outliers (히스토그램)
- ✅ **3개 Drill-Down 모달 추가**
  - **Process Modal**: 트렌드 차트, Sub-Process 분포, Top 10 Workers
  - **Shift Modal**: 일별 성과 분포, 프로세스 믹스 파이 차트
  - **Distribution Modal**: 범위별 작업자 리스트 테이블
- ✅ **AI Warning 로직 구현**
  - Low Utilization (< 50%)
  - Low Efficiency (< 50%)
  - Efficiency Gap (High Util + Low Eff)
  - Process Concentration (> 60%)
  - Low Sample Size (< 100 records)
- ✅ **필터 연동**: Report 탭 필터 적용 시 Dashboard 자동 업데이트
- ✅ **Chart.js 차트**: Line, Bar, Doughnut, Pie 차트 활용

### v3.6.0 (2026-02-28) 🔧 **Process Mapping 자동화 & UI 개선**
- ✅ **93개 하드코딩 매핑 규칙 추가** (Upload 24 기준)
  - `DEFAULT_PROCESS_MAPPING` 객체 생성
  - Mapping 시트 없을 때 자동 적용
- ✅ **Process Mapping API 추가**
  - `GET /api/process-mapping`
  - `GET /api/uploads/:id/process-mapping`
  - `POST /api/process-mapping`
  - `DELETE /api/process-mapping/:id`
- ✅ **업로드 진행률 UI 단순화**
  - Progress Bar 제거
  - "Data uploaded successfully! Processing in background..." 메시지만 표시
  - 3초 후 자동 사라짐
- ✅ **D1 Database에 업로드 진행률 저장**
  - `upload_status`, `progress_current`, `progress_total`, `error_message` 컬럼 추가
  - Cloudflare Workers 인스턴스 간 상태 공유 문제 해결
- ✅ **버그 수정**: Upload 47번 WT 필터 0명 문제
  - `loadDefaultProcessMapping()` 로직 수정
  - DB에 매핑 없으면 하드코딩 규칙 자동 적용

### v3.5.1 (2026-02-27)
- ✅ Worker Detail 모달 데이터 동기화 버그 수정

### v3.5.0 (2026-02-24)
- ✅ Week 필터 개선
- ✅ 성과 밴드 정렬 기능

### v3.4.0 (2026-02-23)
- ✅ Working Shift 필터별 컨텍스트 안내 추가

### v3.3.0 (2026-02-22)
- ✅ 로딩 인디케이터 추가

### v3.2.0 (2026-02-21)
- ✅ KPI 카드 재설계 (4개 구조)
- ✅ 동적 테마 (Utilization 파란색, Efficiency 보라색)

### v3.1.0 (2026-02-21)
- ✅ DB 스키마 업데이트 (worker_st, worker_rate_pct 추가)

### v3.0.0 (2026-02-20)
- ✅ 두 가지 성과 지표 시스템 도입

### v2.0.0 (2026-02-18)
- ✅ Cloudflare D1 데이터베이스 통합

### v1.0.0 (2026-02-15)
- ✅ 초기 버전 (엑셀 파일 로드 + 기본 리포트)

---

## 🚧 향후 계획

### 🎯 Phase 1: MES API 직접 연동 (v5.0.0)
**목표**: Excel 업로드 방식에서 실시간 MES API 연동으로 전환

#### 필수 기능
- [ ] **MES R018 API 직접 연동**
  - DB 직접 접근 또는 REST API 호출 방식 확정
  - 방화벽 오픈 요청 (사내 MES 서버 → Cloudflare Pages)
  - 데이터 필드 매핑 확정 (FD Desc, FO Desc, Worker Name, Shift, etc.)
- [ ] **실시간 데이터 조회 및 자동 업데이트**
  - 배치 스케줄러 구현 (예: 매 1시간마다 자동 동기화)
  - 증분 업데이트 로직 (신규 레코드만 가져오기)
  - 데이터 충돌 해결 로직 (중복 제거, 시간 겹침 처리)
- [ ] **작업자 실시간 모니터링 기능**
  - 현재 진행 중인 작업 표시
  - 실시간 KPI 업데이트 (30초~1분 단위)
  - 이상 감지 알림 (효율 급감, 작업 중단 등)

#### 기술 요구사항
- [ ] **MES 데이터베이스 정보 확보**
  - DB 연결 정보 (호스트, 포트, 인증 방식)
  - 테이블 스키마 및 쿼리 권한
  - 데이터 샘플 및 필드 정의서
- [ ] **SSO 통합 (Azure AD)**
  - Tenant ID, Client ID, Client Secret, Redirect URI
  - Role-based access control (RBAC) 구현
  - 개발 2~3일 예상
- [ ] **다국가 법인 대응 (Multi-site Support)**
  - FO Desc 표준화 테이블 (한국어/영어/베트남어 매핑)
  - Shift 정보 관리 (작업자별/법인별 캘린더)
  - MOD 매핑 (Machine Code → MOD 1/2/3)

---

### 🚀 Phase 2: AI 통합 및 Work Order Allocation (v6.0.0)
**목표**: 성과 데이터와 기술 사양을 결합하여 AI 기반 작업 할당 최적화

#### 핵심 컨셉
IPR의 **작업자 성과 데이터**와 MES의 **Work Order 기술 사양**을 결합하여, 작업 할당 시 최적의 작업자를 추천하는 Decision Support System 구축.

#### 필수 데이터 확장
현재 IPR는 작업자 성과만 추적하지만, AI 기반 최적화를 위해서는 **Work Order의 기술적 특성**이 필요합니다:

| 필드명 | 설명 | 예시 값 | 중요도 |
|--------|------|---------|--------|
| `thickness` | 강판 두께 (mm) | 50.0, 30.0, 80.0 | ⭐⭐⭐ |
| `material` | 소재 종류 | SS400, SUS304, SM490 | ⭐⭐⭐ |
| `complexity` | 작업 난이도 | Simple, Moderate, Complex | ⭐⭐ |
| `tolerance` | 공차 요구사항 (mm) | ±0.5, ±1.0, ±2.0 | ⭐⭐ |
| `quality_grade` | 품질 등급 | A, B, C | ⭐⭐ |
| `defect_count` | 불량 개수 | 0, 1, 2 | ⭐ |
| `rework_required` | 재작업 필요 여부 | 0 (정상), 1 (재작업) | ⭐ |

**데이터 소스**: MES Work Order 테이블 또는 생산 관리 시스템

#### 실제 분석 사례
**목표**: "RIVERA 작업자는 왜 효율이 85%로 높고 재작업률이 0%인가?"

현재 IPR 데이터만으로는 알 수 없지만, 기술 사양 데이터를 결합하면:
- **두께별 숙련도**: ≥50mm 강판에서 85% 효율, <30mm에서 72% 효율
- **소재별 적합성**: SS400 두꺼운 강판에 강점, SUS304 얇은 강판에 약점
- **재작업 리스크**: 두꺼운 강판 1~2%, 복잡한 작업+야간 시프트에서 최대 18%
- **시프트 × 복잡도 상관관계**: 야간 + Complex → 효율 10~15% 하락

#### 구현 로드맵

##### Stage 1: 데이터 수집 및 확장 (1~2개월)
- [ ] MES API에 기술 사양 필드 추가 요청
  - `thickness`, `material`, `complexity`, `tolerance`, `quality_grade`
- [ ] IPR 데이터베이스 스키마 확장
  - `raw_data` 테이블에 컬럼 추가
  - 인덱스 생성 (thickness, material, complexity)
- [ ] 데이터 수집 시작
  - 최소 3개월간 데이터 축적 필요 (통계적 유의성)
  - 목표: 작업자별 최소 50건 이상의 다양한 작업 기록

##### Stage 2: 통계 기반 Worker Profile 구축 (3~4개월)
- [ ] **기본 통계 분석**
  - 두께별 평균 효율 (예: 50mm 이상, 30~50mm, 30mm 이하)
  - 소재별 평균 효율 (SS400, SUS304, SM490 등)
  - 복잡도별 평균 효율 (Simple, Moderate, Complex)
  - 재작업률 계산 (전체, 소재별, 복잡도별)
- [ ] **Worker Profile 생성**
  - 작업자별 강점/약점 태그 (예: "두꺼운 강판 전문", "SUS304 약점")
  - 숙련도 점수 (0~100점)
  - 신뢰도 지표 (데이터 샘플 수, 표준편차)
- [ ] **UI에 Profile 표시**
  - Worker Detail Modal에 "Strengths" / "Weaknesses" 섹션 추가
  - 두께별/소재별 효율 차트 표시
  - 재작업 리스크 점수 표시

##### Stage 2.5: 🎯 Decision Support System (과도기적 AI) - **빠른 구현 가능** ⚡
**개념**: ML 모델 없이 **규칙 기반 + 통계**로 Supervisor에게 작업 할당 정보 제공

**장점**:
- ✅ 빠른 구현 (2~3주)
- ✅ 설명 가능한 로직 (Why? 질문에 명확한 답변)
- ✅ 데이터 부족 시에도 작동
- ✅ Stage 3 ML 모델로 자연스럽게 전환 가능

#### 📋 기능 1: Worker Candidate List API
**목적**: 새로운 Work Order에 대해 후보 작업자 목록을 점수와 함께 제공

**API 설계**:
```typescript
POST /api/work-order/candidates
Request: {
  "process": "Bevel",
  "thickness": 60.0,        // Optional
  "material": "SS400",      // Optional
  "complexity": "Moderate", // Optional
  "urgent": false
}

Response: {
  "process": "Bevel",
  "candidates": [
    {
      "worker_name": "RIVERA",
      "current_workload": 2,           // 현재 진행 중인 WO 개수
      "avg_efficiency": 85.0,          // Bevel 공정 평균 효율
      "recent_efficiency": 88.0,       // 최근 7일 효율
      "total_experience": 145,         // Bevel 공정 총 작업 건수
      "rework_rate": 1.5,              // 재작업률 (%)
      "estimated_time_hrs": 2.5,       // 예상 소요 시간
      "score": 92.5,                   // 종합 점수 (0~100)
      "strengths": ["Thick plates ≥50mm", "High efficiency", "Low rework"],
      "warnings": []
    },
    {
      "worker_name": "SMITH",
      "current_workload": 4,
      "avg_efficiency": 72.0,
      "recent_efficiency": 70.0,
      "total_experience": 89,
      "rework_rate": 5.8,
      "estimated_time_hrs": 3.2,
      "score": 68.5,
      "strengths": ["Consistent performer"],
      "warnings": ["High workload (4 WOs)", "Below 75% efficiency"]
    },
    {
      "worker_name": "BROWN",
      "current_workload": 1,
      "avg_efficiency": 55.0,
      "recent_efficiency": 52.0,
      "total_experience": 34,
      "rework_rate": 12.3,
      "estimated_time_hrs": 4.0,
      "score": 45.2,
      "strengths": ["Low workload"],
      "warnings": ["Low experience (<50 jobs)", "High rework rate (>10%)"]
    }
  ],
  "filters_applied": {
    "min_experience": 10,      // 최소 경험 건수
    "max_workload": 5          // 최대 동시 작업
  }
}
```

#### 🧮 점수 계산 로직 (Scoring System)
**4가지 기준의 가중 평균**:

```javascript
// 1. 효율 점수 (40% 가중치)
efficiencyScore = (avg_efficiency / 100) * 40

// 2. 워크로드 점수 (30% 가중치) - 낮을수록 좋음
workloadScore = Math.max(0, (5 - current_workload) / 5) * 30

// 3. 안정성 점수 (20% 가중치) - 재작업률 낮고 변동성 낮을수록 좋음
stabilityScore = Math.max(0, (1 - rework_rate / 20)) * 20

// 4. 경험 점수 (10% 가중치)
experienceScore = Math.min(total_experience / 100, 1.0) * 10

// 최종 점수
totalScore = efficiencyScore + workloadScore + stabilityScore + experienceScore

// 보너스: 최근 성과 상승 중이면 +5점
if (recent_efficiency > avg_efficiency + 5) {
  totalScore += 5
}

// 패널티: 긴급 작업인데 워크로드 높으면 -10점
if (urgent && current_workload >= 4) {
  totalScore -= 10
}
```

#### 🔍 기능 2: Skill Matrix (작업자 × 공정 능력 매트릭스)
**목적**: 작업자별 공정 숙련도를 한눈에 파악

**API 설계**:
```typescript
GET /api/skill-matrix

Response: {
  "matrix": [
    {
      "worker_name": "RIVERA",
      "skills": {
        "Bevel": { "efficiency": 85, "experience": 145, "grade": "⭐⭐⭐" },
        "Cut": { "efficiency": 82, "experience": 123, "grade": "⭐⭐⭐" },
        "Bend": { "efficiency": 78, "experience": 67, "grade": "⭐⭐" },
        "FU": { "efficiency": 65, "experience": 23, "grade": "⭐" }
      },
      "specializations": ["Bevel", "Cut"],  // 효율 ≥80% 공정
      "training_needed": ["FU"]              // 효율 <70% 공정
    },
    {
      "worker_name": "SMITH",
      "skills": {
        "Bevel": { "efficiency": 72, "experience": 89, "grade": "⭐⭐" },
        "Cut": { "efficiency": 75, "experience": 102, "grade": "⭐⭐" },
        "Paint": { "efficiency": 88, "experience": 156, "grade": "⭐⭐⭐" }
      },
      "specializations": ["Paint"],
      "training_needed": []
    }
  ],
  "legend": {
    "⭐⭐⭐": "Expert (≥80% efficiency, ≥50 jobs)",
    "⭐⭐": "Proficient (70-79% efficiency, ≥30 jobs)",
    "⭐": "Learning (<70% efficiency or <30 jobs)"
  }
}
```

#### ⚠️ 기능 3: Bottleneck Detection (병목 예측)
**목적**: 특정 공정에 작업이 몰릴 때 미리 경고

**로직**:
```javascript
// 공정별 현재 대기 중인 WO 개수
const queuedWOs = {
  "Bevel": 8,
  "Cut": 3,
  "Paint": 12
}

// 공정별 가용 작업자 평균 처리 속도 (시간당 WO 처리 개수)
const avgThroughput = {
  "Bevel": 0.6,  // 1.67시간/WO
  "Cut": 0.8,    // 1.25시간/WO
  "Paint": 0.4   // 2.5시간/WO
}

// 예상 처리 시간 = 대기 WO / 처리 속도
const estimatedHours = {
  "Bevel": 8 / 0.6 = 13.3 hours,
  "Cut": 3 / 0.8 = 3.75 hours,
  "Paint": 12 / 0.4 = 30 hours  // ⚠️ 병목!
}

// 경고 발생 기준: 예상 처리 시간 > 16시간 (2 shifts)
if (estimatedHours["Paint"] > 16) {
  alert("Paint 공정 병목 예상: 30시간 소요, 추가 인력 배치 권장")
}
```

#### 🔗 외부 플랫폼 연동 (Work Order Agent AI)
**개념**: IPR은 UI를 직접 제공하지 않고, **API를 통해 외부 Work Order Agent AI 플랫폼에 데이터를 제공**

**아키텍처**:
```
┌─────────────────────────────────────┐
│  Work Order Agent AI Platform      │  ← 기존 플랫폼 (W/O 생성 및 Worker Allocation)
│  - W/O 생성                         │
│  - Worker Allocation 의사결정       │
│  - Supervisor Dashboard             │
└──────────────┬──────────────────────┘
               │ HTTP API 호출
               ↓
┌─────────────────────────────────────┐
│  IPR (Individual Performance Report)│  ← 이 프로젝트
│  - 작업자 성과 데이터 제공          │
│  - Candidate List API               │
│  - Skill Matrix API                 │
│  - Bottleneck Detection API         │
└─────────────────────────────────────┘
```

#### 📈 구현 순서 (2~3주)
**Week 1: 백엔드 API 개발**
- [ ] `/api/work-order/candidates` 엔드포인트 구현
- [ ] `/api/skill-matrix` 엔드포인트 구현
- [ ] `/api/bottleneck-detection` 엔드포인트 구현
- [ ] 점수 계산 로직 구현
- [ ] 통계 계산 (avg_efficiency, rework_rate, 현재 워크로드)
- [ ] CORS 설정 (외부 플랫폼 접근 허용)

**Week 2: API 문서화 및 테스트**
- [ ] OpenAPI (Swagger) 문서 자동 생성
- [ ] API 테스트 케이스 작성
- [ ] Postman Collection 제공
- [ ] 응답 시간 최적화 (< 500ms 목표)

**Week 3: 외부 플랫폼 연동 지원**
- [ ] JWT 기반 API 인증 구현
- [ ] Rate Limiting (초당 요청 제한)
- [ ] API 사용 로그 및 모니터링
- [ ] Work Order Agent AI 플랫폼 팀과 통합 테스트

#### 🔄 Stage 3로의 자연스러운 전환
Stage 2.5의 규칙 기반 시스템은 Stage 3 ML 모델의 **기준선(Baseline)**이 됩니다:
- 규칙 기반 점수를 "Ground Truth"로 사용
- ML 모델이 규칙보다 더 정확한지 A/B 테스트
- 설명 가능한 AI (Explainable AI)를 위한 비교 기준

##### Stage 3: ML 모델 및 추천 시스템 (6~12개월)
- [ ] **성과 예측 모델**
  - 입력: Worker Profile + WO 기술 사양 (두께, 소재, 복잡도)
  - 출력: 예상 효율 (%), 예상 소요 시간 (분), 재작업 확률 (%)
  - 모델: Random Forest, XGBoost, 또는 Neural Network
- [ ] **Work Order 추천 API**
  ```typescript
  POST /api/work-order/recommend
  Request: {
    "wo_number": "WO-2024-001",
    "thickness": 60.0,
    "material": "SS400",
    "complexity": "Moderate",
    "urgent": false
  }
  Response: {
    "recommendations": [
      {
        "worker_name": "RIVERA",
        "predicted_efficiency": 85.2,
        "predicted_time_mins": 120,
        "rework_risk": 2.1,
        "score": 92.5,
        "reason": "Strong track record on thick SS400 plates (85% avg efficiency)"
      },
      {
        "worker_name": "BROWN",
        "predicted_efficiency": 78.0,
        "predicted_time_mins": 135,
        "rework_risk": 5.3,
        "score": 84.2,
        "reason": "Moderate efficiency on similar tasks, slightly higher rework risk"
      }
    ]
  }
  ```
- [ ] **Supervisor Dashboard**
  - 실시간 WO 할당 추천 화면
  - 작업자별 현재 워크로드 표시
  - "Best Match" 하이라이트 및 이유 설명
  - 수동 오버라이드 기능 (Supervisor 최종 결정권 유지)

#### 핵심 숫자 (반드시 보존)
- **RIVERA 효율**: 85% (≥50mm 두께), 72% (<30mm 두께)
- **재작업률**: 평균 5%, 두꺼운 강판 1~2%, 복잡한 작업 최대 18%
- **두께 기준선**: 50mm
- **공차 예시**: ±0.5mm
- **품질 등급**: A/B/C
- **불량 개수**: 평균 0개 (RIVERA), 최대 2개 (일부 작업자)
- **효율 범위**: 72~88%

---

### 📊 Phase 3: Dashboard 고도화 (v4.4.0)
- [ ] Weekly aggregation 구현 (현재는 Daily만)
- [ ] WoW/DoD 변화율 표시
- [ ] Process hierarchy 드릴다운 (L1 → L2 → L3)
- [ ] 시간대별 분포 차트
- [ ] Dashboard → PDF/Excel Export 기능
- [ ] AI Insights 고도화
  - 이상 탐지 알고리즘 (Prophet, LSTM)
  - 자동 프로세스 매핑 (NLP)
  - 성과 최적화 제안

---

### 🌍 Phase 4: 다국가 확장 및 통합 플랫폼 (v7.0.0)
**목표**: 미국, 한국, 베트남, 중국 등 다국가 법인 대응 및 통합 플랫폼 연동

#### Multi-site Support
- [ ] **FO Desc 표준화**
  - 다국어 매핑 테이블 (한국어/영어/베트남어/중국어)
  - 사이트별 공정명 차이 흡수
  - 자동 번역 및 검증 로직
- [ ] **Shift Calendar 다국가 대응**
  - 법인별 시프트 시스템 (2교대/3교대/4교대)
  - 시간대(Timezone) 관리
  - 휴일 캘린더 연동
- [ ] **MOD Mapping**
  - Machine Code → MOD 1/2/3 자동 매핑
  - 신규 장비 자동 감지 및 알림
  - 작업자별 MOD Override 지원

#### 통합 플랫폼 연동 (Work Order Agent AI)
**목표**: IPR을 Work Order Agent AI 플랫폼과 연동하여 작업자 성과 데이터 제공

- [ ] **Microservice Architecture**
  - IPR을 독립 서비스로 배포 (Cloudflare Workers 유지)
  - API Gateway를 통한 외부 접근
  - JWT 기반 인증/인가 (Work Order Agent AI 플랫폼 전용 토큰)
  
- [ ] **REST API 제공 (Work Order Agent AI용)**
  - `/api/v1/workers` - 작업자 목록 및 성과 조회
  - `/api/v1/workers/{name}` - 특정 작업자 상세 프로필
  - `/api/v1/work-order/candidates` - Work Order 후보 작업자 추천
  - `/api/v1/skill-matrix` - 작업자 × 공정 능력 매트릭스
  - `/api/v1/bottleneck-detection` - 공정별 병목 예측
  - `/api/v1/kpi` - KPI 데이터 조회
  - `/api/v1/dashboard` - 대시보드 집계 데이터 조회
  
- [ ] **Webhook 지원 (Real-time Sync)**
  - Work Order Agent AI → IPR: 새로운 W/O 할당 시 IPR에 알림
  - IPR → Work Order Agent AI: 작업 완료/성과 업데이트 시 알림
  - 양방향 데이터 동기화
  
- [ ] **API 문서화 및 개발자 지원**
  - OpenAPI (Swagger) 문서 자동 생성
  - Postman Collection 제공
  - API 사용 예시 및 통합 가이드
  - Rate Limiting 정책 (초당 100 requests)
  
- [ ] **Iframe Embedding 지원 (Optional)**
  - `?embed=true` 파라미터로 UI Chrome 제거
  - Work Order Agent AI 플랫폼에서 IPR Dashboard를 iframe으로 임베딩
  - `postMessage` API로 부모 페이지와 통신
  - Single Sign-On (SSO) 토큰 전달

---

### 🛠️ Phase 5: 성능 및 UX 개선 (v4.5.0)
- [ ] Chart 렌더링 최적화 (Virtual Scrolling)
- [ ] 모달 lazy loading
- [ ] 대용량 데이터 가상 스크롤링 (50,000+ 레코드)
- [ ] 모바일 반응형 레이아웃 개선 (태블릿 최적화)
- [ ] 다국어 지원 (한국어/영어/베트남어/중국어)
- [ ] Progressive Web App (PWA) 지원
- [ ] 오프라인 모드 (Service Worker)

---

**제작자**: JB Park (jbpark@cswind.com)  
**최종 업데이트**: 2026-03-18 (v4.3.6)  
**라이선스**: MIT

---

## 📞 문의

- GitHub Issues: https://github.com/joonbae123/MES_R018_Analysis/issues
- Deployment: https://mes-r018-analysis-5bz.pages.dev
