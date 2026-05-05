export const drawingPageStyles = `
.drawing-page-shell {
  width: 100%;
  padding: 0 28px 48px;
  margin: 0;
  min-height: calc(100dvh - var(--header-height, 60px));
  max-width: none;
  box-sizing: border-box;
  background: var(--background);
  border-left: 1px solid color-mix(in oklab, var(--border) 92%, transparent);
}
.drawing-page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin: 0 -28px 22px;
  padding: 22px 28px 20px;
  background: color-mix(in oklab, var(--card) 98%, white 2%);
  border-bottom: 1px solid color-mix(in oklab, var(--border) 92%, transparent);
}
.drawing-page-header > div { flex: 1; min-width: 0; }
.drawing-page-badge {
  display: inline-flex; align-items: center; gap: 8px;
  color: #f59e0b; font-size: 13px; font-weight: 700; margin-bottom: 8px;
}
.drawing-page-hero-copy { display: flex; flex-direction: column; gap: 10px; }
.drawing-page-hero-copy-title {
  font-size: 22px; line-height: 1.45; font-weight: 800; color: var(--foreground);
}
.drawing-page-hero-copy-summary {
  color: var(--muted-foreground); line-height: 1.75; white-space: normal;
  word-break: break-word; max-width: 1080px;
}
.drawing-stage-grid {
  display: grid; grid-template-columns: minmax(420px, 0.95fr) minmax(520px, 1fr);
  gap: 26px; align-items: start;
}
.drawing-panel-card {
  border: 1px solid color-mix(in oklab, var(--border) 92%, transparent) !important;
  border-radius: 18px !important; box-shadow: none !important;
  background: color-mix(in oklab, var(--card) 98%, white 2%) !important;
  overflow: hidden;
}
.drawing-panel-body { padding: 24px !important; }
.drawing-form-stack { display: flex; flex-direction: column; gap: 16px; }
.drawing-config-pills { display: flex; flex-wrap: wrap; gap: 8px; }
.drawing-field-block { display: flex; flex-direction: column; gap: 10px; }
.drawing-field-head {
  display: flex; justify-content: space-between; align-items: center;
  gap: 12px; flex-wrap: wrap;
}
.drawing-upload-panel {
  border: 1px dashed color-mix(in oklab, #f59e0b 30%, var(--border) 70%);
  border-radius: 18px; padding: 16px;
  background: color-mix(in oklab, #f59e0b 3%, var(--card) 97%);
  transition: border-color 0.18s ease, background 0.18s ease;
}
.drawing-upload-panel:hover {
  border-color: color-mix(in oklab, #f59e0b 55%, var(--border) 45%);
}
.drawing-upload-panel.is-muted { opacity: 0.75; }
.drawing-upload-placeholder {
  min-height: 168px; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 12px; text-align: center;
}
.drawing-upload-icon {
  width: 42px; height: 42px; border-radius: 14px; display: inline-flex;
  align-items: center; justify-content: center;
  background: color-mix(in oklab, #f59e0b 18%, var(--card) 82%); color: #d97706;
}
.drawing-reference-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.drawing-reference-item, .drawing-reference-add {
  position: relative; border-radius: 16px; overflow: hidden;
  border: 1px solid color-mix(in oklab, var(--border) 92%, transparent);
  background: color-mix(in oklab, var(--card) 98%, white 2%); min-height: 148px;
}
.drawing-reference-add {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; color: var(--muted-foreground);
}
.drawing-reference-image {
  width: 100%; aspect-ratio: 1 / 1; object-fit: cover; display: block;
}
.drawing-reference-remove {
  position: absolute; top: 8px; right: 8px; width: 30px; height: 30px;
  border-radius: 11px; border: 0; display: inline-flex; align-items: center;
  justify-content: center; color: white; background: rgba(15, 23, 42, 0.72);
}
.drawing-reference-meta { display: flex; flex-direction: column; gap: 4px; padding: 10px; font-size: 12px; }
.drawing-reference-meta span:first-child {
  color: var(--foreground); font-weight: 700; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.drawing-reference-meta span:last-child { color: var(--muted-foreground); }
.drawing-setup-shell { display: flex; flex-direction: column; gap: 14px; }
.drawing-token-panel {
  padding: 14px 16px; border-radius: 18px;
  border: 1px solid color-mix(in oklab, var(--border) 92%, transparent);
  background: color-mix(in oklab, #f59e0b 3%, var(--card) 97%);
}
.drawing-panel-kicker { font-size: 12px; font-weight: 700; color: #b45309; margin-bottom: 6px; }
.drawing-token-title, .drawing-control-title {
  font-size: 15px; font-weight: 800; color: var(--foreground);
}
.drawing-token-note, .drawing-control-note {
  display: block; margin-top: 6px; font-size: 12px; line-height: 1.7; color: var(--muted-foreground);
}
.drawing-inline-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.drawing-control-card {
  padding: 14px 16px; border-radius: 18px;
  border: 1px solid color-mix(in oklab, var(--border) 92%, transparent);
  background: color-mix(in oklab, var(--card) 98%, white 2%);
}
.drawing-select-trigger {
  margin-top: 12px; width: 100% !important; height: 42px !important;
  border-radius: 14px !important;
  background: color-mix(in oklab, var(--background) 88%, white 12%) !important;
}
.drawing-action-bar { display: flex; align-items: center; gap: 12px; }
.drawing-action-bar--full > button { width: 100%; }
.drawing-generate-button {
  height: 48px !important; border-radius: 16px !important; font-size: 15px !important;
  font-weight: 800 !important; background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%) !important;
  color: white !important;
}
.drawing-error-box {
  border: 1px solid color-mix(in oklab, #ef4444 25%, var(--border) 75%);
  background: color-mix(in oklab, #ef4444 5%, var(--card) 95%); color: #dc2626;
  border-radius: 16px; padding: 12px 14px; line-height: 1.7; font-size: 13px;
}
.drawing-preview-head {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 16px;
}
.drawing-preview-subtitle {
  display: block; margin-top: 6px; font-size: 12px; line-height: 1.7; color: var(--muted-foreground);
}
.drawing-preview-stage {
  position: relative; min-height: 520px; border-radius: 22px; overflow: hidden;
  border: 1px solid color-mix(in oklab, var(--border) 90%, transparent);
  background:
    radial-gradient(circle at top, rgba(245, 158, 11, 0.14), transparent 36%),
    linear-gradient(180deg, color-mix(in oklab, var(--card) 98%, white 2%) 0%, color-mix(in oklab, var(--background) 92%, white 8%) 100%);
}
.dark .drawing-preview-stage {
  background:
    radial-gradient(circle at top, rgba(245, 158, 11, 0.18), transparent 36%),
    linear-gradient(180deg, color-mix(in oklab, var(--card) 98%, black 2%) 0%, color-mix(in oklab, var(--background) 95%, black 5%) 100%);
}
.drawing-preview-glow {
  position: absolute; inset: -20% auto auto 50%; width: 380px; height: 380px;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(245, 158, 11, 0.18), transparent 68%);
  pointer-events: none;
}
.drawing-preview-empty {
  position: absolute; inset: 0; padding: 26px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 14px; text-align: center;
  color: var(--muted-foreground);
}
.drawing-preview-timer { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.drawing-preview-timer span { font-size: 13px; color: #b45309; }
.drawing-preview-timer strong {
  font-size: 22px; line-height: 1; color: var(--foreground);
  letter-spacing: 0.04em; font-variant-numeric: tabular-nums;
}
.drawing-preview-orb {
  width: 72px; height: 72px; border-radius: 999px;
  background:
    radial-gradient(circle at 28% 28%, rgba(99, 102, 241, 0.28), transparent 38%),
    radial-gradient(circle at 72% 28%, rgba(244, 114, 182, 0.32), transparent 34%),
    radial-gradient(circle at 50% 76%, rgba(34, 197, 94, 0.24), transparent 34%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(238, 242, 255, 0.82));
}
.drawing-single-preview { position: absolute; inset: 0; padding: 20px; }
.drawing-single-preview-image {
  width: 100%; height: 100%; object-fit: contain; display: block;
  border-radius: 16px; background: white;
}
.drawing-single-preview-actions, .drawing-preview-grid-actions {
  position: absolute; top: 30px; right: 30px; display: flex; gap: 8px;
}
.drawing-preview-grid {
  position: absolute; inset: 0; padding: 20px; display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px;
}
.drawing-preview-grid-item {
  position: relative; border-radius: 16px; overflow: hidden; background: white;
  border: 1px solid color-mix(in oklab, var(--border) 90%, transparent);
}
.drawing-preview-grid-item img {
  width: 100%; height: 100%; object-fit: contain; display: block; background: white;
}
.drawing-result-details { margin-top: 18px; }
.drawing-preview-stat-row {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px;
}
.drawing-preview-stat {
  display: flex; flex-direction: column; gap: 6px; padding: 14px 16px;
  border-radius: 18px; border: 1px solid color-mix(in oklab, var(--border) 82%, transparent);
  background: color-mix(in oklab, var(--card) 88%, transparent);
}
.drawing-preview-stat span { font-size: 12px; color: var(--muted-foreground); }
.drawing-preview-stat strong { font-size: 14px; color: var(--foreground); word-break: break-word; }
.drawing-detail-card {
  padding: 16px 18px; border-radius: 20px;
  border: 1px solid color-mix(in oklab, var(--border) 82%, transparent);
  background: color-mix(in oklab, var(--card) 92%, transparent);
}
.drawing-detail-title {
  display: block; margin-bottom: 8px; font-size: 14px; font-weight: 800; color: var(--foreground);
}
.drawing-response-text {
  display: block; font-size: 12px; line-height: 1.7; color: var(--muted-foreground); white-space: pre-wrap;
}
.drawing-history-fab {
  position: fixed; right: 28px; bottom: 28px; z-index: 40; height: 48px;
  display: inline-flex; align-items: center; gap: 10px; border: 0; border-radius: 16px;
  padding: 0 16px; background: #111827; color: white;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.22); font-weight: 800;
}
.dark .drawing-history-fab { background: #f59e0b; color: #111827; }
.drawing-history-fab em {
  min-width: 22px; height: 22px; display: inline-flex; align-items: center;
  justify-content: center; border-radius: 8px; background: rgba(255, 255, 255, 0.16);
  font-style: normal; font-size: 12px;
}
.dark .drawing-history-fab em { background: rgba(17, 24, 39, 0.14); }
.drawing-history-sheet {
  width: min(560px, calc(100vw - 24px)) !important; max-width: 560px !important; padding: 0 !important;
}
.drawing-history-sheet-body {
  flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 0 18px 18px;
}
.drawing-history-drawer-grid {
  flex: 1; min-height: 0; overflow-y: auto; display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); align-content: start;
  gap: 12px; padding: 12px 2px 12px;
}
.drawing-history-drawer-card {
  position: relative; overflow: hidden; border-radius: 18px;
  border: 1px solid color-mix(in oklab, var(--border) 95%, transparent);
  background: color-mix(in oklab, var(--card) 98%, white 2%); outline: none;
  display: flex; flex-direction: column;
}
.drawing-history-drawer-card.is-active {
  border-color: rgba(245, 158, 11, 0.68); box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.14);
}
.drawing-history-media {
  position: relative; aspect-ratio: 1 / 1; overflow: hidden;
  background: #f1f5f9;
}
.drawing-history-drawer-image {
  width: 100%; height: 100%; display: block; object-fit: cover; background: #f1f5f9;
}
.drawing-history-edit-tip {
  position: absolute; top: 8px; right: 8px; width: 30px; height: 30px;
  display: inline-flex; align-items: center; justify-content: center; border-radius: 11px;
  border: 0; background: rgba(15, 23, 42, 0.72); color: #fff; z-index: 2;
}
.drawing-history-card-overlay {
  position: absolute; left: 10px; right: 10px; bottom: 10px;
  display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
  gap: 8px; padding: 0; background: transparent;
  opacity: 0; pointer-events: none; transition: opacity 0.18s ease;
}
.drawing-history-drawer-card:hover .drawing-history-card-overlay,
.drawing-history-drawer-card:focus-within .drawing-history-card-overlay {
  opacity: 1; pointer-events: auto;
}
.drawing-history-card-overlay button {
  min-width: 0; max-width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 4px; border: 0;
  border-radius: 12px; padding: 9px 12px; background: rgba(255, 255, 255, 0.94);
  color: #0f172a; font-size: 12px; line-height: 1; font-weight: 800;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.18);
  white-space: nowrap;
}
.drawing-history-card-info {
  padding: 9px 10px 10px; display: flex; flex-direction: column; gap: 4px; flex: 1;
}
.drawing-history-card-info span, .drawing-history-card-info small {
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.drawing-history-card-info span { color: var(--foreground); font-size: 13px; font-weight: 800; }
.drawing-history-card-info small { color: var(--muted-foreground); font-size: 11px; font-weight: 650; }
.drawing-history-pagination {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding-top: 12px; border-top: 1px solid color-mix(in oklab, var(--border) 92%, transparent);
}
.drawing-history-pagination button {
  min-width: 34px; height: 34px; display: inline-flex; align-items: center;
  justify-content: center; border: 1px solid color-mix(in oklab, var(--border) 96%, transparent);
  border-radius: 10px; background: color-mix(in oklab, var(--card) 98%, white 2%);
  color: var(--muted-foreground); font-size: 13px; font-weight: 800;
}
.drawing-history-pagination button.is-active {
  border-color: #111827; background: #111827; color: white;
}
.dark .drawing-history-pagination button.is-active {
  border-color: #f59e0b; background: #f59e0b; color: #111827;
}
.drawing-history-pagination button:disabled { cursor: not-allowed; opacity: 0.45; }
.drawing-preview-dialog {
  width: min(1320px, calc(100vw - 24px)) !important;
  max-width: min(1320px, calc(100vw - 24px)) !important;
  padding: 16px !important;
  gap: 12px !important;
  border-radius: 24px !important;
  background: color-mix(in oklab, var(--card) 98%, white 2%) !important;
}
.dark .drawing-preview-dialog {
  background: color-mix(in oklab, var(--card) 96%, black 4%) !important;
}
.drawing-preview-dialog-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-right: 36px;
}
.drawing-preview-dialog-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--foreground);
}
.drawing-preview-dialog-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  max-height: calc(100dvh - 140px);
  overflow: auto;
  border-radius: 20px;
  border: 1px solid color-mix(in oklab, var(--border) 90%, transparent);
  background:
    radial-gradient(circle at top, rgba(245, 158, 11, 0.12), transparent 32%),
    color-mix(in oklab, var(--background) 94%, white 6%);
  padding: 14px;
}
.dark .drawing-preview-dialog-stage {
  background:
    radial-gradient(circle at top, rgba(245, 158, 11, 0.16), transparent 32%),
    color-mix(in oklab, var(--background) 95%, black 5%);
}
.drawing-preview-dialog-image {
  display: block;
  max-width: 100%;
  max-height: calc(100dvh - 180px);
  margin: 0 auto;
  border-radius: 16px;
  background: white;
  object-fit: contain;
}
@media (max-width: 1100px) {
  .drawing-stage-grid { grid-template-columns: 1fr; }
  .drawing-inline-grid, .drawing-preview-stat-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 768px) {
  .drawing-page-shell { padding: 0 12px 32px; border-left: 0; }
  .drawing-page-header { margin: 0 -12px 16px; padding: 14px 12px 12px; align-items: flex-start; }
  .drawing-page-hero-copy-title { font-size: 16px; }
  .drawing-inline-grid, .drawing-reference-grid, .drawing-preview-stat-row { grid-template-columns: 1fr; }
  .drawing-preview-stage { min-height: 420px; }
  .drawing-single-preview-actions, .drawing-preview-grid-actions { top: 22px; right: 22px; }
  .drawing-history-fab { right: 14px; bottom: 14px; height: 44px; border-radius: 14px; padding: 0 13px; }
  .drawing-history-sheet { width: 100vw !important; max-width: 100vw !important; }
  .drawing-history-drawer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .drawing-history-card-overlay { left: 8px; right: 8px; bottom: 8px; gap: 6px; }
  .drawing-history-card-overlay button { padding: 8px 10px; font-size: 11px; }
  .drawing-preview-dialog {
    width: calc(100vw - 16px) !important;
    max-width: calc(100vw - 16px) !important;
    padding: 12px !important;
    border-radius: 18px !important;
  }
  .drawing-preview-dialog-toolbar {
    align-items: flex-start;
    padding-right: 28px;
  }
  .drawing-preview-dialog-stage {
    max-height: calc(100dvh - 120px);
    padding: 10px;
  }
  .drawing-preview-dialog-image {
    max-height: calc(100dvh - 160px);
  }
}
`
