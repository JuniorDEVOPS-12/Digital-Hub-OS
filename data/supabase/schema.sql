-- ============================================================
-- Digital Hub OS — Schéma Supabase (migration localStorage → Supabase)
-- ============================================================
--
-- À exécuter dans : Supabase Dashboard → SQL Editor.
--
-- Contexte : les tables `students`, `trainers`, `modules`, `attendance`
-- et `schedule` existent déjà mais leur schéma est trop minimal pour le
-- modèle applicatif (pas de first_name/last_name/phone, id de type uuid
-- incompatible avec les identifiants texte générés côté client, modules
-- sans order/duration/color/description, etc.).
--
-- Ce script ALIGNE les tables EXISTANTES sur le modèle applicatif SANS
-- toucher au système d'authentification (schéma auth.* non modifié).
-- Les tables étant vides, la recréation ne perd aucune donnée.
--
-- Identifiants : type `text` (valeur fournie par le client via generateId(),
-- avec repli gen_random_uuid()::text) pour préserver les relations telles
-- que gérées par l'application (module.trainerId, schedule.moduleId, ...).
-- ============================================================

-- --- Tables (recréation propre — tables vides) ---------------
drop table if exists public.attendance cascade;
drop table if exists public.schedule cascade;
drop table if exists public.modules cascade;
drop table if exists public.students cascade;
drop table if exists public.trainers cascade;

create table public.students (
    id          text primary key default gen_random_uuid()::text,
    first_name  text not null default '',
    last_name   text not null default '',
    name        text not null default '',
    email       text not null default '',
    phone       text not null default '',
    status      text not null default 'active',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create table public.trainers (
    id          text primary key default gen_random_uuid()::text,
    first_name  text not null default '',
    last_name   text not null default '',
    name        text not null default '',
    email       text not null default '',
    phone       text not null default '',
    specialty   text not null default '',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create table public.modules (
    id          text primary key default gen_random_uuid()::text,
    name        text not null default '',
    title       text not null default '',
    order_index integer not null default 1,
    duration    integer not null default 1,
    trainer_id  text references public.trainers(id) on delete set null,
    description text not null default '',
    color       text not null default '#6366f1',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create table public.schedule (
    id          text primary key default gen_random_uuid()::text,
    date        date not null,
    module_id   text references public.modules(id) on delete cascade,
    start_time  text not null default '16:00',
    end_time    text not null default '19:00',
    created_at  timestamptz not null default now()
);

create table public.attendance (
    id          text primary key,
    student_id  text references public.students(id) on delete cascade,
    date        date not null,
    status      text not null,
    created_at  timestamptz not null default now(),
    unique (student_id, date)
);

create index if not exists idx_schedule_date on public.schedule(date);
create index if not exists idx_attendance_date on public.attendance(date);
create index if not exists idx_modules_order on public.modules(order_index);

-- --- Row Level Security -------------------------------------
-- Accès CRUD complet pour les utilisateurs authentifiés (l'app impose déjà
-- une connexion via Supabase Auth). Aucun accès anonyme en écriture.
alter table public.students   enable row level security;
alter table public.trainers   enable row level security;
alter table public.modules    enable row level security;
alter table public.schedule   enable row level security;
alter table public.attendance enable row level security;

do $$
declare t text;
begin
    foreach t in array array['students','trainers','modules','schedule','attendance']
    loop
        execute format('drop policy if exists %I on public.%I;', t || '_auth_all', t);
        execute format(
            'create policy %I on public.%I for all to authenticated using (true) with check (true);',
            t || '_auth_all', t
        );
    end loop;
end $$;
