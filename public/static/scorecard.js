// Scorecard Tab JavaScript
// Reuses Report tab's data loading logic from AppState

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

// Load and Aggregate Scorecard Data
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
        
        // Get processed data from AppState
        const data = window.AppState.processedData;
        
        // Aggregate by worker
        const workerMap = new Map();
        
        data.forEach(record => {
            const name = record.workerName;
            if (!name) return;
            
            if (!workerMap.has(name)) {
                workerMap.set(name, {
                    name: name,
                    works: [],
                    totalShiftTime: 0,
                    totalActualTime: 0,
                    totalStandardTime: 0,
                    processes: new Set(),
                    shifts: new Set()
                });
            }
            
            const worker = workerMap.get(name);
            worker.works.push(record);
            worker.totalShiftTime += record.shiftTime || 0;
            worker.totalActualTime += record.actualTime || 0;
            worker.totalStandardTime += record.standardTime || 0;
            
            if (record.foDesc3) worker.processes.add(record.foDesc3);
            if (record.workingShift) worker.shifts.add(record.workingShift);
        });
        
        // Calculate metrics for each worker
        const workers = Array.from(workerMap.values()).map(worker => {
            const utilization = worker.totalShiftTime > 0 
                ? (worker.totalActualTime / worker.totalShiftTime) * 100 
                : 0;
            
            const efficiency = worker.totalActualTime > 0
                ? (worker.totalStandardTime / worker.totalActualTime) * 100
                : 0;
            
            // Composite score: 50% utilization + 50% efficiency
            const score = (utilization * 0.5) + (efficiency * 0.5);
            
            // Determine main process (most frequent)
            const processCounts = {};
            worker.works.forEach(w => {
                const proc = w.foDesc3 || 'Unknown';
                processCounts[proc] = (processCounts[proc] || 0) + 1;
            });
            const mainProcess = Object.entries(processCounts)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
            
            return {
                name: worker.name,
                main_process: mainProcess,
                work_count: worker.works.length,
                score: score,
                utilization: utilization,
                efficiency: efficiency,
                totalShiftTime: worker.totalShiftTime,
                totalActualTime: worker.totalActualTime,
                totalStandardTime: worker.totalStandardTime,
                processes: Array.from(worker.processes),
                shifts: Array.from(worker.shifts),
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

// Update Process Filter Options
function updateProcessFilterOptions(workers) {
    const processes = [...new Set(workers.map(w => w.main_process))].filter(p => p && p !== 'Unknown').sort();
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
    console.log('📊 Loading detail for worker:', workerName);
    
    const worker = ScorecardState.allWorkers.find(w => w.name === workerName);
    if (!worker) {
        alert('Worker not found');
        return;
    }
    
    // Show detail view
    document.getElementById('scorecardListView').classList.add('hidden');
    document.getElementById('scorecardDetailView').classList.remove('hidden');
    
    ScorecardState.selectedWorker = worker;
    
    // Prepare detailed data
    const detailedWorker = prepareWorkerDetail(worker);
    renderWorkerDetail(detailedWorker);
}

// Prepare Worker Detail Data
function prepareWorkerDetail(worker) {
    // Sort works by date (most recent first)
    const sortedWorks = worker.works.sort((a, b) => {
        const dateA = new Date(a.workingDay);
        const dateB = new Date(b.workingDay);
        return dateB - dateA;
    });
    
    // Calculate trend (group by date)
    const dailyStats = {};
    sortedWorks.forEach(work => {
        const date = work.workingDay;
        if (!dailyStats[date]) {
            dailyStats[date] = {
                date: date,
                totalShiftTime: 0,
                totalActualTime: 0,
                totalStandardTime: 0,
                count: 0
            };
        }
        
        dailyStats[date].totalShiftTime += work.shiftTime || 0;
        dailyStats[date].totalActualTime += work.actualTime || 0;
        dailyStats[date].totalStandardTime += work.standardTime || 0;
        dailyStats[date].count++;
    });
    
    const trend = Object.values(dailyStats).map(day => ({
        date: day.date,
        utilization: day.totalShiftTime > 0 ? (day.totalActualTime / day.totalShiftTime) * 100 : 0,
        efficiency: day.totalActualTime > 0 ? (day.totalStandardTime / day.totalActualTime) * 100 : 0,
        workCount: day.count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Shift distribution
    const shiftCounts = {};
    sortedWorks.forEach(work => {
        const shift = work.workingShift || 'Unknown';
        shiftCounts[shift] = (shiftCounts[shift] || 0) + 1;
    });
    
    const shift_distribution = Object.entries(shiftCounts).map(([shift, count]) => ({
        shift: shift,
        count: count
    }));
    
    // Process distribution
    const processCounts = {};
    sortedWorks.forEach(work => {
        const process = work.foDesc3 || 'Unknown';
        processCounts[process] = (processCounts[process] || 0) + 1;
    });
    
    const process_distribution = Object.entries(processCounts).map(([process, count]) => ({
        process: process,
        count: count
    }));
    
    // Recent works (last 20)
    const recent_works = sortedWorks.slice(0, 20).map(work => ({
        date: work.workingDay,
        process: work.foDesc3,
        shift: work.workingShift,
        utilization: work.shiftTime > 0 ? (work.actualTime / work.shiftTime) * 100 : 0,
        efficiency: work.actualTime > 0 ? (work.standardTime / work.actualTime) * 100 : 0,
        remark: work.remark || ''
    }));
    
    return {
        ...worker,
        trend: trend,
        shift_distribution: shift_distribution,
        process_distribution: process_distribution,
        recent_works: recent_works
    };
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

// Render Worker Detail
function renderWorkerDetail(worker) {
    const gradeInfo = getGradeInfo(worker.score);
    
    // Calculate percentile
    const betterCount = ScorecardState.allWorkers.filter(w => w.score > worker.score).length;
    const percentile = ((betterCount / ScorecardState.allWorkers.length) * 100).toFixed(1);
    
    // Header
    document.getElementById('workerDetailName').innerHTML = `
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">${worker.name}</h2>
            <span class="px-4 py-2 rounded-full text-lg font-bold ${gradeInfo.color}">
                Grade ${gradeInfo.grade}
            </span>
        </div>
    `;
    
    document.getElementById('workerDetailInfo').innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
                <span class="text-gray-500">Main Process</span>
                <p class="font-semibold text-gray-900 mt-1">${worker.main_process}</p>
            </div>
            <div>
                <span class="text-gray-500">Total Works</span>
                <p class="font-semibold text-gray-900 mt-1">${worker.work_count.toLocaleString()}</p>
            </div>
            <div>
                <span class="text-gray-500">Score</span>
                <p class="font-semibold text-gray-900 mt-1">${worker.score.toFixed(1)} pts</p>
            </div>
            <div>
                <span class="text-gray-500">Rank</span>
                <p class="font-semibold text-gray-900 mt-1">Top ${percentile}%</p>
            </div>
        </div>
    `;
    
    // KPIs
    document.getElementById('workerDetailKpis').innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="text-sm font-medium text-blue-700">
                        <i class="fas fa-clock mr-1"></i>Time Utilization
                    </h4>
                    <span class="text-2xl font-bold ${getPerformanceColor(worker.utilization, 'utilization')}">
                        ${worker.utilization.toFixed(1)}%
                    </span>
                </div>
                <div class="w-full bg-blue-200 rounded-full h-2.5">
                    <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${Math.min(worker.utilization, 100)}%"></div>
                </div>
            </div>
            
            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="text-sm font-medium text-green-700">
                        <i class="fas fa-bolt mr-1"></i>Work Efficiency
                    </h4>
                    <span class="text-2xl font-bold ${getPerformanceColor(worker.efficiency, 'efficiency')}">
                        ${worker.efficiency.toFixed(1)}%
                    </span>
                </div>
                <div class="w-full bg-green-200 rounded-full h-2.5">
                    <div class="bg-green-600 h-2.5 rounded-full" style="width: ${Math.min(worker.efficiency, 100)}%"></div>
                </div>
            </div>
        </div>
    `;
    
    // Render charts
    renderWorkerTrendChart(worker.trend);
    renderWorkerDistributionCharts(worker.shift_distribution, worker.process_distribution);
    renderWorkerWorkRecords(worker.recent_works);
    renderWorkerInsights(worker);
}

// Render Trend Chart
function renderWorkerTrendChart(trend) {
    if (ScorecardState.charts.trend) {
        ScorecardState.charts.trend.destroy();
    }
    
    const ctx = document.getElementById('workerTrendChart');
    if (!ctx) return;
    
    ScorecardState.charts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trend.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [
                {
                    label: 'Utilization %',
                    data: trend.map(d => d.utilization),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Efficiency %',
                    data: trend.map(d => d.efficiency),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                    max: 120,
                    ticks: {
                        callback: value => value + '%'
                    }
                }
            }
        }
    });
}

// Render Distribution Charts
function renderWorkerDistributionCharts(shiftDist, processDist) {
    if (ScorecardState.charts.shift) {
        ScorecardState.charts.shift.destroy();
    }
    
    const shiftCtx = document.getElementById('workerShiftChart');
    if (shiftCtx && shiftDist && shiftDist.length > 0) {
        ScorecardState.charts.shift = new Chart(shiftCtx, {
            type: 'doughnut',
            data: {
                labels: shiftDist.map(d => d.shift),
                datasets: [{
                    data: shiftDist.map(d => d.count),
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    if (ScorecardState.charts.process) {
        ScorecardState.charts.process.destroy();
    }
    
    const processCtx = document.getElementById('workerProcessChart');
    if (processCtx && processDist && processDist.length > 0) {
        ScorecardState.charts.process = new Chart(processCtx, {
            type: 'doughnut',
            data: {
                labels: processDist.map(d => d.process),
                datasets: [{
                    data: processDist.map(d => d.count),
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Render Work Records
function renderWorkerWorkRecords(works) {
    const tbody = document.getElementById('workerWorkRecordsBody');
    if (!tbody) return;
    
    if (!works || works.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-4 py-4 text-center text-gray-500 text-sm">
                    No work records available
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = works.map(work => {
        const utilizationColor = getPerformanceColor(work.utilization, 'utilization');
        const efficiencyColor = getPerformanceColor(work.efficiency, 'efficiency');
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">
                    ${new Date(work.date).toLocaleDateString()}
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">
                    <span class="inline-block px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                        ${work.process || '-'}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">
                    ${work.shift || '-'}
                </td>
                <td class="px-4 py-3 text-sm text-right font-medium ${utilizationColor}">
                    ${work.utilization.toFixed(1)}%
                </td>
                <td class="px-4 py-3 text-sm text-right font-medium ${efficiencyColor}">
                    ${work.efficiency.toFixed(1)}%
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                    ${work.remark || '-'}
                </td>
            </tr>
        `;
    }).join('');
}

// Render Insights
function renderWorkerInsights(worker) {
    const insights = [];
    
    if (worker.utilization >= 80) {
        insights.push({ type: 'success', icon: 'fa-check-circle', text: `Excellent time utilization (${worker.utilization.toFixed(1)}%)` });
    } else if (worker.utilization < 60) {
        insights.push({ type: 'warning', icon: 'fa-exclamation-triangle', text: `Low time utilization (${worker.utilization.toFixed(1)}%)` });
    }
    
    if (worker.efficiency >= 90) {
        insights.push({ type: 'success', icon: 'fa-star', text: `Outstanding work efficiency (${worker.efficiency.toFixed(1)}%)` });
    } else if (worker.efficiency < 70) {
        insights.push({ type: 'warning', icon: 'fa-flag', text: `Efficiency needs improvement (${worker.efficiency.toFixed(1)}%)` });
    }
    
    if (worker.score >= 85) {
        insights.push({ type: 'info', icon: 'fa-trophy', text: 'Top performer - maintain this excellence' });
    } else if (worker.score < 65) {
        insights.push({ type: 'danger', icon: 'fa-hand-paper', text: 'Performance review recommended' });
    }
    
    if (worker.trend && worker.trend.length >= 7) {
        const recent = worker.trend.slice(-7);
        const avgRecent = recent.reduce((sum, d) => sum + d.utilization, 0) / recent.length;
        const older = worker.trend.slice(0, 7);
        const avgOlder = older.length > 0 ? older.reduce((sum, d) => sum + d.utilization, 0) / older.length : avgRecent;
        
        if (avgRecent > avgOlder + 5) {
            insights.push({ type: 'success', icon: 'fa-arrow-up', text: 'Positive performance trend detected' });
        } else if (avgRecent < avgOlder - 5) {
            insights.push({ type: 'warning', icon: 'fa-arrow-down', text: 'Performance declining - attention needed' });
        }
    }
    
    const container = document.getElementById('workerInsights');
    if (!container) return;
    
    if (insights.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-gray-500 text-sm">
                <i class="fas fa-info-circle mr-2"></i>
                No specific insights available
            </div>
        `;
        return;
    }
    
    container.innerHTML = insights.map(insight => {
        let colorClass = '';
        switch(insight.type) {
            case 'success': colorClass = 'bg-green-50 border-green-200 text-green-700'; break;
            case 'warning': colorClass = 'bg-yellow-50 border-yellow-200 text-yellow-700'; break;
            case 'danger': colorClass = 'bg-red-50 border-red-200 text-red-700'; break;
            default: colorClass = 'bg-blue-50 border-blue-200 text-blue-700';
        }
        
        return `
            <div class="p-3 rounded-lg border ${colorClass}">
                <i class="fas ${insight.icon} mr-2"></i>
                <span class="text-sm font-medium">${insight.text}</span>
            </div>
        `;
    }).join('');
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

console.log('✅ Scorecard module loaded (using AppState)');
