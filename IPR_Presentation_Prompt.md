# IPR (Individual Performance Report) 프레젠테이션 제작 프롬프트

## 📋 프로젝트 개요
- **프로젝트명**: IPR (Individual Performance Report) - 작업자 성과 관리 시스템
- **목적**: 경영진 대상 장기 로드맵 발표
- **톤앤매너**: 미니멀, 모던, 전문적, 키워드 중심
- **참고 자료**: AIX_R&R_Rev.03.pptx (첨부된 샘플 PPT의 색상/톤 매칭 필수)

---

## 📊 슬라이드 구성 (총 12장)

### **Slide 1: 타이틀**
**내용:**
- 메인 타이틀: Individual Performance Report
- 부제: 작업자 성과 관리 시스템
- 서브: MES R018 Analysis - Long-term Roadmap
- 기간: 2026 ~ 2028
- 날짜: Feb 2026

---

### **Slide 2: The Journey (현재 → 미래)**
**메시지:** 데이터는 있지만 활용하지 못하는 현재에서 데이터 기반 의사결정으로의 전환

**AS-IS (현재의 한계):**
- 데이터는 있지만 활용 없음
- 작업자 성과 측정 불가
- 인력 계획이 경험에 의존
- 비효율 지속

**TO-BE (데이터 기반 의사결정):**
- 3가지 핵심 지표 실시간 집계
- 개인별 성과 리포트
- AI 기반 인력 예측
- 생산성 향상

**표현 방식:** 좌우 대비 (AS-IS vs TO-BE)

---

### **Slide 3: 3-Metric System**
**메시지:** 작업자 성과를 3가지 차원에서 측정

**지표 1: Time Utilization (작업 시간 활용률)**
- 의미: 근무 시간 대비 실제 작업 시간
- 예시 값: 76.3%

**지표 2: Work Efficiency (작업 효율성)**
- 의미: 표준 시간(S/T) 대비 실제 생산성
- 예시 값: 103.2%

**지표 3: Work Completion (작업 완결성)**
- 의미: 완료된 작업 수량 (새로운 지표)
- 예시 값: 7.3 jobs/week
- 설명: 작업자 A가 W/O 3개를 각각 40%, 40%, 40% 수행 → 1.2개 완료로 집계

**종합:**
- Overall Score 개념 도입 (예: A-, 87.2/100)
- 3개 지표를 조합하여 작업자 성과 평가

---

### **Slide 4: Work Completion Score 상세**
**메시지:** 새로운 지표 "Work Completion Score"의 정의와 계산 방법

**공식:**
```
Work Completion Score = Σ (Job Rate / 100)
```

**예시:**
- W/O-123: 100% → 1.0
- W/O-124: 40% → 0.4
- W/O-125: 80% → 0.8
- 합계: 2.2 jobs 완료

**작업 상태별 분류:**
- Completed (100%): 3 jobs
- Near Complete (80-99%): 2 jobs
- In Progress (50-79%): 1 job
- Started (<50%): 3 jobs

**결과:**
- Total Score: 5.4 / 9 jobs
- Completion Rate: 60%

**핵심 메시지:** 단순 시작/완료가 아닌, 진행률 기반의 정량적 완결성 측정

---

### **Slide 5: 현재 완성도**
**메시지:** 시스템 구현 현황 (무엇이 완료되었는가)

**✅ 구현 완료:**
- Time Utilization 지표 측정 (실시간)
- Work Efficiency 지표 측정 (실시간)
- 작업자별 데이터 수집 및 집계
- Worker Detail 모달 (개별 작업자 상세 분석)
- Team Dashboard (팀 전체 현황)
- 데이터 필터링 (기간, 공정, 작업자)
- Excel 업로드 기능
- 실시간 KPI 업데이트

**🚧 개발 중:**
- Work Completion Score 지표 추가
- Individual Performance Report (IPR) 화면
- 공정별 성과 분석
- 주간/월간 리포트 생성

**📊 현재 데이터:**
- 수집된 작업 기록: 38,280건
- 등록된 작업자: 538명
- 모니터링 기간: 2026년 2월 기준

---

### **Slide 6: 장기 로드맵 - 전체 흐름**
**메시지:** 3단계로 진화하는 IPR 시스템

**Phase 1 (0-3개월): Foundation - 기본 지표 시스템**
- 기간: 2026 Q2 ~ Q3
- 목표: 3-Metric System 구축
- 주요 기능:
  - Work Completion Score 추가
  - Individual Performance Report 화면
  - Team Dashboard 고도화

**Phase 2 (3-6개월): Intelligence - AI 기반 예측**
- 기간: 2026 Q4 ~ 2027 Q2
- 목표: 데이터 기반 예측 시스템
- 주요 기능:
  - Standard Time(S/T) 학습 엔진
  - Man-Hour(MH) 예측 시스템
  - 적정 인력 산출 자동화

**Phase 3 (6-12개월): Optimization - 자원 최적화**
- 기간: 2027 Q3 ~ 2028 Q2
- 목표: AI 기반 자원 배분 최적화
- 주요 기능:
  - AI 작업 할당 시스템
  - 실시간 원가 추적
  - ERP/MES 통합 연동

---

### **Slide 7: Phase 1 - Foundation 상세**
**메시지:** 3-Metric System 완성

**목표:** 작업자 성과를 정량적으로 측정하는 기반 마련

**데이터 흐름:**
1. Raw Data (38,280건의 작업 기록)
   - Work Orders
   - Time Logs
   - Worker Assignments

2. 3-Metric Engine
   - Time Utilization 계산
   - Work Efficiency 계산
   - Work Completion 계산

3. Output
   - Individual Performance Report (개인 성적표)
   - Team Dashboard (팀 전체 현황)
   - Real-time Score (실시간 점수)

**일정:**
- M1: 설계 및 데이터 구조 확정
- M2: Work Completion Score 개발
- M3: IPR 화면 개발 및 테스트
- M4: 전사 배포 및 사용자 교육

---

### **Slide 8: Phase 2 - Intelligence 상세**
**메시지:** 실적 데이터를 활용한 예측 시스템

**1. Standard Time Learning**
- 문제: 현재 S/T는 고정값, 실제와 괴리
- 해결: 실적 데이터로 실제 소요 시간 학습
- 효과: S/T 정확도 향상 (60% → 95%)

**2. Man-Hour Forecasting**
- 문제: 물량 계획 시 필요 MH를 수작업으로 추정
- 해결: 과거 실적 기반 MH 자동 예측
- 예시:
  - W/O-125 (Mechanical, 100개) → 예측 1,200 MH
  - W/O-126 (Electrical, 80개) → 예측 960 MH
- 효과: 예측 오차 ±30% → ±5%

**3. Workforce Planning**
- 문제: 인력이 부족한지 넘치는지 불명확
- 해결: 필요 MH 대비 현재 인력 갭 분석
- 예시:
  - 125개 W/O → 2,340 MH 필요
  - 현재 50명 vs 필요 59명 → 9명 부족 (18% shortage)
- 효과: 사전 인력 확보/조정 가능

---

### **Slide 9: Phase 3 - Optimization 상세**
**메시지:** AI가 자원을 최적으로 배분

**1. AI Task Allocation**
- 현재: 관리자가 수작업으로 작업 할당
- 개선: AI가 작업자 스킬/효율/가용시간 고려하여 자동 할당
- 효과: 효율 +15%, 유휴시간 -30%

**2. Cost Tracking**
- 현재: 작업별 원가 사후 집계
- 개선: 실시간 작업별 원가 추적 및 경고
- 예시: W/O-123 원가 $5,880 → $4,855 (17.4% 절감)

**3. ERP Integration**
- 현재: MES와 ERP 간 수동 데이터 전송
- 개선: 실시간 양방향 동기화
- 연동 시스템:
  - SAP/Oracle (ERP)
  - Inventory (재고 관리)
  - Procurement (구매)
  - Finance (재무)

**최종 비전:** Complete Digital Transformation

---

### **Slide 10: Success Metrics - 예상 개선 효과**
**메시지:** 시스템 도입 시 기대 효과

**Operational Excellence (운영 효율):**
- Efficiency: 103% → 120% (+16%)
- Utilization: 76% → 82% (+6%)
- Completion: 7.3 → 9.0 jobs/week (+23%)

**Planning Accuracy (계획 정확도):**
- MH Forecast Error: ±30% → ±5%
- Workforce Gap: -25% → ±2%
- Schedule Changes: 40회/월 → 5회/월

**Financial Impact (재무 효과):**
- Labor Cost: -20%
- Overtime: -35%
- Productivity: +25%

---

### **Slide 11: Vision 2028**
**메시지:** 2028년 최종 목표 - AI Copilot

**AI Copilot - 작업 현장의 AI 비서**

**4가지 핵심 기능:**

1. **Predict (예측)**
   - 주간 생산 계획 자동 생성
   - 필요 인력 사전 예측

2. **Optimize (최적화)**
   - 실시간 자원 배분
   - 작업 우선순위 자동 조정

3. **Alert (경고)**
   - 이상 징후 사전 감지
   - 병목 구간 사전 경보

4. **Learn (학습)**
   - 지속적인 성능 개선
   - 작업 패턴 자동 학습

**최종 목표:** Autonomous Manufacturing Operations (자율 제조 운영)

---

### **Slide 12: Next Steps**
**메시지:** 지금 시작해야 할 일

**즉시 실행 항목:**

✅ **Work Completion Score 개발**
- 기간: 4주
- 내용: 새로운 지표 추가 및 화면 구현

✅ **IPR Pilot Program**
- 기간: 8주
- 대상: 50명 작업자 선정
- 내용: Individual Performance Report 시범 운영

✅ **Team Dashboard 고도화**
- 기간: 12주
- 내용: 전사 배포 버전 완성

✅ **데이터 품질 개선**
- 기간: 지속
- 내용: 누락 데이터 보완, 이상치 제거

**타임라인:**
- M1: 설계
- M2: 개발
- M3: 테스트
- M4: 배포

**필요 사항:**
- Executive Sponsorship (경영진 후원)
- Change Management Plan (변화 관리 계획)
- IT Team Alignment (IT 팀 협업)

**연락처:** MES Team | mes@company.com

---

## 🎯 핵심 메시지 요약

1. **현재 상황:** Time Utilization, Work Efficiency 2개 지표로 운영 중
2. **즉시 과제:** Work Completion Score 추가하여 3-Metric System 완성
3. **장기 비전:** AI Copilot을 통한 자율 제조 운영 (2028년)
4. **3단계 로드맵:**
   - Phase 1: 기본 지표 시스템 (2026 Q2~Q3)
   - Phase 2: AI 예측 시스템 (2026 Q4~2027 Q2)
   - Phase 3: 자원 최적화 (2027 Q3~2028 Q2)

---

## 📝 참고 사항

**샘플 PPT 톤 매칭:**
- 첨부된 AIX_R&R_Rev.03.pptx 파일의 색상, 레이아웃, 톤앤매너 적용
- Navy Blue (#232669), Bright Blue (#0583F2) 중심 색상
- 미니멀하고 깔끔한 디자인
- 키워드 중심, 설명 최소화

**슬라이드 스타일:**
- 각 슬라이드는 1개의 핵심 메시지만 전달
- 텍스트는 키워드/불릿 포인트 중심
- 숫자/지표는 크게 강조
- 도표/차트는 간결하게

**발표 대상:** 경영진 (CEO, 공장장, 부문장)
**발표 시간:** 약 20분
**목적:** 장기 로드맵 공유 및 Phase 1 착수 승인
