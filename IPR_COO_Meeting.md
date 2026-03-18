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

**주요 기능**
- ⏱️ **Time Utilization Rate**: 시간 활용도 (작업시간 ÷ 시프트시간)
- ⚡ **Work Efficiency Rate**: 작업 효율 (표준시간 ÷ 실제시간)
- 📊 **Dashboard**: AI Insights, KPI Trend, Process Ranking
- 📄 **Worker Detail**: 작업자별 상세 성과 분석

---

## 🌐 현재 베타 버전

**프로덕션 URL**: https://mes-r018-analysis-5bz.pages.dev

**주요 화면**
1. **Dashboard**: 전체 성과 요약, 경고, 트렌드
2. **Report**: 필터링, Pivot 테이블, 작업자 검색
3. **Worker Detail Modal**: 개인별 상세 이력 및 통계
4. **Process Mapping**: 공정 매핑 관리

**현재 방식**: Excel 파일 업로드 → 분석

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

## 🔄 향후 계획 (풀 오픈 이후)

**Phase 2 (5~6월)**:
- MES API 직접 연동 (Excel 업로드 방식 탈피)
- 실시간 데이터 자동 업데이트
- SSO (Azure AD) 로그인

**Phase 3 (7~9월)**:
- Work Order Agent AI 연동
- AI 기반 작업 할당 추천 API 제공
- 작업자 Skill Matrix

**Phase 4 (10~12월)**:
- 다국가 법인 지원 (한국, 베트남 등)

---

## 📞 Contact & Next Steps

**개발 담당**: JB Park (jbpark@cswind.com)
**GitHub**: https://github.com/joonbae123/MES_R018_Analysis
**Production**: https://mes-r018-analysis-5bz.pages.dev

**Next Steps**:
1. 오늘 접수된 요구사항 정리 (개발팀)
2. 요구사항별 우선순위 협의 (COO 조직)
3. 3/19 개발 착수
4. 주간 진행 상황 공유 (이메일)
5. 4/1 1차 오픈 전 UAT (User Acceptance Test)

---

## Q&A

**질문 환영합니다!** 🙋‍♂️

