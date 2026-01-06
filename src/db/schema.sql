-- Phase 2 Schema

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  subscription_plan TEXT DEFAULT 'FREE', -- FREE, STANDARD, PRO, ENTERPRISE
  status TEXT DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('GLOBAL_ADMIN', 'ADMIN', 'CONTRIBUTOR', 'VIEWER')) NOT NULL DEFAULT 'CONTRIBUTOR',
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS metrics (
  id TEXT PRIMARY KEY,
  organization_id TEXT, -- If NULL, it's a system standard metric
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  unit TEXT NOT NULL,
  emission_factor REAL DEFAULT 0,
  category TEXT, -- Environmental, Social, Governance
  type TEXT DEFAULT 'NUMERIC',
  frequency TEXT DEFAULT 'MONTHLY', -- MONTHLY, QUARTERLY, YEARLY
  is_custom BOOLEAN DEFAULT 1,
  description TEXT,
  framework_tags TEXT, -- JSON array of tags e.g. ["GRI", "SASB"]
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS emission_factors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  source TEXT, -- e.g. "DEFRA 2024"
  unit TEXT NOT NULL,
  factor_value REAL NOT NULL, -- kgCO2e per unit
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  metric_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  value TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  calculated_emission REAL DEFAULT 0,
  status TEXT CHECK(status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')) DEFAULT 'DRAFT',
  comments TEXT, -- JSON array of comment objects
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (metric_id) REFERENCES metrics(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS targets (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  metric_id TEXT, -- NULL if category-level target
  category TEXT, -- Used if metric_id is NULL
  name TEXT NOT NULL,
  target_value REAL NOT NULL,
  baseline_year INTEGER NOT NULL,
  target_year INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (metric_id) REFERENCES metrics(id)
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- GRI, SASB, BASIC
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data_snapshot TEXT, -- JSON snapshot of the data used
  file_url TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  user_id TEXT,
  action TEXT NOT NULL, -- LOGIN, CREATE, UPDATE, DELETE, EXPORT
  entity_type TEXT NOT NULL, -- USER, METRIC, ENTRY, REPORT
  entity_id TEXT,
  details TEXT, -- JSON metadata
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
