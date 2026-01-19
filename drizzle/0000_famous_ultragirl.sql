CREATE TABLE locations (
  id INTEGER PRIMARY KEY NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  timestampUTC TEXT NOT NULL,
  speed REAL,
  heading REAL,
  accuracy REAL,
  altitude REAL,
  battery_level REAL,
  action TEXT,
  raw_json TEXT
);
