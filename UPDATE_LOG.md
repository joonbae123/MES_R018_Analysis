# MES R018 Analysis - Update Log

## Version 4.3.1 (2026-03-02)

### Enhancement
- **Section ID Column Added**: Worker Detail modal's "Detailed Work Records" table now includes Section ID (from Excel column D) for both Efficiency and Utilization modes
  - Enables tracking which Skirt/Section each worker's task belongs to
  - Missing values are displayed as "-"
- **Thousand Separators**: Shift Performance Comparison table now displays numeric values with comma formatting
  - Workers count: 209 → 209
  - Shift Time: 17391.0 hrs → 17,391.0 hrs
  - Work Time: 9745.1 hrs → 9,745.1 hrs
  - Standard Time: 10736.6 hrs → 10,736.6 hrs
- **UI Improvements**: Better readability for large numeric values

### Technical Changes
- Modified `renderUtilizationTable()` and `renderEfficiencyTable()` functions to include Section ID column
- Added `formatNumber()` helper for thousand-separator formatting in shift comparison tables
- Updated table headers and column layout for both efficiency and utilization modes

---

## Version 4.3.0 (2026-02-28)

### Major Features
- **Shift Performance Comparison Dashboard**: New comprehensive shift comparison section
  - Process group analysis (BT, WT, IM)
  - Per-shift metrics (Workers, Shift Time, Work Time, Utilization, Standard Time, Efficiency)
  - Color-coded performance indicators
  - Expandable accordion layout for each process group

### Enhancements
- **Emoji Fix**: Replaced all broken emoji characters with proper Unicode symbols
  - Fixed: 📊, 📈, ⚙️, 💯, 📝, 🚨, 📌, ⏱️, ✅, 🔄
  - Math symbols: ≥, ×, ÷ now render correctly
- **Performance Band Labels**: Updated with proper Unicode characters
  - Excellent (≥100%), Normal (80-<100%), Poor (60-<80%), At‑Risk (<60%)
  - Excellent (≥80%), Normal (50-<80%), Poor (30-<50%), At‑Risk (<30%)

### Bug Fixes
- **Glossary Readability**: All mathematical symbols and emojis now display correctly

---

## Version 3.2.1 (2026-02-21)

### Bug Fixes
- **Fixed Utilization Rate Mismatch**: Worker detail modal now shows same percentage as main Report page
- **Data Source Consistency**: Both views now use `cachedWorkerAgg` (aggregated, overlap-removed data)
- **Total Shift Time Calculation**: Correctly calculates total shifts worked instead of total workers
- **AI Insights KPI Fix**: AI Insights modal now uses `workerSummary` (worker-level aggregated data with shiftCount)
  - Previously used wrong data level (worker-day-shift-process), causing 0% metrics
  - Now matches Report KPI calculations exactly

### Breaking Changes
- **Efficiency Calculation**: Values calculated with this version are not directly comparable with previous versions
  - New formula provides more accurate shift-based productivity measurements
  - Formula: (Adjusted S/T ÷ Shift time) × 100

---

## Version 3.2.0 (2026-02-21)

### KPI Cards Redesign
- Enhanced visual design with gradient backgrounds
- Improved metric labels and tooltips
- Better color coding for performance bands

---

## Version 3.0.0 (2026-02-15)

### Major Release
- Complete UI overhaul
- Dashboard module redesign
- Report module improvements
- AI Insights module enhancements

---

## Version 2.6.0 (2026-02-10)

### Features
- Worker detail modal enhancements
- Performance band visualization
- Sparkline charts for trends

---

## Version 2.1.0 (2026-02-05)

### Enhancements
- Data filtering improvements
- Export functionality
- Better error handling

---

## Version 2.0.0 (2026-02-01)

### Major Release
- Complete data processing pipeline redesign
- New aggregation logic
- Improved performance

---

## Version 1.0.0 (2026-01-15)

### Initial Release
- Basic data upload functionality
- Worker performance tracking
- Simple reporting features
