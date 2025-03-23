CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "api_key" TEXT,
  "ai_provider" TEXT
);

CREATE TABLE IF NOT EXISTS "frameworks" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "duration" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'not_started'
);

CREATE TABLE IF NOT EXISTS "modules" (
  "id" SERIAL PRIMARY KEY,
  "framework_id" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "content" TEXT,
  "examples" TEXT,
  "key_takeaways" TEXT,
  "quiz_questions" TEXT,
  "video_url" TEXT,
  "resources" TEXT,
  "completed" BOOLEAN DEFAULT FALSE,
  "order" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_progress" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "framework_id" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'not_started',
  "completed_modules" INTEGER DEFAULT 0,
  "total_modules" INTEGER NOT NULL,
  "last_updated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ai_conversations" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "framework_id" INTEGER,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create session table for express-session with connect-pg-simple
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");