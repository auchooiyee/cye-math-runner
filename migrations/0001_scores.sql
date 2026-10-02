CREATE TABLE IF NOT EXISTS scores (
  player_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score > 0),
  distance INTEGER NOT NULL CHECK (distance >= 0),
  accuracy REAL NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
  mode TEXT NOT NULL CHECK (mode IN ('endless', 'sprint')),
  grade TEXT,
  date TEXT NOT NULL DEFAULT (date('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS scores_rank ON scores(score DESC, updated_at ASC);
