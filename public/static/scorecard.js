// Scorecard Tab JavaScript
// Uses AppState.workerSummary AND applies filters from processedData

// Make ScorecardState globally accessible for debugging
window.ScorecardState = {
    allWorkers: [],
    filteredWorkers: [],
    selectedWorker: null,
    sortColumn: 'score',
    sortDirection: 'desc',
    filters: {
        shift: '',
        workingDays: [],
        workingShift: '',
        categories: [],
        processes: [],
        workers: [],
        grade: ''
    }
};

// Local reference
const ScorecardState = window.ScorecardState;

// Initialize Scorecard Tab (make globally accessible)
window.initScorecardTab = function() {
    console.log('🎯 Initializing Scorecard Tab');
    
    // Check if data exists
    if (!window.AppState || !window.AppState.processedData || window.AppState.processedData.length === 0) {
        console.log('❌ No processedData in AppState');
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
    
    // Initialize filter dropdowns
    initializeScorecardFilterDropdowns();
    
    // Load data
    loadScorecardData();
};

// Initialize Filter Dropdowns (same as Report tab)
function initializeScorecardFilterDropdowns() {
    const data = window.AppState.processedData;
    
    // Extract unique values
    const workingDays = [...new Set(data.map(r => r.workingDay).filter(Boolean))].sort();
    const categories = [...new Set(data.map(r => r.foDesc2).filter(Boolean))].sort();
    const processes = [...new Set(data.map(r => r.foDesc3).filter(Boolean))];
    const workers = [...new Set(data.map(r => r.workerName).filter(Boolean))].sort();
    
    // Sort processes by CATEGORY_ORDER
    if (window.CATEGORY_ORDER) {
        processes.sort((a, b) => {
            const catA = data.find(r => r.foDesc3 === a)?.foDesc2 || '';
            const catB = data.find(r => r.foDesc3 === b)?.foDesc2 || '';
            
            const orderA = window.CATEGORY_ORDER[catA] || 999;
            const orderB = window.CATEGORY_ORDER[catB] || 999;
            
            if (orderA !== orderB) return orderA - orderB;
            return a.localeCompare(b);
        });
    }
    
    // Build Working Day dropdown (with month groups)
    buildWorkingDayDropdown(workingDays);
    
    // Build Category dropdown
    buildCategoryDropdown(categories);
    
    // Build Process dropdown
    buildProcessDropdown(processes);
    
    // Build Worker dropdown
    buildWorkerDropdown(workers);
    
    console.log(`📋 Filters initialized: ${workingDays.length} days, ${categories.length} categories, ${processes.length} processes, ${workers.length} workers`);
}

// Build Working Day Dropdown with Month Groups
function buildWorkingDayDropdown(workingDays) {
    const dropdown = document.getElementById('scorecardFilterWorkingDayDropdown');
    if (!dropdown) return;
    
    // Group by month
    const byMonth = {};
    workingDays.forEach(day => {
        const month = day.substring(0, 7); // YYYY-MM
        if (!byMonth[month]) byMonth[month] = [];
        byMonth[month].push(day);
    });
    
    let html = '<div class="p-2">';
    
    // All dates option
    html += `
        <label class="flex items-center px-3 py-2 hover:bg-blue-100 cursor-pointer rounded border-b-2 border-gray-300 bg-gray-50 font-semibold mb-2">
            <input type="checkbox" class="mr-3 h-4 w-4 text-blue-600" onchange="toggleScorecardAllDates(this)">
            <span class="text-sm text-blue-700">Select All Dates</span>
        </label>
    `;
    
    // Month groups
    Object.keys(byMonth).sort().reverse().forEach(month => {
        html += `<div class="mb-3">`;
        html += `<div class="px-3 py-1 bg-gray-100 text-xs font-bold text-gray-700 mb-1">${month}</div>`;
        byMonth[month].forEach(day => {
            html += `
                <label class="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer rounded">
                    <input type="checkbox" value="${day}" class="scorecard-workingDay-checkbox mr-3 h-4 w-4 text-blue-600" onchange="updateScorecardMultiSelect('workingDay')">
                    <span class="text-sm text-gray-700">${day}</span>
                </label>
            `;
        });
        html += `</div>`;
    });
    
    html += '</div>';
    dropdown.innerHTML = html;
}

// Build Category Dropdown
function buildCategoryDropdown(categories) {
    const dropdown = document.getElementById('scorecardFilterCategoryDropdown');
    if (!dropdown) return;
    
    let html = '<div class="p-2">';
    
    // All categories option
    html += `
        <label class="flex items-center px-3 py-2 hover:bg-blue-100 cursor-pointer rounded border-b-2 border-gray-300 bg-gray-50 font-semibold">
            <input type="checkbox" class="mr-3 h-4 w-4 text-blue-600" onchange="toggleScorecardAll('category', this)">
            <span class="text-sm text-blue-700">Select All Categories</span>
        </label>
    `;
    
    categories.forEach(cat => {
        html += `
            <label class="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer rounded border-b border-gray-100">
                <input type="checkbox" value="${cat}" class="scorecard-category-checkbox mr-3 h-4 w-4 text-blue-600" onchange="updateScorecardMultiSelect('category')">
                <span class="text-sm text-gray-700">${cat}</span>
            </label>
        `;
    });
    
    html += '</div>';
    dropdown.innerHTML = html;
}

// Build Process Dropdown
function buildProcessDropdown(processes) {
    const dropdown = document.getElementById('scorecardFilterProcessDropdown');
    if (!dropdown) return;
    
    let html = '<div class="p-2">';
    
    // All processes option
    html += `
        <label class="flex items-center px-3 py-2 hover:bg-blue-100 cursor-pointer rounded border-b-2 border-gray-300 bg-gray-50 font-semibold">
            <input type="checkbox" class="mr-3 h-4 w-4 text-blue-600" onchange="toggleScorecardAll('process', this)">
            <span class="text-sm text-blue-700">Select All Processes</span>
        </label>
    `;
    
    processes.forEach(proc => {
        html += `
            <label class="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer rounded border-b border-gray-100">
                <input type="checkbox" value="${proc}" class="scorecard-process-checkbox mr-3 h-4 w-4 text-blue-600" onchange="updateScorecardMultiSelect('process')">
                <span class="text-sm text-gray-700">${proc}</span>
            </label>
        `;
    });
    
    html += '</div>';
    dropdown.innerHTML = html;
}

// Build Worker Dropdown
function buildWorkerDropdown(workers) {
    const dropdown = document.getElementById('scorecardFilterWorkerDropdown');
    if (!dropdown) return;
    
    let html = '';
    
    // All workers option (in the scrollable list)
    let listHtml = '<div class="p-2">';
    listHtml += `
        <label class="flex items-center px-3 py-2 hover:bg-blue-100 cursor-pointer rounded border-b-2 border-gray-300 bg-gray-50 font-semibold">
            <input type="checkbox" class="mr-3 h-4 w-4 text-blue-600" onchange="toggleScorecardAll('worker', this)">
            <span class="text-sm text-blue-700">Select All Workers</span>
        </label>
    `;
    
    workers.forEach(worker => {
        listHtml += `
            <label class="scorecard-worker-option flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer rounded border-b border-gray-100">
                <input type="checkbox" value="${worker}" class="scorecard-worker-checkbox mr-3 h-4 w-4 text-blue-600" onchange="updateScorecardMultiSelect('worker')">
                <span class="text-sm text-gray-700">${worker}</span>
            </label>
        `;
    });
    listHtml += '</div>';
    
    // Set the list HTML
    const listDiv = document.getElementById('scorecardWorkerList');
    if (listDiv) {
        listDiv.innerHTML = listHtml;
    }
}

// Toggle Dropdown
window.toggleScorecardDropdown = function(type) {
    const dropdown = document.getElementById(`scorecardFilter${type.charAt(0).toUpperCase() + type.slice(1)}Dropdown`);
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
    
    // Close other dropdowns
    ['shift', 'workingDay', 'workingShift', 'category', 'process', 'worker'].forEach(t => {
        if (t !== type) {
            const other = document.getElementById(`scorecardFilter${t.charAt(0).toUpperCase() + t.slice(1)}Dropdown`);
            if (other) other.classList.add('hidden');
        }
    });
};

// Update Single Select Filter
window.updateScorecardFilter = function(type, value) {
    ScorecardState.filters[type] = value;
    
    // Update display
    const display = document.getElementById(`scorecardFilter${type.charAt(0).toUpperCase() + type.slice(1)}Display`);
    if (display) {
        const span = display.querySelector('span');
        if (span) {
            span.textContent = value || 'All';
            span.className = value ? 'text-gray-900' : 'text-gray-500';
        }
    }
    
    // Close dropdown
    const dropdown = document.getElementById(`scorecardFilter${type.charAt(0).toUpperCase() + type.slice(1)}Dropdown`);
    if (dropdown) dropdown.classList.add('hidden');
};

// Update Multi-Select Filter
window.updateScorecardMultiSelect = function(type) {
    const checkboxes = document.querySelectorAll(`.scorecard-${type}-checkbox:checked`);
    const values = Array.from(checkboxes).map(cb => cb.value);
    
    const filterKey = type === 'workingDay' ? 'workingDays' : 
                      type === 'category' ? 'categories' : 
                      type === 'process' ? 'processes' : 'workers';
    
    ScorecardState.filters[filterKey] = values;
    
    // Update display
    const display = document.getElementById(`scorecardFilter${type.charAt(0).toUpperCase() + type.slice(1)}Display`);
    if (display) {
        const span = display.querySelector('span');
        if (span) {
            if (values.length === 0) {
                span.textContent = type === 'workingDay' ? 'Select dates...' : 'Select...';
                span.className = 'text-gray-500';
            } else {
                span.textContent = `${values.length} selected`;
                span.className = 'text-gray-900';
            }
        }
    }
};

// Toggle All Checkboxes
window.toggleScorecardAll = function(type, checkbox) {
    const checkboxes = document.querySelectorAll(`.scorecard-${type}-checkbox`);
    checkboxes.forEach(cb => cb.checked = checkbox.checked);
    updateScorecardMultiSelect(type);
};

// Toggle All Dates
window.toggleScorecardAllDates = function(checkbox) {
    const checkboxes = document.querySelectorAll('.scorecard-workingDay-checkbox');
    checkboxes.forEach(cb => cb.checked = checkbox.checked);
    updateScorecardMultiSelect('workingDay');
};

// Filter Worker List
window.filterScorecardWorkerList = function(searchTerm) {
    const options = document.querySelectorAll('.scorecard-worker-option');
    const term = searchTerm.toLowerCase();
    
    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(term) ? 'flex' : 'none';
    });
};

// Load Scorecard Data from AppState with filters applied
function loadScorecardData() {
    try {
        console.log('🔍 loadScorecardData() called');
        console.log('   Current filters:', JSON.parse(JSON.stringify(ScorecardState.filters)));
        
        // Use Report's workerSummary directly (already aggregated correctly)
        if (!window.AppState || !window.AppState.workerSummary) {
            console.error('❌ AppState or workerSummary not available');
            ScorecardState.allWorkers = [];
            applyScorecardGradeFilter();
            return;
        }
        
        if (window.AppState.workerSummary.length === 0) {
            console.error('❌ workerSummary is empty');
            ScorecardState.allWorkers = [];
            applyScorecardGradeFilter();
            return;
        }
        
        console.log(`📦 Total workers in workerSummary: ${window.AppState.workerSummary.length}`);
        console.log('First workerSummary entry:', window.AppState.workerSummary[0]);
        
        // Convert Report's workerSummary to Scorecard format
        // workerSummary has: workerName, shiftCount, utilizationRate, efficiencyRate, validCount, foDesc3, totalMinutes, assignedStandardTime
        ScorecardState.allWorkers = window.AppState.workerSummary
            .filter(worker => worker.workerName && worker.workerName.trim())  // Filter out invalid workers
            .map(worker => {
                // ✅ Use Report's field names directly
                const utilization = worker.utilizationRate || 0;
                const efficiency = worker.efficiencyRate || 0;
                const score = (utilization * 0.5) + (efficiency * 0.5);
                
                return {
                    name: worker.workerName,
                    main_process: worker.foDesc3 || 'Unknown',
                    category: worker.foDesc2 || '',
                    work_count: worker.validCount || 0,
                    shift_count: worker.shiftCount || 0,  // ✅ Use shiftCount directly
                    utilization: utilization,
                    efficiency: efficiency,
                    score: score,
                    grade: getGrade(score),
                    total_minutes: worker.totalMinutes || 0,  // ✅ Use totalMinutes (overlap-removed)
                    assigned_st: worker.assignedStandardTime || 0
                };
            });
        
        console.log(`📊 Scorecard: Converted ${ScorecardState.allWorkers.length} workers from workerSummary`);
        console.log('First worker:', ScorecardState.allWorkers[0]);
        
        // Apply grade filter and render
        applyScorecardGradeFilter();
        
    } catch (error) {
        console.error('❌ Error loading scorecard data:', error);
        console.error('Stack:', error.stack);
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

// Get Grade from Score (S≥80, A≥70, B≥60, C≥50, D<50)
function getGrade(score) {
    if (score >= 80) return 'S';
    if (score >= 70) return 'A';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    return 'D';
}

// Apply Filters (called by Apply button)
window.applyScorecardFilters = function() {
    console.log('🔧 Apply Filters button clicked');
    console.log('   Current filter state:', JSON.parse(JSON.stringify(ScorecardState.filters)));
    
    // Close all dropdowns
    ['shift', 'workingDay', 'workingShift', 'category', 'process', 'worker'].forEach(type => {
        const dropdown = document.getElementById(`scorecardFilter${type.charAt(0).toUpperCase() + type.slice(1)}Dropdown`);
        if (dropdown) dropdown.classList.add('hidden');
    });
    
    // Reload data with new filters
    loadScorecardData();
};

// Reset Filters
window.resetScorecardFilters = function() {
    // Reset filter state
    ScorecardState.filters = {
        shift: '',
        workingDays: [],
        workingShift: '',
        categories: [],
        processes: [],
        workers: [],
        grade: ''
    };
    
    // Reset radio buttons
    document.querySelectorAll('input[name="scorecardShift"]').forEach(r => r.checked = r.value === '');
    document.querySelectorAll('input[name="scorecardWorkingShift"]').forEach(r => r.checked = r.value === '');
    
    // Reset checkboxes
    document.querySelectorAll('.scorecard-workingDay-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.scorecard-category-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.scorecard-process-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.scorecard-worker-checkbox').forEach(cb => cb.checked = false);
    
    // Reset grade filter
    const gradeFilter = document.getElementById('scorecardGradeFilter');
    if (gradeFilter) gradeFilter.value = '';
    
    // Reset display texts
    const displayResets = [
        ['scorecardFilterShiftDisplay', 'All'],
        ['scorecardFilterWorkingDayDisplay', 'Select dates...'],
        ['scorecardFilterWorkingShiftDisplay', 'All'],
        ['scorecardFilterCategoryDisplay', 'Select...'],
        ['scorecardFilterProcessDisplay', 'Select...'],
        ['scorecardFilterWorkerDisplay', 'Select...']
    ];
    
    displayResets.forEach(([id, text]) => {
        const display = document.getElementById(id);
        if (display) {
            const span = display.querySelector('span');
            if (span) {
                span.textContent = text;
                span.className = 'text-gray-500';
            }
        }
    });
    
    // Reload data
    loadScorecardData();
};

// Apply Grade Filter
function applyScorecardGradeFilter() {
    const gradeFilter = document.getElementById('scorecardGradeFilter');
    const selectedGrade = gradeFilter ? gradeFilter.value : '';
    
    if (selectedGrade) {
        ScorecardState.filteredWorkers = ScorecardState.allWorkers.filter(w => w.grade === selectedGrade);
    } else {
        ScorecardState.filteredWorkers = [...ScorecardState.allWorkers];
    }
    
    renderScorecardTable();
}

// Render Scorecard Table
function renderScorecardTable() {
    const tbody = document.getElementById('scorecardTableBody');
    const countSpan = document.getElementById('scorecardWorkerCount');
    
    // Update count
    if (countSpan) {
        countSpan.textContent = `${ScorecardState.filteredWorkers.length}`;
    }
    
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
            <td class="px-4 py-3 text-sm">
                <button onclick="window.showScorecardWorkerDetail('${worker.name.replace(/'/g, "\\'")}')" 
                        class="text-blue-600 hover:text-blue-800 hover:underline font-semibold transition">
                    ${worker.name}
                </button>
            </td>
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
                <button onclick="window.showScorecardWorkerDetail('${worker.name.replace(/'/g, "\\'")}')" 
                        class="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition">
                    <i class="fas fa-chart-line mr-1"></i>View
                </button>
            </td>
        </tr>
    `).join('');
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

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('[id^="scorecardFilter"]')) {
        ['shift', 'workingDay', 'workingShift', 'category', 'process', 'worker'].forEach(type => {
            const dropdown = document.getElementById(`scorecardFilter${type.charAt(0).toUpperCase() + type.slice(1)}Dropdown`);
            if (dropdown) dropdown.classList.add('hidden');
        });
    }
});

// ============================================================================
// Worker Detail Modal (Scorecard-specific)
// ============================================================================

let scorecardScoreChart = null;
let scorecardComparisonChart = null;

window.showScorecardWorkerDetail = function(workerName) {
    console.log('🎯 Opening Scorecard worker detail for:', workerName);
    
    // Get worker data from allWorkers
    const worker = ScorecardState.allWorkers.find(w => w.name === workerName);
    if (!worker) {
        console.error('❌ Worker not found in allWorkers:', workerName);
        console.log('Available workers:', ScorecardState.allWorkers.map(w => w.name));
        alert('Worker data not found');
        return;
    }
    
    console.log('✅ Found worker:', worker);
    
    // Get raw records for this worker (filtered by current filters)
    const workerRecords = window.AppState.processedData.filter(r => r.workerName === workerName);
    console.log(`📊 Found ${workerRecords.length} raw records for ${workerName}`);
    
    // Update modal header with worker name
    const headerElement = document.getElementById('scorecardModalWorkerName');
    if (headerElement) {
        const iconSpan = headerElement.querySelector('i');
        const textSpan = headerElement.querySelector('span');
        if (textSpan) {
            textSpan.textContent = workerName;
        } else {
            headerElement.innerHTML = `<i class="fas fa-award"></i><span>${workerName}</span>`;
        }
    }
    
    // Update summary cards (with null checks)
    const gradeEl = document.getElementById('scorecardModalGrade');
    const scoreEl = document.getElementById('scorecardModalScore');
    const utilEl = document.getElementById('scorecardModalUtilization');
    const effEl = document.getElementById('scorecardModalEfficiency');
    const shiftEl = document.getElementById('scorecardModalShiftCount');
    const workEl = document.getElementById('scorecardModalWorkCount');
    
    if (gradeEl) gradeEl.textContent = worker.grade || '-';
    if (scoreEl) scoreEl.textContent = (worker.score || 0).toFixed(1);
    if (utilEl) utilEl.textContent = (worker.utilization || 0).toFixed(1) + '%';
    if (effEl) effEl.textContent = (worker.efficiency || 0).toFixed(1) + '%';
    if (shiftEl) shiftEl.textContent = worker.shift_count || 0;
    if (workEl) workEl.textContent = worker.work_count || 0;
    
    console.log('📋 Summary cards updated:', {
        grade: worker.grade,
        score: worker.score,
        utilization: worker.utilization,
        efficiency: worker.efficiency,
        shift_count: worker.shift_count,
        work_count: worker.work_count,
        elementsFound: {
            grade: !!gradeEl,
            score: !!scoreEl,
            util: !!utilEl,
            eff: !!effEl,
            shift: !!shiftEl,
            work: !!workEl
        }
    });
    
    // Style grade badge
    if (gradeEl) {
        gradeEl.className = 'text-4xl font-bold';
    }
    
    // Aggregate daily data
    const dailyData = aggregateDailyData(workerRecords);
    console.log(`📅 Aggregated ${dailyData.length} daily records`);
    
    // Build performance insights (pass worker object for ranking)
    buildPerformanceInsights(worker, workerRecords, dailyData);
    
    // Build charts
    buildScorecardScoreChart(dailyData);
    buildScorecardComparisonChart(dailyData);
    
    // Build table
    buildScorecardDailyTable(dailyData);
    
    // Show modal
    document.getElementById('scorecardWorkerModal').classList.remove('hidden');
};

window.closeScorecardWorkerModal = function(event) {
    // Only close if clicking backdrop or close button
    if (event && event.target.id !== 'scorecardWorkerModal' && !event.target.closest('button[onclick*="closeScorecardWorkerModal"]')) {
        return;
    }
    
    // Destroy charts if exists
    if (scorecardScoreChart) {
        scorecardScoreChart.destroy();
        scorecardScoreChart = null;
    }
    if (scorecardComparisonChart) {
        scorecardComparisonChart.destroy();
        scorecardComparisonChart = null;
    }
    
    document.getElementById('scorecardWorkerModal').classList.add('hidden');
};

// Build performance insights
function buildPerformanceInsights(worker, workerRecords, dailyData) {
    // 1. Ranking & Comparison with all workers
    const rankingEl = document.getElementById('scorecardModalRanking');
    if (rankingEl) {
        const allWorkers = ScorecardState.allWorkers;
        const workerRank = allWorkers.findIndex(w => w.name === worker.name) + 1;
        const totalWorkers = allWorkers.length;
        const avgScore = allWorkers.reduce((sum, w) => sum + w.score, 0) / totalWorkers;
        const scoreDiff = worker.score - avgScore;
        
        const rankPercentile = ((totalWorkers - workerRank + 1) / totalWorkers * 100).toFixed(0);
        const comparisonIcon = scoreDiff > 0 ? '🟢' : scoreDiff < 0 ? '🔴' : '⚪';
        const comparisonText = scoreDiff > 0 ? 'above' : scoreDiff < 0 ? 'below' : 'at';
        
        const rankingHTML = `
            <div class="font-medium text-gray-800">Rank #${workerRank} of ${totalWorkers}</div>
            <div class="text-xl font-bold text-blue-600">Top ${rankPercentile}%</div>
            <div class="text-xs text-gray-600 mt-1">
                ${comparisonIcon} ${Math.abs(scoreDiff).toFixed(1)} pts ${comparisonText} average
            </div>
        `;
        rankingEl.innerHTML = rankingHTML;
    }
    
    // 2. Recent Trend (Last 7 days vs Previous 7 days)
    const trendEl = document.getElementById('scorecardModalRecentTrend');
    if (trendEl && dailyData.length >= 2) {
        const sortedDays = [...dailyData].sort((a, b) => new Date(b.date) - new Date(a.date));
        const last7Days = sortedDays.slice(0, Math.min(7, sortedDays.length));
        const prev7Days = sortedDays.slice(7, Math.min(14, sortedDays.length));
        
        const avgLast7 = last7Days.reduce((sum, d) => sum + d.score, 0) / last7Days.length;
        const avgPrev7 = prev7Days.length > 0 
            ? prev7Days.reduce((sum, d) => sum + d.score, 0) / prev7Days.length 
            : avgLast7;
        
        const trendChange = avgLast7 - avgPrev7;
        const trendIcon = trendChange > 5 ? '📈' : trendChange < -5 ? '📉' : '➡️';
        const trendColor = trendChange > 5 ? 'text-green-600' : trendChange < -5 ? 'text-red-600' : 'text-gray-600';
        const trendLabel = trendChange > 5 ? 'Improving' : trendChange < -5 ? 'Declining' : 'Stable';
        
        const trendHTML = `
            <div class="flex items-center gap-2">
                <span class="text-2xl">${trendIcon}</span>
                <div>
                    <div class="font-medium ${trendColor}">${trendLabel}</div>
                    <div class="text-xs text-gray-600">
                        Last 7d: ${avgLast7.toFixed(1)} pts
                        ${prev7Days.length > 0 ? `<br>Prev 7d: ${avgPrev7.toFixed(1)} pts` : ''}
                    </div>
                </div>
            </div>
        `;
        trendEl.innerHTML = trendHTML;
    }
    
    // 3. Work Pattern (Shift distribution & frequency)
    const patternEl = document.getElementById('scorecardModalWorkPattern');
    if (patternEl && workerRecords.length > 0) {
        const shiftCounts = {};
        const uniqueDates = new Set();
        
        workerRecords.forEach(record => {
            const shift = record.workingShift || 'Unknown';
            shiftCounts[shift] = (shiftCounts[shift] || 0) + 1;
            uniqueDates.add(record.workingDay);
        });
        
        const totalRecords = workerRecords.length;
        const dayCount = shiftCounts['Day'] || 0;
        const nightCount = shiftCounts['Night'] || 0;
        const dayPct = (dayCount / totalRecords * 100).toFixed(0);
        const nightPct = (nightCount / totalRecords * 100).toFixed(0);
        
        const mainProcess = worker.main_process || 'Unknown';
        const totalDays = uniqueDates.size;
        
        const patternHTML = `
            <div class="font-medium text-gray-800">${mainProcess}</div>
            <div class="text-sm text-gray-600 mt-1">
                ${totalDays} working days<br>
                🌞 Day: ${dayPct}% | 🌙 Night: ${nightPct}%
            </div>
        `;
        patternEl.innerHTML = patternHTML;
    }
}

// Aggregate daily data
function aggregateDailyData(records) {
    const dailyMap = {};
    
    records.forEach(record => {
        const date = record.workingDay;
        if (!dailyMap[date]) {
            dailyMap[date] = {
                date: date,
                shifts: new Set(),
                workCount: 0,
                totalActualMins: 0,
                totalAssignedST: 0
            };
        }
        
        dailyMap[date].shifts.add(record.actualShift);
        dailyMap[date].workCount++;
        dailyMap[date].totalActualMins += record.workerActMins || 0;
        
        // Calculate adjusted assigned S/T (same logic as Report)
        const st = record['Worker S/T'] || 0;
        const rate = record['Worker Rate(%)'] || 0;
        const assigned = (st * rate / 100);
        const adjustmentRatio = record.overlapAdjustmentRatio || 1;
        const adjustedAssigned = assigned * adjustmentRatio;
        
        dailyMap[date].totalAssignedST += adjustedAssigned;
    });
    
    // Calculate metrics for each day
    const dailyArray = Object.values(dailyMap).map(day => {
        const shiftCount = day.shifts.size;
        const shiftTime = shiftCount * 660;
        const utilization = shiftTime > 0 ? (day.totalActualMins / shiftTime) * 100 : 0;
        const efficiency = shiftTime > 0 ? (day.totalAssignedST / shiftTime) * 100 : 0;
        const score = (utilization * 0.5) + (efficiency * 0.5);
        
        return {
            ...day,
            shiftCount,
            shiftTime,
            utilization,
            efficiency,
            score
        };
    });
    
    // Sort by date
    dailyArray.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return dailyArray;
}

// Build daily score trend chart
function buildScorecardScoreChart(dailyData) {
    if (scorecardScoreChart) {
        scorecardScoreChart.destroy();
        scorecardScoreChart = null;
    }
    
    const ctx = document.getElementById('scorecardModalScoreChart');
    if (!ctx || dailyData.length === 0) return;
    
    const dates = dailyData.map(d => d.date);
    const scores = dailyData.map(d => d.score);
    const utilization = dailyData.map(d => d.utilization);
    const efficiency = dailyData.map(d => d.efficiency);
    
    // Calculate dynamic max for Y axis
    const allValues = [...scores, ...utilization, ...efficiency];
    const maxValue = Math.max(...allValues, 100);
    const yMax = Math.ceil(maxValue / 20) * 20; // Round up to nearest 20
    
    scorecardScoreChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Score',
                    data: scores,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.3,
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Utilization',
                    data: utilization,
                    borderColor: '#3b82f6',
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    borderWidth: 1.5,
                    borderDash: [5, 5]
                },
                {
                    label: 'Efficiency',
                    data: efficiency,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    borderWidth: 1.5,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: yMax,
                    ticks: {
                        stepSize: 20
                    },
                    title: {
                        display: true,
                        text: 'Score / Rate (%)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Build utilization vs efficiency comparison chart
function buildScorecardComparisonChart(dailyData) {
    if (scorecardComparisonChart) {
        scorecardComparisonChart.destroy();
        scorecardComparisonChart = null;
    }
    
    const ctx = document.getElementById('scorecardModalComparisonChart');
    if (!ctx || dailyData.length === 0) return;
    
    const dates = dailyData.map(d => d.date);
    const utilization = dailyData.map(d => d.utilization);
    const efficiency = dailyData.map(d => d.efficiency);
    
    // Calculate dynamic max for Y axis
    const allValues = [...utilization, ...efficiency];
    const maxValue = Math.max(...allValues, 100);
    const yMax = Math.ceil(maxValue / 20) * 20; // Round up to nearest 20
    
    scorecardComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Utilization',
                    data: utilization,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: '#3b82f6',
                    borderWidth: 1
                },
                {
                    label: 'Efficiency',
                    data: efficiency,
                    backgroundColor: 'rgba(139, 92, 246, 0.7)',
                    borderColor: '#8b5cf6',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: yMax,
                    ticks: {
                        stepSize: 20
                    },
                    title: {
                        display: true,
                        text: 'Rate (%)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Build daily performance table
function buildScorecardDailyTable(dailyData) {
    const tbody = document.getElementById('scorecardModalTableBody');
    
    if (dailyData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    No performance data available
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = dailyData.map(day => {
        const shiftList = Array.from(day.shifts).join(', ');
        
        // Score-based row coloring (subtle)
        let rowClass = 'hover:bg-gray-50';
        let scoreBadge = '';
        if (day.score >= 80) {
            rowClass = 'bg-gray-50 hover:bg-gray-100';
            scoreBadge = 'bg-gray-700';
        } else if (day.score >= 70) {
            rowClass = 'bg-gray-50 hover:bg-gray-100';
            scoreBadge = 'bg-gray-600';
        } else if (day.score >= 60) {
            rowClass = 'hover:bg-gray-50';
            scoreBadge = 'bg-gray-500';
        } else {
            rowClass = 'hover:bg-gray-50';
            scoreBadge = 'bg-gray-400';
        }
        
        return `
            <tr class="${rowClass}">
                <td class="px-4 py-3 text-sm">${day.date}</td>
                <td class="px-4 py-3 text-sm">${shiftList}</td>
                <td class="px-4 py-3 text-sm text-center">${day.workCount}</td>
                <td class="px-4 py-3 text-sm text-right">${day.shiftTime.toFixed(0)}</td>
                <td class="px-4 py-3 text-sm text-right">${day.totalActualMins.toFixed(0)}</td>
                <td class="px-4 py-3 text-sm text-right">${day.utilization.toFixed(1)}%</td>
                <td class="px-4 py-3 text-sm text-right">${day.efficiency.toFixed(1)}%</td>
                <td class="px-4 py-3 text-sm text-right">
                    <span class="inline-block px-2 py-1 ${scoreBadge} text-white text-xs font-bold rounded">
                        ${day.score.toFixed(1)}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

console.log('✅ Scorecard module loaded with Score-based worker detail modal');
