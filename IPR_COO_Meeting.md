---
marp: true
theme: default
paginate: true
style: |
  section {
    background-color: #f8f9fa;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  h1 {
    color: #1a73e8;
    border-bottom: 4px solid #1a73e8;
    padding-bottom: 10px;
  }
  h2 {
    color: #1a73e8;
    margin-top: 20px;
  }
  h3 {
    color: #34a853;
  }
  strong {
    color: #ea4335;
  }
  table {
    margin: 20px auto;
  }
  blockquote {
    background: #e8f0fe;
    border-left: 5px solid #1a73e8;
    padding: 15px;
    margin: 20px 0;
  }
---

# 🎯 IPR (Individual Performance Report)
## **COO 조직 요구사항 수집 미팅**

<br>

**날짜**: 2026년 3월
**참석**: BT Manager, COO 조직 담당자

<br>

> *"데이터 기반 생산성 분석으로 현장 혁신을 실현합니다"*

---

## 📋 Today's Agenda

<br>

| 순서 | 내용 | 시간 |
|:---:|:---|:---:|
| 1️⃣ | **IPR 소개 및 핵심 지표** | 8분 |
| 2️⃣ | **Dashboard & Report 기능** | 7분 |
| 3️⃣ | **정식 개발 일정** | 3분 |
| 4️⃣ | **요구사항 수집 및 논의** | 12분 |

<br>

**Total**: 30분

---

# 🎯 IPR이란?

<br>

## **Individual Performance Report & Dashboard**

<br>

> 📊 **MES R018 데이터 기반** 작업자별 생산성 측정 및 분석 시스템
> 
> 🔄 **Excel 업로드** → **자동 분석** → **실시간 리포트**

<br>

### ✅ 현재 베타 버전 운영 중
**URL**: https://mes-r018-analysis-5bz.pages.dev

---

## ⏱️ 지표 1: Time Utilization Rate
### **(시간 활용도)**

<br>

**📌 핵심 질문**: *"작업자가 할당된 시간을 얼마나 활용했는가?"*

<br>

### 계산 공식
```
Time Utilization Rate = (실제 작업 시간 ÷ 총 시프트 시간) × 100%
```

<br>

### 실제 예시
- **총 시프트 시간**: 660분 (11시간)
- **실제 작업 시간**: 480분 (8시간)
- **Utilization Rate**: **72.7%** ✅

---

## ⏱️ Time Utilization - 활용 시나리오

<br>

### 📊 **현장 관리자 관점**
- 작업자 A: 85% → **우수** 🟢
- 작업자 B: 45% → **개선 필요** 🟡
- 작업자 C: 25% → **긴급 조치** 🔴

<br>

### 🎯 **개선 액션**
1. **저활용 작업자 식별** → 원인 분석 (대기 시간, 자재 부족 등)
2. **공정 병목 파악** → 워크플로우 최적화
3. **작업 재분배** → 라인 밸런싱

---

## ⚡ 지표 2: Work Efficiency Rate
### **(작업 효율)**

<br>

**📌 핵심 질문**: *"작업자가 얼마나 빠르고 정확하게 작업했는가?"*

<br>

### 계산 공식
```
Work Efficiency Rate = (표준 시간(S/T) ÷ 실제 소요 시간) × 100%
```

<br>

### 실제 예시
- **표준 시간 (S/T)**: 400분
- **실제 소요 시간**: 480분
- **Efficiency Rate**: **83.3%** ✅

---

## ⚡ Work Efficiency - 활용 시나리오

<br>

### 📊 **현장 관리자 관점**
- 작업자 A: 120% → **숙련자** (표준 시간보다 빠름) 🟢
- 작업자 B: 80% → **표준** 🟡
- 작업자 C: 50% → **교육 필요** 🔴

<br>

### 🎯 **개선 액션**
1. **고효율 작업자 분석** → 베스트 프랙티스 공유
2. **저효율 작업자 지원** → 교육 및 멘토링
3. **공정별 표준 시간 검증** → S/T 재설정

---

## 📈 Dashboard - 전체 성과 한눈에

<br>

### 🚨 **1. AI Insights & Warnings**
- **저효율 경고**: 평균 효율 50% 미만
- **저가동 경고**: 평균 활용도 50% 미만
- **공정 편중**: 특정 공정 60% 초과
- **이상치 감지**: 비정상 데이터 자동 필터링
- **샘플 부족**: 통계적 유의성 검증

<br>

### 📊 **2. KPI Trend Overview**
- **Daily/Weekly 토글**: 일별/주별 추이 비교
- **차트 클릭**: 프로세스 상세 모달 표시
- **드릴다운**: L1 → L2 → L3 계층 분석

---

## 📈 Dashboard - 성과 비교 및 분포

<br>

### 🏆 **3. Process Performance Ranking**
- **Top 5 공정**: 우수 공정 시각화 (초록색)
- **Bottom 5 공정**: 개선 필요 공정 (빨간색)
- **카드 클릭**: 공정별 상세 통계 모달

<br>

### 📉 **4. Shift Performance Comparison**
| 그룹 | Day Shift | Night Shift | 지원 Shift |
|:---:|:---:|:---:|:---:|
| **BT** (Body Tower) | 72% / 85% | 68% / 78% | A, B, C, D |
| **WT** (Wind Tower) | 75% / 88% | 70% / 82% | A, B, C, D |
| **IM** (Inner Material) | 78% / 90% | 71% / 80% | A, B, C |

---

## 📈 Dashboard - 분포 분석

<br>

### 📊 **5. Distribution & Outliers**

<br>

**시간 활용도 분포 히스토그램**
```
 80-100% ████████████████ (35명) 🟢 Excellent
 60-80%  ████████████     (28명) 🟡 Normal
 40-60%  ████████         (18명) 🟠 Poor
 20-40%  ████             (9명)  🔴 At-Risk
  0-20%  ██               (4명)  ⚫ Critical
```

<br>

**클릭 → 해당 범위 작업자 리스트 모달**

---

## 📋 Report - 상세 데이터 분석

<br>

### 🔍 **1. 고급 필터링 시스템**

| 필터 타입 | 옵션 | 기능 |
|:---|:---|:---|
| **📅 날짜** | 일/주/월/기간 선택 | 특정 기간 성과 분석 |
| **🌓 시프트** | Day/Night/A/B/C/D | 시프트별 비교 분석 |
| **🏭 공정** | L1 → L2 → L3 계층 | 공정별 드릴다운 |
| **👤 작업자** | 다중 선택 지원 | 특정 작업자 그룹 분석 |
| **🎯 성과 밴드** | Excellent/Normal/Poor | 등급별 필터링 |

<br>

**✨ 복합 필터**: 모든 필터 동시 적용 가능

---

## 📋 Report - KPI 및 시각화

<br>

### 📊 **2. 4개 핵심 KPI 카드**

<br>

| KPI | Utilization Mode | Efficiency Mode |
|:---|:---|:---|
| **카드 1** | 총 작업자 수 | 총 작업자 수 |
| **카드 2** | 총 시프트 시간 | 총 표준 시간 (S/T) |
| **카드 3** | 총 작업 시간 | 총 실제 시간 |
| **카드 4** | **평균 활용도 (%)** ⭐ | **평균 효율 (%)** ⭐ |

<br>

**🔄 실시간 전환**: Utilization ⇄ Efficiency 버튼 클릭

---

## 📋 Report - 성과 분포 및 상세

<br>

### 🍩 **3. Performance Band (도넛 차트)**

<br>

**5단계 등급 분류**
- **🟢 Excellent** (≥80%): 우수 작업자
- **🟡 Normal** (50-80%): 표준 작업자
- **🟠 Poor** (30-50%): 개선 필요
- **🔴 At-Risk** (<30%): 긴급 조치 필요
- **⚫ Critical**: 심각한 문제

<br>

**차트 클릭 → 해당 등급 작업자 목록**

---

## 📋 Report - 공정 분석 및 작업자 상세

<br>

### 📈 **4. Process Performance (막대 차트)**
- **상위 30개 공정** 성과 비교
- **색상 코딩**: 초록(우수) / 노랑(보통) / 빨강(개선 필요)
- **정렬 기능**: 성과순 / 가나다순

<br>

### 👤 **5. Worker Detail Modal**
**작업자 이름 클릭 시 상세 팝업**
- **📊 Shift Distribution Chart**: 시프트별 작업 시간 분포
- **📈 Process Distribution Chart**: 공정별 효율 분포
- **📋 Work Records Table**: 전체 작업 이력 (날짜, 공정, 시간, 효율)
- **🔄 정렬 기능**: 날짜순 / 효율순 / 공정순

---

## 📅 정식 개발 일정

<br>

### 🚀 **3주 Sprint로 빠른 배포**

<br>

| 날짜 | 마일스톤 | 주요 내용 | 산출물 |
|:---:|:---|:---|:---|
| **3/19 (수)** | 🎬 **개발 착수** | 요구사항 반영 시작 | 상세 설계서 |
| **4/1 (화)** | 🎯 **1차 오픈** | 핵심 기능 배포 | Beta+ 버전 |
| **4/8 (화)** | 🎉 **풀 오픈** | 전체 기능 완료 | Production |

<br>

**개발 인력**: 22 M/D (약 3주)
**배포 방식**: Cloudflare Pages (Zero Downtime)

---

## ✅ 접수된 요구사항 1
### **작업자별 성적표 (Report Card)**

<br>

**📌 요구사항**
> 두 지표(Time Utilization + Work Efficiency)를 결합한 작업자별 종합 성적표 생성 및 추출

<br>

### 제안 기능
| 기능 | 설명 | 산출물 |
|:---|:---|:---:|
| **종합 점수** | Utilization 50% + Efficiency 50% | 0-100점 |
| **등급 분류** | S (90+) / A (80-89) / B (70-79) / C (60-69) / D (<60) | S~D |
| **기간별 생성** | 주간 / 월간 / 분기별 성적표 | 📊 |
| **다운로드** | Excel / PDF 형식 지원 | 💾 |

**⏱️ 예상 개발 기간**: 3~5일

---

## ✅ 접수된 요구사항 2
### **모드별 필터링 (Advanced Filtering)**

<br>

**📌 요구사항**
> 다양한 기준으로 데이터를 필터링하고 분석할 수 있는 고급 필터 시스템

<br>

### 제안 기능
| 필터 타입 | 옵션 | 활용 예시 |
|:---|:---|:---|
| **공정별** | Bevel, Cut, Paint 등 | "Bevel 공정만 보기" |
| **시프트별** | Day/Night, A/B/C/D | "야간 근무자만 분석" |
| **기간별** | 일/주/월/커스텀 | "최근 1주일 성과" |
| **성과 밴드** | Excellent/Normal/Poor | "우수 작업자만 조회" |
| **복합 필터** | 위 조건 동시 적용 | "Day + Bevel + 우수" |

**⏱️ 예상 개발 기간**: 2~3일

---

## 💬 추가 요구사항을 들려주세요

<br>

### 🎯 **핵심 질문**

<br>

1. **📱 모바일/태블릿** - 현장에서 태블릿으로 사용하시나요?

2. **🔔 알림 기능** - 특정 작업자나 공정에 대한 알림이 필요한가요?

3. **📊 추가 리포트** - 어떤 형태의 리포트가 더 필요하신가요?

4. **⚡ 데이터 업데이트** - 실시간? 1시간마다? 하루 1회?

5. **🎓 교육 기능** - 저효율 작업자를 위한 교육 추천 기능?

6. **🔗 타 시스템 연동** - ERP, WMS 등 다른 시스템과 연동?

---

# 🙏 Thank You!

<br>

## **함께 만들어가는 IPR**

<br>

> *"여러분의 요구사항이 IPR을 더 강력하게 만듭니다"*

<br>

**개발 담당**: JB Park (jbpark@cswind.com)
**GitHub**: https://github.com/joonbae123/MES_R018_Analysis
**Production**: https://mes-r018-analysis-5bz.pages.dev

<br>

### 💬 질문 및 논의 환영합니다!

