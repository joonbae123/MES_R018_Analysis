// Scorecard Tab JavaScript
// Uses AppState.workerSummary directly from Report tab (already calculated)

// Make ScorecardState globally accessible for debugging
window.ScorecardState = {
    allWorkers: [],
    filteredWorkers: [],
    selectedWorker: null,
    sortColumn: 'score',
    sortDirection: 'desc'
};

// Local reference
const ScorecardState = window.ScorecardState;

// Initialize Scorecard Tab (make globally accessible)
window.initScorecardTab = function() {
    console.log('🎯 Initializing Scorecard Tab');
    
    // Use workerSummary from Report tab (already calculated!)
    if (!window.AppState || !window.AppState.workerSummary || window.AppState.workerSummary.length === 0) {
        console.log('❌ No workerSummary in AppState');
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
    
    console.log(`✅ Found ${window.AppState.workerSummary.length} workers in AppState.workerSummary`);
    loadScorecardData();
};

// Load Scorecard Data from AppState.workerSummary
function loadScorecardData() {
    try {
        // Use workerSummary directly (already calculated in Report tab!)
        const workerSummary = window.AppState.workerSummary;
        
        // Transform to Scorecard format
        ScorecardState.allWorkers = workerSummary.map(worker => {
            const utilization = worker.utilizationRate || 0;
            const efficiency = worker.efficiencyRate || 0;
            const score = (utilization * 0.5) + (efficiency * 0.5);
            
            return {
                name: worker.workerName,
                main_process: worker.foDesc3 || 'Unknown',
                category: worker.foDesc2 || '',
                work_count: worker.woCount || 0,
                shift_count: worker.shiftCount || 0,
                utilization: utilization,
                efficiency: efficiency,
                score: score,
                grade: getGrade(score),
                utilization_band: worker.utilizationBand?.label || '',
                efficiency_band: worker.efficiencyBand?.label || '',
                total_minutes: worker.totalMinutes || 0,
                assigned_st: worker.assignedStandardTime || 0
            };
        });
        
        console.log(`📊 Scorecard: Transformed ${ScorecardState.allWorkers.length} workers`);
        console.log('First worker:', ScorecardState.allWorkers[0]);
        
        // Update process filter
        updateProcessFilter();
        
        // Apply filters and render
        window.resetScorecardFilters();
        
    } catch (error) {
        console.error('❌ Error loading scorecard data:', error);
        document.getElementById('scorecardTableBody').innerHTML = `
            <tr>
                <td colspan="9" class="px-4 py-8 text-center text-red-500">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    Error: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Get Grade from Score
function getGrade(score) {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
}

// Update Process Filter (sorted by CATEGORY_ORDER)
function updateProcessFilter() {
    const processFilter = document.getElementById('scorecardProcessFilter');
    if (!processFilter) return;
    
    // Get unique processes
    const processes = [...new Set(ScorecardState.allWorkers.map(w => w.main_process))];
    
    // Sort by CATEGORY_ORDER (same as Report tab)
    if (window.CATEGORY_ORDER) {
        processes.sort((a, b) => {
            const catA = ScorecardState.allWorkers.find(w => w.main_process === a)?.category || '';
            const catB = ScorecardState.allWorkers.find(w => w.main_process === b)?.category || '';
            
            const orderA = window.CATEGORY_ORDER[catA] || 999;
            const orderB = window.CATEGORY_ORDER[catB] || 999;
            
            if (orderA !== orderB) return orderA - orderB;
            return a.localeCompare(b);
        });
    }
    
    // Build options
    processFilter.innerHTML = '<option value="">All Processes</option>' +
        processes.map(p => `<option value="${p}">${p}</option>`).join('');
    
    console.log(`📋 Process filter updated: ${processes.length} processes`);
}

// Apply Filters
window.resetScorecardFilters = function() {
    const searchInput = document.getElementById('scorecardWorkerSearch');
    const processFilter = document.getElementById('scorecardProcessFilter');
    const gradeFilter = document.getElementById('scorecardGradeFilter');
    
    if (searchInput) searchInput.value = '';
    if (processFilter) processFilter.value = '';
    if (gradeFilter) gradeFilter.value = '';
    
    applyScorecardFilters();
};

function applyScorecardFilters() {
    const searchInput = document.getElementById('scorecardWorkerSearch');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const processFilter = document.getElementById('scorecardProcessFilter').value;
    const gradeFilter = document.getElementById('scorecardGradeFilter').value;
    
    ScorecardState.filteredWorkers = ScorecardState.allWorkers.filter(worker => {
        // Search filter
        if (searchTerm && !worker.name.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Process filter
        if (processFilter && worker.main_process !== processFilter) {
            return false;
        }
        
        // Grade filter
        if (gradeFilter && worker.grade !== gradeFilter) {
            return false;
        }
        
        return true;
    });
    
    renderScorecardTable();
}

// Render Scorecard Table
function renderScorecardTable() {
    const tbody = document.getElementById('scorecardTableBody');
    const countSpan = document.getElementById('scorecardWorkerCount');
    
    // Update count
    countSpan.textContent = `${ScorecardState.filteredWorkers.length} workers found`;
    
    if (ScorecardState.filteredWorkers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                    <i class="fas fa-search mr-2"></i>
                    No workers match the selected filters
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by current column
    const sorted = [...ScorecardState.filteredWorkers];
    sorted.sort((a, b) => {
        let aVal, bVal;
        
        switch (ScorecardState.sortColumn) {
            case 'name':
                aVal = a.name;
                bVal = b.name;
                return ScorecardState.sortDirection === 'asc' 
                    ? aVal.localeCompare(bVal) 
                    : bVal.localeCompare(aVal);
            
            case 'process':
                aVal = a.main_process;
                bVal = b.main_process;
                return ScorecardState.sortDirection === 'asc' 
                    ? aVal.localeCompare(bVal) 
                    : bVal.localeCompare(aVal);
            
            case 'grade':
                const gradeOrder = { 'S': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
                aVal = gradeOrder[a.grade] || 0;
                bVal = gradeOrder[b.grade] || 0;
                break;
            
            case 'score':
            case 'utilization':
            case 'efficiency':
            case 'work_count':
                aVal = a[ScorecardState.sortColumn] || 0;
                bVal = b[ScorecardState.sortColumn] || 0;
                break;
            
            default:
                aVal = a.score;
                bVal = b.score;
        }
        
        return ScorecardState.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
    
    // Render rows with rank
    tbody.innerHTML = sorted.map((worker, index) => `
        <tr class="border-b border-gray-200 hover:bg-gray-50">
            <td class="px-4 py-3 text-sm text-gray-500">#${index + 1}</td>
            <td class="px-4 py-3 text-sm">${worker.name}</td>
            <td class="px-4 py-3 text-sm">${worker.main_process}</td>
            <td class="px-4 py-3 text-sm text-right font-semibold">${worker.score.toFixed(1)}</td>
            <td class="px-4 py-3 text-center">
                <span class="inline-block px-3 py-1 rounded-full text-xs font-bold grade-${worker.grade}">
                    ${worker.grade}
                </span>
            </td>
            <td class="px-4 py-3 text-sm text-right">${worker.utilization.toFixed(1)}%</td>
            <td class="px-4 py-3 text-sm text-right">${worker.efficiency.toFixed(1)}%</td>
            <td class="px-4 py-3 text-sm text-right">${worker.work_count}</td>
            <td class="px-4 py-3 text-center">
                <button onclick="alert('Detail view coming soon!')" 
                        class="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                    View
                </button>
            </td>
        </tr>
    `).join('');
}

// Get Band Color
function getBandColor(band) {
    switch (band) {
        case 'Excellent': return 'bg-green-100 text-green-800';
        case 'Good': return 'bg-blue-100 text-blue-800';
        case 'Average': return 'bg-yellow-100 text-yellow-800';
        case 'Below Average': return 'bg-orange-100 text-orange-800';
        case 'Poor': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

// Sort Table
window.sortScorecardTable = function(column) {
    if (ScorecardState.sortColumn === column) {
        ScorecardState.sortDirection = ScorecardState.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        ScorecardState.sortColumn = column;
        ScorecardState.sortDirection = 'desc';
    }
    renderScorecardTable();
};

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Search input
    const searchInput = document.getElementById('scorecardWorkerSearch');
    if (searchInput) {
        searchInput.addEventListener('input', applyScorecardFilters);
    }
    
    // Process filter
    const processFilter = document.getElementById('scorecardProcessFilter');
    if (processFilter) {
        processFilter.addEventListener('change', applyScorecardFilters);
    }
    
    // Grade filter
    const gradeFilter = document.getElementById('scorecardGradeFilter');
    if (gradeFilter) {
        gradeFilter.addEventListener('change', applyScorecardFilters);
    }
});

console.log('✅ Scorecard module loaded (using AppState.workerSummary)');
