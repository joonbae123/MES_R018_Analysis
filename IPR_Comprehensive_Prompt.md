# MES R018 Analysis - IPR 시스템 종합 프롬프트

## 📑 목차

1. [프로젝트 탄생 배경](#-프로젝트-탄생-배경)
   - 문제 인식
   - 핵심 질문
   - 솔루션 방향

2. [프로젝트 목표](#-프로젝트-목표)
   - 단기 목표 (Phase 1)
   - 장기 목표 (Phase 2~3)

3. [현재 개발 완성도 (v3.4.2)](#️-현재-개발-완성도-v342)
   - 완료된 기능
   - 개발 중 / 계획 중

4. [기술 스택 및 아키텍처](#️-기술-스택-및-아키텍처)
   - Frontend / Backend / Database / Deployment
   - Development Workflow

5. [현재 수집된 데이터](#-현재-수집된-데이터)
   - 데이터 규모
   - 주요 인사이트

6. [향후 로드맵 (Phase 1 ~ Phase 3)](#-향후-로드맵-phase-1--phase-3)
   - Phase 1: Foundation (0-3개월)
   - Phase 2: Intelligence (3-6개월)
   - Phase 3: Optimization (6-12개월)

7. [예상 개선 효과](#-예상-개선-효과-정량적-지표)
   - Operational Excellence
   - Planning Accuracy
   - Financial Impact

8. [기술적 도전과 해결](#-기술적-도전과-해결)
   - Outlier 처리
   - Efficiency vs Utilization 혼동
   - 데이터베이스 스키마 변경
   - 필터 성능 최적화

9. [배운 점 및 인사이트](#-배운-점-및-인사이트)
   - 데이터 품질의 중요성
   - 사용자 피드백의 가치
   - 점진적 개선의 힘

10. [즉시 실행 항목 (Next Steps)](#-즉시-실행-항목-next-steps)
    - Work Completion Score 개발
    - IPR Pilot Program
    - 데이터 품질 개선
    - 사용자 교육

11. [고민 중인 이슈](#-고민-중인-이슈)
    - Overall Score 가중치
    - IPR 주기
    - 공정별 난이도 반영
    - Phase 2 기술 스택

12. [연락처 및 협업](#-연락처-및-협업)

13. [요약](#-요약)

---

## 📌 프로젝트 탄생 배경

### 문제 인식
우리 제조 현장에는 **방대한 작업 데이터가 축적**되고 있었습니다.
- 작업자별 작업 시작/종료 시간
- W/O(Work Order)별 진행률
- 공정별 작업 기록
- 시프트(A/B/C)별 근무 이력

하지만 **이 데이터들은 단순 기록으로만 존재**했습니다:
- ❌ 작업자의 실제 생산성을 측정할 수 없었습니다
- ❌ 효율적인 작업자와 그렇지 않은 작업자를 구분할 수 없었습니다
- ❌ 인력 계획을 세울 때 경험과 감에만 의존했습니다
- ❌ 작업 효율을 개선할 구체적인 근거가 없었습니다

### 핵심 질문
**"우리는 데이터는 있지만, 인사이트는 없다"**

경영진과 현장 관리자들이 궁금했던 것들:
- 작업자 A와 B 중 누가 더 효율적인가?
- 특정 공정에서 병목이 발생하는 이유는?
- 내일 100개의 W/O를 처리하려면 몇 명이 필요한가?
- 시프트별로 생산성 차이가 있는가?
- 표준 시간(S/T)과 실제 소요 시간의 차이는 얼마나 되는가?

### 솔루션 방향
**데이터 기반 의사결정 시스템 구축**
- 작업자별 성과를 정량적으로 측정
- 실시간 대시보드로 현황 파악
- 과거 데이터로 미래 예측 (장기 목표)

---

## 🎯 프로젝트 목표

### 단기 목표 (Phase 1 - 현재 진행 중)
**"작업자 성과를 측정할 수 있는 기본 시스템 구축"**

1. **데이터 수집 자동화**
   - Excel 파일 업로드로 간편하게 데이터 입력
   - 데이터베이스 저장으로 이력 관리

2. **성과 지표 시스템**
   - Time Utilization: 시간 활용도 측정
   - Work Efficiency: 작업 효율 측정
   - Work Completion: 작업 완결성 측정 (개발 예정)

3. **시각화 대시보드**
   - 실시간 KPI 카드
   - 작업자별 성과 순위
   - 상세 분석 모달

### 장기 목표 (Phase 2~3 - 로드맵)
**"AI 기반 예측과 자원 최적화"**

1. **Phase 2: Intelligence (AI 예측)**
   - S/T 학습 엔진: 실적 기반 표준시간 자동 업데이트
   - MH 예측 시스템: 필요 인력 자동 산출
   - 인력 갭 분석: 부족/과다 인력 사전 경고

2. **Phase 3: Optimization (자원 최적화)**
   - AI 작업 할당: 최적의 작업자 자동 배정
   - 실시간 원가 추적: W/O별 원가 실시간 모니터링
   - ERP 통합: SAP/Oracle 양방향 동기화

---

## 🏗️ 현재 개발 완성도 (v3.4.2)

### ✅ 완료된 기능 (Production 배포 중)

**1. 데이터 관리**
- ✅ Excel 파일 업로드 (드래그 앤 드롭)
- ✅ Cloudflare D1 데이터베이스 저장
- ✅ 업로드 이력 관리 (최대 50개)
- ✅ 저장된 데이터 불러오기 (원클릭)
- ✅ Raw 데이터 38,280건 수집 (2026년 2월 기준)

**2. 성과 지표 측정 (2개 완성)**

**📊 Time Utilization (작업 시간 활용률)**
- 의미: 근무 시간 중 실제로 일한 시간의 비율
- 계산식: (Total Work Time ÷ Total Shift Time) × 100
- 현재 평균: 76.3%
- 용도: 작업자가 시간을 얼마나 효율적으로 사용하는가?

**⚡ Work Efficiency (작업 효율성)**
- 의미: 표준 시간(S/T) 대비 실제 생산성
- 계산식: (Total Adjusted S/T ÷ Total Shift Time) × 100
- 현재 평균: 103.2%
- 용도: 작업자가 표준 대비 얼마나 빠르게/느리게 일하는가?
- 특징: Outlier Threshold (기본 1000%) 적용 가능

**3. 대시보드 UI**
- ✅ 4개 KPI 카드 (실시간 업데이트)
  - Total Workers
  - Total Shift Time / Total Adjusted S/T
  - Total Work Time / Total Actual Time
  - Average Utilization / Efficiency Rate
- ✅ 성과 밴드 (5단계): Excellent / Good / Normal / Poor / Critical
- ✅ 작업자 순위 테이블 (정렬 가능)
- ✅ 지표 토글 (⏱️ ⇄ ⚡) - 원클릭 전환
- ✅ 테마 자동 변경 (파란색 ⇄ 보라색)

**4. 필터링 시스템**
- ✅ Working Shift 선택 (A/B/C/All)
- ✅ 날짜 범위 선택
- ✅ 공정 선택 (다중 선택)
- ✅ 작업자 선택 (다중 선택)
- ✅ Outlier Threshold 조정 (Efficiency 모드 전용)
- ✅ Apply Filters / Reset 버튼
- ✅ 로딩 인디케이터 (부드러운 애니메이션)

**5. 작업자 상세 모달**
- ✅ Worker Detail 팝업 (작업자 클릭 시)
- ✅ 지표별 차트 분기:
  - Utilization: Daily Utilization Rate, Hourly Distribution
  - Efficiency: Daily Efficiency Rate, Hourly Distribution
- ✅ 작업 이력 테이블 (상세 기록)
- ✅ Outlier 레코드 빨간색 표시 (🚫 아이콘)
- ✅ 집계 데이터와 개별 레코드 분리 표시

**6. 사용자 경험**
- ✅ 전체 영어 인터페이스
- ✅ Shift Filter 컨텍스트 안내
  - All Shifts: 툴팁으로 주의사항 표시
  - Specific Shift (A/B/C): 배경색 경고로 필터 활성화 안내
- ✅ User Guide (도움말)
- ✅ Glossary (용어 설명)
- ✅ Update Log (업데이트 내역)
- ✅ 반응형 디자인 (모바일 대응)
- ✅ 캐시 버스팅 (v=3.4.2)

**7. 데이터베이스 스키마**
- ✅ excel_uploads: 업로드 기록
- ✅ raw_data: 원본 작업 데이터 (worker_name, fo_desc, start_datetime, end_datetime, worker_act, working_day, working_shift, worker_st, worker_rate_pct)
- ✅ process_mapping: 공정 매핑
- ✅ shift_calendar: 시프트 캘린더

**8. 배포 환경**
- ✅ Cloudflare Pages 배포
- ✅ Production URL: https://mes-r018-analysis.pages.dev
- ✅ GitHub 저장소: https://github.com/twokomi/MES_R018_Analysis
- ✅ 버전 관리: v3.4.2 (2026-02-24)

### 🚧 개발 중 / 계획 중

**1. Work Completion Score (새로운 지표)**
- 상태: 설계 완료, 개발 대기
- 의미: 작업 완결성 측정
- 계산식: Σ (Job Rate / 100)
- 예시:
  - W/O-123: 100% → 1.0
  - W/O-124: 40% → 0.4
  - W/O-125: 80% → 0.8
  - 합계: 2.2 jobs 완료
- 목표: 작업자가 몇 개의 W/O를 완료했는가를 정량적으로 측정
- 일정: Phase 1 (4주 소요 예정)

**2. Individual Performance Report (IPR)**
- 상태: 컨셉 화면 완성, 개발 대기
- 화면 구성:
  - Tab 1: Work Completion Score
  - Tab 2: Individual Performance Report (성적표)
  - Tab 3: Team Dashboard
- 목표: 작업자별 종합 성과 리포트
- 일정: Phase 1 (8주 소요 예정)

**3. 3-Metric System 완성**
- 현재: 2개 지표 완료
- 목표: 3개 지표 (Utilization + Efficiency + Completion)
- Overall Score: 3개 지표 조합으로 종합 점수 산출 (예: A-, 87.2/100)

---

## 🗂️ 기술 스택 및 아키텍처

### Frontend
- **HTML5 + CSS3 + JavaScript (ES6+)**
- **Tailwind CSS** (CDN) - 스타일링
- **Chart.js** - 차트 시각화
- **SheetJS (xlsx.js)** - Excel 파싱
- **Font Awesome** - 아이콘

### Backend
- **Hono Framework** (TypeScript) - 경량 웹 프레임워크
- **Cloudflare Workers** - Edge 런타임
- **Vite** - 빌드 도구

### Database
- **Cloudflare D1** (SQLite 기반)
- **Wrangler** - CLI 도구
- 마이그레이션 관리

### Deployment
- **Cloudflare Pages** - 글로벌 CDN 배포
- **GitHub Actions** - CI/CD (수동)
- **Git** - 버전 관리

### Development Workflow
```bash
# 로컬 개발
npm run build              # Vite 빌드
npm run dev:sandbox        # Wrangler dev server (--local)

# 데이터베이스
npm run db:migrate:local   # 로컬 마이그레이션
npm run db:migrate:prod    # 프로덕션 마이그레이션

# 배포
npm run deploy             # Cloudflare Pages 배포
```

---

## 📊 현재 수집된 데이터

### 데이터 규모 (2026년 2월 기준)
- **총 작업 기록**: 38,280건
- **등록 작업자**: 538명
- **수집 기간**: 2026-02-11 ~ 2026-02-17 (1주)
- **공정 수**: 12개 (Mechanical, Electrical, Assembly 등)
- **시프트**: A/B/C (3교대)

### 주요 인사이트 (현재 데이터 기준)
- **평균 Utilization**: 76.3%
- **평균 Efficiency**: 103.2%
- **Top Performer**: MEDINA (Utilization 89%, Efficiency 145%)
- **Outlier 케이스**: Worker Rate 1558% (특정 고효율 작업)
- **공정별 차이**: Mechanical 72%, Electrical 78%, Assembly 75%

---

## 🎯 향후 로드맵 (Phase 1 ~ Phase 3)

### **Phase 1: Foundation (0-3개월) - 기본 지표 시스템**
**목표**: 3-Metric System 완성

**개발 항목:**
1. ✅ Time Utilization (완료)
2. ✅ Work Efficiency (완료)
3. 🚧 Work Completion Score (개발 예정)
4. 🚧 Individual Performance Report 화면 (개발 예정)
5. 🚧 Team Dashboard 고도화 (개발 예정)

**주요 기능:**
- 3개 지표 실시간 집계
- 작업자별 성적표 (Overall Score)
- 공정별 분석 강화
- 주간/월간 리포트 생성

**일정:**
- M1: Work Completion Score 설계 및 개발 (4주)
- M2: IPR 화면 개발 (4주)
- M3: 테스트 및 보완 (2주)
- M4: 전사 배포 및 교육 (2주)

**기대 효과:**
- 작업자 성과를 정량적으로 측정
- 데이터 기반 인사평가 가능
- 현장 관리자의 의사결정 지원

---

### **Phase 2: Intelligence (3-6개월) - AI 기반 예측**
**목표**: 과거 데이터로 미래 예측

**개발 항목:**

**1. Standard Time (S/T) Learning Engine**
- 문제: 현재 S/T는 고정값, 실제와 괴리
- 해결: 실적 데이터로 S/T 자동 학습
- 기술:
  - 회귀 분석 모델 (Linear Regression)
  - 공정/작업자/시프트별 S/T 패턴 학습
  - 주기적 업데이트 (주 1회)
- 효과: S/T 정확도 60% → 95% 향상

**2. Man-Hour (MH) Forecasting System**
- 문제: 물량 계획 시 필요 MH를 수작업으로 추정
- 해결: 과거 실적 기반 MH 자동 예측
- 입력: W/O 목록, 수량, 공정
- 출력: 예상 MH, 필요 인원, 예상 완료 시점
- 예시:
  - Input: W/O-125 (Mechanical, 100개)
  - Output: 예측 MH 1,200시간, 필요 인원 2명, 완료 예정 2026-03-15
- 효과: 예측 오차 ±30% → ±5%

**3. Workforce Planning (적정 인력 산출)**
- 문제: 인력이 부족한지 넘치는지 불명확
- 해결: 필요 MH 대비 현재 인력 갭 분석
- 분석:
  - 주간 W/O 목록 → 필요 MH 계산
  - 현재 인력 → 가용 MH 계산
  - Gap = 필요 MH - 가용 MH
- 예시:
  - 125개 W/O → 2,340 MH 필요
  - 현재 50명 (1일 660분 × 5일 = 3,300분/주 → 2,750 MH)
  - Gap: +9명 부족 (18% shortage)
- 효과: 사전 인력 확보/조정 가능

**기술 스택:**
- Python (scikit-learn) - ML 모델
- Cloudflare Workers AI - Edge AI
- 또는 외부 API (OpenAI, Google Vertex AI)

**일정:**
- M1-M2: S/T Learning Engine 개발
- M3-M4: MH Forecasting System 개발
- M5-M6: Workforce Planning 개발 및 통합

**기대 효과:**
- 인력 계획 자동화
- 예측 정확도 향상
- 관리자 업무 부담 감소

---

### **Phase 3: Optimization (6-12개월) - 자원 최적화**
**목표**: AI가 자원을 최적으로 배분

**개발 항목:**

**1. AI Task Allocation (AI 작업 할당)**
- 문제: 관리자가 수작업으로 작업 할당
- 해결: AI가 작업자 스킬/효율/가용시간 고려하여 자동 할당
- 알고리즘:
  - 작업자 프로필: 공정별 스킬 레벨, 평균 효율, 선호 시프트
  - 작업 요구사항: 난이도, 긴급도, 필요 스킬
  - 최적화 목표: 전체 효율 최대화 + 납기 준수
  - Constraint: 작업자별 근무시간, 시프트 제약
- 기술: 선형 계획법 (Linear Programming) 또는 유전 알고리즘
- 효과: 효율 +15%, 유휴시간 -30%

**2. Real-time Cost Tracking (실시간 원가 추적)**
- 문제: 작업별 원가 사후 집계
- 해결: 실시간 작업별 원가 추적 및 경고
- 계산:
  - 인건비: 작업 시간 × 시간당 임금
  - 재료비: 사용 자재 × 단가
  - 설비비: 가동 시간 × 시간당 감가상각비
- 경고:
  - W/O 원가가 예산 초과 시 알림
  - 비정상 원가 패턴 감지 (예: 평소 대비 200% 초과)
- 효과: 원가 절감 기회 조기 발견

**3. ERP Integration (ERP 통합 연동)**
- 문제: MES와 ERP 간 수동 데이터 전송
- 해결: 실시간 양방향 동기화
- 연동 시스템:
  - SAP/Oracle (ERP)
  - Inventory (재고 관리)
  - Procurement (구매)
  - Finance (재무)
- 데이터 흐름:
  - MES → ERP: 작업 완료 → 재고 증가, 원가 반영
  - ERP → MES: 구매 입고 → 자재 가용량 업데이트
- 기술: REST API, Webhook, Message Queue
- 효과: 데이터 일관성 확보, 수작업 제거

**일정:**
- M1-M3: AI Task Allocation 개발
- M4-M6: Real-time Cost Tracking 개발
- M7-M9: ERP Integration 개발
- M10-M12: 통합 테스트 및 최적화

**최종 비전:**
- **Complete Digital Transformation**
- **AI Copilot**: 작업 현장의 AI 비서
  - 🔮 Predict: 주간 생산 계획 자동 생성
  - ⚙️ Optimize: 실시간 자원 최적 배분
  - 🚨 Alert: 이상 징후 사전 경보
  - 📈 Learn: 지속적 성능 개선

---

## 🎯 예상 개선 효과 (정량적 지표)

### Operational Excellence (운영 효율)
- **Efficiency**: 103% → 120% (+16%)
- **Utilization**: 76% → 82% (+6%)
- **Completion**: 7.3 → 9.0 jobs/week (+23%)

### Planning Accuracy (계획 정확도)
- **MH Forecast Error**: ±30% → ±5%
- **Workforce Gap**: -25% → ±2%
- **Schedule Changes**: 40회/월 → 5회/월

### Financial Impact (재무 효과)
- **Labor Cost**: -20% (적정 인력 배치)
- **Overtime**: -35% (사전 인력 계획)
- **Productivity**: +25% (효율 향상)

---

## 🔧 기술적 도전과 해결

### 도전 1: Outlier 처리
**문제**: Worker Rate 1558% 같은 이상치가 평균을 왜곡
**해결**: 
- Outlier Threshold 기능 추가 (기본 1000%)
- 사용자가 임계값 조정 가능
- 최종 결정: Outlier도 계산에 포함 (v3.4.2)
  - 이유: 높은 Rate는 고효율 작업의 정상적인 결과
  - 대신 빨간색으로 표시하여 참고용으로 구분

### 도전 2: Efficiency vs Utilization 혼동
**문제**: 두 지표의 차이를 사용자가 혼동
**해결**:
- 지표 토글 버튼으로 명확히 분리
- 테마 색상 변경 (파란색 vs 보라색)
- Glossary에 상세 설명 추가
- User Guide 강화

### 도전 3: 데이터베이스 스키마 변경
**문제**: worker_st, worker_rate_pct 컬럼 누락
**해결**:
- 마이그레이션 파일 생성 (0002_add_worker_fields.sql)
- 로컬/프로덕션 분리 배포
- 데이터 무결성 검증 로직 추가

### 도전 4: 필터 성능 최적화
**문제**: 38,280건 데이터 필터링 시 렉 발생
**해결**:
- 로딩 인디케이터 추가 (사용자 경험)
- 캐싱 전략 (AppState.cachedWorkerAgg)
- 불필요한 재계산 방지

---

## 📚 배운 점 및 인사이트

### 데이터 품질의 중요성
- **깨달음**: 데이터가 많다고 좋은 게 아니라, 정확한 데이터가 중요
- **문제**: 중복 기록, 누락 데이터, 이상치
- **해결**: 데이터 검증 로직 강화, Rework 자동 제외

### 사용자 피드백의 가치
- **깨달음**: 현장 관리자의 피드백이 개발 방향을 결정
- **예시**: "Shift별로 봐야 의미있다" → Shift Filter 추가
- **예시**: "Outlier 빼면 안 된다" → 계산 포함하되 시각적 구분

### 점진적 개선의 힘
- **깨달음**: 완벽한 시스템을 한 번에 만들 수 없다
- **전략**: MVP → 피드백 → 개선 → 반복
- **결과**: v1.0 → v3.4.2 (30+ 버전 업데이트)

---

## 🚀 즉시 실행 항목 (Next Steps)

### 1. Work Completion Score 개발 (4주)
- [ ] 데이터 구조 설계
- [ ] 계산 로직 구현
- [ ] UI 추가 (KPI 카드, 차트)
- [ ] 테스트 및 검증

### 2. IPR Pilot Program (8주)
- [ ] 50명 작업자 선정
- [ ] Individual Performance Report 화면 개발
- [ ] 성적표 알고리즘 구현 (Overall Score)
- [ ] 파일럿 운영 및 피드백 수집

### 3. 데이터 품질 개선 (지속)
- [ ] 누락 데이터 보완
- [ ] 이상치 검증 강화
- [ ] 중복 기록 제거 로직

### 4. 사용자 교육 및 문서화
- [ ] User Guide 동영상 제작
- [ ] FAQ 작성
- [ ] 관리자 교육 세션

---

## 💡 고민 중인 이슈

### 이슈 1: Overall Score 가중치
**질문**: 3개 지표를 어떻게 조합할 것인가?
- 옵션 A: 동일 가중치 (33.3% × 3)
- 옵션 B: Efficiency 중심 (Util 30% + Eff 40% + Comp 30%)
- 옵션 C: 사용자가 가중치 설정 가능

### 이슈 2: IPR 주기
**질문**: 성과 리포트를 얼마나 자주 생성할 것인가?
- 옵션 A: 실시간 (사용자가 조회할 때마다 계산)
- 옵션 B: 일간 (매일 자정 배치)
- 옵션 C: 주간 (매주 월요일 배치)
- 고려 사항: DB 부하, 일관성, 사용자 경험

### 이슈 3: 공정별 난이도 반영
**질문**: 공정마다 난이도가 다른데, 이를 반영해야 하는가?
- 현재: 모든 공정을 동일하게 취급
- 제안: 공정별 가중치 도입 (예: Mechanical 1.2, Assembly 1.0)
- 문제: 가중치를 누가 어떻게 결정할 것인가?

### 이슈 4: Phase 2 기술 스택
**질문**: AI 모델을 어디서 실행할 것인가?
- 옵션 A: Cloudflare Workers AI (Edge AI)
- 옵션 B: 외부 API (OpenAI, Google Vertex AI)
- 옵션 C: Python 서버 구축 (별도 인프라)
- 고려 사항: 비용, 지연시간, 유지보수

---

## 📞 연락처 및 협업

**프로젝트 소유자**: twokomi
**GitHub**: https://github.com/twokomi/MES_R018_Analysis
**Production URL**: https://mes-r018-analysis.pages.dev
**문의**: MES Team | mes@company.com

---

## 🎓 요약

**우리는 지금까지:**
- ✅ 데이터를 수집하고 저장하는 시스템을 구축했습니다
- ✅ 2개의 성과 지표로 작업자를 측정할 수 있게 되었습니다
- ✅ 538명의 작업자 데이터를 실시간으로 분석하고 있습니다

**우리는 앞으로:**
- 🎯 Work Completion Score를 추가하여 3-Metric System을 완성할 것입니다
- 🎯 AI 기반 예측 시스템으로 인력 계획을 자동화할 것입니다
- 🎯 2028년까지 자율 제조 운영 시스템을 구축할 것입니다

**우리의 비전:**
**"데이터가 있는 것에서 인사이트가 있는 것으로"**
**"경험에 의존하는 것에서 데이터 기반 의사결정으로"**
**"수동 관리에서 AI 자율 운영으로"**

---

이 프롬프트는 MES R018 Analysis 프로젝트의 **탄생 배경, 현재 완성도, 향후 로드맵**을 종합적으로 담았습니다.
