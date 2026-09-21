# AIspire Database Schema & Data Dictionary

This document describes the PostgreSQL database schema, table structures, relationships, constraints, and Row Level Security (RLS) policies used by AIspire on Supabase.

---

## 1. Entity Relationship Overview

```
                      +-------------------+
                      |   auth.users      |
                      |   (Supabase Auth) |
                      +---------+---------+
                                |
               +----------------+----------------+
               |                |                |
               v                v                v
        +--------------+ +--------------+ +--------------+
        |   profiles   | | assessments  | |   roadmaps   |
        +--------------+ +-------+------+ +--------------+
                                 |
                                 v
                      +-------------------+
                      | assessment_scores |
                      +-------------------+

               +----------------+----------------+
               |                                 |
               v                                 v
        +--------------+                  +--------------+
        |  bookmarks   |                  |ai_chat_history|
        +--------------+                  +--------------+
               |
               v
        +--------------+
        |ai_request_log|
        +--------------+
```

---

## 2. Table Specifications

### A. `profiles`
Stores student background and onboarding information.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, REFERENCES auth.users(id)` | Authenticated user ID |
| `name` | `TEXT` | `NOT NULL` | Display name of the student |
| `education_level` | `TEXT` | `NOT NULL` | e.g., High School, Undergraduate |
| `field_of_interest`| `TEXT` | `NOT NULL` | Chosen academic domain |
| `career_goals` | `TEXT` | `NULL` | Student's open career aspirations |
| `theme_preference` | `TEXT` | `DEFAULT 'dark'` | `'dark'` or `'light'` |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Last update timestamp |

### B. `assessments`
Stores the raw question answers and status of completed assessments.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Assessment identifier |
| `user_id` | `UUID` | `REFERENCES auth.users(id) ON DELETE CASCADE` | Associated student UUID |
| `completed` | `BOOLEAN` | `DEFAULT FALSE` | Completion status |
| `answers` | `JSONB` | `DEFAULT '{}'::jsonb` | Map of question ID to answer index |
| `current_question_index` | `INT` | `DEFAULT 0` | Progress step for resuming |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Test initiation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Last update timestamp |

### C. `assessment_scores`
Stores normalized 7-dimension psychometric scores for deterministic career matching.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Score record identifier |
| `assessment_id` | `UUID` | `REFERENCES assessments(id) ON DELETE CASCADE` | Parent assessment |
| `user_id` | `UUID` | `REFERENCES auth.users(id) ON DELETE CASCADE` | Associated student UUID |
| `analytical` | `FLOAT` | `NOT NULL, CHECK (>=0 AND <=100)` | Normalized Analytical score |
| `creative` | `FLOAT` | `NOT NULL, CHECK (>=0 AND <=100)` | Normalized Creative score |
| `technical` | `FLOAT` | `NOT NULL, CHECK (>=0 AND <=100)` | Normalized Technical score |
| `social_healthcare` | `FLOAT` | `NOT NULL, CHECK (>=0 AND <=100)`| Normalized Social/Healthcare score |
| `management` | `FLOAT` | `NOT NULL, CHECK (>=0 AND <=100)` | Normalized Management score |
| `research` | `FLOAT` | `NOT NULL, CHECK (>=0 AND <=100)` | Normalized Research score |
| `communication`| `FLOAT` | `NOT NULL, CHECK (>=0 AND <=100)` | Normalized Communication score |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Computation timestamp |

> **Unique Constraint:** `CONSTRAINT uq_assessment_scores_user_assessment UNIQUE (user_id, assessment_id)` allows safe, atomic `.upsert()` operations without duplicating score rows.

### D. `career_results`
Stores the top career match scores from completed assessments.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Result record identifier |
| `user_id` | `UUID` | `REFERENCES auth.users(id) ON DELETE CASCADE` | Associated student UUID |
| `career_id` | `TEXT` | `NOT NULL` | Career identifier (e.g. `full-stack-ai-engineer`) |
| `match_score` | `INT` | `NOT NULL` | Final match percentage (0-100) |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Record timestamp |

### E. `roadmap_progress`
Stores milestone progress across selected 10-step career roadmaps.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Progress record identifier |
| `user_id` | `UUID` | `REFERENCES auth.users(id) ON DELETE CASCADE` | Associated student UUID |
| `career_id` | `TEXT` | `NOT NULL` | Career identifier |
| `step_id` | `INT` | `NOT NULL` | Step number (1-10) |
| `completed` | `BOOLEAN` | `DEFAULT TRUE` | Step completion state |
| `completed_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Milestone completion timestamp |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Last update timestamp |

> **Unique Constraint:** `UNIQUE(user_id, career_id, step_id)` enables atomic step toggling via `.upsert()`.

### F. `bookmarks`
Stores educational study resources saved by the student.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Bookmark identifier |
| `user_id` | `UUID` | `REFERENCES auth.users(id) ON DELETE CASCADE` | Associated student UUID |
| `resource_id` | `TEXT` | `NOT NULL` | Resource identifier from curated directory |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Bookmark timestamp |

> **Unique Constraint:** `UNIQUE(user_id, resource_id)` prevents duplicate bookmarks per user.

### G. `ai_chat_history`
Persists conversational dialogue with the AI Career Mentor.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Message identifier |
| `user_id` | `UUID` | `REFERENCES auth.users(id) ON DELETE CASCADE` | Associated student UUID |
| `role` | `TEXT` | `NOT NULL, CHECK (role IN ('user', 'ai'))` | Message author |
| `message` | `TEXT` | `NOT NULL` | Chat dialogue text |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Message timestamp |

### H. `ai_request_log`
Tracks AI Mentor invocation timestamps for sliding-window rate limiting and cooldown enforcement.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Audit record identifier |
| `user_id` | `UUID` | `REFERENCES auth.users(id) ON DELETE CASCADE` | Calling student UUID |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Request timestamp |

---

## 3. Performance Indexes

```sql
CREATE INDEX idx_ai_request_log_user_created ON public.ai_request_log(user_id, created_at DESC);
CREATE INDEX idx_ai_chat_history_user_created ON public.ai_chat_history(user_id, created_at ASC);
CREATE INDEX idx_assessments_user_created ON public.assessments(user_id, created_at DESC);
CREATE INDEX idx_assessment_scores_user_created ON public.assessment_scores(user_id, created_at DESC);
CREATE INDEX idx_roadmap_progress_user_career ON public.roadmap_progress(user_id, career_id);
CREATE INDEX idx_bookmarks_user ON public.bookmarks(user_id);
```

