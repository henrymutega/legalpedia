-- =========================================================
-- TASK MANAGEMENT + COLLAB SCHEMA
-- =========================================================

-- Enums
DO $$ BEGIN
  CREATE TYPE public.task_status AS ENUM ('open','assigned','in_progress','under_review','completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.task_priority AS ENUM ('low','medium','high','urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- TASKS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'corporate',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  status public.task_status NOT NULL DEFAULT 'open',
  related_case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  created_by uuid NOT NULL,
  assigned_by uuid,
  assigned_to uuid,
  assigned_at timestamptz,
  due_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_case ON public.tasks(related_case_id);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.tasks;
CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper: can current user see this task?
CREATE OR REPLACE FUNCTION public.can_access_task(_task_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tasks t
    LEFT JOIN public.cases c ON c.id = t.related_case_id
    WHERE t.id = _task_id AND (
      public.is_staff(_user_id)
      OR c.client_id = _user_id
    )
  );
$$;

-- RLS policies for tasks
DROP POLICY IF EXISTS "View tasks" ON public.tasks;
CREATE POLICY "View tasks" ON public.tasks FOR SELECT
USING (
  public.is_staff(auth.uid())
  OR (related_case_id IS NOT NULL
      AND EXISTS (SELECT 1 FROM public.cases c WHERE c.id = tasks.related_case_id AND c.client_id = auth.uid()))
);

DROP POLICY IF EXISTS "Admins create tasks" ON public.tasks;
CREATE POLICY "Admins create tasks" ON public.tasks FOR INSERT
WITH CHECK (
  public.is_staff(auth.uid()) AND created_by = auth.uid()
);

DROP POLICY IF EXISTS "Update tasks by role" ON public.tasks;
CREATE POLICY "Update tasks by role" ON public.tasks FOR UPDATE
USING (
  public.is_admin_or_super(auth.uid())
  OR (public.is_staff(auth.uid()) AND (assigned_to = auth.uid() OR assigned_to IS NULL))
);

DROP POLICY IF EXISTS "Admins delete tasks" ON public.tasks;
CREATE POLICY "Admins delete tasks" ON public.tasks FOR DELETE
USING (public.is_admin_or_super(auth.uid()));

-- =========================================================
-- TASK ACTIVITY (audit log)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.task_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL,
  action text NOT NULL,    -- e.g. 'created','claimed','assigned','status_changed','commented','uploaded','released'
  detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_task_activity_task ON public.task_activity(task_id, created_at DESC);

ALTER TABLE public.task_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View task activity" ON public.task_activity;
CREATE POLICY "View task activity" ON public.task_activity FOR SELECT
USING (public.can_access_task(task_id, auth.uid()));

DROP POLICY IF EXISTS "Insert task activity" ON public.task_activity;
CREATE POLICY "Insert task activity" ON public.task_activity FOR INSERT
WITH CHECK (actor_id = auth.uid() AND public.can_access_task(task_id, auth.uid()));

-- =========================================================
-- TASK COMMENTS (lawyer collaboration)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON public.task_comments(task_id, created_at);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View task comments" ON public.task_comments;
CREATE POLICY "View task comments" ON public.task_comments FOR SELECT
USING (public.is_staff(auth.uid()) AND public.can_access_task(task_id, auth.uid()));

DROP POLICY IF EXISTS "Insert task comments" ON public.task_comments;
CREATE POLICY "Insert task comments" ON public.task_comments FOR INSERT
WITH CHECK (
  public.is_staff(auth.uid())
  AND author_id = auth.uid()
  AND public.can_access_task(task_id, auth.uid())
);

DROP POLICY IF EXISTS "Admins delete task comments" ON public.task_comments;
CREATE POLICY "Admins delete task comments" ON public.task_comments FOR DELETE
USING (public.is_admin_or_super(auth.uid()));

-- =========================================================
-- LAWYER PRESENCE
-- =========================================================
CREATE TABLE IF NOT EXISTS public.lawyer_presence (
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  last_seen timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_presence_task ON public.lawyer_presence(task_id, last_seen DESC);

ALTER TABLE public.lawyer_presence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff view presence" ON public.lawyer_presence;
CREATE POLICY "Staff view presence" ON public.lawyer_presence FOR SELECT
USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Self upsert presence" ON public.lawyer_presence;
CREATE POLICY "Self upsert presence" ON public.lawyer_presence FOR INSERT
WITH CHECK (user_id = auth.uid() AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Self update presence" ON public.lawyer_presence;
CREATE POLICY "Self update presence" ON public.lawyer_presence FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Self delete presence" ON public.lawyer_presence;
CREATE POLICY "Self delete presence" ON public.lawyer_presence FOR DELETE
USING (user_id = auth.uid());

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,        -- 'task_assigned','task_comment','task_status','case_upload','case_comment'
  title text NOT NULL,
  body text,
  link text,                 -- relative URL
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View own notifications" ON public.notifications;
CREATE POLICY "View own notifications" ON public.notifications FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Mark own notifications" ON public.notifications;
CREATE POLICY "Mark own notifications" ON public.notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff insert notifications" ON public.notifications;
CREATE POLICY "Staff insert notifications" ON public.notifications FOR INSERT
WITH CHECK (
  -- Allow self-notifications and staff-authored notifications.
  -- Server-side flows (triggers) bypass RLS via SECURITY DEFINER.
  user_id = auth.uid() OR public.is_staff(auth.uid())
);

DROP POLICY IF EXISTS "Delete own notifications" ON public.notifications;
CREATE POLICY "Delete own notifications" ON public.notifications FOR DELETE
USING (user_id = auth.uid());

-- =========================================================
-- TASK TRIGGERS: auto-log activity + create notifications
-- =========================================================
CREATE OR REPLACE FUNCTION public.notify_task_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  actor uuid := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.task_activity(task_id, actor_id, action, detail)
    VALUES (NEW.id, COALESCE(actor, NEW.created_by), 'created',
            jsonb_build_object('title', NEW.title, 'priority', NEW.priority));
    IF NEW.assigned_to IS NOT NULL THEN
      INSERT INTO public.notifications(user_id, type, title, body, link)
      VALUES (NEW.assigned_to, 'task_assigned',
              'New task assigned: ' || NEW.title,
              'Priority: ' || NEW.priority::text,
              '/dashboard/tasks/' || NEW.id::text);
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Status change
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.task_activity(task_id, actor_id, action, detail)
      VALUES (NEW.id, COALESCE(actor, NEW.created_by), 'status_changed',
              jsonb_build_object('from', OLD.status, 'to', NEW.status));
    END IF;
    -- Assignment change
    IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
      IF OLD.assigned_to IS NULL AND NEW.assigned_to = actor THEN
        INSERT INTO public.task_activity(task_id, actor_id, action, detail)
        VALUES (NEW.id, actor, 'claimed', jsonb_build_object('user_id', NEW.assigned_to));
      ELSIF NEW.assigned_to IS NULL THEN
        INSERT INTO public.task_activity(task_id, actor_id, action, detail)
        VALUES (NEW.id, COALESCE(actor, NEW.created_by), 'released',
                jsonb_build_object('previous', OLD.assigned_to));
      ELSE
        INSERT INTO public.task_activity(task_id, actor_id, action, detail)
        VALUES (NEW.id, COALESCE(actor, NEW.created_by), 'assigned',
                jsonb_build_object('to', NEW.assigned_to, 'from', OLD.assigned_to));
        INSERT INTO public.notifications(user_id, type, title, body, link)
        VALUES (NEW.assigned_to, 'task_assigned',
                'Task assigned: ' || NEW.title, NULL,
                '/dashboard/tasks/' || NEW.id::text);
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_task_change ON public.tasks;
CREATE TRIGGER trg_notify_task_change
AFTER INSERT OR UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.notify_task_change();

-- Comment trigger: notify assignee
CREATE OR REPLACE FUNCTION public.notify_task_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t record;
BEGIN
  SELECT id, title, assigned_to, created_by INTO t FROM public.tasks WHERE id = NEW.task_id;
  INSERT INTO public.task_activity(task_id, actor_id, action, detail)
  VALUES (NEW.task_id, NEW.author_id, 'commented', jsonb_build_object('comment_id', NEW.id));

  IF t.assigned_to IS NOT NULL AND t.assigned_to <> NEW.author_id THEN
    INSERT INTO public.notifications(user_id, type, title, body, link)
    VALUES (t.assigned_to, 'task_comment',
            'New comment on task: ' || t.title,
            left(NEW.content, 140),
            '/dashboard/tasks/' || NEW.task_id::text);
  END IF;
  IF t.created_by IS NOT NULL AND t.created_by <> NEW.author_id AND t.created_by <> COALESCE(t.assigned_to, '00000000-0000-0000-0000-000000000000'::uuid) THEN
    INSERT INTO public.notifications(user_id, type, title, body, link)
    VALUES (t.created_by, 'task_comment',
            'New comment on task: ' || t.title,
            left(NEW.content, 140),
            '/dashboard/tasks/' || NEW.task_id::text);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_task_comment ON public.task_comments;
CREATE TRIGGER trg_notify_task_comment
AFTER INSERT ON public.task_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_task_comment();

-- =========================================================
-- CASE NOTIFICATIONS (existing flows)
-- =========================================================
CREATE OR REPLACE FUNCTION public.notify_case_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c record;
BEGIN
  SELECT id, title, client_id, assigned_lawyer_id INTO c FROM public.cases WHERE id = NEW.case_id;
  IF c.client_id IS NOT NULL AND c.client_id <> NEW.author_id THEN
    INSERT INTO public.notifications(user_id, type, title, body, link)
    VALUES (c.client_id, 'case_comment', 'New comment on your case: ' || c.title,
            left(NEW.content, 140), '/dashboard/cases/' || c.id::text);
  END IF;
  IF c.assigned_lawyer_id IS NOT NULL AND c.assigned_lawyer_id <> NEW.author_id THEN
    INSERT INTO public.notifications(user_id, type, title, body, link)
    VALUES (c.assigned_lawyer_id, 'case_comment', 'New comment on case: ' || c.title,
            left(NEW.content, 140), '/dashboard/cases/' || c.id::text);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_case_comment ON public.case_comments;
CREATE TRIGGER trg_notify_case_comment
AFTER INSERT ON public.case_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_case_comment();

CREATE OR REPLACE FUNCTION public.notify_case_file()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c record;
BEGIN
  SELECT id, title, client_id, assigned_lawyer_id INTO c FROM public.cases WHERE id = NEW.case_id;
  IF c.client_id IS NOT NULL AND c.client_id <> NEW.uploaded_by THEN
    INSERT INTO public.notifications(user_id, type, title, body, link)
    VALUES (c.client_id, 'case_upload',
            'New ' || NEW.kind || ' document on case: ' || c.title,
            NEW.filename, '/dashboard/cases/' || c.id::text);
  END IF;
  IF c.assigned_lawyer_id IS NOT NULL AND c.assigned_lawyer_id <> NEW.uploaded_by THEN
    INSERT INTO public.notifications(user_id, type, title, body, link)
    VALUES (c.assigned_lawyer_id, 'case_upload',
            'New ' || NEW.kind || ' document on case: ' || c.title,
            NEW.filename, '/dashboard/cases/' || c.id::text);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_case_file ON public.case_files;
CREATE TRIGGER trg_notify_case_file
AFTER INSERT ON public.case_files
FOR EACH ROW EXECUTE FUNCTION public.notify_case_file();

-- =========================================================
-- REALTIME
-- =========================================================
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.task_activity REPLICA IDENTITY FULL;
ALTER TABLE public.task_comments REPLICA IDENTITY FULL;
ALTER TABLE public.lawyer_presence REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.cases REPLICA IDENTITY FULL;
ALTER TABLE public.case_files REPLICA IDENTITY FULL;
ALTER TABLE public.case_comments REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.task_activity;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.lawyer_presence;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.cases;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.case_files;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.case_comments;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;