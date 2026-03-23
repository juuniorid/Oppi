# Database Schema

This document mirrors the current Drizzle schema in [`backend/src/database/schema.ts`](/Users/karl/04_TalTech/Oppi/backend/src/database/schema.ts).
The TypeScript schema is the source of truth.

## Deletion Strategy

Main domain records use soft delete via `deleted_at`:

- `users`
- `groups`
- `children`
- `attendance`
- `enrollments`
- `group_posts`
- `post_media`
- `messages`

Pure relationship tables do not currently use soft delete and can be hard-deleted when links are removed:

- `child_users`
- `group_users`
- `message_recipients`

## Enums

```sql
CREATE TYPE user_role AS ENUM ('ADMIN', 'TEACHER', 'PARENT');
CREATE TYPE teacher_role AS ENUM ('PEA', 'TAVA', 'ABI');
CREATE TYPE child_present AS ENUM ('KOHAL', 'PUUDUB');
CREATE TYPE message_audience AS ENUM ('DIRECT', 'GROUP');
```

## Users

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role user_role NOT NULL,
  phone TEXT,
  email TEXT NOT NULL UNIQUE,
  google_id TEXT NOT NULL UNIQUE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Children

```sql
CREATE TABLE children (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  notes TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Groups

```sql
CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  age_min INT,
  age_max INT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Group Users

```sql
CREATE TABLE group_users (
  group_id INT NOT NULL REFERENCES groups(id),
  user_id INT NOT NULL REFERENCES users(id),
  role teacher_role,
  PRIMARY KEY (group_id, user_id)
);
```

## Attendance

```sql
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  child_id INT NOT NULL REFERENCES children(id),
  date DATE NOT NULL,
  status child_present NOT NULL,
  note TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX attendance_child_id_date_unique
  ON attendance (child_id, date);
```

## Child Users

```sql
CREATE TABLE child_users (
  child_id INT NOT NULL REFERENCES children(id),
  user_id INT NOT NULL REFERENCES users(id),
  relationship TEXT,
  is_primary BOOLEAN,
  PRIMARY KEY (child_id, user_id)
);
```

## Enrollments

```sql
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  child_id INT NOT NULL REFERENCES children(id),
  group_id INT NOT NULL REFERENCES groups(id),
  start_date DATE,
  end_date DATE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Group Posts

```sql
CREATE TABLE group_posts (
  id SERIAL PRIMARY KEY,
  group_id INT NOT NULL REFERENCES groups(id),
  created_by_user_id INT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Post Media

```sql
CREATE TABLE post_media (
  id SERIAL PRIMARY KEY,
  group_post_id INT NOT NULL REFERENCES group_posts(id),
  s3_key TEXT,
  content_type TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Messages

```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_user_id INT NOT NULL REFERENCES users(id),
  target_group_id INT REFERENCES groups(id),
  audience message_audience NOT NULL DEFAULT 'DIRECT',
  subject TEXT,
  body TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Message Recipients

```sql
CREATE TABLE message_recipients (
  message_id INT NOT NULL REFERENCES messages(id),
  user_id INT NOT NULL REFERENCES users(id),
  read_at TIMESTAMPTZ,
  PRIMARY KEY (message_id, user_id)
);
```
