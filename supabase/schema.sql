-- ============================================================================
-- MiCA — Supabase schema for self-host
-- ============================================================================
-- Paste this entire file into Supabase Dashboard → SQL Editor → New query → Run.
-- Idempotent — safe to re-run if you need to re-apply.
--
-- What this file creates:
--   • All 10 tables MiCA uses (campaigns, email/whatsapp/social, exec, etc.)
--   • Foreign keys with ON DELETE CASCADE so deleting a campaign cleans up
--   • Indexes on the columns we filter on most (campaign_id, user_id)
--   • Row-level security policies — users only see/edit their own campaigns
--   • Storage buckets for campaign assets, images, videos, and uploads
--   • Storage RLS policies so authenticated users can upload/delete
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Tables ──────────────────────────────────────────────────────────────────

-- The campaign itself: one row per marketing campaign a user creates.
CREATE TABLE IF NOT EXISTS campaigns (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Inputs from the DoodleMap onboarding
    product_name          text NOT NULL,
    product_description   text NOT NULL,
    product_document_url  text,
    target_audience       text,
    launch_date           date NOT NULL,
    campaign_start_date   date,
    campaign_end_date     date,
    budget                integer DEFAULT 5000,
    location              text,
    product_links         text,
    tone                  text DEFAULT 'Professional',
    tone_custom_words     text,
    creator_name          text,
    customer_data_url     text,

    -- AI-generated outputs
    marketing_plan        jsonb,
    recommended_channels  jsonb,
    tone_preview_content  jsonb,
    tone_revision_used    boolean DEFAULT false,

    -- Video (HeyGen) state
    video_url             text,
    video_status          text DEFAULT 'not_started',
    video_script          text,
    heygen_video_id       text,
    video_started_at      timestamptz,

    -- Lifecycle
    status                text DEFAULT 'draft',
    launched_at           timestamptz,
    created_at            timestamptz DEFAULT now(),
    updated_at            timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_templates (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    template_order  integer NOT NULL,
    subject         text NOT NULL,
    pre_header      text,
    body            text NOT NULL,
    html_body       text,
    cta_text        text,
    scheduled_day   integer,
    created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    message_order   integer NOT NULL,
    message_text    text NOT NULL,
    message_type    text DEFAULT 'nurture',
    scheduled_day   integer,
    created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_posts (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id       uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    post_order        integer NOT NULL,
    caption           text NOT NULL,
    hashtags          text,
    platform          text DEFAULT 'instagram',
    image_url         text,
    image_suggestion  text,
    scheduled_day     integer,
    created_at        timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS generated_images (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id   uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    image_url     text NOT NULL,
    image_prompt  text,
    image_order   integer,
    image_type    text DEFAULT 'social',
    created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_data (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id    uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    name           text,
    email          text,
    phone          text,
    custom_fields  jsonb,
    created_at     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS execution_schedule (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id        uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    channel            text NOT NULL,
    asset_type         text NOT NULL,
    asset_id           uuid NOT NULL,
    scheduled_day      integer NOT NULL,
    scheduled_date     date NOT NULL,
    status             text DEFAULT 'scheduled',
    recipients_total   integer DEFAULT 0,
    recipients_sent    integer DEFAULT 0,
    recipients_failed  integer DEFAULT 0,
    started_at         timestamptz,
    completed_at       timestamptz,
    error_details      text,
    created_at         timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS execution_stats (
    id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id          uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    email_sent           integer DEFAULT 0,
    email_failed         integer DEFAULT 0,
    whatsapp_delivered   integer DEFAULT 0,
    whatsapp_failed      integer DEFAULT 0,
    instagram_posts      integer DEFAULT 0,
    voice_calls          integer DEFAULT 0,
    updated_at           timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaign_logs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    channel         text NOT NULL,
    action          text NOT NULL,
    recipient       text,
    status_details  text,
    executed_at     timestamptz DEFAULT now()
);

-- Public-facing waitlist: anyone can sign up, only authenticated users can read.
CREATE TABLE IF NOT EXISTS waitlist (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email       text NOT NULL,
    source      text,
    created_at  timestamptz DEFAULT now()
);

-- ── Indexes ─────────────────────────────────────────────────────────────────
-- The dashboard and most reads filter by campaign_id; campaigns list filters
-- by user_id. Indexing these makes typical queries snappy.

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id            ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status             ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_templates_campaign     ON email_templates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_campaign   ON whatsapp_messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_campaign        ON social_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_campaign    ON generated_images(campaign_id);
CREATE INDEX IF NOT EXISTS idx_customer_data_campaign       ON customer_data(campaign_id);
CREATE INDEX IF NOT EXISTS idx_execution_schedule_campaign  ON execution_schedule(campaign_id);
CREATE INDEX IF NOT EXISTS idx_execution_stats_campaign     ON execution_stats(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_campaign       ON campaign_logs(campaign_id);

-- ── Row-Level Security ──────────────────────────────────────────────────────
-- Enable RLS on every user-data table. Default-deny; policies below grant
-- access. Without RLS enabled, Supabase's anon key would expose all rows.

ALTER TABLE campaigns           ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images    ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_data       ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_schedule  ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_stats     ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist            ENABLE ROW LEVEL SECURITY;

-- Campaigns: a user can do anything to their own campaigns.
DROP POLICY IF EXISTS "Users manage their own campaigns" ON campaigns;
CREATE POLICY "Users manage their own campaigns" ON campaigns
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Helper: child-table policies all check campaign ownership through the join.
-- This keeps email_templates/social_posts/etc. inaccessible unless the user
-- owns the parent campaign.

DROP POLICY IF EXISTS "Users manage email templates of their campaigns" ON email_templates;
CREATE POLICY "Users manage email templates of their campaigns" ON email_templates
    FOR ALL TO authenticated
    USING      (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = email_templates.campaign_id     AND campaigns.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = email_templates.campaign_id     AND campaigns.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users manage whatsapp of their campaigns" ON whatsapp_messages;
CREATE POLICY "Users manage whatsapp of their campaigns" ON whatsapp_messages
    FOR ALL TO authenticated
    USING      (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = whatsapp_messages.campaign_id   AND campaigns.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = whatsapp_messages.campaign_id   AND campaigns.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users manage social posts of their campaigns" ON social_posts;
CREATE POLICY "Users manage social posts of their campaigns" ON social_posts
    FOR ALL TO authenticated
    USING      (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = social_posts.campaign_id        AND campaigns.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = social_posts.campaign_id        AND campaigns.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users manage images of their campaigns" ON generated_images;
CREATE POLICY "Users manage images of their campaigns" ON generated_images
    FOR ALL TO authenticated
    USING      (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = generated_images.campaign_id    AND campaigns.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = generated_images.campaign_id    AND campaigns.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users manage customer data of their campaigns" ON customer_data;
CREATE POLICY "Users manage customer data of their campaigns" ON customer_data
    FOR ALL TO authenticated
    USING      (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = customer_data.campaign_id       AND campaigns.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = customer_data.campaign_id       AND campaigns.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users manage execution schedule of their campaigns" ON execution_schedule;
CREATE POLICY "Users manage execution schedule of their campaigns" ON execution_schedule
    FOR ALL TO authenticated
    USING      (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = execution_schedule.campaign_id  AND campaigns.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = execution_schedule.campaign_id  AND campaigns.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users manage execution stats of their campaigns" ON execution_stats;
CREATE POLICY "Users manage execution stats of their campaigns" ON execution_stats
    FOR ALL TO authenticated
    USING      (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = execution_stats.campaign_id     AND campaigns.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = execution_stats.campaign_id     AND campaigns.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users manage logs of their campaigns" ON campaign_logs;
CREATE POLICY "Users manage logs of their campaigns" ON campaign_logs
    FOR ALL TO authenticated
    USING      (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_logs.campaign_id       AND campaigns.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_logs.campaign_id       AND campaigns.user_id = auth.uid()));

-- Waitlist: anonymous visitors INSERT their email; only logged-in users SELECT.
-- (Tighten the SELECT policy to specific admin users in production if needed.)
DROP POLICY IF EXISTS "Anyone can join the waitlist" ON waitlist;
CREATE POLICY "Anyone can join the waitlist" ON waitlist
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read waitlist" ON waitlist;
CREATE POLICY "Authenticated users can read waitlist" ON waitlist
    FOR SELECT TO authenticated
    USING (true);

-- ── Storage buckets ─────────────────────────────────────────────────────────
-- Three public buckets (videos and images served via public URLs in <video>
-- and <img> tags) and two private buckets (raw user uploads — CSVs, PDFs).

INSERT INTO storage.buckets (id, name, public, file_size_limit) VALUES
    ('campaign-assets',    'campaign-assets',    true,  52428800),   -- 50 MB
    ('campaign-images',    'campaign-images',    true,  52428800),   -- 50 MB
    ('campaign-videos',    'campaign-videos',    true,  52428800),   -- 50 MB (Free-tier project cap)
    ('customer-documents', 'customer-documents', false, 20971520),   -- 20 MB
    ('product-documents',  'product-documents',  false, 20971520)    -- 20 MB
ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS policies ────────────────────────────────────────────────────
-- The bucket's `public` flag enables public reads via getPublicUrl().
-- These policies let authenticated users upload to and delete from each bucket.

-- Public buckets (uploads + deletes for authenticated users)
DROP POLICY IF EXISTS "auth can upload campaign assets" ON storage.objects;
CREATE POLICY "auth can upload campaign assets" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id IN ('campaign-assets', 'campaign-images', 'campaign-videos'));

DROP POLICY IF EXISTS "auth can delete campaign assets" ON storage.objects;
CREATE POLICY "auth can delete campaign assets" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id IN ('campaign-assets', 'campaign-images', 'campaign-videos'));

DROP POLICY IF EXISTS "auth can update campaign assets" ON storage.objects;
CREATE POLICY "auth can update campaign assets" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id IN ('campaign-assets', 'campaign-images', 'campaign-videos'))
    WITH CHECK (bucket_id IN ('campaign-assets', 'campaign-images', 'campaign-videos'));

-- Private buckets (read + write for authenticated users only)
DROP POLICY IF EXISTS "auth can manage customer documents" ON storage.objects;
CREATE POLICY "auth can manage customer documents" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'customer-documents')
    WITH CHECK (bucket_id = 'customer-documents');

DROP POLICY IF EXISTS "auth can manage product documents" ON storage.objects;
CREATE POLICY "auth can manage product documents" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'product-documents')
    WITH CHECK (bucket_id = 'product-documents');

-- ============================================================================
-- Done. Tables, indexes, RLS, and Storage all set up.
-- Verify by visiting:
--   • Database → Tables (you should see 10 tables)
--   • Storage → Buckets (you should see 5 buckets)
--   • Authentication → Policies → storage.objects (5 policies)
-- ============================================================================
