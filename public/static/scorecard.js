// Scorecard Tab JavaScript

let scorecardData = {
    currentUploadId: null,
    allWorkers: [],
    filteredWorkers: [],
    selectedWorker: null,
    charts: {}
};

// Initialize Scorecard Tab
async function initScorecardTab(uploadId) {
    if (!uploadId) {
        console.log('No upload ID provided');
        return;
    }
    
    scorecardData.currentUploadId = uploadId;
    await loadWorkersList();
}

// Load Workers List
async function loadWorkersList(processFilter = '', gradeFilter = '') {
    try {
        let url = `/api/scorecard/workers?uploadId=${scorecardData.currentUploadId}`;
        if (processFilter) url += `&process=${processFilter}`;
        if (gradeFilter) url += `&grade=${gradeFilter}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to load workers');
        }
        
        scorecardData.allWorkers = data.workers;
        scorecardData.filteredWorkers = data.workers;
        
        renderWorkersList(scorecardData.filteredWorkers);
        renderOverview(scorecardData.allWorkers);
        
    } catch (error) {
        console.error('Failed to load workers list:', error);
        document.getElementById('scorecardWorkerList').innerHTML = `
            <div class="text-red-500 text-sm text-center py-4">
                <i class="fas fa-exclamation-circle mr-2"></i>
                데이터 로드 실패
            </div>
        `;
    }
}

// Render Workers List
function renderWorkersList(workers) {
    const gradeColors = {
        'S': 'bg-yellow-100 border-yellow-400 text-yellow-900',
        'A': 'bg-green-100 border-green-400 text-green-900',
        'B': 'bg-blue-100 border-blue-400 text-blue-900',
        'C': 'bg-orange-100 border-orange-400 text-orange-900',
        'D': 'bg-red-100 border-red-400 text-red-900'
    };
    
    if (workers.length === 0) {
        document.getElementById('scorecardWorkerList').innerHTML = `
            <p class="text-gray-500 text-center py-8 text-sm">검색 결과가 없습니다</p>
        `;
        return;
    }
    
    const html = workers.map(w => `
        <div class="border-2 ${gradeColors[w.grade]} rounded-lg p-3 cursor-pointer hover:shadow-lg transition worker-card"
             data-worker-name="${w.name}"
             onclick="selectWorker('${w.name}')">
            <div class="flex justify-between items-start mb-2">
                <span class="font-bold text-sm">${w.name}</span>
                <span class="text-lg font-bold">${w.grade}</span>
            </div>
            <div class="text-xs text-gray-700 space-y-1">
                <div><i class="fas fa-industry w-4"></i> ${w.main_process}</div>
                <div><i class="fas fa-chart-line w-4"></i> ${w.score}점</div>
                <div><i class="fas fa-box w-4"></i> ${w.work_count}건</div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('scorecardWorkerList').innerHTML = html;
}

// Select Worker
async function selectWorker(workerName) {
    // Highlight selected worker
    document.querySelectorAll('.worker-card').forEach(card => {
        card.classList.remove('ring-4', 'ring-purple-500');
    });
    event.currentTarget?.classList.add('ring-4', 'ring-purple-500');
    
    scorecardData.selectedWorker = workerName;
    
    // Show loading
    document.getElementById('scorecardOverview').classList.add('hidden');
    document.getElementById('scorecardWorkerCard').classList.remove('hidden');
    document.getElementById('scorecardWorkerCard').innerHTML = `
        <div class="text-center py-20">
            <i class="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
            <p class="text-gray-600">성적표를 불러오는 중...</p>
        </div>
    `;
    
    // Load worker card
    await loadWorkerCard(workerName);
}

// Load Worker Card
async function loadWorkerCard(workerName) {
    try {
        const response = await fetch(`/api/scorecard/worker/${encodeURIComponent(workerName)}?uploadId=${scorecardData.currentUploadId}&days=30`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to load worker card');
        }
        
        renderWorkerCard(data);
        
    } catch (error) {
        console.error('Failed to load worker card:', error);
        document.getElementById('scorecardWorkerCard').innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <p class="text-red-600">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    데이터를 불러올 수 없습니다: ${error.message}
                </p>
            </div>
        `;
    }
}

// Render Worker Card
function renderWorkerCard(data) {
    const gradeColors = {
        'S': 'bg-yellow-400 text-yellow-900',
        'A': 'bg-green-400 text-green-900',
        'B': 'bg-blue-400 text-blue-900',
        'C': 'bg-orange-400 text-orange-900',
        'D': 'bg-red-400 text-red-900'
    };
    
    const container = document.getElementById('scorecardWorkerCard');
    
    container.innerHTML = `
        <!-- Back Button -->
        <div class="mb-4">
            <button onclick="backToOverview()" class="text-purple-600 hover:text-purple-800 font-medium">
                <i class="fas fa-arrow-left mr-2"></i>목록으로 돌아가기
            </button>
        </div>
        
        <!-- Header Card -->
        <div class="bg-white shadow-lg rounded-lg p-6 mb-6">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h2 class="text-3xl font-bold">
                        <i class="fas fa-user text-purple-600 mr-2"></i>${data.name}
                    </h2>
                    <p class="text-gray-600 mt-1">
                        BT Team | ${data.header.mainProcess} | Total: ${data.header.totalWorks} Work Orders
                    </p>
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-600">
                        <i class="fas fa-calendar mr-1"></i>${data.period.start} ~ ${data.period.end}
                    </p>
                </div>
            </div>
            
            <div class="mb-4">
                <span class="text-2xl font-bold">종합 성적</span>
                <span class="${gradeColors[data.header.grade]} text-2xl font-bold px-4 py-2 rounded ml-4">
                    ${data.header.grade}등급
                </span>
                <span class="text-3xl font-bold ml-4">${data.header.score}점</span>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <div class="flex justify-between mb-1">
                        <span class="text-sm font-medium">
                            <i class="fas fa-clock text-blue-600 mr-1"></i>Time Utilization
                        </span>
                        <span class="font-bold">${data.header.utilization}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-4">
                        <div class="bg-blue-500 h-4 rounded-full transition-all duration-500" style="width: ${data.header.utilization}%"></div>
                    </div>
                    <p class="text-xs text-gray-600 mt-1">가중치 50% = ${(data.header.utilization * 0.5).toFixed(1)}점</p>
                </div>
                
                <div>
                    <div class="flex justify-between mb-1">
                        <span class="text-sm font-medium">
                            <i class="fas fa-bolt text-green-600 mr-1"></i>Work Efficiency
                        </span>
                        <span class="font-bold">${data.header.efficiency}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-4">
                        <div class="bg-green-500 h-4 rounded-full transition-all duration-500" style="width: ${Math.min(data.header.efficiency, 100)}%"></div>
                    </div>
                    <p class="text-xs text-gray-600 mt-1">가중치 50% = ${(data.header.efficiency * 0.5).toFixed(1)}점</p>
                </div>
            </div>
            
            <div class="text-center text-lg font-medium">
                <i class="fas fa-chart-line text-purple-600 mr-2"></i>
                상위 <span class="font-bold text-purple-600">${data.header.ranking.percentile}%</span> 
                <span class="text-gray-600">(전체 ${data.header.ranking.total}명 중)</span>
            </div>
        </div>
        
        <!-- Main Grid -->
        <div class="grid grid-cols-3 gap-6">
            
            <!-- Trend Chart (col-span-2) -->
            <div class="col-span-2 bg-white shadow rounded-lg p-6">
                <h3 class="text-lg font-bold mb-4">
                    <i class="fas fa-chart-line text-blue-600 mr-2"></i>
                    Performance Trend (최근 30일)
                </h3>
                <canvas id="workerTrendChart"></canvas>
            </div>
            
            <!-- Insights -->
            <div class="bg-white shadow rounded-lg p-6">
                <h3 class="text-lg font-bold mb-4">
                    <i class="fas fa-lightbulb text-yellow-600 mr-2"></i>
                    Quick Insights
                </h3>
                <div id="workerInsights" class="text-sm space-y-3">
                    ${renderInsights(data.insights)}
                </div>
            </div>
            
            <!-- Distribution -->
            <div class="bg-white shadow rounded-lg p-6">
                <h3 class="text-lg font-bold mb-4">
                    <i class="fas fa-chart-pie text-purple-600 mr-2"></i>
                    Work Distribution
                </h3>
                <div class="mb-4">
                    <p class="text-xs text-gray-600 mb-2 font-medium">시프트 분포</p>
                    <canvas id="workerShiftChart" height="150"></canvas>
                </div>
                <div class="mt-6">
                    <p class="text-xs text-gray-600 mb-2 font-medium">공정 분포</p>
                    <canvas id="workerProcessChart" height="150"></canvas>
                </div>
            </div>
            
            <!-- Recent Work Records (col-span-2) -->
            <div class="col-span-2 bg-white shadow rounded-lg p-6">
                <h3 class="text-lg font-bold mb-4">
                    <i class="fas fa-list text-gray-600 mr-2"></i>
                    Recent Work Records (최근 20건)
                </h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full text-xs">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-3 py-2 text-left">날짜</th>
                                <th class="px-3 py-2 text-left">공정</th>
                                <th class="px-3 py-2 text-left">Shift</th>
                                <th class="px-3 py-2 text-right">작업시간</th>
                                <th class="px-3 py-2 text-right">활용도</th>
                                <th class="px-3 py-2 text-right">효율</th>
                                <th class="px-3 py-2 text-left">비고</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${renderWorkTable(data.recentWorks)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // Render charts
    setTimeout(() => {
        renderWorkerTrendChart(data.trend);
        renderWorkerDistributionCharts(data.distribution);
    }, 100);
}

// Render Insights
function renderInsights(insights) {
    let html = '';
    
    if (insights.strengths.length > 0) {
        html += `
            <div>
                <h4 class="font-bold text-green-600 mb-1">
                    <i class="fas fa-check-circle mr-1"></i>강점
                </h4>
                <ul class="list-disc list-inside text-gray-700">
                    ${insights.strengths.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (insights.warnings.length > 0) {
        html += `
            <div>
                <h4 class="font-bold text-yellow-600 mb-1">
                    <i class="fas fa-exclamation-triangle mr-1"></i>주의
                </h4>
                <ul class="list-disc list-inside text-gray-700">
                    ${insights.warnings.map(w => `<li>${w}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (insights.improvements.length > 0) {
        html += `
            <div>
                <h4 class="font-bold text-blue-600 mb-1">
                    <i class="fas fa-arrow-up mr-1"></i>개선 추세
                </h4>
                <ul class="list-disc list-inside text-gray-700">
                    ${insights.improvements.map(i => `<li>${i}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (insights.recommendations.length > 0) {
        html += `
            <div>
                <h4 class="font-bold text-purple-600 mb-1">
                    <i class="fas fa-graduation-cap mr-1"></i>추천
                </h4>
                <ul class="list-disc list-inside text-gray-700">
                    ${insights.recommendations.map(r => `<li>${r}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (html === '') {
        html = '<p class="text-gray-500 text-center py-4">인사이트가 없습니다</p>';
    }
    
    return html;
}

// Render Work Table
function renderWorkTable(works) {
    return works.map(w => {
        const utilColor = w.util_rate >= 80 ? 'text-green-600 font-bold' : 
                         w.util_rate >= 60 ? 'text-yellow-600' : 'text-red-600';
        const effColor = w.eff_rate >= 80 ? 'text-green-600 font-bold' : 
                        w.eff_rate >= 60 ? 'text-yellow-600' : 'text-red-600';
        
        return `
            <tr class="border-b hover:bg-gray-50">
                <td class="px-3 py-2">${w.date}</td>
                <td class="px-3 py-2">${w.fo_desc}</td>
                <td class="px-3 py-2">${w.shift}</td>
                <td class="px-3 py-2 text-right">${(w.work_time / 60).toFixed(1)}h</td>
                <td class="px-3 py-2 text-right ${utilColor}">${w.util_rate}%</td>
                <td class="px-3 py-2 text-right ${effColor}">${w.eff_rate}%</td>
                <td class="px-3 py-2 text-gray-600">${w.rework ? '재작업' : ''}</td>
            </tr>
        `;
    }).join('');
}

// Render Worker Trend Chart
function renderWorkerTrendChart(trend) {
    const ctx = document.getElementById('workerTrendChart');
    if (!ctx) return;
    
    if (scorecardData.charts.trend) {
        scorecardData.charts.trend.destroy();
    }
    
    scorecardData.charts.trend = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: trend.map(d => d.date),
            datasets: [
                {
                    label: 'Time Utilization (%)',
                    data: trend.map(d => d.utilization),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Work Efficiency (%)',
                    data: trend.map(d => d.efficiency),
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    max: 120,
                    title: { display: true, text: 'Performance (%)' }
                }
            }
        }
    });
}

// Render Worker Distribution Charts
function renderWorkerDistributionCharts(distribution) {
    // Shift Chart
    const shiftCtx = document.getElementById('workerShiftChart');
    if (shiftCtx && distribution.shift.length > 0) {
        if (scorecardData.charts.shift) {
            scorecardData.charts.shift.destroy();
        }
        
        scorecardData.charts.shift = new Chart(shiftCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: distribution.shift.map(s => s.shift),
                datasets: [{
                    data: distribution.shift.map(s => s.count),
                    backgroundColor: ['#FBBF24', '#1E40AF']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    // Process Chart
    const processCtx = document.getElementById('workerProcessChart');
    if (processCtx && distribution.process.length > 0) {
        if (scorecardData.charts.process) {
            scorecardData.charts.process.destroy();
        }
        
        scorecardData.charts.process = new Chart(processCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: distribution.process.map(p => p.fo_desc),
                datasets: [{
                    data: distribution.process.map(p => p.count),
                    backgroundColor: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}

// Render Overview
function renderOverview(workers) {
    if (workers.length === 0) return;
    
    // Grade distribution
    const gradeCounts = {
        'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0
    };
    
    workers.forEach(w => {
        if (gradeCounts[w.grade] !== undefined) {
            gradeCounts[w.grade]++;
        }
    });
    
    const ctx = document.getElementById('gradeDistChart');
    if (ctx) {
        if (scorecardData.charts.gradeDist) {
            scorecardData.charts.gradeDist.destroy();
        }
        
        scorecardData.charts.gradeDist = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['S등급', 'A등급', 'B등급', 'C등급', 'D등급'],
                datasets: [{
                    data: [gradeCounts.S, gradeCounts.A, gradeCounts.B, gradeCounts.C, gradeCounts.D],
                    backgroundColor: ['#FBBF24', '#10B981', '#3B82F6', '#F59E0B', '#EF4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'right' }
                }
            }
        });
    }
    
    // Top 10
    const top10 = workers.slice(0, 10);
    document.getElementById('top10List').innerHTML = top10.map((w, idx) => `
        <div class="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer" onclick="selectWorker('${w.name}')">
            <span class="font-medium">${idx + 1}. ${w.name}</span>
            <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">${w.score}점</span>
                <span class="px-2 py-1 rounded text-xs font-bold ${getGradeBadgeClass(w.grade)}">${w.grade}</span>
            </div>
        </div>
    `).join('');
    
    // Needs Improvement
    const dGrade = workers.filter(w => w.grade === 'D');
    if (dGrade.length > 0) {
        document.getElementById('needsImprovementList').innerHTML = dGrade.map(w => `
            <div class="flex justify-between items-center p-2 bg-red-50 rounded hover:bg-red-100 cursor-pointer" onclick="selectWorker('${w.name}')">
                <span class="font-medium">${w.name}</span>
                <span class="text-sm text-red-600">${w.score}점</span>
            </div>
        `).join('');
    } else {
        document.getElementById('needsImprovementList').innerHTML = `
            <p class="text-gray-500 text-center py-4 text-sm">개선 필요한 작업자가 없습니다</p>
        `;
    }
}

// Helper: Get grade badge class
function getGradeBadgeClass(grade) {
    const classes = {
        'S': 'bg-yellow-400 text-yellow-900',
        'A': 'bg-green-400 text-green-900',
        'B': 'bg-blue-400 text-blue-900',
        'C': 'bg-orange-400 text-orange-900',
        'D': 'bg-red-400 text-red-900'
    };
    return classes[grade] || 'bg-gray-400 text-gray-900';
}

// Back to Overview
function backToOverview() {
    scorecardData.selectedWorker = null;
    
    // Clear selection highlight
    document.querySelectorAll('.worker-card').forEach(card => {
        card.classList.remove('ring-4', 'ring-purple-500');
    });
    
    // Show overview
    document.getElementById('scorecardWorkerCard').classList.add('hidden');
    document.getElementById('scorecardOverview').classList.remove('hidden');
}

// Search Worker
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('scorecardWorkerSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            scorecardData.filteredWorkers = scorecardData.allWorkers.filter(w => 
                w.name.toLowerCase().includes(keyword)
            );
            renderWorkersList(scorecardData.filteredWorkers);
        });
    }
    
    // Process Filter
    const processFilter = document.getElementById('scorecardProcessFilter');
    if (processFilter) {
        processFilter.addEventListener('change', (e) => {
            const gradeFilter = document.getElementById('scorecardGradeFilter').value;
            loadWorkersList(e.target.value, gradeFilter);
        });
    }
    
    // Grade Filter
    const gradeFilter = document.getElementById('scorecardGradeFilter');
    if (gradeFilter) {
        gradeFilter.addEventListener('change', (e) => {
            const processFilter = document.getElementById('scorecardProcessFilter').value;
            loadWorkersList(processFilter, e.target.value);
        });
    }
});
