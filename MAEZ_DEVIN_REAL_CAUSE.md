# 🔍 MAEZ, DEVIN 0% 문제 - 진짜 원인 분석

## ❌ 잘못된 초기 분석
- **X** ~~S/T가 0이라서~~ → S/T는 Efficiency에만 영향
- **X** ~~Worker Rate가 0이라서~~ → Utilization과 무관

## ✅ 진짜 원인

### 문제 코드 (app.js line 1078-1082)
```javascript
function isValidResult(resultCnt) {
    if (!resultCnt) return false;
    const normalized = normalizeHeader(resultCnt.toString());
    return normalized === 'X'; // ⚠️ Result Cnt가 'X'가 아니면 false
}
```

### 집계 로직 (app.js line 2228-2229)
```javascript
if (record.validFlag === 1) {  // ⚠️ validFlag가 1일 때만 누적
    aggregated[key].totalMinutes += record.workerActMins || 0;
```

### 원인
**MAEZ, DEVIN의 레코드에서 `Result Cnt` 컬럼이 'X'가 아님**
- Result Cnt = NULL, 빈 문자열, 또는 다른 값 (예: 'O', '1', 'Y')
- → `isValidResult()` returns false
- → `validFlag = 0`
- → `totalMinutes`에 누적되지 않음
- → **Utilization = 0%**

---

## 🔍 확인 방법

### 방법 1: 브라우저 콘솔에서 확인
```javascript
// 메인 페이지에서 F12 → Console
AppState.processedData
    .filter(r => r.workerName === 'MAEZ, DEVIN')
    .forEach(r => console.log({
        date: r.workingDay,
        process: r.foDesc3,
        resultCnt: r.resultCnt,
        validFlag: r.validFlag,
        workerActMins: r.workerActMins
    }));
```

### 방법 2: 데이터베이스 확인
```sql
SELECT 
    worker_name,
    working_day,
    fo_desc,
    result_cnt,  -- ⚠️ 이 값이 'X'인지 확인
    worker_act
FROM raw_data
WHERE worker_name = 'MAEZ, DEVIN'
ORDER BY working_day DESC
LIMIT 10;
```

---

## 🛠️ 해결 방안

### 방안 1: validFlag 조건 완화 (권장)

**문제:** Result Cnt가 'X'가 아니면 모든 작업이 무시됨

**해결:** validFlag 체크를 제거하거나, 다른 조건 추가

```javascript
// app.js line 2227-2231 수정
// 기존
if (record.validFlag === 1) {
    aggregated[key].totalMinutes += record.workerActMins || 0;
    aggregated[key].validCount += 1;
    validRecords++;
}

// 수정 옵션 1: validFlag 무시, workerActMins만 체크
if (record.workerActMins > 0) {  // ✅ 작업 시간이 있으면 누적
    aggregated[key].totalMinutes += record.workerActMins;
    aggregated[key].validCount += 1;
    validRecords++;
}

// 수정 옵션 2: Rework만 제외
if (record.validFlag === 1 || record.workerActMins > 0) {  // ✅ validFlag 또는 작업시간
    aggregated[key].totalMinutes += record.workerActMins || 0;
    aggregated[key].validCount += 1;
    validRecords++;
}
```

---

### 방안 2: isValidResult 함수 수정

**문제:** Result Cnt = 'X'만 유효로 인식

**해결:** 다른 값도 허용

```javascript
// app.js line 1078-1082 수정
function isValidResult(resultCnt) {
    if (!resultCnt) return true;  // ✅ 빈 값도 허용 (기본값 = 유효)
    const normalized = normalizeHeader(resultCnt.toString());
    
    // ✅ 'X', 'O', 'Y', '1' 모두 유효로 인식
    const validValues = ['X', 'O', 'Y', '1', 'OK', 'COMPLETE'];
    return validValues.includes(normalized);
    
    // 또는 Rework만 제외
    // return normalized !== 'REWORK' && normalized !== 'R';
}
```

---

### 방안 3: 데이터 수정 (근본 해결)

**Excel 파일 수정:**
- MAEZ, DEVIN의 Result Cnt 컬럼을 'X'로 변경
- 재업로드

**데이터베이스 수정:**
```sql
-- Result Cnt가 비어있거나 'X'가 아닌 경우 'X'로 업데이트
UPDATE raw_data
SET result_cnt = 'X'
WHERE worker_name = 'MAEZ, DEVIN'
AND (result_cnt IS NULL OR result_cnt = '' OR result_cnt != 'X');
```

---

## 🎯 권장 해결 방법

### **옵션 A: validFlag 조건 완화** (빠른 해결)

**장점:**
- 코드 1줄 수정으로 즉시 해결
- 다른 작업자들도 함께 해결

**단점:**
- Rework도 포함될 수 있음 (주의 필요)

**구현:**
```javascript
// app.js line 2228 수정
// Before:
if (record.validFlag === 1) {

// After:
if (record.validFlag === 1 || (record.workerActMins > 0 && !record.foDesc3.toLowerCase().includes('rework'))) {
```

---

### **옵션 B: isValidResult 함수 수정** (더 안전)

**장점:**
- 명확한 조건 정의
- Rework 제외 로직 유지

**단점:**
- Result Cnt 값의 표준을 정의해야 함

**구현:**
```javascript
// app.js line 1078-1082 수정
function isValidResult(resultCnt) {
    if (!resultCnt) return true;  // ✅ 빈 값은 유효로 처리
    const normalized = normalizeHeader(resultCnt.toString());
    
    // Rework만 제외
    const invalidValues = ['REWORK', 'R', 'RE'];
    return !invalidValues.includes(normalized);
}
```

---

## 📊 동일 케이스 찾기

### Frontend에서 확인
```javascript
// 브라우저 콘솔에서 실행
const workersWithZeroUtil = AppState.processedData
    .reduce((acc, r) => {
        if (!acc[r.workerName]) {
            acc[r.workerName] = {
                totalRecords: 0,
                validRecords: 0,
                invalidRecords: 0,
                totalMinutes: 0
            };
        }
        acc[r.workerName].totalRecords++;
        if (r.validFlag === 1) {
            acc[r.workerName].validRecords++;
            acc[r.workerName].totalMinutes += r.workerActMins || 0;
        } else {
            acc[r.workerName].invalidRecords++;
        }
        return acc;
    }, {});

// 0분 작업자 찾기
Object.entries(workersWithZeroUtil)
    .filter(([name, data]) => data.totalMinutes === 0 && data.totalRecords > 0)
    .forEach(([name, data]) => {
        console.log(`⚠️ ${name}: ${data.totalRecords} records, all invalid (validFlag=0)`);
    });
```

### Database에서 확인
```sql
-- Result Cnt가 'X'가 아닌 작업자 찾기
SELECT 
    worker_name,
    COUNT(*) as total_records,
    SUM(CASE WHEN result_cnt = 'X' THEN 1 ELSE 0 END) as valid_records,
    SUM(CASE WHEN result_cnt IS NULL OR result_cnt = '' OR result_cnt != 'X' THEN 1 ELSE 0 END) as invalid_records
FROM raw_data
GROUP BY worker_name
HAVING invalid_records > 0
ORDER BY invalid_records DESC;
```

---

## 🚀 즉시 적용 가능한 수정

### 수정 1: validFlag 조건 완화
```javascript
// /home/user/webapp/public/js/app.js line 2228

// Before:
if (record.validFlag === 1) {

// After:
if (record.validFlag === 1 || record.workerActMins > 0) {
```

### 수정 2: dist 복사 및 배포
```bash
cd /home/user/webapp
cp public/js/app.js dist/js/app.js
pm2 restart mes-r018-analysis
```

---

## ✅ 체크리스트

- [ ] MAEZ, DEVIN의 Result Cnt 값 확인 (콘솔 또는 DB)
- [ ] 다른 0% 작업자 리스트 확인
- [ ] validFlag 조건 완화 (app.js 수정)
- [ ] 테스트 (로컬)
- [ ] dist/js/app.js 복사
- [ ] pm2 restart
- [ ] 프로덕션 배포
- [ ] MAEZ, DEVIN 재확인

---

**다음 단계:** 
1. 브라우저 콘솔에서 MAEZ, DEVIN의 validFlag 확인
2. validFlag 조건 완화 코드 적용
3. 테스트 및 배포

어떤 방법으로 진행할까요? 🚀
