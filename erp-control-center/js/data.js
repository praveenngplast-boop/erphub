/* ============================================================
   data.js — storage layer. Units + modules are user-editable
   and persisted; tickets/tasks/vendors start empty.
   ============================================================ */

const ERP_SEED = {
  users: [],
  units: ['IMD', 'DCD', 'TRD', 'HO'],
  modules: ['Sales', 'Purchase', 'Production', 'Quality', 'Dispatch', 'Finance'],
  tickets: [],
  tasks: [],
  vendors: [],
  reportTypes: [],
};

const Store = {
  KEY: 'erp_cc_state_v2',   // bumped so existing browsers pick up new shape

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fall through */ }

    const seeded = {
      units: [...ERP_SEED.units],
      modules: [...ERP_SEED.modules],
      tickets: [],
      tasks: [],
      vendors: [],
      theme: 'light',
      unit: 'All Units',
      session: null,
    };
    this.save(seeded);
    return seeded;
  },

  save(state) {
    try { localStorage.setItem(this.KEY, JSON.stringify(state)); } catch (e) {}
  },

  get() {
    return this._state || (this._state = this.load());
  },

  set(patch) {
    const s = Object.assign(this.get(), patch);
    this._state = s;
    this.save(s);
    return s;
  },

  reset() {
    localStorage.removeItem(this.KEY);
    this._state = null;
    return this.load();
  },
};