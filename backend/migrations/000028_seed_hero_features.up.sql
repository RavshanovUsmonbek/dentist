INSERT INTO site_content (section, key, value, type, translations) VALUES
  ('hero', 'feature_1_title', 'Pain-Free Treatment',   'text', '{"uz":"Og''riqsiz Davolash","ru":"Безболезненное Лечение","en":"Pain-Free Treatment"}'),
  ('hero', 'feature_1_desc',  'Advanced anesthesia & gentle techniques', 'text', '{"uz":"Zamonaviy anestezilar va yumshoq texnikalar","ru":"Современная анестезия и щадящие техники","en":"Advanced anesthesia & gentle techniques"}'),
  ('hero', 'feature_2_title', 'Certified Specialists',  'text', '{"uz":"Sertifikatlangan Mutaxassislar","ru":"Сертифицированные Специалисты","en":"Certified Specialists"}'),
  ('hero', 'feature_2_desc',  'Board-certified dental professionals', 'text', '{"uz":"Malakali stomatologiya mutaxassislari","ru":"Квалифицированные стоматологи","en":"Board-certified dental professionals"}'),
  ('hero', 'feature_3_title', 'Modern Equipment',       'text', '{"uz":"Zamonaviy Uskunalar","ru":"Современное Оборудование","en":"Modern Equipment"}'),
  ('hero', 'feature_3_desc',  'High-tech diagnostics & treatment', 'text', '{"uz":"Yuqori texnologiyali diagnostika va davolash","ru":"Высокотехнологичная диагностика и лечение","en":"High-tech diagnostics & treatment"}'),
  ('hero', 'feature_4_title', 'Safe & Sterile',         'text', '{"uz":"Xavfsiz va Steril","ru":"Безопасно и Стерильно","en":"Safe & Sterile"}'),
  ('hero', 'feature_4_desc',  'Hospital-grade sterilization standards', 'text', '{"uz":"Shifoxona sifatidagi sterilizatsiya standartlari","ru":"Стандарты стерилизации больничного уровня","en":"Hospital-grade sterilization standards"}')
ON CONFLICT (section, key) DO UPDATE
  SET value = EXCLUDED.value,
      translations = EXCLUDED.translations;
