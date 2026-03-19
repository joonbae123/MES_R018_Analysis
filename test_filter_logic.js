// Test filter logic
const filters = {
    workingDays: []
};

const data = [
    { workingDay: '2026-03-01' },
    { workingDay: '2026-03-02' },
    { workingDay: '2026-03-03' }
];

let filtered = data;

// Current logic
if (filters.workingDays.length > 0) {
    filtered = filtered.filter(r => filters.workingDays.includes(r.workingDay));
    console.log('After filter:', filtered.length);
} else {
    console.log('No filter applied, keeping all:', filtered.length);
}

console.log('Result:', filtered.length, 'records');
