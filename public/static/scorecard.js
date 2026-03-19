// Scorecard Tab JavaScript
// Consistent design with Dashboard and Report tabs

let ScorecardState = {
    currentUploadId: null,
    allWorkers: [],
    filteredWorkers: [],
    selectedWorker: null,
    sortColumn: 'score',
    sortDirection: 'desc',
    charts: {}
};

// Initialize Scorecard Tab
async function initScorecardTab(uploadId) {
    console.log('🎯 Initializing Scorecard Tab, uploadId:', uploadId);
    
    if (!uploadId) {
        console.log('❌ No upload ID provided');
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
    
    ScorecardState.currentUploadId = uploadId;
    await loadScorecardData();
}

// Load Scorecard Data
async function loadScorecardData() {
    try {
        // Show loading
        document.getElementById('scorecardTableBody').innerHTML = `
            <tr>
                <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    Loading workers data...
                </td>
            </tr>
        `;
        
        // Get current filter values
        const processFilter = document.getElementById('scorecardProcessFilter')?.value || '';
        const gradeFilter = document.getElementById('scorecardGradeFilter')?.value || '';
        
        // Build API URL
        let url = `/api/scorecard/workers?uploadId=${ScorecardState.currentUploadId}`;
        if (processFilter) url += `&process=${encodeURIComponent(processFilter)}`;
        if (gradeFilter) url += `&grade=${encodeURIComponent(gradeFilter)}`;
        
        console.log('📡 Fetching scorecard data:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to load workers');
        }
        
        console.log(`✅ Loaded ${data.workers.length} workers`);
        
        ScorecardState.allWorkers = data.workers;
        ScorecardState.filteredWorkers = data.workers;
        
        // Update process filter options
        updateProcessFilterOptions(data.workers);
        
        // Apply search filter
        applySearchFilter();
        
        // Render table
        renderScorecardTable();
        
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
    const processes = [...new Set(workers.map(w => w.main_process))].filter(p => p).sort();
    const selectElement = document.getElementById('scorecardProcessFilter');
    const currentValue = selectElement.value;
    
    selectElement.innerHTML = '<option value="">All Processes</option>';
    processes.forEach(process => {
        selectElement.innerHTML += `<option value="${process}">${process}</option>`;
    });
    
    if (currentValue) {
        selectElement.value = currentValue;
    }
}

// Apply Search Filter
function applySearchFilter() {
    const searchTerm = document.getElementById('scorecardWorkerSearch')?.value.toLowerCase() || '';
    
    if (searchTerm) {
        ScorecardState.filteredWorkers = ScorecardState.allWorkers.filter(worker => 
            worker.name.toLowerCase().includes(searchTerm)
        );
    } else {
        ScorecardState.filteredWorkers = ScorecardState.allWorkers;
    }
    
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
    
    if (!ScorecardState.filteredWorkers || ScorecardState.filteredWorkers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                    <i class="fas fa-search mr-2"></i>
                    No workers found
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
                        ${worker.main_process || '-'}
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
                    <button onclick="viewWorkerDetail('${worker.name}')" 
                            class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <i class="fas fa-eye mr-1"></i>View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// View Worker Detail
async function viewWorkerDetail(workerName) {
    console.log('📊 Loading detail for worker:', workerName);
    
    try {
        // Show loading in detail view
        document.getElementById('scorecardListView').classList.add('hidden');
        document.getElementById('scorecardDetailView').classList.remove('hidden');
        
        // Build API URL
        const url = `/api/scorecard/worker/${encodeURIComponent(workerName)}?uploadId=${ScorecardState.currentUploadId}&days=30`;
        
        console.log('📡 Fetching worker detail:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to load worker detail');
        }
        
        console.log('✅ Worker detail loaded:', data.worker);
        
        ScorecardState.selectedWorker = data.worker;
        renderWorkerDetail(data.worker);
        
    } catch (error) {
        console.error('❌ Failed to load worker detail:', error);
        alert('Failed to load worker detail: ' + error.message);
        backToScorecardList();
    }
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
    
    // Calculate percentile (simple approximation)
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
                <p class="font-semibold text-gray-900 mt-1">${worker.main_process || '-'}</p>
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
    // Destroy existing chart
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
                    max: 100,
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
    // Shift Distribution
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
    
    // Process Distribution
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
    
    tbody.innerHTML = works.slice(0, 20).map(work => {
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
    
    // Performance insights
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
    
    // Grade insights
    if (worker.score >= 85) {
        insights.push({ type: 'info', icon: 'fa-trophy', text: 'Top performer - maintain this excellence' });
    } else if (worker.score < 65) {
        insights.push({ type: 'danger', icon: 'fa-hand-paper', text: 'Performance review recommended' });
    }
    
    // Trend insights (if available)
    if (worker.trend && worker.trend.length >= 7) {
        const recent = worker.trend.slice(-7);
        const avgRecent = recent.reduce((sum, d) => sum + d.utilization, 0) / recent.length;
        const older = worker.trend.slice(0, 7);
        const avgOlder = older.reduce((sum, d) => sum + d.utilization, 0) / older.length;
        
        if (avgRecent > avgOlder + 5) {
            insights.push({ type: 'success', icon: 'fa-arrow-up', text: 'Positive performance trend detected' });
        } else if (avgRecent < avgOlder - 5) {
            insights.push({ type: 'warning', icon: 'fa-arrow-down', text: 'Performance declining - attention needed' });
        }
    }
    
    const container = document.getElementById('workerInsights');
    
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
    loadScorecardData();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Search input
    const searchInput = document.getElementById('scorecardWorkerSearch');
    if (searchInput) {
        searchInput.addEventListener('input', applySearchFilter);
    }
    
    // Filter selects
    const processFilter = document.getElementById('scorecardProcessFilter');
    if (processFilter) {
        processFilter.addEventListener('change', loadScorecardData);
    }
    
    const gradeFilter = document.getElementById('scorecardGradeFilter');
    if (gradeFilter) {
        gradeFilter.addEventListener('change', loadScorecardData);
    }
});

console.log('✅ Scorecard module loaded');
