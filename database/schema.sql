
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tenant organizations
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users belonging to tenants
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('admin', 'manager', 'analyst')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (tenant_id, email),
    UNIQUE (tenant_id, id)
);

-- Asynchronous report records
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_by UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'queued'
        CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    cache_key TEXT,
    result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    FOREIGN KEY (tenant_id, created_by)
        REFERENCES users(tenant_id, id)
);

-- Audit trail for security investigations
CREATE TABLE audit_events (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID,
    user_id UUID,
    event_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_reports_tenant ON reports(tenant_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_audit_tenant_time
    ON audit_events(tenant_id, created_at DESC);