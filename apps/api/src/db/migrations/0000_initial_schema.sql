-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Custom enum types
DO $$ BEGIN
    CREATE TYPE "user_role" AS ENUM ('student', 'faculty', 'org_officer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "day_of_week" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "consultation_status" AS ENUM ('pending', 'approved', 'declined', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "event_category" AS ENUM ('academic', 'cultural', 'sports', 'seminar', 'org', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "attendance_status" AS ENUM ('registered', 'attended', 'absent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "membership_status" AS ENUM ('pending', 'active', 'declined', 'removed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "membership_role" AS ENUM ('member', 'officer', 'president');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "announcement_audience" AS ENUM ('all', 'dean', 'ccs', 'org');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "grade_period" AS ENUM ('Prelims', 'Midterms', 'Finals');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "building" AS ENUM ('main', 'annex', 'gymnasium', 'library', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" varchar(255) NOT NULL UNIQUE,
    "password_hash" text NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'student',
    "first_name" varchar(100) NOT NULL,
    "last_name" varchar(100) NOT NULL,
    "middle_name" varchar(100),
    "student_number" varchar(20) UNIQUE,
    "employee_number" varchar(20) UNIQUE,
    "program" varchar(100),
    "year_level" varchar(20),
    "section" varchar(20),
    "avatar_url" text,
    "is_active" boolean NOT NULL DEFAULT true,
    "must_change_password" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- 2. Refresh tokens
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "token_hash" text NOT NULL UNIQUE,
    "expires_at" timestamptz NOT NULL,
    "revoked" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT now()
);

-- 3. Password reset tokens
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "token_hash" text NOT NULL,
    "expires_at" timestamptz NOT NULL,
    "used" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT now()
);

-- 4. Courses
CREATE TABLE IF NOT EXISTS "courses" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" varchar(20) NOT NULL UNIQUE,
    "title" varchar(200) NOT NULL,
    "units" integer NOT NULL,
    "description" text,
    "program" varchar(100) NOT NULL,
    "year_level" varchar(20) NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- 5. Faculty course assignments
CREATE TABLE IF NOT EXISTS "faculty_course_assignments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "faculty_id" uuid NOT NULL REFERENCES "users"("id"),
    "course_id" uuid NOT NULL REFERENCES "courses"("id"),
    "academic_year" varchar(20) NOT NULL,
    "semester" integer NOT NULL,
    "section" varchar(20) NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now()
);

-- 6. Enrollments
CREATE TABLE IF NOT EXISTS "enrollments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" uuid NOT NULL REFERENCES "users"("id"),
    "course_id" uuid NOT NULL REFERENCES "courses"("id"),
    "academic_year" varchar(20) NOT NULL,
    "semester" integer NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "enrollment_unique_term" UNIQUE ("student_id", "course_id", "academic_year", "semester")
);

-- 7. Class schedules
CREATE TABLE IF NOT EXISTS "class_schedules" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "course_id" uuid NOT NULL REFERENCES "courses"("id"),
    "faculty_id" uuid NOT NULL REFERENCES "users"("id"),
    "section" varchar(20) NOT NULL,
    "day" "day_of_week" NOT NULL,
    "start_time" time NOT NULL,
    "end_time" time NOT NULL,
    "room" varchar(50),
    "academic_year" varchar(20) NOT NULL,
    "semester" integer NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- 8. Consultation slots
CREATE TABLE IF NOT EXISTS "consultation_slots" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "faculty_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "day" "day_of_week" NOT NULL,
    "start_time" time NOT NULL,
    "end_time" time NOT NULL,
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- 9. Consultation requests (with double-booking exclusion constraint)
CREATE TABLE IF NOT EXISTS "consultation_requests" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" uuid NOT NULL REFERENCES "users"("id"),
    "faculty_id" uuid NOT NULL REFERENCES "users"("id"),
    "slot_id" uuid NOT NULL REFERENCES "consultation_slots"("id"),
    "requested_date" date NOT NULL,
    "start_time" time NOT NULL,
    "end_time" time NOT NULL,
    "subject" text NOT NULL,
    "message" text NOT NULL,
    "status" "consultation_status" NOT NULL DEFAULT 'pending',
    "faculty_note" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Exclusion constraint to prevent double-booking at DB level
ALTER TABLE "consultation_requests"
    DROP CONSTRAINT IF EXISTS "no_double_booking_faculty_slot";

ALTER TABLE "consultation_requests"
    ADD CONSTRAINT "no_double_booking_faculty_slot"
    EXCLUDE USING gist (
        faculty_id WITH =,
        requested_date WITH =,
        tsrange(
            requested_date + start_time,
            requested_date + end_time
        ) WITH &&
    )
    WHERE (status NOT IN ('declined', 'cancelled'));

-- 10. Events
CREATE TABLE IF NOT EXISTS "events" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" varchar(200) NOT NULL,
    "description" text NOT NULL,
    "category" "event_category" NOT NULL,
    "location" varchar(200) NOT NULL,
    "starts_at" timestamptz NOT NULL,
    "ends_at" timestamptz NOT NULL,
    "registration_deadline" timestamptz,
    "max_slots" integer,
    "is_published" boolean NOT NULL DEFAULT false,
    "created_by" uuid NOT NULL REFERENCES "users"("id"),
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- 11. Event registrations
CREATE TABLE IF NOT EXISTS "event_registrations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id" uuid NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "qr_payload" text NOT NULL,
    "attendance_status" "attendance_status" NOT NULL DEFAULT 'registered',
    "attended_at" timestamptz,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "event_registration_unique_user" UNIQUE ("event_id", "user_id")
);

-- 12. Organizations
CREATE TABLE IF NOT EXISTS "organizations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" varchar(200) NOT NULL UNIQUE,
    "acronym" varchar(20) NOT NULL,
    "description" text NOT NULL,
    "logo_url" text,
    "adviser_id" uuid REFERENCES "users"("id"),
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- 13. Org memberships
CREATE TABLE IF NOT EXISTS "org_memberships" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "status" "membership_status" NOT NULL DEFAULT 'pending',
    "role" "membership_role" NOT NULL DEFAULT 'member',
    "application_note" text,
    "reviewed_by" uuid REFERENCES "users"("id"),
    "review_note" text,
    "reviewed_at" timestamptz,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "org_membership_unique_user" UNIQUE ("organization_id", "user_id")
);

-- 14. Announcements
CREATE TABLE IF NOT EXISTS "announcements" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" varchar(300) NOT NULL,
    "body" text NOT NULL,
    "audience" "announcement_audience" NOT NULL,
    "organization_id" uuid REFERENCES "organizations"("id"),
    "is_pinned" boolean NOT NULL DEFAULT false,
    "published_at" timestamptz,
    "expires_at" timestamptz,
    "created_by" uuid NOT NULL REFERENCES "users"("id"),
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- 15. Grades
CREATE TABLE IF NOT EXISTS "grades" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" uuid NOT NULL REFERENCES "users"("id"),
    "course_id" uuid NOT NULL REFERENCES "courses"("id"),
    "academic_year" varchar(20) NOT NULL,
    "semester" integer NOT NULL,
    "period" "grade_period" NOT NULL,
    "grade" numeric(4, 2),
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "grade_unique_entry" UNIQUE ("student_id", "course_id", "academic_year", "semester", "period")
);

-- 16. Evaluation periods
CREATE TABLE IF NOT EXISTS "evaluation_periods" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "academic_year" varchar(20) NOT NULL,
    "semester" integer NOT NULL,
    "label" varchar(100) NOT NULL,
    "opens_at" timestamptz NOT NULL,
    "closes_at" timestamptz NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now()
);

-- 17. Evaluation submissions
CREATE TABLE IF NOT EXISTS "evaluation_submissions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "period_id" uuid NOT NULL REFERENCES "evaluation_periods"("id"),
    "student_id" uuid NOT NULL REFERENCES "users"("id"),
    "faculty_id" uuid NOT NULL REFERENCES "users"("id"),
    "course_id" uuid NOT NULL REFERENCES "courses"("id"),
    "ratings" text NOT NULL,
    "comments" text,
    "submitted_at" timestamptz NOT NULL DEFAULT now(),
    "created_at" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "evaluation_submission_unique" UNIQUE ("period_id", "student_id", "faculty_id")
);

-- 18. Research studies
CREATE TABLE IF NOT EXISTS "research_studies" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" varchar(500) NOT NULL,
    "authors" text NOT NULL,
    "abstract" text NOT NULL,
    "keywords" text NOT NULL,
    "program" varchar(100) NOT NULL,
    "academic_year" varchar(20) NOT NULL,
    "search_vector" tsvector,
    "uploaded_by" uuid REFERENCES "users"("id"),
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Research search vector generation trigger
CREATE OR REPLACE FUNCTION research_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', unaccent(coalesce(NEW.title, ''))), 'A') ||
        setweight(to_tsvector('english', unaccent(coalesce(NEW.keywords, ''))), 'B') ||
        setweight(to_tsvector('english', unaccent(coalesce(NEW.abstract, ''))), 'C');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_research_vector_update ON "research_studies";
CREATE TRIGGER trg_research_vector_update
    BEFORE INSERT OR UPDATE ON "research_studies"
    FOR EACH ROW
    EXECUTE FUNCTION research_vector_update();

-- 19. Campus rooms
CREATE TABLE IF NOT EXISTS "campus_rooms" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" varchar(20) NOT NULL UNIQUE,
    "name" varchar(100) NOT NULL,
    "building" "building" NOT NULL,
    "floor" integer NOT NULL,
    "description" text,
    "capacity" integer,
    "map_x" numeric(8, 2),
    "map_y" numeric(8, 2),
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS "research_search_vector_gin_idx" ON "research_studies" USING gin ("search_vector");
CREATE INDEX IF NOT EXISTS "research_title_trgm_idx" ON "research_studies" USING gin ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "research_abstract_trgm_idx" ON "research_studies" USING gin ("abstract" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "consultation_faculty_date_idx" ON "consultation_requests" ("faculty_id", "requested_date");
CREATE INDEX IF NOT EXISTS "announcements_audience_published_idx" ON "announcements" ("audience", "published_at");
CREATE INDEX IF NOT EXISTS "grades_student_term_idx" ON "grades" ("student_id", "academic_year", "semester");
