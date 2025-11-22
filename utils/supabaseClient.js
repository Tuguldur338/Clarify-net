import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isValidHttpUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

/** @type {any} */
/** @type {any} */
let supabase;
let isMock = false;
const isServer = typeof window === "undefined";
let mockFilePath = null;
if (isServer) {
  try {
    const path = require("path");
    mockFilePath = path.resolve(process.cwd(), ".mock_db.json");
  } catch (e) {
    mockFilePath = null;
  }
}

if (!isValidHttpUrl(supabaseUrl) || !supabaseKey) {
  // Provide a minimal mock object so server-side builds don't fail when env vars are absent.
  // This allows pages to render during build without attempting real network calls.
  // Intentionally do not log to console here to avoid noisy dev output.
  isMock = true;

  const chainable = () => {
    // simple in-memory mock DB persisted across calls
    // On server, try to hydrate from .mock_db.json so different server processes share data.
    if (!chainable._mockDb) {
      chainable._mockDb = { knowledge_posts: [] };
      if (isServer && mockFilePath) {
        try {
          const fs = require("fs");
          if (fs.existsSync(mockFilePath)) {
            const raw = fs.readFileSync(mockFilePath, "utf8");
            const parsed = JSON.parse(raw || "{}");
            // merge known table
            chainable._mockDb = Object.assign({ knowledge_posts: [] }, parsed);
          }
        } catch (e) {
          // ignore file read errors
        }
      }
    }
    const mockDb = chainable._mockDb;

    const obj = {
      _table: null,
      _results: null,
      _select: null,
      _insertPayload: null,
      _operation: null,
      _updatePayload: null,

      select: function (cols) {
        this._select = cols;
        // compute current results snapshot
        if (!this._results && this._table) {
          this._results = (mockDb[this._table] || []).slice();
        }
        // if select called after insert, ensure data reflects inserted payload
        this.data = this._results ? this._results.map((r) => r) : [];
        return this;
      },

      eq: function (field, value) {
        if (!this._results && this._table)
          this._results = (mockDb[this._table] || []).slice();
        this._results = (this._results || []).filter(
          (r) => String(r[field]) === String(value)
        );
        this.data = this._results.slice();
        return this;
      },

      ilike: function (field, pattern) {
        if (!this._results && this._table)
          this._results = (mockDb[this._table] || []).slice();
        // pattern like %term%
        const term = String(pattern).replace(/%/g, "").toLowerCase();
        this._results = (this._results || []).filter((r) => {
          const val = String((r && r[field]) || "").toLowerCase();
          return val.includes(term);
        });
        this.data = this._results.slice();
        return this;
      },

      // mark operation as delete (actual removal happens when single() resolves)
      delete: function () {
        this._operation = "delete";
        return this;
      },

      // mark operation as update with payload (applied when single() resolves)
      update: function (payload) {
        this._operation = "update";
        this._updatePayload = payload;
        return this;
      },

      limit: function (n) {
        if (!this._results && this._table)
          this._results = (mockDb[this._table] || []).slice();
        this._results = (this._results || []).slice(0, n);
        this.data = this._results.slice();
        return this;
      },

      insert: function (payload) {
        // insert into mock DB (support array or single)
        const table = this._table;
        if (!mockDb[table]) mockDb[table] = [];
        const toInsert = Array.isArray(payload) ? payload : [payload];
        const inserted = toInsert.map((p) => {
          // shallow clone to avoid mutations
          const item = Object.assign({}, p);
          mockDb[table].push(item);
          return item;
        });
        // store last inserted payload
        this._insertPayload = inserted.length === 1 ? inserted[0] : inserted;
        this.data = Array.isArray(this._insertPayload)
          ? this._insertPayload.slice()
          : [this._insertPayload];
        // persist to disk on server so separate server contexts can read it
        if (isServer && mockFilePath) {
          try {
            const fs = require("fs");
            fs.writeFileSync(
              mockFilePath,
              JSON.stringify(chainable._mockDb, null, 2),
              "utf8"
            );
          } catch (e) {
            // ignore write errors
          }
        }
        return this;
      },

      update: function (payload) {
        // update all rows matched by _results (or all rows in table if no filter)
        const table = this._table;
        if (!mockDb[table]) mockDb[table] = [];
        if (!this._results) this._results = (mockDb[table] || []).slice();
        const updated = [];
        for (let i = 0; i < mockDb[table].length; i++) {
          const row = mockDb[table][i];
          const match = this._results.some((r) => r.id === row.id);
          if (match) {
            mockDb[table][i] = Object.assign({}, row, payload);
            updated.push(mockDb[table][i]);
          }
        }
        this._results = updated.slice();
        this.data = this._results.slice();
        // persist
        if (isServer && mockFilePath) {
          try {
            const fs = require("fs");
            fs.writeFileSync(
              mockFilePath,
              JSON.stringify(chainable._mockDb, null, 2),
              "utf8"
            );
          } catch (e) {}
        }
        return this;
      },

      del: function () {
        // delete rows matched by _results
        const table = this._table;
        if (!mockDb[table]) mockDb[table] = [];
        if (!this._results) this._results = (mockDb[table] || []).slice();
        const toKeep = (mockDb[table] || []).filter(
          (r) => !this._results.some((rr) => rr.id === r.id)
        );
        const deleted = (mockDb[table] || []).filter((r) =>
          this._results.some((rr) => rr.id === r.id)
        );
        chainable._mockDb[table] = toKeep;
        this._results = deleted.slice();
        this.data = this._results.slice();
        // persist
        if (isServer && mockFilePath) {
          try {
            const fs = require("fs");
            fs.writeFileSync(
              mockFilePath,
              JSON.stringify(chainable._mockDb, null, 2),
              "utf8"
            );
          } catch (e) {}
        }
        return this;
      },

      single: async function () {
        // if an insert just happened, return that
        if (this._insertPayload)
          return { data: this._insertPayload, error: null };

        // handle delete/update operations
        if (this._operation === "delete") {
          const table = this._table;
          if (!mockDb[table]) return { data: null, error: null };
          // determine rows to delete (use _results if present, otherwise none)
          const toDelete = this._results || [];
          const deleted = [];
          mockDb[table] = (mockDb[table] || []).filter((r) => {
            const keep = !toDelete.includes(r);
            if (!keep) deleted.push(r);
            return keep;
          });
          this.data = deleted.slice();
          // persist
          if (isServer && mockFilePath) {
            try {
              const fs = require("fs");
              fs.writeFileSync(
                mockFilePath,
                JSON.stringify(chainable._mockDb, null, 2),
                "utf8"
              );
            } catch (e) {}
          }
          return {
            data: deleted.length === 1 ? deleted[0] : deleted,
            error: null,
          };
        }

        if (this._operation === "update") {
          const table = this._table;
          if (!mockDb[table]) return { data: null, error: null };
          const updated = [];
          const rows = mockDb[table];
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (this._results && this._results.length > 0) {
              if (this._results.includes(row)) {
                const merged = Object.assign({}, row, this._updatePayload);
                mockDb[table][i] = merged;
                updated.push(merged);
              }
            }
          }
          this.data = updated.slice();
          // persist
          if (isServer && mockFilePath) {
            try {
              const fs = require("fs");
              fs.writeFileSync(
                mockFilePath,
                JSON.stringify(chainable._mockDb, null, 2),
                "utf8"
              );
            } catch (e) {}
          }
          return {
            data: updated.length === 1 ? updated[0] : updated,
            error: null,
          };
        }

        // otherwise return first from data/results
        const first = this.data && this.data.length > 0 ? this.data[0] : null;
        return { data: first, error: null };
      },

      // helper to set table when supabase.from(name) is called
      _withTable: function (name) {
        this._table = name;
        this._results = (mockDb[name] || []).slice();
        this.data = this._results.slice();
        return this;
      },
    };
    return obj;
  };

  // export a supabase-like object with persistent in-memory mock DB
  supabase = {
    from: (tableName) => chainable()._withTable(tableName),
  };
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase, isMock };
