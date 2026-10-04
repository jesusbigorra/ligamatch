-- Datos de ejemplo. Cada bloque solo inserta si la tabla está vacía.

insert into venues (id, name, zone, surface, price_usd, notes, sort) values
  ('v1', 'Macaracuay Cancha AEF',      'Macaracuay',      null, null, null, 1),
  ('v2', 'Los Samanes Fútbol Park',    'Los Samanes',     null, null, null, 2),
  ('v3', 'San Luis Striker Ground',    'San Luis',        null, null, null, 3),
  ('v4', 'Prados del Este DirecTV',    'Prados del Este', null, null, null, 4)
on conflict (id) do nothing;

do $$
begin
  if not exists (select 1 from matches) then
    insert into matches (round, venue_id, play_date, play_time, home, away, home_goals, away_goals) values
      (1, 'v1', '2026-09-27', '09:00', 'Chaguaramos FC',  'Altamira United', 3, 2),
      (1, 'v3', '2026-09-27', '10:15', 'La Urbina 5',     'Mercedes Sur',    1, 1),
      (1, 'v4', '2026-09-27', '11:30', 'Chacao Pumas',    'Hatillo Rovers',  4, 0),
      (2, 'v2', '2026-10-11', '09:00', 'Altamira United', 'La Urbina 5',     null, null),
      (2, 'v4', '2026-10-11', '10:15', 'Mercedes Sur',    'Chacao Pumas',    null, null),
      (2, 'v1', '2026-10-11', '11:30', 'Hatillo Rovers',  'Chaguaramos FC',  null, null);
  end if;

  if not exists (select 1 from prizes) then
    insert into prizes (title, value_usd, kind, sponsor, sort) values
      ('Campeón de temporada',            1500, 'Efectivo',            'Casa Ejemplo Deportes', 1),
      ('Subcampeón',                       600, 'Efectivo',            'Casa Ejemplo Deportes', 2),
      ('Goleador de la temporada',         250, 'Efectivo + trofeo',   'Bebida Ejemplo',        3),
      ('Mejor portero',                    150, 'Guantes + bono',      'Tienda Ejemplo',        4),
      ('Premio Jornada 2: equipo del día', 120, 'Consumo en cantina',  'Tienda Ejemplo',        5);
  end if;

  if not exists (select 1 from ad_slots) then
    insert into ad_slots (name, type, price_usd, per, descr, priority, sponsor, until, sort) values
      ('Banner principal de la web',            'Digital', 300, 'mes',     'Franja fija en la parte superior de todas las pantallas.',  'Alta',  'Casa Ejemplo Deportes', '2026-12-31', 1),
      ('Banner en tabla de posiciones',         'Digital', 150, 'mes',     'Visible junto a la clasificación y los resultados.',        'Media', null,                    null,         2),
      ('Banner en la ficha de cada sede',       'Digital', 120, 'mes',     'Aparece en la página de la sede que elijas.',               'Media', 'Bebida Ejemplo',        '2026-11-30', 3),
      ('Valla perimetral en cancha',            'Físico',   90, 'jornada', 'Valla de tu marca junto a la cancha durante los partidos.', 'Alta',  null,                    null,         4),
      ('Logo en camiseta de árbitros',          'Físico',   80, 'jornada', 'Tu logo en la camiseta del cuerpo arbitral.',               'Baja',  null,                    null,         5),
      ('Punto de marca en la sede',             'Físico',   60, 'jornada', 'Pendón o stand de tu marca en la sede.',                    'Media', 'Tienda Ejemplo',        '2026-10-31', 6),
      ('Premio de jornada con nombre de marca', 'Físico',  120, 'jornada', 'El premio del equipo del día lleva el nombre de tu marca.', 'Alta',  null,                    null,         7);
  end if;
end $$;
