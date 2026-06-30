INSERT INTO public.user_roles (user_id, role)
SELECT
    id,
    'super_admin'
FROM auth.users
WHERE email = 'admin@legalpedia.com'
ON CONFLICT (user_id, role) DO NOTHING;