-- Masterlist table for pre-registered students and faculty
CREATE TABLE IF NOT EXISTS "ccs_masterlist" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" varchar(255) NOT NULL UNIQUE,
    "role" "user_role" NOT NULL DEFAULT 'student',
    "first_name" varchar(100) NOT NULL,
    "last_name" varchar(100) NOT NULL,
    "middle_name" varchar(100),
    "student_number" varchar(20) UNIQUE,
    "employee_number" varchar(20) UNIQUE,
    "program" varchar(100),
    "year_level" varchar(20),
    "section" varchar(20),
    "is_claimed" boolean NOT NULL DEFAULT false,
    "last_email_sent_at" timestamptz,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "masterlist_email_idx" ON "ccs_masterlist" ("email");
