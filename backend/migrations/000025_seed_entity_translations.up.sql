-- Add translations column to gallery_categories (missed in migration 023)
ALTER TABLE gallery_categories ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;
UPDATE gallery_categories SET translations = jsonb_build_object('label', jsonb_build_object('uz', label), 'description', jsonb_build_object('uz', COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_gallery_categories_translations ON gallery_categories USING gin(translations);

-- =============================================
-- Services translations (uz/ru/en)
-- =============================================
UPDATE services SET translations = jsonb_build_object(
  'title', jsonb_build_object(
    'uz', 'Umumiy stomatologiya',
    'ru', 'Общая стоматология',
    'en', 'General Dentistry'
  ),
  'description', jsonb_build_object(
    'uz', 'Og''iz sog''lig''ingizni saqlash uchun keng qamrovli tish tekshiruvi, tozalash va profilaktika xizmatlari.',
    'ru', 'Комплексные стоматологические осмотры, чистка и профилактические процедуры для поддержания здоровья полости рта.',
    'en', 'Comprehensive dental checkups, cleanings, and preventive care to maintain your oral health.'
  )
) WHERE title = 'General Dentistry';

UPDATE services SET translations = jsonb_build_object(
  'title', jsonb_build_object(
    'uz', 'Kosmetik stomatologiya',
    'ru', 'Косметическая стоматология',
    'en', 'Cosmetic Dentistry'
  ),
  'description', jsonb_build_object(
    'uz', 'Tishlarni oqartirish, vinir va professional tabassum yaratish orqali tabassumingizni o''zgartiring.',
    'ru', 'Преобразите свою улыбку с помощью отбеливания зубов, виниров и профессионального изменения улыбки.',
    'en', 'Transform your smile with teeth whitening, veneers, and professional smile makeovers.'
  )
) WHERE title = 'Cosmetic Dentistry';

UPDATE services SET translations = jsonb_build_object(
  'title', jsonb_build_object(
    'uz', 'Tish implantlari',
    'ru', 'Зубные импланты',
    'en', 'Dental Implants'
  ),
  'description', jsonb_build_object(
    'uz', 'Zamonaviy implant texnologiyasi yordamida yo''qolgan tishlarni almashtirish uchun doimiy, tabiiy ko''rinishli yechim.',
    'ru', 'Постоянное, естественно выглядящее решение для замены недостающих зубов с использованием передовых технологий имплантации.',
    'en', 'Permanent, natural-looking solution for missing teeth with advanced implant technology.'
  )
) WHERE title = 'Dental Implants';

UPDATE services SET translations = jsonb_build_object(
  'title', jsonb_build_object(
    'uz', 'Ortodontiya',
    'ru', 'Ортодонтия',
    'en', 'Orthodontics'
  ),
  'description', jsonb_build_object(
    'uz', 'An''anaviy breketlar yoki zamonaviy shaffof to''g''rilagichlar yordamida tishlaringizni to''g''rilang.',
    'ru', 'Выпрямите зубы с помощью традиционных брекетов или современных прозрачных элайнеров.',
    'en', 'Straighten your teeth with traditional braces or modern clear aligner systems.'
  )
) WHERE title = 'Orthodontics';

UPDATE services SET translations = jsonb_build_object(
  'title', jsonb_build_object(
    'uz', 'Kanal davolash',
    'ru', 'Лечение корневых каналов',
    'en', 'Root Canal Treatment'
  ),
  'description', jsonb_build_object(
    'uz', 'Zararlangan tishlarni saqlab qolish va noqulaylikni bartaraf etish uchun og''riqsiz kanal terapiyasi.',
    'ru', 'Безболезненная терапия корневых каналов для сохранения инфицированных зубов и устранения дискомфорта.',
    'en', 'Pain-free root canal therapy to save infected teeth and relieve discomfort.'
  )
) WHERE title = 'Root Canal Treatment';

UPDATE services SET translations = jsonb_build_object(
  'title', jsonb_build_object(
    'uz', 'Shoshilinch stomatologik yordam',
    'ru', 'Экстренная стоматологическая помощь',
    'en', 'Emergency Dental Care'
  ),
  'description', jsonb_build_object(
    'uz', 'Stomatologik favqulodda vaziyatlar, tish og''rig''i va shoshilinch og''iz sog''lig''i muammolari uchun zudlik bilan yordam.',
    'ru', 'Немедленная помощь при стоматологических экстренных ситуациях, зубной боли и срочных проблемах полости рта.',
    'en', 'Immediate attention for dental emergencies, toothaches, and urgent oral health issues.'
  )
) WHERE title = 'Emergency Dental Care';

-- =============================================
-- Gallery Categories translations (uz/ru/en)
-- =============================================
UPDATE gallery_categories SET translations = jsonb_build_object(
  'label', jsonb_build_object('uz', 'Umumiy', 'ru', 'Общее', 'en', 'General'),
  'description', jsonb_build_object('uz', 'Umumiy galereya rasmlari', 'ru', 'Общие фотографии галереи', 'en', 'General gallery images')
) WHERE slug = 'general';

UPDATE gallery_categories SET translations = jsonb_build_object(
  'label', jsonb_build_object('uz', 'Ish misollari', 'ru', 'Клинические случаи', 'en', 'Case Studies'),
  'description', jsonb_build_object('uz', 'Davolashdan oldin va keyin', 'ru', 'Случаи до и после лечения', 'en', 'Before and after case studies')
) WHERE slug = 'case_studies';

UPDATE gallery_categories SET translations = jsonb_build_object(
  'label', jsonb_build_object('uz', 'Diplomlar va sertifikatlar', 'ru', 'Дипломы и сертификаты', 'en', 'Diplomas & Certifications'),
  'description', jsonb_build_object('uz', 'Professional malakalar va sertifikatlar', 'ru', 'Профессиональные дипломы и сертификаты', 'en', 'Professional credentials and certifications')
) WHERE slug = 'diplomas';

UPDATE gallery_categories SET translations = jsonb_build_object(
  'label', jsonb_build_object('uz', 'Konferentsiyalar va tadbirlar', 'ru', 'Конференции и мероприятия', 'en', 'Conferences & Events'),
  'description', jsonb_build_object('uz', 'Qatnashilgan professional konferentsiyalar va tadbirlar', 'ru', 'Профессиональные конференции и мероприятия', 'en', 'Professional conferences and events attended')
) WHERE slug = 'conferences';

-- =============================================
-- Locations translations (uz/ru/en)
-- =============================================
UPDATE locations SET translations = jsonb_build_object(
  'name', jsonb_build_object('uz', 'Asosiy ofis', 'ru', 'Главный офис', 'en', 'Main Office'),
  'address', jsonb_build_object('uz', '123 Tibbiy maydon, 100-xona', 'ru', '123 Медицинская площадь, кабинет 100', 'en', '123 Medical Plaza, Suite 100')
) WHERE name = 'Main Office';

UPDATE locations SET translations = jsonb_build_object(
  'name', jsonb_build_object('uz', 'G''arbiy klinika', 'ru', 'Западная клиника', 'en', 'West Side Clinic'),
  'address', jsonb_build_object('uz', '456 G''arbiy prospekt, 2-qavat', 'ru', '456 Западный проспект, этаж 2', 'en', '456 West Avenue, Floor 2')
) WHERE name = 'West Side Clinic';

-- =============================================
-- Testimonials translations (uz/ru/en)
-- =============================================
UPDATE testimonials SET translations = jsonb_build_object(
  'name', jsonb_build_object('uz', 'Sara Jonson', 'ru', 'Сара Джонсон', 'en', 'Sarah Johnson'),
  'text', jsonb_build_object(
    'uz', 'Men hayotimda ko''rgan eng yaxshi stomatologik tajriba! Xodimlar nihoyatda professional va g''amxo''r. Tishlarim hech qachon bunday yaxshi ko''rinmagan.',
    'ru', 'Лучший стоматологический опыт в моей жизни! Персонал невероятно профессиональный и заботливый. Мои зубы никогда не выглядели так хорошо.',
    'en', 'Best dental experience I''ve ever had! The staff is incredibly professional and caring. My teeth have never looked better.'
  )
) WHERE name = 'Sarah Johnson';

UPDATE testimonials SET translations = jsonb_build_object(
  'name', jsonb_build_object('uz', 'Maykl Chen', 'ru', 'Майкл Чен', 'en', 'Michael Chen'),
  'text', jsonb_build_object(
    'uz', 'Tish implantatsiyasi protsedurasi oldidan xavotir olgan edim, lekin Dr. Smit meni to''liq tinchlantirdi. Natijalar kutganlarimdan ham yaxshi bo''ldi!',
    'ru', 'Я волновался перед процедурой установки имплантата, но д-р Смит полностью успокоила меня. Результаты превзошли мои ожидания!',
    'en', 'I was nervous about my dental implant procedure, but Dr. Smith made me feel completely at ease. The results exceeded my expectations!'
  )
) WHERE name = 'Michael Chen';

UPDATE testimonials SET translations = jsonb_build_object(
  'name', jsonb_build_object('uz', 'Emili Rodriges', 'ru', 'Эмили Родригес', 'en', 'Emily Rodriguez'),
  'text', jsonb_build_object(
    'uz', 'Boshidan oxirigacha ajoyib xizmat. Ofis zamonaviy, toza, butun jamoa do''stona va bilimli. Tavsiya qilaman!',
    'ru', 'Фантастический сервис от начала до конца. Офис современный, чистый, и вся команда дружелюбная и компетентная. Очень рекомендую!',
    'en', 'Fantastic service from start to finish. The office is modern, clean, and the entire team is friendly and knowledgeable. Highly recommend!'
  )
) WHERE name = 'Emily Rodriguez';

UPDATE testimonials SET translations = jsonb_build_object(
  'name', jsonb_build_object('uz', 'Devid Tompson', 'ru', 'Дэвид Томпсон', 'en', 'David Thompson'),
  'text', jsonb_build_object(
    'uz', 'Stomatologdan yillar davomida qochib yurganimdan so''ng, nihoyat ishonchim komil bo''lgan klinikani topdim. Ular hamma narsani tushuntiradi va sizi qulay his qildiradi.',
    'ru', 'После многих лет уклонения от стоматолога я наконец нашёл клинику, которой доверяю. Они объясняют всё и помогают чувствовать себя комфортно.',
    'en', 'After years of avoiding the dentist, I finally found a practice I trust. They take the time to explain everything and make you feel comfortable.'
  )
) WHERE name = 'David Thompson';

UPDATE testimonials SET translations = jsonb_build_object(
  'name', jsonb_build_object('uz', 'Jessika Martines', 'ru', 'Джессика Мартинес', 'en', 'Jessica Martinez'),
  'text', jsonb_build_object(
    'uz', 'Vinir bilan tabassumimni o''zgartirish hayotimni o''zgartirdi! Ajoyib g''amxo''rlik va tafsilotlarga e''tibor uchun rahmat.',
    'ru', 'Преображение улыбки с помощью виниров изменило мою жизнь! Спасибо за исключительную заботу и внимание к деталям.',
    'en', 'My smile transformation with veneers has changed my life! Thank you for the exceptional care and attention to detail.'
  )
) WHERE name = 'Jessica Martinez';

UPDATE testimonials SET translations = jsonb_build_object(
  'name', jsonb_build_object('uz', 'Robert Uilson', 'ru', 'Роберт Уилсон', 'en', 'Robert Wilson'),
  'text', jsonb_build_object(
    'uz', 'Shoshilinch tashrifga tezkor va professional munosabat ko''rsatildi. Ular meni darhol qabul qilishdi va og''riqni tezda bartaraf etishdi. Cheksiz minnatdorman!',
    'ru', 'Экстренный визит был обработан оперативно и профессионально. Меня приняли сразу и быстро избавили от боли. Вечно благодарен!',
    'en', 'Emergency visit was handled promptly and professionally. They got me in right away and relieved my pain quickly. Forever grateful!'
  )
) WHERE name = 'Robert Wilson';
