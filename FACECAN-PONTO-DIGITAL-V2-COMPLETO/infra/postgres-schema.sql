-- Schema de produção recomendado para AWS RDS/Aurora PostgreSQL.
-- O aplicativo entregue roda localmente com SQLite para facilitar testes.
-- Antes de produção, migrar a persistência para PostgreSQL privado e revisar índices/RLS.

CREATE TABLE IF NOT EXISTS shifts (
 id BIGSERIAL PRIMARY KEY,
 name VARCHAR(80) UNIQUE NOT NULL,
 entry_start TIME NOT NULL,
 entry_end TIME NOT NULL,
 break_start TIME,
 break_end TIME,
 exit_start TIME NOT NULL,
 exit_end TIME NOT NULL,
 crosses_midnight BOOLEAN NOT NULL DEFAULT FALSE,
 active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS employees (
 id BIGSERIAL PRIMARY KEY,
 registration VARCHAR(50) UNIQUE NOT NULL,
 name VARCHAR(160) NOT NULL,
 department VARCHAR(120) DEFAULT '',
 shift_id BIGINT NOT NULL REFERENCES shifts(id),
 status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
 face_status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance_records (
 id BIGSERIAL PRIMARY KEY,
 employee_id BIGINT NOT NULL REFERENCES employees(id),
 event_type VARCHAR(30) NOT NULL,
 occurred_at TIMESTAMPTZ NOT NULL,
 source VARCHAR(40) NOT NULL DEFAULT 'TERMINAL',
 device_id VARCHAR(80),
 confidence NUMERIC(5,4),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attendance_employee_time ON attendance_records(employee_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_attendance_time ON attendance_records(occurred_at);

CREATE TABLE IF NOT EXISTS audit_logs (
 id BIGSERIAL PRIMARY KEY,
 actor VARCHAR(160) NOT NULL,
 action VARCHAR(50) NOT NULL,
 resource VARCHAR(80) NOT NULL,
 resource_id VARCHAR(80),
 ip INET,
 details TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS files (
 id BIGSERIAL PRIMARY KEY,
 original_name VARCHAR(255) NOT NULL,
 stored_name VARCHAR(255) UNIQUE NOT NULL,
 mime_type VARCHAR(120) NOT NULL,
 size_bytes BIGINT NOT NULL,
 uploaded_by VARCHAR(160) NOT NULL,
 status VARCHAR(30) NOT NULL DEFAULT 'RECEBIDO',
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
