// Scorecard Tab JavaScript
// Reuses Report tab's data aggregation logic

// Make ScorecardState globally accessible for debugging
window.ScorecardState = {
    allWorkers: [],
    filteredWorkers: [],
    selectedWorker: null,
    sortColumn: 'score',
    sortDirection: 'desc',
    charts: {}
};

// Local reference for easier access
const ScorecardState = window.ScorecardState;

// Initialize Scorecard Tab
function initScorecardTab() {
    console.log('🎯 Initializing Scorecard Tab');
    
    // Check if data exists in AppState
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
}

// Load and Aggregate Scorecard Data (Reuse Report logic)
function loadScorecardData() {
    try {
        // Show loading
        document.getElementById('scorecardTableBody').innerHTML = `
            <tr>
                <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    Calculating worker scores...
                </td>
            </tr>
        `;
        
        // Aggregate by worker using same logic as Report tab
        const workerMap = {};
        
        window.AppState.processedData.forEach(record => {
            const name = record.workerName;
            if (!name) return;
            
            const key = name;
            
            if (!workerMap[key]) {
                workerMap[key] = {
                    name: name,
                    works: [],
                    totalShiftMinutes: 0,
                    totalActualMinutes: 0,
                    totalAssignedStandardTime: 0,
                    processes: {},
                    shifts: {}
                };
            }
            
            const worker = workerMap[key];
            worker.works.push(record);
            
            // Accumulate time data (same as Report tab)
            const actualMinutes = record.workerActMins || 0;
            const shiftMinutes = record.shiftTime || 0;
            const st = record['Worker S/T'] || 0;
            const rate = record['Worker Rate(%)'] || 0;
            const assigned = (st * rate / 100);
            const adjustmentRatio = record.overlapAdjustmentRatio || 1;
            const adjustedAssigned = assigned * adjustmentRatio;
            
            worker.totalShiftMinutes += shiftMinutes;
            worker.totalActualMinutes += actualMinutes;
            worker.totalAssignedStandardTime += adjustedAssigned;
            
            // Track processes and shifts
            const process = record.foDesc3 || 'Unknown';
            const shift = record.workingShift || 'Unknown';
            
            worker.processes[process] = (worker.processes[process] || 0) + 1;
            worker.shifts[shift] = (worker.shifts[shift] || 0) + 1;
        });
        
        // Calculate metrics for each worker
        const workers = Object.values(workerMap).map(worker => {
            // Time Utilization Rate = (Actual Time / Shift Time) × 100
            const utilization = worker.totalShiftMinutes > 0 
                ? (worker.totalActualMinutes / worker.totalShiftMinutes) * 100 
                : 0;
            
            // Work Efficiency Rate = (Assigned S/T / Shift Time) × 100
            const efficiency = worker.totalShiftMinutes > 0
                ? (worker.totalAssignedStandardTime / worker.totalShiftMinutes) * 100
                : 0;
            
            // Composite score: 50% utilization + 50% efficiency
            const score = (utilization * 0.5) + (efficiency * 0.5);
            
            // Determine main process (most frequent)
            const mainProcess = Object.entries(worker.processes)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
            
            return {
                name: worker.name,
                main_process: mainProcess,
                work_count: worker.works.length,
                score: score,
                utilization: utilization,
                efficiency: efficiency,
                totalShiftMinutes: worker.totalShiftMinutes,
                totalActualMinutes: worker.totalActualMinutes,
                totalAssignedStandardTime: worker.totalAssignedStandardTime,
                processes: worker.processes,
                shifts: worker.shifts,
                works: worker.works
            };
        });
        
        console.log(`✅ Calculated scores for ${workers.length} workers`);
        
        ScorecardState.allWorkers = workers;
        ScorecardState.filteredWorkers = workers;
        
        // Update process filter options
        updateProcessFilterOptions(workers);
        
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

// Update Process Filter Options (same order as Report tab)
function updateProcessFilterOptions(workers) {
    const processes = [...new Set(workers.map(w => w.main_process))].filter(p => p && p !== 'Unknown');
    
    // Sort by process mapping order (same as Report tab)
    if (window.AppState && window.AppState.processMapping) {
        const processOrder = window.AppState.processMapping.map(p => p.foDesc3);
        processes.sort((a, b) => {
            const indexA = processOrder.indexOf(a);
            const indexB = processOrder.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    } else {
        processes.sort();
    }
    
    const selectElement = document.getElementById('scorecardProcessFilter');
    if (!selectElement) return;
    
    const currentValue = selectElement.value;
    
    selectElement.innerHTML = '<option value="">All Processes</option>';
    processes.forEach(process => {
        selectElement.innerHTML += `<option value="${process}">${process}</option>`;
    });
    
    if (currentValue && processes.includes(currentValue)) {
        selectElement.value = currentValue;
    }
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

// Sort Table
function sortScorecardTable(column) {
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
}

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

// View Worker Detail
function viewWorkerDetail(workerName) {
    console.log('📊 View button clicked - feature not yet implemented');
    alert('Worker detail view coming soon!\n\nThis feature will show:\n- Performance trends\n- Work distribution\n- AI insights\n- Recent work records');
    
    // TODO: Implement detail view
    // const worker = ScorecardState.allWorkers.find(w => w.name === workerName);
    // if (!worker) {
    //     alert('Worker not found');
    //     return;
    // }
    // 
    // document.getElementById('scorecardListView').classList.add('hidden');
    // document.getElementById('scorecardDetailView').classList.remove('hidden');
    // renderWorkerDetail(worker);
}

// Back to List
function backToScorecardList() {
    document.getElementById('scorecardDetailView').classList.add('hidden');
    document.getElementById('scorecardListView').classList.remove('hidden');
    
    // Destroy charts
    Object.values(ScorecardState.charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    ScorecardState.charts = {};
}

// Reset Filters
function resetScorecardFilters() {
    document.getElementById('scorecardWorkerSearch').value = '';
    document.getElementById('scorecardProcessFilter').value = '';
    document.getElementById('scorecardGradeFilter').value = '';
    applyAllFilters();
}

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
