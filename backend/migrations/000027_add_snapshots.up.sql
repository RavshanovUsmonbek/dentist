CREATE TABLE IF NOT EXISTS snapshots (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    data        JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_snapshots_created_at ON snapshots(created_at DESC);

CREATE TRIGGER update_snapshots_updated_at
    BEFORE UPDATE ON snapshots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
