// Scorecard Tab JavaScript
// Uses EXACTLY the same logic as Report tab

// Make ScorecardState globally accessible for debugging
window.ScorecardState = {
    allWorkers: [],
    filteredWorkers: [],
    selectedWorker: null,
    sortColumn: 'score',
    sortDirection: 'desc',
    charts: {}
};

// Local reference
const ScorecardState = window.ScorecardState;

// Use CATEGORY_ORDER from app.js (already declared globally)
// const CATEGORY_ORDER is in app.js

// Initialize Scorecard Tab (make globally accessible)
window.initScorecardTab = function() {
    console.log('🎯 Initializing Scorecard Tab');
    
    if (!window.AppState || !window.AppState.processedData || window.AppState.processedData.length === 0) {
        console.log('❌ No data in AppState');
        document.getElementById('scorecardTableBody').innerHTML = `
            <tr>
                <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    Please upload data first
                </td>
            </tr>
        `;
        return;
    }
    
    console.log(`✅ Found ${window.AppState.processedData.length} records in AppState`);
    loadScorecardData();
};

// Load and Aggregate Scorecard Data
function loadScorecardData() {
    try {
        document.getElementById('scorecardTableBody').innerHTML = `
            <tr>
                <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    Calculating worker scores...
                </td>
            </tr>
        `;
        
        // Group by worker + date + shift + process (same as Report aggregation)
        const aggregated = {};
        
        window.AppState.processedData.forEach(record => {
            const key = `${record.workerName}|${record.workingDay}|${record.workingShift}|${record.actualShift}|${record.foDesc3}`;
            
            if (!aggregated[key]) {
                aggregated[key] = {
                    workerName: record.workerName,
                    foDesc3: record.foDesc3,
                    foDesc2: record.foDesc2,
                    workingDay: record.workingDay,
                    workingShift: record.workingShift,
                    actualShift: record.actualShift,
                    shiftTime: 0,          // Total shift time
                    actualTime: 0,         // Total actual time
                    assignedStandardTime: 0,  // Adjusted S/T for efficiency
                    seq: record.seq,
                    count: 0
                };
            }
            
            // Accumulate times (same as Report)
            const actualMinutes = record.workerActMins || 0;
            const shiftMinutes = (record.shiftCount || 0) * 660;  // shiftCount × 660 minutes
            const st = record['Worker S/T'] || 0;
            const rate = record['Worker Rate(%)'] || 0;
            const assigned = (st * rate / 100);
            const adjustmentRatio = record.overlapAdjustmentRatio || 1;
            const adjustedAssigned = assigned * adjustmentRatio;
            
            aggregated[key].shiftTime += shiftMinutes;
            aggregated[key].actualTime += actualMinutes;
            aggregated[key].assignedStandardTime += adjustedAssigned;
            aggregated[key].count++;
        });
        
        // Group by worker
        const workerMap = {};
        
        Object.values(aggregated).forEach(agg => {
            const name = agg.workerName;
            if (!name) return;
            
            if (!workerMap[name]) {
                workerMap[name] = {
                    name: name,
                    totalShiftTime: 0,
                    totalActualTime: 0,
                    totalAssignedStandardTime: 0,
                    workCount: 0,
                    processes: {},
                    shifts: {},
                    categories: {}
                };
            }
            
            const worker = workerMap[name];
            worker.totalShiftTime += agg.shiftTime;
            worker.totalActualTime += agg.actualTime;
            worker.totalAssignedStandardTime += agg.assignedStandardTime;
            worker.workCount++;
            
            // Track processes with category info
            const process = agg.foDesc3 || 'Unknown';
            if (!worker.processes[process]) {
                worker.processes[process] = {
                    count: 0,
                    category: agg.foDesc2,
                    seq: agg.seq
                };
            }
            worker.processes[process].count++;
            
            // Track shifts
            const shift = agg.workingShift || 'Unknown';
            worker.shifts[shift] = (worker.shifts[shift] || 0) + 1;
            
            // Track categories
            const category = agg.foDesc2 || 'Other';
            worker.categories[category] = (worker.categories[category] || 0) + 1;
        });
        
        // Calculate metrics for each worker
        const workers = Object.values(workerMap).map(worker => {
            // Time Utilization = (Actual Time / Shift Time) × 100
            const utilization = worker.totalShiftTime > 0 
                ? (worker.totalActualTime / worker.totalShiftTime) * 100 
                : 0;
            
            // Work Efficiency = (Adjusted S/T / Shift Time) × 100
            const efficiency = worker.totalShiftTime > 0
                ? (worker.totalAssignedStandardTime / worker.totalShiftTime) * 100
                : 0;
            
            // Composite score: 50% utilization + 50% efficiency
            const score = (utilization * 0.5) + (efficiency * 0.5);
            
            // DEBUG: Log first worker
            if (Object.keys(workerMap).indexOf(worker.name) === 0) {
                console.log('🔍 First worker calculation:', {
                    name: worker.name,
                    totalShiftTime: worker.totalShiftTime,
                    totalActualTime: worker.totalActualTime,
                    totalAssignedStandardTime: worker.totalAssignedStandardTime,
                    utilization: utilization.toFixed(2) + '%',
                    efficiency: efficiency.toFixed(2) + '%',
                    score: score.toFixed(2)
                });
            }
            
            // Determine main process (sorted by category/seq, then count)
            const mainProcess = Object.entries(worker.processes)
                .sort((a, b) => {
                    // Sort by category order first
                    const catA = window.CATEGORY_ORDER[a[1].category] || 999;
                    const catB = window.CATEGORY_ORDER[b[1].category] || 999;
                    if (catA !== catB) return catA - catB;
                    
                    // Then by seq
                    const seqA = a[1].seq || 999;
                    const seqB = b[1].seq || 999;
                    if (seqA !== seqB) return seqA - seqB;
                    
                    // Finally by count (highest first)
                    return b[1].count - a[1].count;
                })[0]?.[0] || 'Unknown';
            
            return {
                name: worker.name,
                main_process: mainProcess,
                work_count: worker.workCount,
                score: score,
                utilization: utilization,
                efficiency: efficiency,
                totalShiftTime: worker.totalShiftTime,
                totalActualTime: worker.totalActualTime,
                totalAssignedStandardTime: worker.totalAssignedStandardTime,
                processes: worker.processes,
                shifts: worker.shifts,
                categories: worker.categories
            };
        });
        
        console.log(`✅ Calculated scores for ${workers.length} workers`);
        console.log(`📊 Sample worker:`, workers[0]);
        
        ScorecardState.allWorkers = workers;
        ScorecardState.filteredWorkers = workers;
        
        // Update process filter options
        updateProcessFilterOptions();
        
        // Apply filters
        applyAllFilters();
        
    } catch (error) {
        console.error('❌ Failed to load scorecard data:', error);
        document.getElementById('scorecardTableBody').innerHTML = `
            <tr>
                <td colspan="9" class="px-4 py-8 text-center text-red-500">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    Error loading data: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Update Process Filter Options (EXACTLY same order as Report tab)
function updateProcessFilterOptions() {
    // Build process map with category/seq info from processedData
    const processMap = new Map();
    
    window.AppState.processedData.forEach(d => {
        if (d.foDesc3 && !processMap.has(d.foDesc3)) {
            const categorySeq = window.CATEGORY_ORDER[d.foDesc2] || 999;
            const processSeq = d.seq !== undefined ? d.seq : 999;
            processMap.set(d.foDesc3, {
                category: d.foDesc2,
                categorySeq: categorySeq,
                processSeq: processSeq
            });
        }
    });
    
    // Sort by category order, then by seq, then alphabetically
    const processes = Array.from(processMap.entries())
        .sort((a, b) => {
            if (a[1].categorySeq !== b[1].categorySeq) {
                return a[1].categorySeq - b[1].categorySeq;
            }
            if (a[1].processSeq !== b[1].processSeq) {
                return a[1].processSeq - b[1].processSeq;
            }
            return a[0].localeCompare(b[0]);
        })
        .map(entry => entry[0]);
    
    const selectElement = document.getElementById('scorecardProcessFilter');
    if (!selectElement) return;
    
    const currentValue = selectElement.value;
    
    selectElement.innerHTML = '<option value="">All Processes</option>' + 
        processes.map(process => `<option value="${process}">${process}</option>`).join('');
    
    if (currentValue && processes.includes(currentValue)) {
        selectElement.value = currentValue;
    }
    
    console.log(`✅ Process filter updated with ${processes.length} processes in correct order`);
}

// Apply All Filters
function applyAllFilters() {
    let filtered = [...ScorecardState.allWorkers];
    
    // Search filter
    const searchTerm = document.getElementById('scorecardWorkerSearch')?.value.toLowerCase() || '';
    if (searchTerm) {
        filtered = filtered.filter(worker => 
            worker.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Process filter
    const processFilter = document.getElementById('scorecardProcessFilter')?.value || '';
    if (processFilter) {
        filtered = filtered.filter(worker => worker.main_process === processFilter);
    }
    
    // Grade filter
    const gradeFilter = document.getElementById('scorecardGradeFilter')?.value || '';
    if (gradeFilter) {
        filtered = filtered.filter(worker => {
            const grade = getGradeInfo(worker.score).grade;
            return grade === gradeFilter;
        });
    }
    
    ScorecardState.filteredWorkers = filtered;
    renderScorecardTable();
}

// Sort Table (make globally accessible)
window.sortScorecardTable = function(column) {
    if (ScorecardState.sortColumn === column) {
        ScorecardState.sortDirection = ScorecardState.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        ScorecardState.sortColumn = column;
        ScorecardState.sortDirection = 'desc';
    }
    
    ScorecardState.filteredWorkers.sort((a, b) => {
        let aVal, bVal;
        
        switch(column) {
            case 'name':
                aVal = a.name;
                bVal = b.name;
                break;
            case 'process':
                aVal = a.main_process;
                bVal = b.main_process;
                break;
            case 'score':
                aVal = a.score;
                bVal = b.score;
                break;
            case 'utilization':
                aVal = a.utilization;
                bVal = b.utilization;
                break;
            case 'efficiency':
                aVal = a.efficiency;
                bVal = b.efficiency;
                break;
            default:
                return 0;
        }
        
        if (aVal < bVal) return ScorecardState.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return ScorecardState.sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    renderScorecardTable();
};

// Get Grade Info
function getGradeInfo(score) {
    if (score >= 90) return { grade: 'S', color: 'bg-yellow-50 text-yellow-700 border border-yellow-200' };
    if (score >= 80) return { grade: 'A', color: 'bg-green-50 text-green-700 border border-green-200' };
    if (score >= 70) return { grade: 'B', color: 'bg-blue-50 text-blue-700 border border-blue-200' };
    if (score >= 60) return { grade: 'C', color: 'bg-orange-50 text-orange-700 border border-orange-200' };
    return { grade: 'D', color: 'bg-red-50 text-red-700 border border-red-200' };
}

// Get Performance Color
function getPerformanceColor(value, type = 'utilization') {
    const threshold = type === 'utilization' ? 70 : 80;
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.7) return 'text-yellow-600';
    return 'text-red-600';
}

// Render Scorecard Table
function renderScorecardTable() {
    const tbody = document.getElementById('scorecardTableBody');
    const countElement = document.getElementById('scorecardWorkerCount');
    
    if (!tbody || !countElement) return;
    
    if (!ScorecardState.filteredWorkers || ScorecardState.filteredWorkers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                    <i class="fas fa-search mr-2"></i>
                    No workers found with current filters
                </td>
            </tr>
        `;
        countElement.textContent = '0';
        return;
    }
    
    countElement.textContent = ScorecardState.filteredWorkers.length.toLocaleString();
    
    tbody.innerHTML = ScorecardState.filteredWorkers.map((worker, index) => {
        const gradeInfo = getGradeInfo(worker.score);
        const utilizationColor = getPerformanceColor(worker.utilization, 'utilization');
        const efficiencyColor = getPerformanceColor(worker.efficiency, 'efficiency');
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">
                    ${index + 1}
                </td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">
                    ${worker.name}
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">
                    <span class="inline-block px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                        ${worker.main_process}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                    ${worker.score.toFixed(1)}
                </td>
                <td class="px-4 py-3 text-center">
                    <span class="inline-block px-3 py-1 rounded-full text-sm font-bold ${gradeInfo.color}">
                        ${gradeInfo.grade}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-right font-medium ${utilizationColor}">
                    ${worker.utilization.toFixed(1)}%
                </td>
                <td class="px-4 py-3 text-sm text-right font-medium ${efficiencyColor}">
                    ${worker.efficiency.toFixed(1)}%
                </td>
                <td class="px-4 py-3 text-sm text-right text-gray-700">
                    ${worker.work_count.toLocaleString()}
                </td>
                <td class="px-4 py-3 text-center">
                    <button onclick="viewWorkerDetail('${worker.name.replace(/'/g, "\\'")}')" 
                            class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <i class="fas fa-eye mr-1"></i>View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// View Worker Detail (make globally accessible)
window.viewWorkerDetail = function(workerName) {
    console.log('📊 View button clicked for:', workerName);
    alert('Worker detail view coming soon!\n\nThis feature will show:\n- Performance trends\n- Work distribution\n- AI insights\n- Recent work records');
};

// Reset Filters (make globally accessible)
window.resetScorecardFilters = function() {
    document.getElementById('scorecardWorkerSearch').value = '';
    document.getElementById('scorecardProcessFilter').value = '';
    document.getElementById('scorecardGradeFilter').value = '';
    applyAllFilters();
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('scorecardWorkerSearch');
    if (searchInput) {
        searchInput.addEventListener('input', () => applyAllFilters());
    }
    
    const processFilter = document.getElementById('scorecardProcessFilter');
    if (processFilter) {
        processFilter.addEventListener('change', () => applyAllFilters());
    }
    
    const gradeFilter = document.getElementById('scorecardGradeFilter');
    if (gradeFilter) {
        gradeFilter.addEventListener('change', () => applyAllFilters());
    }
});

console.log('✅ Scorecard module loaded (using Report aggregation logic)');
