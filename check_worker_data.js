// Test aggregation logic
const record = {
    workerName: 'LUNA, BRYAN JAMES',
    shiftCount: 2,
    workerActMins: 100,
    'Worker S/T': 50,
    'Worker Rate(%)': 80,
    overlapAdjustmentRatio: 1.0
};

const shiftMinutes = (record.shiftCount || 0) * 660;
const actualMinutes = record.workerActMins || 0;
const st = record['Worker S/T'] || 0;
const rate = record['Worker Rate(%)'] || 0;
const assigned = (st * rate / 100);
const adjustmentRatio = record.overlapAdjustmentRatio || 1;
const adjustedAssigned = assigned * adjustmentRatio;

console.log('shiftCount:', record.shiftCount);
console.log('shiftMinutes:', shiftMinutes, '(should be', record.shiftCount * 660, ')');
console.log('actualMinutes:', actualMinutes);
console.log('assigned S/T:', assigned);
console.log('adjusted assigned:', adjustedAssigned);

const totalShiftTime = shiftMinutes;
const totalActualTime = actualMinutes;
const totalAssignedST = adjustedAssigned;

const utilization = totalShiftTime > 0 ? (totalActualTime / totalShiftTime) * 100 : 0;
const efficiency = totalShiftTime > 0 ? (totalAssignedST / totalShiftTime) * 100 : 0;
const score = (utilization * 0.5) + (efficiency * 0.5);

console.log('\nResults:');
console.log('totalShiftTime:', totalShiftTime);
console.log('utilization:', utilization, '%');
console.log('efficiency:', efficiency, '%');
console.log('score:', score);
