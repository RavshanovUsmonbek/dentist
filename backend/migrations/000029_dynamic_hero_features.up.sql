-- Remove the individual fixed feature keys
DELETE FROM site_content
WHERE section = 'hero'
  AND key IN ('feature_1_title','feature_1_desc','feature_2_title','feature_2_desc',
              'feature_3_title','feature_3_desc','feature_4_title','feature_4_desc');

-- Insert a single JSON-array row for all features
INSERT INTO site_content (section, key, value, type) VALUES (
  'hero',
  'features',
  '[{"title":{"uz":"Og''riqsiz Davolash","ru":"Безболезненное Лечение","en":"Pain-Free Treatment"},"desc":{"uz":"Zamonaviy anestezilar va yumshoq texnikalar","ru":"Современная анестезия и щадящие техники","en":"Advanced anesthesia & gentle techniques"}},{"title":{"uz":"Sertifikatlangan Mutaxassislar","ru":"Сертифицированные Специалисты","en":"Certified Specialists"},"desc":{"uz":"Malakali stomatologiya mutaxassislari","ru":"Квалифицированные стоматологи","en":"Board-certified dental professionals"}},{"title":{"uz":"Zamonaviy Uskunalar","ru":"Современное Оборудование","en":"Modern Equipment"},"desc":{"uz":"Yuqori texnologiyali diagnostika va davolash","ru":"Высокотехнологичная диагностика и лечение","en":"High-tech diagnostics & treatment"}},{"title":{"uz":"Xavfsiz va Steril","ru":"Безопасно и Стерильно","en":"Safe & Sterile"},"desc":{"uz":"Shifoxona sifatidagi sterilizatsiya standartlari","ru":"Стандарты стерилизации больничного уровня","en":"Hospital-grade sterilization standards"}}]',
  'json'
)
ON CONFLICT (section, key) DO UPDATE
  SET value = EXCLUDED.value,
      type  = EXCLUDED.type;
