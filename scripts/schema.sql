CREATE TABLE IF NOT EXISTS organizations (
 id UUID PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL, email TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS users (
 id UUID PRIMARY KEY, full_name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('citizen','organization','admin')), city TEXT NOT NULL,
 organization_id UUID REFERENCES organizations(id), active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CHECK((role='organization' AND organization_id IS NOT NULL) OR (role<>'organization' AND organization_id IS NULL))
);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY,user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires_at TIMESTAMPTZ NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS issues (
 id UUID PRIMARY KEY,issue_number BIGSERIAL UNIQUE NOT NULL,title TEXT NOT NULL,description TEXT NOT NULL,
 category TEXT NOT NULL CHECK(category IN ('roads','streetlights','water','footpaths','drainage','waste')),
 address TEXT NOT NULL,city TEXT NOT NULL,lat DOUBLE PRECISION NOT NULL CHECK(lat BETWEEN -90 AND 90),lng DOUBLE PRECISION NOT NULL CHECK(lng BETWEEN -180 AND 180),
 photo_data TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','assigned','in_progress','resolved','rejected','reopened')),
 priority TEXT NOT NULL CHECK(priority IN ('low','normal','high','critical')),reporter_id UUID NOT NULL REFERENCES users(id),organization_id UUID REFERENCES organizations(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),resolved_at TIMESTAMPTZ,due_at TIMESTAMPTZ NOT NULL,
 rating INTEGER CHECK(rating BETWEEN 1 AND 5),reopen_count INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS issues_reporter ON issues(reporter_id,created_at DESC);
CREATE INDEX IF NOT EXISTS issues_org_status ON issues(organization_id,status);
CREATE INDEX IF NOT EXISTS issues_location ON issues(city,category,status);
CREATE TABLE IF NOT EXISTS issue_events (id UUID PRIMARY KEY,issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,actor_id UUID NOT NULL REFERENCES users(id),kind TEXT NOT NULL,message TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS events_issue ON issue_events(issue_id,created_at);
CREATE TABLE IF NOT EXISTS votes (issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),PRIMARY KEY(issue_id,user_id));
CREATE TABLE IF NOT EXISTS notifications (id UUID PRIMARY KEY,user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,title TEXT NOT NULL,body TEXT NOT NULL,issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,is_read BOOLEAN NOT NULL DEFAULT false,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS notices_user ON notifications(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY,count INTEGER NOT NULL,reset_at TIMESTAMPTZ NOT NULL);
CREATE TABLE IF NOT EXISTS audit_logs(id UUID PRIMARY KEY,actor_id UUID NOT NULL REFERENCES users(id),action TEXT NOT NULL,target_id UUID NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY,applied_at TIMESTAMPTZ NOT NULL DEFAULT now());
INSERT INTO schema_migrations(version) VALUES(1) ON CONFLICT DO NOTHING;
