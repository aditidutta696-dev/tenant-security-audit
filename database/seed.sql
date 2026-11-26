
-- Two independent tenant organizations
INSERT INTO tenants (id, name)
VALUES
('11111111-1111-4111-8111-111111111111', 'Alpha Corporation'),
('22222222-2222-4222-8222-222222222222', 'Beta Corporation');

-- Synthetic users (passwords are temporary placeholders)
INSERT INTO users (id, tenant_id, email, password_hash, role)
VALUES
(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 '11111111-1111-4111-8111-111111111111',
 'alice@alpha.test',
 'TEMP_HASH_REPLACE_BEFORE_LOGIN',
 'admin'
),
(
 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
 '22222222-2222-4222-8222-222222222222',
 'bob@beta.test',
 'TEMP_HASH_REPLACE_BEFORE_LOGIN',
 'admin'
);

-- Synthetic reports
INSERT INTO reports (id, tenant_id, created_by, title)
VALUES
(
 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',
 '11111111-1111-4111-8111-111111111111',
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 'Alpha Confidential Report'
),
(
 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb',
 '22222222-2222-4222-8222-222222222222',
 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
 'Beta Confidential Report'
);
