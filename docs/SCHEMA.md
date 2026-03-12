# Database Schema

## Users

```sql
CREATE TYPE user_role AS ENUM ('ADMIN', 'TEACHER', 'PARENT');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role user_role NOT NULL,
  phone TEXT,
  email TEXT NOT NULL UNIQUE,
  google_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## Groups

```sql
CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name TEXT,
  description TEXT,
  age_min INT,
  age_max INT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## Children

```sql
CREATE TABLE children (
  id SERIAL PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## Teacher Roles

```sql
CREATE TYPE teacher_role AS ENUM ('PEA', 'TAVA', 'ABI');
```

## Group Users

```sql
CREATE TABLE group_users (
  group_id INT REFERENCES groups(id),
  user_id INT REFERENCES users(id),
  role teacher_role,
  PRIMARY KEY (group_id, user_id)
);
```

## Attendance

```sql
CREATE TYPE present_enum AS ENUM ('KOHAL', 'PUUDUB');

CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  child_id INT REFERENCES children(id),
  date DATE,
  status present_enum,
  note TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE (child_id, date)
);
```

## Child Users

```sql
CREATE TABLE child_users (
  child_id INT REFERENCES children(id),
  user_id INT REFERENCES users(id),
  relationship TEXT,
  is_primary BOOLEAN,
  PRIMARY KEY (child_id, user_id)
);
```

## Enrollments

```sql
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  child_id INT REFERENCES children(id),
  group_id INT REFERENCES groups(id),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## Group Posts

```sql
CREATE TABLE group_posts (
  id SERIAL PRIMARY KEY,
  group_id INT REFERENCES groups(id),
  created_by_user_id INT REFERENCES users(id),
  title TEXT,
  message TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## Post Media

```sql
CREATE TABLE post_media (
  id SERIAL PRIMARY KEY,
  group_post_id INT REFERENCES group_posts(id),
  s3_key TEXT,
  content_type TEXT,
  created_at TIMESTAMPTZ
);
```

## Messages

```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_user_id INT REFERENCES users(id),
  recipient_user_id INT REFERENCES users(id),
  subject TEXT,
  body TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## Group Messages

```sql
CREATE TABLE group_messages (
  id SERIAL PRIMARY KEY,
  sender_user_id INT REFERENCES users(id),
  subject TEXT,
  body TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE group_message_recipients (
  group_message_id INT REFERENCES group_messages(id),
  user_id INT REFERENCES users(id),
  read_at TIMESTAMPTZ,
  PRIMARY KEY (group_message_id, user_id)
);
```
