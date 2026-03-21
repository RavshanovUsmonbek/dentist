-- Seed uz/ru/en translations for all site_content rows
-- Hero section
UPDATE site_content SET translations = jsonb_build_object(
  'uz', 'Tabassumingiz — bizning ustuvorligimiz',
  'ru', 'Ваша улыбка — наш приоритет',
  'en', 'Your Smile, Our Priority'
) WHERE section = 'hero' AND key = 'title';

UPDATE site_content SET translations = jsonb_build_object(
  'uz', 'Zamonaviy texnologiyalar va og''iz sog''lig''ingizga bag''ishlangan mehribon jamoa bilan ajoyib stomatologik xizmatdan bahramand bo''ling.',
  'ru', 'Получите превосходную стоматологическую помощь с использованием передовых технологий и заботливой команды, посвящённой здоровью вашей полости рта.',
  'en', 'Experience exceptional dental care with state-of-the-art technology and a compassionate team dedicated to your oral health.'
) WHERE section = 'hero' AND key = 'subtitle';

UPDATE site_content SET translations = jsonb_build_object(
  'uz', 'Qabulga yozilish',
  'ru', 'Записаться на приём',
  'en', 'Schedule Appointment'
) WHERE section = 'hero' AND key = 'cta_primary_text';

UPDATE site_content SET translations = jsonb_build_object(
  'uz', 'Bizning xizmatlar',
  'ru', 'Наши услуги',
  'en', 'Our Services'
) WHERE section = 'hero' AND key = 'cta_secondary_text';

-- About section
UPDATE site_content SET translations = jsonb_build_object(
  'uz', 'Dr. Sara Smit, DDS',
  'ru', 'Д-р Сара Смит, DDS',
  'en', 'Dr. Sarah Smith, DDS'
) WHERE section = 'about' AND key = 'doctor_name';

UPDATE site_content SET translations = jsonb_build_object(
  'uz', '<p>Smile Dental Care klinikasiga xush kelibsiz! Men Dr. Sara Smit, 15 yildan ortiq vaqt davomida stomatologiyaga ishtiyoq bilan xizmat qilib kelaman. Maqsadim — sizga qulay va iliq muhitda eng yuqori sifatli stomatologik yordam ko''rsatishdir.</p><p>Har bir bemorga shaxsiy e''tibor va uning ehtiyojlariga moslashtirilgan davolanish rejasi taqdim etilishiga ishonamanو. Oddiy profilaktik tozalashdan to to''liq tabassum tiklanishigacha — siz professional va g''amxo''r qo''llarda ekanligingizga ishonchingiz komil bo''lishi mumkin.</p>',
  'ru', '<p>Добро пожаловать в Smile Dental Care! Я — д-р Сара Смит, и вот уже более 15 лет я с увлечением занимаюсь стоматологией. Моя цель — обеспечить вам стоматологическую помощь высочайшего качества в комфортной и гостеприимной обстановке.</p><p>Я убеждена, что каждый пациент заслуживает индивидуального внимания и плана лечения, адаптированного под его уникальные потребности. Будь то обычная гигиеническая чистка или полное преображение улыбки — вы можете быть уверены, что находитесь в надёжных и заботливых руках.</p>',
  'en', '<p>Welcome to Smile Dental Care! I''m Dr. Sarah Smith, and I''ve been passionate about dentistry for over 15 years. My commitment is to provide you with the highest quality dental care in a comfortable, welcoming environment.</p><p>I believe that every patient deserves personalized attention and a treatment plan tailored to their unique needs. Whether you''re here for a routine cleaning or a complete smile makeover, you can trust that you''re in capable, caring hands.</p>'
) WHERE section = 'about' AND key = 'about_text';

UPDATE site_content SET translations = jsonb_build_object(
  'uz', jsonb_build_array('Stomatologiya doktori, Kaliforniya universiteti', 'Kengaytirilgan kosmetik stomatologiya sertifikati'),
  'ru', jsonb_build_array('Доктор стоматологии, Калифорнийский университет', 'Сертификат по продвинутой косметической стоматологии'),
  'en', jsonb_build_array('Doctor of Dental Surgery, University of California', 'Advanced Cosmetic Dentistry Certification')
) WHERE section = 'about' AND key = 'education';

UPDATE site_content SET translations = jsonb_build_object(
  'uz', jsonb_build_array('15 yildan ortiq stomatologik amaliyot', 'Kosmetik va restavratsion stomatologiya mutaxassisi'),
  'ru', jsonb_build_array('Более 15 лет стоматологической практики', 'Специалист по косметической и восстановительной стоматологии'),
  'en', jsonb_build_array('15+ years of dental practice', 'Specialist in cosmetic and restorative dentistry')
) WHERE section = 'about' AND key = 'experience';

UPDATE site_content SET translations = jsonb_build_object(
  'uz', jsonb_build_array('Amerika stomatologlar assotsiatsiyasi a''zosi', '2023 yil eng yaxshi stomatolog mukofoti'),
  'ru', jsonb_build_array('Член Американской стоматологической ассоциации', 'Награда «Лучший стоматолог 2023»'),
  'en', jsonb_build_array('American Dental Association Member', 'Best Dentist Award 2023')
) WHERE section = 'about' AND key = 'awards';

-- Services section
UPDATE site_content SET translations = jsonb_build_object(
  'uz', 'Bizning xizmatlar',
  'ru', 'Наши услуги',
  'en', 'Our Services'
) WHERE section = 'services' AND key = 'title';

UPDATE site_content SET translations = jsonb_build_object(
  'uz', 'Ehtiyojlaringizga moslashtirilgan keng qamrovli professional xizmatlar',
  'ru', 'Комплексные профессиональные услуги, адаптированные под ваши нужды',
  'en', 'Comprehensive professional services tailored to your needs'
) WHERE section = 'services' AND key = 'subtitle';

-- Testimonials section
UPDATE site_content SET translations = jsonb_build_object(
  'uz', 'Mijozlar fikrlari',
  'ru', 'Отзывы клиентов',
  'en', 'Client Testimonials'
) WHERE section = 'testimonials' AND key = 'title';

UPDATE site_content SET translations = jsonb_build_object(
  'uz', 'Mijozlarimizning o''z tajribalari haqida nima deyishlarini eshiting',
  'ru', 'Послушайте, что говорят наши клиенты о своём опыте',
  'en', 'Hear what our clients have to say about their experience'
) WHERE section = 'testimonials' AND key = 'subtitle';

-- Contact section
UPDATE site_content SET translations = jsonb_build_object(
  'uz', 'Biz bilan bog''laning',
  'ru', 'Свяжитесь с нами',
  'en', 'Contact Us'
) WHERE section = 'contact' AND key = 'title';

UPDATE site_content SET translations = jsonb_build_object(
  'uz', 'Savollaringiz bormi yoki qabulga yozilmoqchimisiz? Sizdan xabar olishdan xursand bo''lamiz. Quyidagi shaklni to''ldiring yoki bizga qo''ng''iroq qiling.',
  'ru', 'Есть вопросы или хотите записаться на приём? Мы будем рады услышать вас. Заполните форму ниже или позвоните нам.',
  'en', 'Have questions or want to schedule an appointment? We''d love to hear from you. Fill out the form below or give us a call.'
) WHERE section = 'contact' AND key = 'subtitle';

UPDATE site_content SET translations = jsonb_build_object(
  'uz', 'Xabar yuborish',
  'ru', 'Отправить сообщение',
  'en', 'Send us a Message'
) WHERE section = 'contact' AND key = 'form_title';

UPDATE site_content SET translations = jsonb_build_object(
  'uz', 'Murojatingiz uchun rahmat! Tez orada javob beramiz.',
  'ru', 'Спасибо за обращение! Мы свяжемся с вами в ближайшее время.',
  'en', 'Thank you for contacting us! We''ll get back to you soon.'
) WHERE section = 'contact' AND key = 'success_message';

UPDATE site_content SET translations = jsonb_build_object(
  'uz', 'Ish vaqti',
  'ru', 'Часы работы',
  'en', 'Business Hours'
) WHERE section = 'contact' AND key = 'hours_title';

-- Footer section
UPDATE site_content SET translations = jsonb_build_object(
  'uz', 'Mehr va mahorat bilan ajoyib stomatologik xizmat ko''rsatish. Tabassumingiz bizning ustuvorligimiz.',
  'ru', 'Предоставляем исключительную стоматологическую помощь с заботой и профессионализмом. Ваша улыбка — наш приоритет.',
  'en', 'Providing exceptional dental care with compassion and expertise. Your smile is our priority.'
) WHERE section = 'footer' AND key = 'description';

UPDATE site_content SET translations = jsonb_build_object(
  'uz', 'Smile Dental Care. Barcha huquqlar himoyalangan.',
  'ru', 'Smile Dental Care. Все права защищены.',
  'en', 'Smile Dental Care. All rights reserved.'
) WHERE section = 'footer' AND key = 'copyright_text';

UPDATE site_content SET translations = jsonb_build_object(
  'uz', 'Ish vaqti',
  'ru', 'Часы работы',
  'en', 'Hours'
) WHERE section = 'footer' AND key = 'hours_title';
