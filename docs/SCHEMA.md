# Database Schema

## Users

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  google_id TEXT NOT NULL UNIQUE,
  role ENUM('ADMIN', 'TEACHER', 'PARENT') NOT NULL,
  phone TEXT
);
```

## Groups

```sql
CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  kindergarten_name TEXT NOT NULL
);
```

## Children

```sql
CREATE TABLE children (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  group_id INTEGER NOT NULL REFERENCES groups(id)
);
```

## Posts

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER NOT NULL REFERENCES users(id),
  group_id INTEGER NOT NULL REFERENCES groups(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Messages

```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id),
  recipient_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## Parents to Children (Many-to-Many)

```sql
CREATE TABLE parents_to_children (
  parent_id INTEGER NOT NULL REFERENCES users(id),
  child_id INTEGER NOT NULL REFERENCES children(id),
  PRIMARY KEY (parent_id, child_id)
);
```
