export const groupMonitorStyles = `
.group-monitor-page {
  width: 100%;
  min-height: calc(100dvh - var(--header-height, 60px));
  padding: 0 24px 40px;
  background:
    radial-gradient(circle at 88% 4%, color-mix(in oklab, #60a5fa 12%, transparent), transparent 34%),
    radial-gradient(circle at 8% 2%, color-mix(in oklab, #818cf8 12%, transparent), transparent 30%),
    var(--background);
  border-left: 1px solid color-mix(in oklab, var(--border) 92%, transparent);
}
.group-monitor-dashboard-shell {
  max-width: 1280px;
  margin: 0 auto;
  padding-top: 24px;
}
.group-monitor-hero-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
}
.group-monitor-hero-heading {
  min-width: 0;
  flex: 1;
}
.group-monitor-hero-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.group-monitor-hero-title {
  font-size: 30px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.8px;
}
.group-monitor-summary-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid color-mix(in oklab, var(--border) 88%, transparent);
  background: color-mix(in oklab, var(--card) 94%, white 6%);
  font-size: 12px;
  font-weight: 700;
  color: var(--muted-foreground);
  box-shadow: 0 10px 24px color-mix(in oklab, #64748b 10%, transparent);
}
.group-monitor-summary-chip strong {
  font-size: 13px;
  color: var(--foreground);
}
.group-monitor-glass-panel {
  border-radius: 28px;
  border: 1px solid color-mix(in oklab, var(--border) 88%, transparent);
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--card) 98%, white 2%) 0%,
      color-mix(in oklab, var(--background) 95%, white 5%) 100%
    );
  box-shadow: 0 20px 56px color-mix(in oklab, #64748b 10%, transparent);
  backdrop-filter: blur(18px);
}
.dark .group-monitor-glass-panel {
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--card) 96%, black 4%) 0%,
      color-mix(in oklab, var(--background) 98%, black 2%) 100%
    );
}
.group-monitor-empty {
  padding: 56px 24px;
  text-align: center;
}
.group-monitor-title-badge {
  display: inline-flex;
  height: 40px;
  width: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: color-mix(in oklab, #3b82f6 16%, transparent);
  color: #3b82f6;
  box-shadow: 0 10px 24px color-mix(in oklab, #3b82f6 16%, transparent);
}
.group-monitor-caption {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: var(--muted-foreground);
  font-size: 13px;
  line-height: 1.8;
}
@keyframes gmPulseRing {
  0% {
    transform: scale(0.8);
    opacity: 0.55;
  }
  80% {
    transform: scale(2);
    opacity: 0;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
@keyframes gmShineSweep {
  0% {
    left: -38%;
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    left: 118%;
    opacity: 0;
  }
}
.group-monitor-pulse-dot {
  position: relative;
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #10b981;
  flex-shrink: 0;
}
.group-monitor-pulse-dot::after {
  content: '';
  position: absolute;
  inset: -3px;
  border: 1px solid #10b981;
  border-radius: 999px;
  animation: gmPulseRing 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}
.group-monitor-refresh-btn {
  display: inline-flex;
  height: 40px;
  align-items: center;
  gap: 8px;
  border-radius: 14px;
  border: 1px solid color-mix(in oklab, var(--border) 92%, transparent);
  background: color-mix(in oklab, var(--card) 94%, white 6%);
  padding: 0 16px;
  font-size: 13px;
  font-weight: 700;
  color: var(--foreground);
  box-shadow: 0 10px 28px color-mix(in oklab, #64748b 8%, transparent);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}
.group-monitor-refresh-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: color-mix(in oklab, #60a5fa 38%, var(--border));
  box-shadow: 0 16px 34px color-mix(in oklab, #3b82f6 12%, transparent);
}
.group-monitor-refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.group-monitor-overview-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 26px 28px;
}
.group-monitor-overview-status {
  min-width: 180px;
}
.group-monitor-overview-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 14px;
  border: 1px solid color-mix(in oklab, var(--border) 88%, transparent);
  background: color-mix(in oklab, var(--background) 88%, white 12%);
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted-foreground);
}
.dark .group-monitor-overview-status-chip {
  background: color-mix(in oklab, var(--background) 94%, black 6%);
}
.group-monitor-overview-divider {
  width: 1px;
  align-self: stretch;
  background: color-mix(in oklab, var(--border) 88%, transparent);
}
.group-monitor-overview-metrics-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
.group-monitor-overview-metric {
  border-radius: 22px;
  border: 1px solid color-mix(in oklab, var(--border) 88%, transparent);
  background: color-mix(in oklab, var(--background) 86%, white 14%);
  padding: 18px 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28);
}
.group-monitor-overview-metric-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.group-monitor-overview-metric-icon {
  flex-shrink: 0;
}
.group-monitor-overview-metric-value {
  font-size: 36px;
}
.group-monitor-overview-metric-label {
  line-height: 1.35;
}
.dark .group-monitor-overview-metric {
  background: color-mix(in oklab, var(--background) 94%, black 6%);
}
.group-monitor-toolbar-panel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 20px;
  padding: 18px 20px;
}
.group-monitor-toolbar-primary {
  display: flex;
  min-width: 0;
  flex: 1 1 0%;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.group-monitor-toolbar-window-switch {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.group-monitor-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.group-monitor-mobile-window-select {
  display: none;
}
.group-monitor-time-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  border: 1px solid color-mix(in oklab, var(--border) 90%, transparent);
  border-radius: 999px;
  background: color-mix(in oklab, var(--card) 92%, white 8%);
  padding: 0 14px;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted-foreground);
  transition: all 0.18s ease;
}
.group-monitor-time-chip:hover {
  transform: translateY(-1px);
  color: var(--foreground);
}
.group-monitor-time-chip.active {
  border-color: transparent;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: #ffffff;
  box-shadow: 0 16px 34px rgba(59, 130, 246, 0.22);
}
.group-monitor-search-shell {
  position: relative;
  min-width: 260px;
}
.group-monitor-search-input {
  padding-left: 40px !important;
  background: color-mix(in oklab, var(--card) 94%, white 6%) !important;
  border-color: color-mix(in oklab, var(--border) 90%, transparent) !important;
}
.group-monitor-main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(340px, 0.92fr);
  gap: 18px;
  align-items: start;
}
.group-monitor-list-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.group-monitor-list-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 22px 18px;
  border-bottom: 1px solid color-mix(in oklab, var(--border) 86%, transparent);
}
.group-monitor-list-header-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--muted-foreground);
}
.group-monitor-list-body {
  display: flex;
  flex-direction: column;
}
.group-monitor-row {
  padding: 18px 22px;
  border-bottom: 1px solid color-mix(in oklab, var(--border) 82%, transparent);
}
.group-monitor-row:last-child {
  border-bottom: none;
}
.group-monitor-row-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.group-monitor-row-title {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 12px;
}
.group-monitor-row-icon {
  display: inline-flex;
  height: 38px;
  width: 38px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: color-mix(in oklab, var(--background) 84%, white 16%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32);
}
.dark .group-monitor-row-icon {
  background: color-mix(in oklab, var(--background) 94%, black 6%);
}
.group-monitor-row-subtitle {
  margin-top: 5px;
  font-size: 12px;
  color: var(--muted-foreground);
}
.group-monitor-row-metrics {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  min-width: 0;
  gap: 8px;
}
.group-monitor-stat-chip {
  min-width: 102px;
  border-radius: 15px;
  border: 1px solid color-mix(in oklab, var(--border) 88%, transparent);
  background: color-mix(in oklab, var(--background) 86%, white 14%);
  padding: 8px 12px;
  text-align: center;
}
.dark .group-monitor-stat-chip {
  background: color-mix(in oklab, var(--background) 94%, black 6%);
}
.group-monitor-bar-track {
  position: relative;
  overflow: hidden;
  display: flex;
  gap: 2px;
  padding: 3px;
  border-radius: 12px;
  background: color-mix(in oklab, var(--background) 88%, white 12%);
}
.dark .group-monitor-bar-track {
  background: color-mix(in oklab, var(--background) 95%, black 5%);
}
.group-monitor-bar-track::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -35%;
  width: 22%;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.42), transparent);
  filter: blur(1px);
  animation: gmShineSweep 4.2s ease-in-out infinite;
}
.group-monitor-mini-bar-track {
  display: flex;
  gap: 2px;
  margin-top: 6px;
}
.group-monitor-bar {
  flex: 1;
  min-width: 0;
  height: 24px;
  border-radius: 8px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transition:
    transform 0.18s ease,
    filter 0.18s ease;
}
.group-monitor-bar:hover {
  filter: brightness(0.96);
  transform: scaleY(1.06);
}
.group-monitor-bar-tooltip {
  max-width: 220px;
  border-radius: 12px;
  padding: 10px 12px;
  line-height: 1.6;
}
.group-monitor-mini-bar-track .group-monitor-bar {
  height: 8px;
  border-radius: 999px;
}
.group-monitor-tick-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 1px 0;
  font-size: 10px;
  font-weight: 600;
  color: var(--muted-foreground);
}
.group-monitor-expand-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  border: none;
  background: transparent;
  padding: 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted-foreground);
  transition: color 0.18s ease;
}
.group-monitor-expand-btn:hover {
  color: var(--foreground);
}
.group-monitor-model-shell {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
  border-top: 1px dashed color-mix(in oklab, var(--border) 86%, transparent);
  padding-top: 12px;
}
.group-monitor-model-card {
  border-radius: 18px;
  border: 1px solid color-mix(in oklab, var(--border) 88%, transparent);
  background: color-mix(in oklab, var(--background) 88%, white 12%);
  padding: 12px 14px;
}
.dark .group-monitor-model-card {
  background: color-mix(in oklab, var(--background) 94%, black 6%);
}
.group-monitor-page-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid color-mix(in oklab, var(--border) 84%, transparent);
  background: color-mix(in oklab, var(--background) 86%, white 14%);
  padding: 16px 22px;
}
.dark .group-monitor-page-footer {
  background: color-mix(in oklab, var(--background) 95%, black 5%);
}
.group-monitor-page-switch {
  display: inline-flex;
  height: 32px;
  min-width: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid color-mix(in oklab, var(--border) 90%, transparent);
  background: color-mix(in oklab, var(--card) 92%, white 8%);
  color: var(--muted-foreground);
  font-size: 13px;
  font-weight: 700;
  transition: all 0.18s ease;
}
.group-monitor-page-switch:hover:not(:disabled) {
  color: var(--foreground);
  transform: translateY(-1px);
}
.group-monitor-page-switch.active {
  border-color: transparent;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: #ffffff;
  box-shadow: 0 12px 28px rgba(59, 130, 246, 0.22);
}
.group-monitor-page-switch:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.group-monitor-insight-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.group-monitor-insight-card {
  padding: 18px 20px 16px;
}
.group-monitor-insight-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--foreground);
}
.group-monitor-trend-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted-foreground);
}
.group-monitor-trend-chart {
  height: 248px;
  margin-top: -2px;
}
.group-monitor-trend-chart > div,
.group-monitor-trend-chart canvas {
  height: 100% !important;
}
.group-monitor-donut-panel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 22px;
}
.group-monitor-donut {
  position: relative;
  display: flex;
  height: 132px;
  width: 132px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
}
.group-monitor-donut-inner {
  display: flex;
  height: 84px;
  width: 84px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: color-mix(in oklab, var(--card) 96%, white 4%);
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.08);
}
.dark .group-monitor-donut-inner {
  background: color-mix(in oklab, var(--card) 92%, black 8%);
}
.group-monitor-donut-legend {
  flex: 1;
  min-width: 210px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.group-monitor-donut-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}
.group-monitor-risk-item {
  border-radius: 18px;
  border: 1px solid color-mix(in oklab, var(--border) 88%, transparent);
  background: color-mix(in oklab, var(--background) 88%, white 12%);
  padding: 14px 16px;
}
.dark .group-monitor-risk-item {
  background: color-mix(in oklab, var(--background) 94%, black 6%);
}
.group-monitor-admin-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr);
  gap: 22px;
  align-items: stretch;
}
.group-monitor-config-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.group-monitor-config-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.group-monitor-config-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.group-monitor-config-actions {
  display: flex;
  justify-content: flex-end;
}
.group-monitor-group-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}
.group-monitor-group-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid color-mix(in oklab, var(--border) 88%, transparent);
  border-radius: 16px;
  background: color-mix(in oklab, var(--background) 88%, white 12%);
  padding: 12px 14px;
}
.dark .group-monitor-group-chip {
  background: color-mix(in oklab, var(--background) 94%, black 6%);
}
@media (max-width: 1220px) {
  .group-monitor-overview-card,
  .group-monitor-main-grid,
  .group-monitor-admin-grid {
    grid-template-columns: 1fr;
    display: grid;
  }
  .group-monitor-overview-card {
    gap: 18px;
  }
  .group-monitor-overview-divider {
    display: none;
  }
  .group-monitor-overview-metrics-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 920px) {
  .group-monitor-page {
    padding: 0 16px 28px;
  }
  .group-monitor-dashboard-shell {
    padding-top: 18px;
  }
  .group-monitor-hero-header {
    align-items: stretch;
    margin-bottom: 24px;
  }
  .group-monitor-hero-title {
    font-size: 24px;
    letter-spacing: -0.45px;
  }
  .group-monitor-overview-card,
  .group-monitor-toolbar-panel,
  .group-monitor-insight-card,
  .group-monitor-glass-panel.group-monitor-list-panel,
  .group-monitor-glass-panel.mt-6 {
    border-radius: 22px;
  }
  .group-monitor-toolbar-panel {
    flex-direction: column;
    align-items: stretch;
  }
  .group-monitor-toolbar-primary,
  .group-monitor-toolbar-actions {
    width: 100%;
  }
  .group-monitor-toolbar-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .group-monitor-toolbar-window-switch {
    width: 100%;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 2px;
  }
  .group-monitor-time-chip {
    white-space: nowrap;
    flex: 0 0 auto;
  }
  .group-monitor-refresh-btn {
    width: 100%;
    justify-content: center;
  }
  .group-monitor-row,
  .group-monitor-list-header,
  .group-monitor-page-footer {
    padding-left: 16px;
    padding-right: 16px;
  }
  .group-monitor-overview-metrics-grid,
  .group-monitor-config-grid {
    grid-template-columns: 1fr;
  }
  .group-monitor-row-header {
    flex-direction: column;
    align-items: stretch;
  }
  .group-monitor-row-metrics {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    justify-content: stretch;
  }
  .group-monitor-stat-chip {
    min-width: 0;
  }
  .group-monitor-trend-chart {
    height: 220px;
  }
  .group-monitor-list-header-badges,
  .group-monitor-config-actions {
    width: 100%;
  }
  .group-monitor-config-actions > * {
    width: 100%;
  }
  .group-monitor-search-shell {
    width: 100%;
    min-width: 0;
  }
}
@media (max-width: 640px) {
  .group-monitor-overview-metrics-grid,
  .group-monitor-group-selector {
    grid-template-columns: 1fr;
  }
  .group-monitor-toolbar-window-switch {
    display: none;
  }
  .group-monitor-mobile-window-select {
    display: block;
    width: 100%;
  }
  .group-monitor-row-metrics {
    grid-template-columns: 1fr;
  }
  .group-monitor-donut-panel,
  .group-monitor-page-footer {
    flex-direction: column;
    align-items: stretch;
  }
  .group-monitor-donut {
    margin: 0 auto;
  }
}
`
