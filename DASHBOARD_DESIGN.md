# Dashboard Design Specification v1.0

**CS WIND Shopfloor Performance Dashboard**  
**Date**: 2026-02-28  
**Designer**: Product Analytics Team

---

## 📋 Executive Summary

**Purpose**: Create a managerial landing page for CS WIND MES R018 Analysis that provides trend visibility, process comparison, shift analysis, outlier detection, and AI-powered insights based on data-driven rules.

**Design Principles**:
- ✅ Minimal colors, clean typography, strong spacing
- ✅ Managerial insights over decorative charts
- ✅ Modal-based drill-down for details
- ✅ No redundant visualizations
- ✅ Data confidence cues (sample size, missing logs)
- ✅ Regression-safe: existing Report page unchanged

---

## 🎯 Dashboard Goals

1. **Trend Visibility**: Utilization/Efficiency trends (daily/weekly) by process hierarchy (L1/L2/L3)
2. **Process Comparison**: Top/Bottom processes with WoW/DoD variance
3. **Shift Analysis**: Day vs Night performance comparison
4. **Outlier Detection**: Abnormal workers/processes with confidence labels
5. **AI Insights**: 6-10 data-driven warning rules
6. **Drill-Down**: Process/Shift/Worker modals for details

---

## 🖼️ Wireframe Layout (Top to Bottom)

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: Dashboard | Filters (Date, Shift, Process L1/L2/L3)    │
├─────────────────────────────────────────────────────────────────┤
│ Section 1: AI Insights & Warnings (3-5 critical alerts)        │
├─────────────────────────────────────────────────────────────────┤
│ Section 2: KPI Trend Overview                                   │
│ ├─ Utilization Trend (Daily/Weekly toggle)                      │
│ └─ Efficiency Trend (Daily/Weekly toggle)                       │
├─────────────────────────────────────────────────────────────────┤
│ Section 3: Process Performance Ranking                          │
│ ├─ Top 5 Processes (Utilization)                                │
│ └─ Bottom 5 Processes (Utilization)                             │
├─────────────────────────────────────────────────────────────────┤
│ Section 4: Shift Comparison Heatmap                             │
│ ├─ Day Shift: Utilization vs Efficiency                         │
│ └─ Night Shift: Utilization vs Efficiency                       │
├─────────────────────────────────────────────────────────────────┤
│ Section 5: Outlier Workers & Processes                          │
│ ├─ Workers with Critical Performance (<30%)                     │
│ └─ Processes with High Variance (Sample size label)             │
├─────────────────────────────────────────────────────────────────┤
│ Section 6: Data Integrity Dashboard                             │
│ ├─ Missing Job Off Count                                        │
│ ├─ Abnormal Overlap Removal (>1000 min)                         │
│ └─ Process Concentration Risk (Work time in 2-hour band)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Section Specifications

### Section 1: AI Insights & Warnings 🚨

**Purpose**: Surface 3-5 critical alerts to managers based on data-driven rules.

**Key Question**: What requires immediate attention?

**Visual**: 
- Alert cards (red/yellow/blue border)
- Icon + Title + Metric + Threshold + Impacted entity

**Example Alert:**
```
🔴 [CRITICAL] Utilization Collapse Detected
Process: WT → Blasting (Night Shift)
Current: 28.5% | Previous Week: 62.3% (▼ -33.8pp)
Sample: 12 workers, 72 shifts
Confidence: High (sufficient data)
```

**Filters**: All primary filters apply

**Drill-Down**: Click alert → Opens Process Modal (WT → Blasting, Night Shift, current week)

**Interpretation**:
- Red border: Critical (<30% Utilization or >50% drop)
- Yellow border: Warning (30-50% Utilization or 20-50% drop)
- Blue border: Insight (High Util + Low Eff mismatch)

**Action**:
- Manager should investigate shift schedule, equipment downtime, or worker availability
- Click to drill down to process-level details

**Pitfalls**:
- Low sample size (<10 workers) may cause false alarms → Show "Low Confidence" label
- Weekly comparison may miss daily spikes → Provide daily trend in modal

---

### Section 2: KPI Trend Overview 📈

**Purpose**: Show Utilization and Efficiency trends over time with process hierarchy exploration.

**Key Question**: How are performance trends evolving?

**Visual**:
- Two line charts (side by side or stacked)
- X-axis: Date (Daily) or Week (Weekly toggle)
- Y-axis: Utilization Rate % (left), Efficiency Rate % (right)
- Lines: Overall (bold), FO Desc L2 (selectable via dropdown)

**Filters**: Date range, Shift, Process L1

**Drill-Down**: 
- Click data point → Opens Process Modal (selected date, FO Desc L2, shift)
- Toggle: Daily ⇄ Weekly aggregation

**Interpretation**:
- Upward trend: Performance improving
- Downward trend: Performance declining (check AI Insights for root cause)
- Flat trend: Stable performance

**Action**:
- Manager should identify declining periods and drill down to specific processes
- Compare Day vs Night shift trends

**Pitfalls**:
- Weekly aggregation may hide daily volatility
- Process L2 dropdown may overwhelm with too many options → Limit to top 10 by work time

---

### Section 3: Process Performance Ranking 🏆

**Purpose**: Identify top/bottom performing processes with variance vs previous period.

**Key Question**: Which processes are excelling or struggling?

**Visual**:
- Two horizontal bar charts (Top 5 green, Bottom 5 red)
- X-axis: Utilization Rate % (or Efficiency Rate, toggle)
- Y-axis: Process (FO Desc L2 + L3)
- Annotation: WoW/DoD variance (▲ +5.2pp, ▼ -3.1pp)

**Filters**: Date range, Shift, Process L1

**Drill-Down**: Click bar → Opens Process Modal (selected process, current period)

**Interpretation**:
- Green bars (Top 5): High performers (≥60% Utilization)
- Red bars (Bottom 5): Low performers (<40% Utilization)
- ▲ variance: Improvement from previous period
- ▼ variance: Decline from previous period

**Action**:
- Manager should reward top performers and investigate bottom performers
- Check if bottom processes have training gaps or equipment issues

**Pitfalls**:
- Process with low sample size (<5 workers) may rank misleadingly → Show sample size label
- Variance may be distorted by one-time events (e.g., equipment failure) → Provide trend in modal

---

### Section 4: Shift Comparison Heatmap 🌓

**Purpose**: Compare Day vs Night shift performance across both KPIs.

**Key Question**: Is there a consistent shift performance gap?

**Visual**:
- 2x2 Grid Heatmap
- Rows: Day Shift, Night Shift
- Columns: Utilization Rate %, Efficiency Rate %
- Cell color: Green (≥60%), Yellow (40-60%), Red (<40%)
- Cell text: Rate % + Sample (workers, shifts)

**Filters**: Date range, Process L1/L2/L3

**Drill-Down**: Click cell → Opens Shift Modal (selected shift, date range)

**Interpretation**:
- Green cell: Strong performance (≥60%)
- Yellow cell: Moderate performance (40-60%)
- Red cell: Weak performance (<40%)
- Compare Day vs Night: If Night < Day by >15pp → Investigate shift staffing or fatigue

**Action**:
- Manager should balance shift staffing if one shift consistently underperforms
- Check if Night shift has training gaps or equipment downtime

**Pitfalls**:
- Sample size bias: Night shift may have fewer workers → Always show worker count
- Weekend shifts may distort weekly averages → Provide daily breakdown in modal

---

### Section 5: Outlier Workers & Processes 🎯

**Purpose**: Detect abnormal workers and processes using statistical thresholds.

**Key Question**: Who/What needs coaching or investigation?

**Visual**:
- Two tables (Workers, Processes)
- Columns: Name, Utilization %, Efficiency %, Shifts, Confidence
- Row color: Red (<30%), Yellow (30-50%)
- Badge: "Low Sample" if <5 shifts

**Filters**: Date range, Shift, Process L1/L2/L3

**Drill-Down**: 
- Click worker name → Opens Worker Modal (existing)
- Click process name → Opens Process Modal

**Interpretation**:
- Red row: Critical performance (<30%) → Immediate action needed
- Yellow row: Poor performance (30-50%) → Coaching recommended
- "Low Sample" badge: <5 shifts → May not be representative

**Action**:
- Manager should schedule 1:1 coaching for workers in red rows
- Investigate processes in red rows for equipment/training issues

**Pitfalls**:
- New workers may have low performance during onboarding → Filter out <1 week tenure
- Processes with seasonal demand spikes may rank low in off-season → Compare YoY

---

### Section 6: Data Integrity Dashboard 🛡️

**Purpose**: Surface data quality issues that may distort performance metrics.

**Key Question**: Is the data reliable?

**Visual**:
- Three KPI cards (red/yellow/green indicator)
- Card 1: Missing Job Off Count (red if >10)
- Card 2: Abnormal Overlap Removal (red if >1000 min total)
- Card 3: Process Concentration Risk (red if >50% work time in 2-hour band)

**Filters**: Date range, Shift, Process L1/L2/L3

**Drill-Down**: Click card → Shows detailed table of impacted records

**Interpretation**:
- Red indicator: High data quality risk → Manual review needed
- Yellow indicator: Moderate risk → Monitor closely
- Green indicator: Data quality acceptable

**Action**:
- Manager should coordinate with IT/MES team to fix data collection issues
- Exclude impacted periods from performance evaluations if data is unreliable

**Pitfalls**:
- Overlap removal may be legitimate (worker switching between tasks) → Distinguish from data errors
- Process concentration may be normal for short-cycle tasks → Compare vs historical baseline

---

## 🚨 AI Insight / Warning Rules

### Rule 1: Utilization Collapse
**Condition**: `Current Week Utilization < 30% AND Previous Week Utilization >= 60%`  
**Message**: `🔴 [CRITICAL] Utilization Collapse Detected - {Process} ({Shift}) dropped from {Prev}% to {Curr}% (▼ {Delta}pp)`  
**Confidence**: High if Sample ≥10 workers, Low if <10

---

### Rule 2: Efficiency Collapse
**Condition**: `Current Week Efficiency < 40% AND Previous Week Efficiency >= 70%`  
**Message**: `🔴 [CRITICAL] Efficiency Collapse Detected - {Process} ({Shift}) dropped from {Prev}% to {Curr}% (▼ {Delta}pp)`  
**Confidence**: High if Sample ≥10 workers, Low if <10

---

### Rule 3: High Utilization + Low Efficiency
**Condition**: `Utilization ≥70% AND Efficiency <50%`  
**Message**: `🔵 [INSIGHT] High Utilization but Low Efficiency - {Process} ({Shift}): Workers busy ({Util}%) but inefficient ({Eff}%). Possible training gap or standard time mismatch.`  
**Confidence**: High if Sample ≥15 workers, Low if <15

---

### Rule 4: Low Utilization + High Efficiency
**Condition**: `Utilization <40% AND Efficiency ≥80%`  
**Message**: `🟡 [WARNING] Low Utilization but High Efficiency - {Process} ({Shift}): Workers idle ({Util}%) but efficient when working ({Eff}%). Possible missing job-on/off logs or dispatch issue.`  
**Confidence**: High if Sample ≥10 workers, Low if <10

---

### Rule 5: Missing Job Off Spike
**Condition**: `Missing Job Off Count > 20 records in current week`  
**Message**: `🔴 [CRITICAL] Data Integrity Issue - {Count} missing job-off records detected in {Process} ({Shift}). Utilization metrics may be inflated.`  
**Confidence**: High (data count is factual)

---

### Rule 6: Abnormal Overlap Removal
**Condition**: `Total Overlap Removal > 1500 minutes in current week for a process`  
**Message**: `🟡 [WARNING] Abnormal Overlap Detected - {Minutes} minutes removed from {Process} ({Shift}). Possible task switching or data logging errors.`  
**Confidence**: Moderate (may be legitimate multi-tasking)

---

### Rule 7: Process Concentration Risk
**Condition**: `>60% of work time concentrated in a 2-hour band (e.g., 13:00-15:00)`  
**Message**: `🔵 [INSIGHT] Process Concentration Risk - {Process} ({Shift}): {Pct}% of work time in {TimeRange}. Possible bottleneck or shift schedule mismatch.`  
**Confidence**: High if Sample ≥20 shifts, Low if <20

---

### Rule 8: Night Shift Underperformance
**Condition**: `Night Shift Utilization < Day Shift Utilization - 20pp`  
**Message**: `🟡 [WARNING] Night Shift Gap - Night shift {NightUtil}% vs Day shift {DayUtil}% (▼ {Delta}pp). Investigate staffing or fatigue.`  
**Confidence**: High if Sample ≥10 workers per shift, Low if <10

---

### Rule 9: Process Variance Spike
**Condition**: `Standard Deviation of Worker Utilization within a process > 25%`  
**Message**: `🔵 [INSIGHT] High Worker Variance - {Process} ({Shift}): Worker performance ranges from {Min}% to {Max}% (σ={StdDev}%). Possible training inconsistency.`  
**Confidence**: High if Sample ≥20 workers, Low if <20

---

### Rule 10: Impossible Duration Detected
**Condition**: `Worker Act > 660 minutes (shift time) for any record`  
**Message**: `🔴 [CRITICAL] Data Error - {Count} records with impossible duration (>{Threshold} min) in {Process}. Metrics unreliable for this period.`  
**Confidence**: High (data error is factual)

---

## 🪟 Modal Specifications

### Modal 1: Process Modal
**Trigger**: Click process name/bar/trend data point

**Content**:
- **Header**: Process name (FO Desc L2 + L3), Date range, Shift
- **KPI Cards (2x2)**:
  - Utilization Rate %
  - Efficiency Rate %
  - Total Workers
  - Total Shifts
- **Trend Chart**: Daily/Weekly Utilization + Efficiency (dual-axis line)
- **Shift Breakdown Table**:
  - Columns: Shift, Workers, Utilization %, Efficiency %, Variance vs Prev Period
- **Top 10 Workers Table**:
  - Columns: Worker Name, Utilization %, Efficiency %, Shifts, Action (Click → Worker Modal)
- **Close Button**

**Interactions**:
- Toggle: Daily ⇄ Weekly trend
- Sort: Click table headers
- Drill-down: Click worker name → Opens Worker Modal

---

### Modal 2: Shift Modal
**Trigger**: Click shift cell in heatmap or shift filter

**Content**:
- **Header**: Shift name (Day/Night), Date range, Process filter
- **KPI Cards (2x2)**:
  - Utilization Rate %
  - Efficiency Rate %
  - Total Workers
  - Total Shifts
- **Hourly Distribution Chart**: Bar chart (X: Hour 0-23, Y: Work Time minutes)
- **Process Mix Table**:
  - Columns: Process (FO Desc L2), Utilization %, Efficiency %, Workers, % of Total Time
- **Top 10 Workers Table** (same as Process Modal)
- **Close Button**

**Interactions**:
- Sort: Click table headers
- Drill-down: Click process name → Opens Process Modal, Click worker name → Opens Worker Modal

---

### Modal 3: Worker Modal (Existing - Reuse)
**Trigger**: Click worker name in any table/chart

**Content** (Utilization Mode):
- **Header**: Worker name, Date range, Shift
- **KPI Cards (3x)**:
  - Total Shift Time
  - Total Work Time
  - Work Rate %
- **Shift Distribution Chart**: Bar chart (X: Date, Y: Work Time)
- **Work Records Table**:
  - Columns: Date, Shift, Process, Start, End, Duration, Rate %
- **Close Button**

**Content** (Efficiency Mode):
- **Header**: Worker name, Date range, Shift
- **KPI Cards (4x)**:
  - Total Shifts
  - Total Adjusted S/T
  - Total Shift Time
  - Efficiency Rate %
- **Process Distribution Chart**: Horizontal bar chart (X: S/T minutes, Y: Process)
- **Work Records Table** (same as Utilization, + S/T column)
- **Close Button**

---

## ✅ Acceptance Criteria Checklist

### Functional Requirements
- [ ] Dashboard page loads without breaking existing Report page
- [ ] All 6 sections render correctly with test data
- [ ] AI Insights show 3-5 alerts based on current data
- [ ] KPI Trend charts toggle between Daily/Weekly
- [ ] Process Ranking shows Top 5 + Bottom 5 with WoW/DoD variance
- [ ] Shift Comparison heatmap displays 2x2 grid with correct colors
- [ ] Outlier tables flag workers/processes with confidence labels
- [ ] Data Integrity cards show accurate counts
- [ ] Process Modal opens with correct data and charts
- [ ] Shift Modal opens with correct data and charts
- [ ] Worker Modal (existing) opens without errors

### Regression Safety
- [ ] Existing Report page renders identically (no UI breakage)
- [ ] Existing filters (Date, Shift, Process) produce identical results
- [ ] Worker modal (Utilization) shows same values as before
- [ ] Worker modal (Efficiency) shows same values as before
- [ ] No navigation paths removed (all links/buttons work)
- [ ] Page load time ≤3 seconds (same as before)
- [ ] Filter response time ≤1 second (same as before)

### Data Quality
- [ ] All metrics calculated identically to Report page (numerically)
- [ ] Sample size labels shown for low-confidence data
- [ ] Missing data warnings displayed appropriately
- [ ] Confidence logic correctly flags High/Low confidence alerts

### UX Requirements
- [ ] Minimal colors (blue, green, yellow, red only)
- [ ] Clean typography (consistent font sizes, weights)
- [ ] Strong spacing (sections clearly separated)
- [ ] No redundant charts (each section has unique purpose)
- [ ] Drill-down path clear: Dashboard → Modal → Worker Modal

### Performance
- [ ] Dashboard loads within 3 seconds on test server
- [ ] Modal opens within 500ms
- [ ] Charts render within 1 second
- [ ] No JavaScript errors in console

### Rollback Plan
- [ ] Ability to disable Dashboard tab via feature flag
- [ ] Ability to revert Dashboard release without touching Report logic
- [ ] Backup of pre-Dashboard codebase in Git

---

## 🚀 Implementation Plan

### Phase 1: Infrastructure (1-2 hours)
1. Create Dashboard tab in HTML
2. Add Dashboard routing (show/hide sections)
3. Create placeholder sections (6 empty divs)

### Phase 2: Section 1 - AI Insights (2-3 hours)
1. Implement 10 warning rule functions
2. Create alert card component
3. Render 3-5 alerts based on current data

### Phase 3: Section 2 - KPI Trend (2-3 hours)
1. Implement Daily/Weekly aggregation logic
2. Create dual-axis line chart (Utilization + Efficiency)
3. Add Process L1 filter dropdown

### Phase 4: Section 3 - Process Ranking (1-2 hours)
1. Implement Top/Bottom 5 ranking logic
2. Calculate WoW/DoD variance
3. Create horizontal bar charts (green/red)

### Phase 5: Section 4 - Shift Comparison (1-2 hours)
1. Aggregate Utilization/Efficiency by shift
2. Create 2x2 heatmap grid
3. Add color logic (green/yellow/red)

### Phase 6: Section 5 - Outliers (1-2 hours)
1. Implement outlier detection logic (≤30%)
2. Create worker/process tables
3. Add confidence labels (Low Sample badge)

### Phase 7: Section 6 - Data Integrity (1 hour)
1. Count missing job-off records
2. Sum overlap removal minutes
3. Detect process concentration (2-hour band)
4. Create 3 KPI cards with red/yellow/green indicators

### Phase 8: Modals (2-3 hours)
1. Implement Process Modal (trend + breakdown + top workers)
2. Implement Shift Modal (hourly dist + process mix)
3. Reuse existing Worker Modal (no changes)

### Phase 9: Testing (2-3 hours)
1. Regression test: Report page unchanged
2. Functional test: All 6 sections + 3 modals work
3. Performance test: Load time ≤3s
4. Data accuracy test: Metrics match Report page

### Phase 10: Deployment (1 hour)
1. Build & deploy to test URL
2. User validation
3. Deploy to production

**Total Estimate**: 15-20 hours

---

## 📞 Contact

**Product Designer**: twokomi  
**Date Created**: 2026-02-28  
**Version**: 1.0  
**Status**: Draft (Pending Approval)

---

**Next Steps**:
1. Review wireframe & section specs
2. Approve AI warning rules
3. Confirm modal reuse approach
4. Approve implementation plan
5. Begin Phase 1 (Infrastructure)
