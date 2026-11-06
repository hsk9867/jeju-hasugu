-- 제주 하수구 제왕 관리자: 덮어쓴 콘텐츠 + 업로드 사진 + 방문 기록
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,            -- 16자리 hex + 확장자
  type TEXT NOT NULL,             -- image/jpeg | image/png | image/webp
  data TEXT NOT NULL,             -- base64
  size INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS hits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,            -- unix 초
  day TEXT NOT NULL,              -- 한국시간 YYYY-MM-DD
  hour INTEGER NOT NULL,          -- 한국시간 0~23
  type TEXT NOT NULL,             -- view | event
  name TEXT,                      -- event 이름 (tel, sms, booking, reserve, blog)
  path TEXT NOT NULL,
  ref_host TEXT,
  ref_url TEXT,
  source TEXT NOT NULL,           -- 분류된 유입경로
  medium TEXT,
  campaign TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  vid TEXT NOT NULL,              -- 익명 방문자 ID
  screen TEXT,
  lang TEXT
);
CREATE INDEX IF NOT EXISTS idx_hits_day ON hits(day, type);
CREATE INDEX IF NOT EXISTS idx_hits_ts ON hits(ts);
