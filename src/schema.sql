-- ═══════════════════════════════════════════════
-- خيال — مخطط قاعدة البيانات (PostgreSQL / Aiven)
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  username     TEXT UNIQUE NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,
  bio          TEXT DEFAULT '',
  verified     BOOLEAN DEFAULT FALSE,
  role         TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  joined       DATE DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prompts (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT DEFAULT '',
  body         TEXT NOT NULL,
  category     TEXT NOT NULL,
  tags         TEXT[] DEFAULT '{}',
  models       TEXT[] DEFAULT '{}',
  cover        TEXT DEFAULT '',
  author_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  copies       INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_id    TEXT NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, prompt_id)
);

-- الفهارس
CREATE INDEX IF NOT EXISTS idx_prompts_author    ON prompts(author_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category  ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_created   ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_copies    ON prompts(copies DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_tags      ON prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompts_models    ON prompts USING GIN(models);
CREATE INDEX IF NOT EXISTS idx_likes_prompt      ON likes(prompt_id);
CREATE INDEX IF NOT EXISTS idx_likes_user        ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_users_verified    ON users(verified);