-- LigaMatch: esquema inicial (Postgres en Neon). Se puede ejecutar varias veces.

create table if not exists venues (
  id         text primary key,
  name       text not null,
  zone       text not null,
  surface    text,
  price_usd  integer,
  notes      text,
  sort       integer not null default 0
);

create table if not exists matches (
  id          serial primary key,
  round       integer not null,
  venue_id    text references venues(id),
  play_date   date not null,
  play_time   time not null,
  home        text not null,
  away        text not null,
  home_goals  integer,
  away_goals  integer,
  check (home <> away)
);

-- Datos privados (teléfono, cédula) viven aquí y solo se leen desde el servidor.
create table if not exists players (
  id             serial primary key,
  auth_user_id  text not null unique,
  email          text not null,
  full_name      text not null,
  age            integer not null check (age between 16 and 70),
  phone          text not null,
  cedula         text not null,
  cedula_norm    text not null unique,
  zone           text not null,
  photo_url      text,
  status         text not null default 'Pendiente' check (status in ('Pendiente', 'Verificado', 'Rechazado')),
  created_at     timestamptz not null default now()
);

create table if not exists prizes (
  id         serial primary key,
  title      text not null,
  value_usd  integer not null check (value_usd >= 0),
  kind       text not null,
  sponsor    text not null,
  sort       integer not null default 0
);

-- Espacios publicitarios. El pago se registra aquí como estado, no se procesa en la plataforma.
create table if not exists ad_slots (
  id              serial primary key,
  name            text not null,
  type            text not null check (type in ('Digital', 'Físico')),
  price_usd       integer not null check (price_usd >= 0),
  per             text not null check (per in ('mes', 'jornada', 'temporada')),
  descr           text,
  priority        text not null default 'Media' check (priority in ('Alta', 'Media', 'Baja')),
  venue_id        text references venues(id),
  sponsor         text,
  until           date,
  payment_status  text not null default 'Pendiente' check (payment_status in ('Pendiente', 'Confirmado')),
  sort            integer not null default 0
);

create table if not exists sponsor_requests (
  id          serial primary key,
  company     text not null,
  contact     text not null,
  phone       text not null,
  slot_id     integer references ad_slots(id) on delete set null,
  status      text not null default 'Nueva' check (status in ('Nueva', 'Asignada', 'Atendida', 'Descartada')),
  created_at  timestamptz not null default now()
);
