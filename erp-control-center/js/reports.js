/* ============================================================
   reports.js
   ============================================================ */

(function () {
  if (!App.init('reports', 'Reports')) return;

  function buildRows(reportId) {
    const state = Store.get();
    switch (reportId) {
      case 'sales-summary': {
        const bySales = ERP_SEED.modules.includes('Sales') ? state.tickets.filter((t) => t.module === 'Sales') : [];
        return {
          header: ['Unit', 'Open Sales Tickets', 'Resolved Sales Tickets'],
          rows: ERP_SEED.units.map((u) => [u, bySales.filter((t) => t.unit === u && t.status !== 'Closed').length, bySales.filter((t) => t.unit === u && t.status === 'Closed').length]),
        };
      }
      case 'purchase-register':
        return {
          header: ['Vendor ID', 'Vendor', 'Category', 'Unit', 'Next Follow-up', 'Status'],
          rows: state.vendors.map((v) => [v.id, v.name, v.category, v.unit, v.nextFollowUp, v.overdue ? 'Overdue' : 'On track']),
        };
      case 'production-output':
        return {
          header: ['Task ID', 'Title', 'Module', 'Status', 'Progress %'],
          rows: state.tasks.filter((t) => t.module === 'Production').map((t) => [t.id, t.title, t.module, t.status, t.progress]),
        };
      case 'quality-rejection':
        return {
          header: ['Ticket ID', 'Subject', 'Unit', 'Priority', 'Status'],
          rows: state.tickets.filter((t) => t.module === 'Quality').map((t) => [t.id, t.subject, t.unit, t.priority, t.status]),
        };
      case 'dispatch-log':
        return {
          header: ['Ticket ID', 'Subject', 'Unit', 'Status', 'Updated'],
          rows: state.tickets.filter((t) => t.module === 'Dispatch').map((t) => [t.id, t.subject, t.unit, t.status, t.updated]),
        };
      case 'trial-balance':
        return {
          header: ['Ledger Head', 'Debit (₹)', 'Credit (₹)'],
          rows: ['Raw Material Purchase', 'Sales Revenue', 'Salaries & Wages', 'Power & Fuel', 'Sundry Debtors', 'Sundry Creditors'].map((h, i) => [h, (i % 2 === 0 ? (120000 + i * 5400) : 0), (i % 2 !== 0 ? (98000 + i * 4200) : 0)]),
        };
      case 'ticket-aging':
        return {
          header: ['Ticket ID', 'Subject', 'Status', 'Priority', 'Age (days)'],
          rows: state.tickets.filter((t) => t.status !== 'Closed').map((t) => [t.id, t.subject, t.status, t.priority, Utils.daysBetween(t.created)]),
        };
      case 'vendor-followup':
        return {
          header: ['Vendor ID', 'Vendor', 'Next Follow-up', 'Status'],
          rows: state.vendors.map((v) => [v.id, v.name, v.nextFollowUp, v.overdue ? 'Overdue' : 'Upcoming']),
        };
      default:
        return { header: [], rows: [] };
    }
  }

  function previewReport(rt) {
    const { header, rows } = buildRows(rt.id);
    const bodyRows = rows.slice(0, 8).map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
    renderModal({
      title: rt.name,
      bodyHtml: `
        <p style="font-size:12.5px;color:var(--text-muted);margin-bottom:14px;">${rt.desc}</p>
        <div class="table-wrap">
          <table class="table">
            <thead><tr>${header.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${bodyRows || `<tr><td colspan="${header.length}" style="text-align:center;color:var(--text-faint);">No data for this report yet</td></tr>`}</tbody>
          </table>
        </div>
        ${rows.length > 8 ? `<p style="font-size:11.5px;color:var(--text-faint);margin-top:8px;">Showing 8 of ${rows.length} rows — export CSV for the full report.</p>` : ''}
      `,
      footHtml: `<button class="btn btn-secondary" data-close-modal>Close</button>
                 <button class="btn btn-primary" id="exportReportBtn">${ICONS.export} Export CSV</button>`,
    });
    document.getElementById('exportReportBtn').addEventListener('click', () => {
      Utils.csvDownload(`${rt.id}.csv`, [header, ...rows]);
      renderToast('Report exported', 'success');
    });
  }

  function render() {
    const root = document.getElementById('pageRoot');
    root.innerHTML = `
      <div class="page-head">
        <div><h1>Reports</h1><div class="desc">Generate and export operational reports across every module</div></div>
      </div>
      <div class="report-grid">
        ${ERP_SEED.reportTypes.map((rt) => `
          <div class="card report-card" data-id="${rt.id}">
            <div class="icon">${ICONS.reports}</div>
            <h4>${rt.name}</h4>
            <p>${rt.desc}</p>
            <div class="rowfoot">
              <span class="badge badge-open">${rt.module}</span>
              <button class="btn btn-ghost btn-sm view-report-btn" data-id="${rt.id}">View →</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    Utils.$$('.view-report-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rt = ERP_SEED.reportTypes.find((r) => r.id === btn.getAttribute('data-id'));
        previewReport(rt);
      });
    });
    Utils.$$('.report-card').forEach((card) => {
      card.addEventListener('click', () => {
        const rt = ERP_SEED.reportTypes.find((r) => r.id === card.getAttribute('data-id'));
        previewReport(rt);
      });
    });
  }

  render();
})();
