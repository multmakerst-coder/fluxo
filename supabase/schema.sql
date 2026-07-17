-- ============================================================================
-- FLUXO — Schema Supabase (PostgreSQL)
-- Plataforma de automação WhatsApp / Instagram / Email
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
create type user_role as enum ('super_admin', 'admin', 'client', 'agent');
create type channel_type as enum ('whatsapp', 'instagram', 'email');
create type channel_status as enum ('connected', 'disconnected', 'error');
create type flow_status as enum ('active', 'inactive', 'draft');
create type broadcast_status as enum ('scheduled', 'sending', 'sent', 'failed');
create type sequence_status as enum ('active', 'paused', 'archived');
create type conversation_status as enum ('open', 'pending', 'closed', 'archived');
create type message_direction as enum ('inbound', 'outbound');
create type sender_type as enum ('contact', 'agent', 'bot');
create type plan_slug as enum ('gratuito', 'pro', 'empresas');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled');
create type team_role as enum ('admin', 'agent', 'readonly');

-- ---------------------------------------------------------------------------
-- PERFIS (estende auth.users)
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  avatar_url text,
  role user_role not null default 'client',
  owner_id uuid references profiles (id) on delete cascade, -- para agentes/membros de equipa
  language text not null default 'pt',
  theme text not null default 'dark',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- PLANOS E SUBSCRIÇÕES
-- ---------------------------------------------------------------------------
create table plans (
  id uuid primary key default gen_random_uuid(),
  slug plan_slug not null unique,
  name text not null,
  price_monthly numeric(10, 2),
  price_yearly numeric(10, 2),
  contact_limit integer, -- null = ilimitado
  channel_limit integer,
  flow_limit integer,
  features jsonb not null default '[]',
  is_custom_price boolean not null default false,
  created_at timestamptz not null default now()
);

create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  percent_off integer,
  amount_off numeric(10, 2),
  valid_until timestamptz,
  max_redemptions integer,
  created_at timestamptz not null default now()
);

-- Definições globais da plataforma (par chave/valor), configuráveis a partir de
-- /admin/configuracoes. Ex.: { "key": "trial_days", "value": 14 }.
create table platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles (id) on delete set null
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  plan_id uuid not null references plans (id),
  status subscription_status not null default 'trialing',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- CANAIS LIGADOS
-- ---------------------------------------------------------------------------
create table channels (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  type channel_type not null,
  status channel_status not null default 'disconnected',
  display_name text,
  phone_number text,
  external_account_id text,
  access_token_encrypted text,
  metadata jsonb not null default '{}',
  connected_at timestamptz,
  created_at timestamptz not null default now(),
  unique (client_id, type)
);

-- ---------------------------------------------------------------------------
-- CRM: CONTACTOS, CAMPOS, TAGS, SEGMENTOS
-- ---------------------------------------------------------------------------
create table contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  avatar_url text,
  source_channel channel_type,
  notes text,
  created_at timestamptz not null default now(),
  last_contact_at timestamptz
);
create index contacts_client_id_idx on contacts (client_id);

create table custom_fields (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  key text not null,
  label text not null,
  field_type text not null default 'text', -- text | number | date | list
  created_at timestamptz not null default now(),
  unique (client_id, key)
);

create table contact_field_values (
  contact_id uuid not null references contacts (id) on delete cascade,
  field_id uuid not null references custom_fields (id) on delete cascade,
  value text,
  primary key (contact_id, field_id)
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  color text not null default '#6C47FF',
  created_at timestamptz not null default now(),
  unique (client_id, name)
);

create table contact_tags (
  contact_id uuid not null references contacts (id) on delete cascade,
  tag_id uuid not null references tags (id) on delete cascade,
  primary key (contact_id, tag_id)
);

create table segments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  filter jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- FLUXOS (WhatsApp / Instagram / Email)
-- ---------------------------------------------------------------------------
create table flows (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  channel channel_type not null,
  name text not null,
  status flow_status not null default 'draft',
  trigger_type text not null,
  trigger_config jsonb not null default '{}',
  nodes jsonb not null default '[]',
  edges jsonb not null default '[]',
  activations_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index flows_client_id_idx on flows (client_id);

-- ---------------------------------------------------------------------------
-- BROADCASTS
-- ---------------------------------------------------------------------------
create table broadcasts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  channel channel_type not null,
  segment_id uuid references segments (id) on delete set null,
  name text not null,
  content jsonb not null default '{}',
  scheduled_at timestamptz,
  status broadcast_status not null default 'scheduled',
  stats jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- SEQUÊNCIAS
-- ---------------------------------------------------------------------------
create table sequences (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  channel channel_type not null,
  name text not null,
  status sequence_status not null default 'paused',
  exit_on_reply boolean not null default true,
  created_at timestamptz not null default now()
);

create table sequence_steps (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid not null references sequences (id) on delete cascade,
  step_order integer not null,
  delay_minutes integer not null default 0,
  content jsonb not null default '{}'
);

create table sequence_enrollments (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid not null references sequences (id) on delete cascade,
  contact_id uuid not null references contacts (id) on delete cascade,
  current_step integer not null default 0,
  status text not null default 'active',
  enrolled_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- INBOX (LIVE CHAT)
-- ---------------------------------------------------------------------------
create table conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  contact_id uuid not null references contacts (id) on delete cascade,
  channel channel_type not null,
  status conversation_status not null default 'open',
  assigned_to uuid references profiles (id) on delete set null,
  last_message_at timestamptz,
  created_at timestamptz not null default now()
);
create index conversations_client_id_idx on conversations (client_id);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  direction message_direction not null,
  sender_type sender_type not null,
  sender_id uuid references profiles (id) on delete set null,
  content text,
  media_url text,
  created_at timestamptz not null default now()
);
create index messages_conversation_id_idx on messages (conversation_id);

create table internal_notes (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  author_id uuid not null references profiles (id),
  content text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- INTEGRAÇÕES, WEBHOOKS, API KEYS
-- ---------------------------------------------------------------------------
create table integrations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  provider text not null, -- google_sheets | notion | calendly | stripe | shopify | woocommerce | zapier | make
  status text not null default 'disconnected',
  config jsonb not null default '{}',
  connected_at timestamptz,
  unique (client_id, provider)
);

create table webhooks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  url text not null,
  events text[] not null default '{}',
  secret text not null default encode(gen_random_bytes(24), 'hex'),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table api_keys (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

-- ---------------------------------------------------------------------------
-- EQUIPA E NOTIFICAÇÕES
-- ---------------------------------------------------------------------------
create table team_members (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles (id) on delete cascade,
  user_id uuid references profiles (id) on delete cascade,
  invited_email text not null,
  role team_role not null default 'agent',
  status text not null default 'pending', -- pending | active
  created_at timestamptz not null default now()
);

create table notification_settings (
  client_id uuid primary key references profiles (id) on delete cascade,
  new_lead_email boolean not null default true,
  flow_error_email boolean not null default true,
  plan_limit_email boolean not null default true
);

-- ---------------------------------------------------------------------------
-- CONTEÚDO PÚBLICO (gerido pelo admin)
-- ---------------------------------------------------------------------------
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text,
  category text,
  cover_image_url text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table help_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  category text not null, -- primeiros-passos | whatsapp | instagram | email | faturacao
  title text not null,
  content text,
  created_at timestamptz not null default now(),
  unique (category, slug)
);

create table faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0
);

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text,
  company text,
  avatar_url text,
  content text not null,
  is_featured boolean not null default false
);

-- ---------------------------------------------------------------------------
-- COMUNICAÇÕES ADMIN → CLIENTES
-- ---------------------------------------------------------------------------
create table admin_broadcasts (
  id uuid primary key default gen_random_uuid(),
  sent_by uuid references profiles (id),
  audience jsonb not null default '{}', -- {"type":"all"} | {"type":"plan","plan_id":...}
  subject text not null,
  content text not null,
  channel text not null default 'email', -- email | in_app
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table channels enable row level security;
alter table contacts enable row level security;
alter table custom_fields enable row level security;
alter table contact_field_values enable row level security;
alter table tags enable row level security;
alter table contact_tags enable row level security;
alter table segments enable row level security;
alter table flows enable row level security;
alter table broadcasts enable row level security;
alter table sequences enable row level security;
alter table sequence_steps enable row level security;
alter table sequence_enrollments enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table internal_notes enable row level security;
alter table integrations enable row level security;
alter table webhooks enable row level security;
alter table api_keys enable row level security;
alter table team_members enable row level security;
alter table notification_settings enable row level security;

-- Helper: id do "workspace" do utilizador autenticado (o próprio, ou o "owner_id" se for agente)
create or replace function auth_workspace_id()
returns uuid
language sql stable
as $$
  select coalesce(
    (select owner_id from profiles where id = auth.uid() and owner_id is not null),
    auth.uid()
  );
$$;

create or replace function auth_is_admin()
returns boolean
language sql stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

-- profiles: o próprio utilizador pode ver/editar o seu perfil; admins veem todos
create policy "profiles_select_own_or_admin" on profiles
  for select using (id = auth.uid() or owner_id = auth.uid() or auth_is_admin());
create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());

-- Política genérica reutilizada em todas as tabelas com client_id
do $$
declare
  t text;
begin
  foreach t in array array[
    'subscriptions','channels','contacts','custom_fields','tags','segments',
    'flows','broadcasts','sequences','conversations','integrations','webhooks',
    'api_keys','team_members'
  ]
  loop
    execute format(
      'create policy "%1$s_workspace_access" on %1$s
       for all using (client_id = auth_workspace_id() or auth_is_admin())
       with check (client_id = auth_workspace_id());',
      t
    );
  end loop;
end $$;

create policy "notification_settings_workspace_access" on notification_settings
  for all using (client_id = auth_workspace_id() or auth_is_admin())
  with check (client_id = auth_workspace_id());

create policy "contact_field_values_access" on contact_field_values
  for all using (
    exists (select 1 from contacts c where c.id = contact_id and (c.client_id = auth_workspace_id() or auth_is_admin()))
  );

create policy "contact_tags_access" on contact_tags
  for all using (
    exists (select 1 from contacts c where c.id = contact_id and (c.client_id = auth_workspace_id() or auth_is_admin()))
  );

create policy "sequence_steps_access" on sequence_steps
  for all using (
    exists (select 1 from sequences s where s.id = sequence_id and (s.client_id = auth_workspace_id() or auth_is_admin()))
  );

create policy "sequence_enrollments_access" on sequence_enrollments
  for all using (
    exists (select 1 from sequences s where s.id = sequence_id and (s.client_id = auth_workspace_id() or auth_is_admin()))
  );

create policy "messages_access" on messages
  for all using (
    exists (select 1 from conversations c where c.id = conversation_id and (c.client_id = auth_workspace_id() or auth_is_admin()))
  );

create policy "internal_notes_access" on internal_notes
  for all using (
    exists (select 1 from conversations c where c.id = conversation_id and (c.client_id = auth_workspace_id() or auth_is_admin()))
  );

-- Conteúdo público: leitura livre, escrita apenas admin
alter table blog_posts enable row level security;
alter table help_articles enable row level security;
alter table faqs enable row level security;
alter table testimonials enable row level security;
alter table plans enable row level security;
alter table coupons enable row level security;
alter table admin_broadcasts enable row level security;
alter table platform_settings enable row level security;

create policy "blog_posts_public_read" on blog_posts for select using (published = true or auth_is_admin());
create policy "blog_posts_admin_write" on blog_posts for all using (auth_is_admin()) with check (auth_is_admin());
create policy "help_articles_public_read" on help_articles for select using (true);
create policy "help_articles_admin_write" on help_articles for all using (auth_is_admin()) with check (auth_is_admin());
create policy "faqs_public_read" on faqs for select using (true);
create policy "faqs_admin_write" on faqs for all using (auth_is_admin()) with check (auth_is_admin());
create policy "testimonials_public_read" on testimonials for select using (true);
create policy "testimonials_admin_write" on testimonials for all using (auth_is_admin()) with check (auth_is_admin());
create policy "plans_public_read" on plans for select using (true);
create policy "plans_admin_write" on plans for all using (auth_is_admin()) with check (auth_is_admin());
create policy "coupons_admin_only" on coupons for all using (auth_is_admin()) with check (auth_is_admin());
create policy "admin_broadcasts_admin_only" on admin_broadcasts for all using (auth_is_admin()) with check (auth_is_admin());
create policy "platform_settings_public_read" on platform_settings for select using (true);
create policy "platform_settings_admin_write" on platform_settings for all using (auth_is_admin()) with check (auth_is_admin());

-- ---------------------------------------------------------------------------
-- SEED: planos por omissão
-- ---------------------------------------------------------------------------
insert into plans (slug, name, price_monthly, price_yearly, contact_limit, channel_limit, flow_limit, features, is_custom_price)
values
  ('gratuito', 'Gratuito', 0, 0, 500, 1, 3, '["Analytics básico", "Sem broadcasts"]', false),
  ('pro', 'Pro', 29, 290, null, 3, null, '["Contactos ilimitados", "WhatsApp + Instagram + Email", "Broadcasts e sequências", "Analytics completo", "Suporte prioritário", "Respostas com IA"]', false),
  ('empresas', 'Empresas', null, null, null, 3, null, '["Tudo do Pro", "Multi-utilizador", "API própria", "Onboarding dedicado", "SLA garantido"]', true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- SEED: definições globais por omissão
-- ---------------------------------------------------------------------------
insert into platform_settings (key, value)
values
  ('trial_days', '14'),
  ('support_email', '"suporte@fluxo.pt"')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- TRIGGER: criar perfil automaticamente após signup
-- ---------------------------------------------------------------------------
-- IMPORTANTE: o email abaixo tem de ser mantido em sincronia com
-- ADMIN_EMAIL em src/lib/admin.ts — é a única conta que recebe `role =
-- 'admin'` automaticamente no signup. Todas as outras contas (incluindo
-- quaisquer emails de teste) recebem sempre `role = 'client'`. Para promover
-- outra conta a admin, atualiza manualmente `profiles.role` na base de
-- dados — não adicionar mais emails aqui.
create or replace function handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    case
      when lower(new.email) = 'isildotavarespt@gmail.com' then 'admin'
      else 'client'
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
