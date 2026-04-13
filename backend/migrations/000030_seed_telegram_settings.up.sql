INSERT INTO site_settings (key, value, type, description, translations, updated_at)
VALUES
  ('telegram_bot_token', '', 'string', 'Telegram bot token from @BotFather', '{}', NOW()),
  ('telegram_chat_id',   '', 'string', 'Telegram chat ID to receive notifications', '{}', NOW())
ON CONFLICT (key) DO NOTHING;
