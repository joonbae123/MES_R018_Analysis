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
        // Filter processedData first
        let filteredData = window.AppState.processedData;
        
        console.log('🔍 loadScorecardData() called');
        console.log('   Current filters:', JSON.parse(JSON.stringify(ScorecardState.filters)));
        console.log('📦 Total records before filtering:', filteredData.length);
        
        // Apply filters (only if filter has value)
        if (ScorecardState.filters.shift) {
            filteredData = filteredData.filter(r => r.actualShift === ScorecardState.filters.shift);
            console.log(`  → After shift filter: ${filteredData.length} records`);
        }
        
        if (ScorecardState.filters.workingDays.length > 0) {
            filteredData = filteredData.filter(r => ScorecardState.filters.workingDays.includes(r.workingDay));
            console.log(`  → After working days filter: ${filteredData.length} records`);
        }
        
        if (ScorecardState.filters.workingShift) {
            filteredData = filteredData.filter(r => r.workingShift === ScorecardState.filters.workingShift);
            console.log(`  → After working shift filter: ${filteredData.length} records`);
        }
        
        if (ScorecardState.filters.categories.length > 0) {
            filteredData = filteredData.filter(r => ScorecardState.filters.categories.includes(r.foDesc2));
            console.log(`  → After categories filter: ${filteredData.length} records`);
        }
        
        if (ScorecardState.filters.processes.length > 0) {
            filteredData = filteredData.filter(r => ScorecardState.filters.processes.includes(r.foDesc3));
            console.log(`  → After processes filter: ${filteredData.length} records`);
        }
        
        if (ScorecardState.filters.workers.length > 0) {
            filteredData = filteredData.filter(r => ScorecardState.filters.workers.includes(r.workerName));
            console.log(`  → After workers filter: ${filteredData.length} records`);
        }
        
        console.log(`✅ Final filtered data: ${filteredData.length} records (from ${window.AppState.processedData.length})`);
        
        // Aggregate filtered data by worker (same logic as Report tab)
        const workerMap = {};
        
        filteredData.forEach(record => {
            const name = record.workerName;
            if (!name) return;
            
            if (!workerMap[name]) {
                workerMap[name] = {
                    name: name,
                    totalActualTime: 0,
                    totalAssignedST: 0,
                    workCount: 0,
                    shifts: new Set(),
                    main_process: record.foDesc3,
                    category: record.foDesc2
                };
            }
            
            const actualMinutes = record.workerActMins || 0;
            const st = record['Worker S/T'] || 0;
            const rate = record['Worker Rate(%)'] || 0;
            const assigned = (st * rate / 100);
            const adjustmentRatio = record.overlapAdjustmentRatio || 1;
            const adjustedAssigned = assigned * adjustmentRatio;
            
            workerMap[name].totalActualTime += actualMinutes;
            workerMap[name].totalAssignedST += adjustedAssigned;
            workerMap[name].workCount++;
            
            const shiftKey = `${record.workingDay}_${record.workingShift}`;
            workerMap[name].shifts.add(shiftKey);
        });
        
        // Calculate metrics (using shift count * 660 for totalShiftTime)
        ScorecardState.allWorkers = Object.values(workerMap).map(worker => {
            const shiftCount = worker.shifts.size;
            const totalShiftTime = shiftCount * 660; // 660 minutes per shift
            
            const utilization = totalShiftTime > 0 
                ? (worker.totalActualTime / totalShiftTime) * 100 
                : 0;
            const efficiency = totalShiftTime > 0 
                ? (worker.totalAssignedST / totalShiftTime) * 100 
                : 0;
            const score = (utilization * 0.5) + (efficiency * 0.5);
            
            return {
                name: worker.name,
                main_process: worker.main_process || 'Unknown',
                category: worker.category || '',
                work_count: worker.workCount,
                shift_count: shiftCount,
                utilization: utilization,
                efficiency: efficiency,
                score: score,
                grade: getGrade(score),
                total_minutes: worker.totalActualTime,
                assigned_st: worker.totalAssignedST
            };
        });
        
        console.log(`📊 Scorecard: Aggregated ${ScorecardState.allWorkers.length} workers`);
        console.log('First worker:', ScorecardState.allWorkers[0]);
        
        // Apply grade filter and render
        applyScorecardGradeFilter();
        
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

console.log('✅ Scorecard module loaded with advanced filters');
