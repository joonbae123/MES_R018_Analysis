---
marp: true
theme: default
paginate: true
---

# IPR (Individual Performance Report)
## COO 조직 요구사항 수집 미팅

**날짜**: 2026년 3월
**참석**: BT Manager, COO 조직 담당자

---

## 📋 미팅 Agenda

1. **IPR 간단 소개** (5분)
   - 현재 베타 버전 주요 기능
   - 데모 URL 공유

2. **정식 개발 일정** (3분)
   - 3/19 개발 착수 → 4/1 1차 오픈 → 4/8 풀 오픈

3. **요구사항 수집** (15분)
   - 현재 접수된 요구사항 확인
   - 추가 요구사항 접수

4. **Q&A 및 Next Steps** (7분)

---

## 🎯 IPR이란?

**Individual Performance Report & Dashboard**
- 작업자별 생산성을 측정하고 분석하는 웹 애플리케이션
- MES R018 데이터 기반 성과 분석

**현재 방식**: Excel 파일 업로드 → 자동 분석 → 리포트 생성

**프로덕션 URL**: https://mes-r018-analysis-5bz.pages.dev

---

## 📊 두 가지 핵심 지표

### ⏱️ Time Utilization Rate (시간 활용도)
- **정의**: 실제 작업 시간이 총 시프트 시간 중 몇 %인지 측정
- **계산식**: (총 작업 시간 ÷ 총 시프트 시간) × 100
- **목적**: 작업자가 할당된 시간을 얼마나 활용했는지 평가

### ⚡ Work Efficiency Rate (작업 효율)
- **정의**: 표준 시간(S/T) 대비 실제 소요 시간 비율
- **계산식**: (총 표준 시간 ÷ 총 실제 시간) × 100
- **목적**: 작업 속도 및 숙련도 평가

---

## 📈 주요 기능: Dashboard

**전체 성과 한눈에 보기**
- 🚨 **AI Insights & Warnings**: 6가지 자동 경고 (저효율, 저가동, 공정 편중 등)
- 📊 **KPI Trend Overview**: Daily/Weekly 성과 추이 (차트 클릭 → 상세 모달)
- 🏆 **Process Performance Ranking**: Top 5 / Bottom 5 공정 비교
- 📉 **Shift Performance Comparison**: Day/Night, BT/WT/IM 그룹별 비교
- 📊 **Distribution & Outliers**: 가동률/효율 분포 히스토그램

---

## 📋 주요 기능: Report

**상세 데이터 분석 및 필터링**
- 🔍 **고급 필터링**: 날짜, 시프트, 공정, 작업자 다중 선택
- 🔄 **두 지표 전환**: Utilization ⇄ Efficiency 실시간 전환
- 📊 **4개 KPI 카드**: 작업자 수, 시프트 시간, 작업 시간, 평균 Rate
- 🍩 **Performance Band**: 5단계 등급별 분포 (Excellent/Normal/Poor/Critical)
- 📈 **Process Performance**: 공정별 성과 비교 (상위 30개)
- 👤 **Worker Detail Modal**: 작업자 클릭 → 상세 이력 및 통계

---

## 📅 정식 개발 일정

| 날짜 | 마일스톤 | 주요 내용 |
|------|----------|-----------|
| **3/19 (수)** | 개발 착수 | 요구사항 반영 시작 |
| **4/1 (화)** | 1차 오픈 | 핵심 기능 배포 (Beta+) |
| **4/8 (화)** | 풀 오픈 | 전체 기능 완료 |

**개발 기간**: 약 3주 (22 M/D)

**1차 오픈 (4/1)**: 기본 기능 + 긴급 요구사항
**풀 오픈 (4/8)**: 전체 요구사항 + 안정화

---

## ✅ 접수된 요구사항 (2건)

### 1. 작업자별 성적표 기능
**요구사항**: 두 지표(Time Utilization + Work Efficiency)를 결합한 작업자별 성적표 생성 및 추출

**제안 기능**:
- 작업자별 종합 점수 (Utilization 50% + Efficiency 50%)
- 등급 분류 (S/A/B/C/D)
- Excel/PDF 다운로드 기능
- 기간별 성적표 생성 (주간/월간)

**예상 개발 기간**: 3~5일

---

## ✅ 접수된 요구사항 (2건)

### 2. 모드별 필터링 기능
**요구사항**: 다양한 모드로 데이터를 필터링하고 분석

**제안 기능**:
- 공정별 필터 (Bevel, Cut, Paint 등)
- 시프트별 필터 (Day/Night, Shift A/B/C/D)
- 기간별 필터 (일/주/월)
- 성과 밴드별 필터 (Excellent/Normal/Poor)
- 복합 필터 (공정 + 시프트 + 기간)

**예상 개발 기간**: 2~3일

---

## 💡 추가 요구사항 접수

**오픈 질문**:
1. 현재 베타 버전 사용 시 불편한 점은?
2. 추가로 필요한 리포트나 차트는?
3. 작업자 성적표에 포함되어야 할 정보는?
4. 모바일/태블릿에서도 사용하시나요?
5. 데이터 업데이트 주기는? (현재: 수동 Excel 업로드)
6. 특정 작업자나 공정에 대한 알림 기능이 필요한가요?

**접수 방법**: 오늘 미팅 중 구두 또는 이메일로 추가 접수 가능

---

## Q&A

**질문 환영합니다!** 🙋‍♂️

**개발 담당**: JB Park (jbpark@cswind.com)
**GitHub**: https://github.com/joonbae123/MES_R018_Analysis
**Production**: https://mes-r018-analysis-5bz.pages.dev

