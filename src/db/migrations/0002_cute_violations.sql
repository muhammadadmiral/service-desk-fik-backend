CREATE TABLE "disposisi_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"from_user_id" integer,
	"to_user_id" integer NOT NULL,
	"reason" text,
	"notes" text,
	"progress_update" integer,
	"created_at" timestamp DEFAULT now(),
	"action_type" varchar(50),
	"expected_completion_time" timestamp,
	"sla_impact" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "ticket_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"hour" integer,
	"department" varchar(100),
	"category" varchar(100),
	"total_tickets" integer DEFAULT 0,
	"open_tickets" integer DEFAULT 0,
	"closed_tickets" integer DEFAULT 0,
	"average_resolution_time" integer,
	"average_response_time" integer,
	"sla_breaches" integer DEFAULT 0,
	"customer_satisfaction_average" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"action" varchar(100) NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"subcategory" varchar(100),
	"department" varchar(100) NOT NULL,
	"priority" varchar(50) NOT NULL,
	"template_content" jsonb NOT NULL,
	"auto_assignment_rules" jsonb,
	"sla_hours" integer DEFAULT 24,
	"is_active" boolean DEFAULT true,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_workflows" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"steps" jsonb NOT NULL,
	"conditions" jsonb,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"action" varchar(100) NOT NULL,
	"performed_by" integer NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"related_id" integer,
	"related_type" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text NOT NULL,
	"type" varchar(50) DEFAULT 'string',
	"category" varchar(100),
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "position" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "program_studi" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "fakultas" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "angkatan" varchar(10);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login" timestamp;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD COLUMN "message_type" varchar(50) DEFAULT 'comment';--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD COLUMN "is_internal" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "subcategory" varchar(100);--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "is_simple" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "disposisi_chain" jsonb DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "current_handler" integer;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "sla_deadline" timestamp;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "sla_status" varchar(50);--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "escalation_level" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "reopen_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "customer_satisfaction" integer;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "resolution_time" integer;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "first_response_time" integer;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "tags" jsonb DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "metadata" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "disposisi_history" ADD CONSTRAINT "disposisi_history_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disposisi_history" ADD CONSTRAINT "disposisi_history_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disposisi_history" ADD CONSTRAINT "disposisi_history_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_audit_logs" ADD CONSTRAINT "ticket_audit_logs_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_audit_logs" ADD CONSTRAINT "ticket_audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_templates" ADD CONSTRAINT "ticket_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_workflows" ADD CONSTRAINT "ticket_workflows_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_audit_logs" ADD CONSTRAINT "user_audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_audit_logs" ADD CONSTRAINT "user_audit_logs_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_current_handler_users_id_fk" FOREIGN KEY ("current_handler") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE users
  ADD COLUMN program_studi TEXT NULL,
  ADD COLUMN fakultas TEXT NULL,
  ADD COLUMN angkatan TEXT NULL,
  ADD COLUMN status TEXT NULL;

  CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  related_id INTEGER,
  related_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'string',
  category VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add assignment_target to tickets
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS assignment_target VARCHAR(50);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_category ON settings(category);
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'string',
  category VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Fungsi bantu untuk memeriksa dan menyisipkan pengaturan jika belum ada
CREATE OR REPLACE FUNCTION upsert_setting(
  p_key VARCHAR,
  p_value TEXT,
  p_type VARCHAR,
  p_category VARCHAR,
  p_description TEXT
) RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM settings WHERE key = p_key) THEN
    INSERT INTO settings (key, value, type, category, description)
    VALUES (p_key, p_value, p_type, p_category, p_description);
    RAISE NOTICE 'Added setting: %', p_key;
  ELSE
    RAISE NOTICE 'Setting already exists: %', p_key;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Sisipkan pengaturan kategori tiket
SELECT upsert_setting(
  'ticket.categories',
  '[
    {
      "name": "Academic",
      "subcategories": [
        "SIAKAD error",
        "Error KRS",
        "Nilai tidak muncul",
        "Transkrip nilai",
        "Absensi",
        "Jadwal kuliah",
        "Lainnya"
      ]
    },
    {
      "name": "Financial",
      "subcategories": [
        "Pembayaran UKT",
        "Tagihan",
        "Pembayaran lainnya",
        "Beasiswa",
        "Lainnya"
      ]
    },
    {
      "name": "Technical",
      "subcategories": [
        "WiFi/Network",
        "PC/Laptop",
        "Software",
        "Email kampus",
        "Akun sistem",
        "Lainnya"
      ]
    },
    {
      "name": "Facility",
      "subcategories": [
        "AC rusak",
        "Proyektor rusak",
        "Ruangan",
        "Furnitur",
        "Kebersihan",
        "Lainnya"
      ]
    },
    {
      "name": "Administrative",
      "subcategories": [
        "Surat keterangan",
        "Surat izin",
        "Legalisir dokumen",
        "Permintaan data",
        "Lainnya"
      ]
    }
  ]',
  'json',
  'ticket',
  'Kategori dan subkategori tiket'
);

-- Sisipkan pengaturan prioritas tiket
SELECT upsert_setting(
  'ticket.priorities',
  '["low", "medium", "high", "urgent"]',
  'json',
  'ticket',
  'Prioritas tiket'
);

-- Sisipkan pengaturan tipe tiket
SELECT upsert_setting(
  'ticket.types',
  '["software", "hardware", "document", "financial", "other"]',
  'json',
  'ticket',
  'Tipe tiket'
);

-- Sisipkan pengaturan departemen tiket
SELECT upsert_setting(
  'ticket.departments',
  '["IT Support", "Akademik", "Keuangan", "Fasilitas", "Administrasi"]',
  'json',
  'ticket',
  'Departemen untuk tiket'
);

-- Sisipkan pengaturan SLA tiket
SELECT upsert_setting(
  'ticket.sla',
  '{"low": 72, "medium": 48, "high": 24, "urgent": 4}',
  'json',
  'ticket',
  'SLA dalam jam untuk setiap prioritas'
);

-- Sisipkan pengaturan judul situs
SELECT upsert_setting(
  'site.title',
  'Service Desk FIK',
  'string',
  'site',
  'Judul website'
);

-- Sisipkan pengaturan deskripsi situs
SELECT upsert_setting(
  'site.description',
  'Sistem layanan helpdesk untuk Fakultas Ilmu Komputer',
  'string',
  'site',
  'Deskripsi website'
);

-- Sisipkan pengaturan notifikasi email
SELECT upsert_setting(
  'email.notification',
  'true',
  'boolean',
  'email',
  'Apakah notifikasi email aktif'
);

-- Hapus fungsi bantu
DROP FUNCTION upsert_setting;

-- Tampilkan semua settings
SELECT id, key, type, category, description, created_at FROM settings ORDER BY category, key;

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'string',
  category VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Hapus data lama (opsional)
-- TRUNCATE TABLE settings;

-- Fungsi untuk menyisipkan setting jika belum ada
CREATE OR REPLACE FUNCTION upsert_setting(p_key VARCHAR, p_value TEXT, p_type VARCHAR, p_category VARCHAR, p_description TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM settings WHERE key = p_key) THEN
    INSERT INTO settings (key, value, type, category, description)
    VALUES (p_key, p_value, p_type, p_category, p_description);
    RAISE NOTICE 'Setting berhasil dibuat: %', p_key;
  ELSE
    UPDATE settings SET 
      value = p_value,
      type = p_type,
      category = p_category,
      description = p_description,
      updated_at = NOW()
    WHERE key = p_key;
    RAISE NOTICE 'Setting berhasil diperbarui: %', p_key;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Kategori dan subkategori tiket
SELECT upsert_setting(
  'ticket.categories',
  '[
    {
      "name": "Academic",
      "subcategories": [
        "SIAKAD error",
        "Error KRS",
        "Nilai tidak muncul",
        "Transkrip nilai",
        "Absensi",
        "Jadwal kuliah",
        "Lainnya"
      ]
    },
    {
      "name": "Financial",
      "subcategories": [
        "Pembayaran UKT",
        "Tagihan",
        "Pembayaran lainnya",
        "Beasiswa",
        "Lainnya"
      ]
    },
    {
      "name": "Technical",
      "subcategories": [
        "WiFi/Network",
        "PC/Laptop",
        "Software",
        "Email kampus",
        "Akun sistem",
        "Lainnya"
      ]
    },
    {
      "name": "Facility",
      "subcategories": [
        "AC rusak",
        "Proyektor rusak",
        "Ruangan",
        "Furnitur",
        "Kebersihan",
        "Lainnya"
      ]
    },
    {
      "name": "Administrative",
      "subcategories": [
        "Surat keterangan",
        "Surat izin",
        "Legalisir dokumen",
        "Permintaan data",
        "Lainnya"
      ]
    }
  ]',
  'json',
  'ticket',
  'Kategori dan subkategori tiket'
);

-- Prioritas tiket
SELECT upsert_setting(
  'ticket.priorities',
  '["low", "medium", "high", "urgent"]',
  'json',
  'ticket',
  'Prioritas tiket'
);

-- Tipe tiket
SELECT upsert_setting(
  'ticket.types',
  '["software", "hardware", "document", "financial", "other"]',
  'json',
  'ticket',
  'Tipe tiket'
);

-- Departemen tiket
SELECT upsert_setting(
  'ticket.departments',
  '["IT Support", "Akademik", "Keuangan", "Fasilitas", "Administrasi"]',
  'json',
  'ticket',
  'Departemen untuk tiket'
);

-- SLA tiket
SELECT upsert_setting(
  'ticket.sla',
  '{"low": 72, "medium": 48, "high": 24, "urgent": 4}',
  'json',
  'ticket',
  'SLA dalam jam untuk setiap prioritas'
);

-- Pengaturan umum
SELECT upsert_setting('siteName', 'Service Desk FIK', 'string', 'general', 'Nama situs');
SELECT upsert_setting('siteDescription', 'Sistem Layanan Terpadu Fakultas Ilmu Komputer', 'string', 'general', 'Deskripsi situs');
SELECT upsert_setting('contactEmail', 'servicedesk@fik.upnvj.ac.id', 'string', 'general', 'Email kontak');
SELECT upsert_setting('maxAttachmentSize', '10', 'number', 'general', 'Ukuran maksimal lampiran dalam MB');
SELECT upsert_setting('allowRegistration', 'false', 'boolean', 'general', 'Izinkan pendaftaran mandiri');

-- Pengaturan tiket
SELECT upsert_setting('defaultPriority', 'medium', 'string', 'ticket', 'Prioritas default untuk tiket baru');
SELECT upsert_setting('autoAssignTickets', 'true', 'boolean', 'ticket', 'Assign tiket secara otomatis');
SELECT upsert_setting('requireApproval', 'false', 'boolean', 'ticket', 'Memerlukan persetujuan sebelum tiket selesai');
SELECT upsert_setting('allowAnonymousTickets', 'false', 'boolean', 'ticket', 'Izinkan tiket anonim');
SELECT upsert_setting('ticketPrefix', 'FIK', 'string', 'ticket', 'Prefix untuk nomor tiket');

-- Pengaturan SLA
SELECT upsert_setting('enableSLA', 'true', 'boolean', 'sla', 'Aktifkan SLA');
SELECT upsert_setting('lowPrioritySLA', '72', 'number', 'sla', 'SLA untuk prioritas low (jam)');
SELECT upsert_setting('mediumPrioritySLA', '48', 'number', 'sla', 'SLA untuk prioritas medium (jam)');
SELECT upsert_setting('highPrioritySLA', '24', 'number', 'sla', 'SLA untuk prioritas high (jam)');
SELECT upsert_setting('urgentPrioritySLA', '4', 'number', 'sla', 'SLA untuk prioritas urgent (jam)');
SELECT upsert_setting('sendSLANotifications', 'true', 'boolean', 'sla', 'Kirim notifikasi untuk SLA');

-- Pengaturan notifikasi
SELECT upsert_setting('emailNotifications', 'true', 'boolean', 'notification', 'Aktifkan notifikasi email');
SELECT upsert_setting('inAppNotifications', 'true', 'boolean', 'notification', 'Aktifkan notifikasi in-app');
SELECT upsert_setting('notifyOnNewTicket', 'true', 'boolean', 'notification', 'Notifikasi untuk tiket baru');
SELECT upsert_setting('notifyOnTicketUpdate', 'true', 'boolean', 'notification', 'Notifikasi untuk update tiket');
SELECT upsert_setting('notifyOnTicketAssignment', 'true', 'boolean', 'notification', 'Notifikasi untuk penugasan tiket');
SELECT upsert_setting('notifyOnSLABreach', 'true', 'boolean', 'notification', 'Notifikasi untuk pelanggaran SLA');
SELECT upsert_setting('digestFrequency', 'daily', 'string', 'notification', 'Frekuensi digest email');

-- Hapus fungsi setelah selesai
DROP FUNCTION upsert_setting;

-- Menampilkan semua settings yang berhasil dibuat/diperbarui