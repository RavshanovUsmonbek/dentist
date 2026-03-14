package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

// TelegramService handles sending notifications to Telegram
type TelegramService struct {
	botToken string
	chatID   string
}

// NewTelegramService creates a new TelegramService
func NewTelegramService(botToken, chatID string) *TelegramService {
	return &TelegramService{
		botToken: botToken,
		chatID:   chatID,
	}
}

// TelegramMessage represents a message to send via Telegram Bot API
type TelegramMessage struct {
	ChatID    string `json:"chat_id"`
	Text      string `json:"text"`
	ParseMode string `json:"parse_mode"`
}

// SendContactNotification sends a contact form notification to Telegram
func (s *TelegramService) SendContactNotification(name, email, phone, message string) error {
	// Skip if not configured
	if s.botToken == "" || s.chatID == "" {
		return nil // Gracefully skip if not configured
	}

	// Format phone display
	phoneDisplay := phone
	if phoneDisplay == "" {
		phoneDisplay = "Not provided"
	}

	// Create formatted message
	text := fmt.Sprintf(
		"🔔 *New Contact Form Submission*\n\n"+
			"👤 *Name:* %s\n"+
			"📧 *Email:* %s\n"+
			"📱 *Phone:* %s\n\n"+
			"💬 *Message:*\n%s",
		escapeTelegramMarkdown(name),
		escapeTelegramMarkdown(email),
		escapeTelegramMarkdown(phoneDisplay),
		escapeTelegramMarkdown(message),
	)

	msg := TelegramMessage{
		ChatID:    s.chatID,
		Text:      text,
		ParseMode: "Markdown",
	}

	jsonData, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("failed to marshal telegram message: %w", err)
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", s.botToken)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to send telegram request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("telegram API returned status %d", resp.StatusCode)
	}

	return nil
}

// escapeTelegramMarkdown escapes special characters for Telegram Markdown
func escapeTelegramMarkdown(text string) string {
	// Escape special markdown characters
	replacements := map[rune]string{
		'_':  "\\_",
		'*':  "\\*",
		'[':  "\\[",
		']':  "\\]",
		'(':  "\\(",
		')':  "\\)",
		'~':  "\\~",
		'`':  "\\`",
		'>':  "\\>",
		'#':  "\\#",
		'+':  "\\+",
		'-':  "\\-",
		'=':  "\\=",
		'|':  "\\|",
		'{':  "\\{",
		'}':  "\\}",
		'.':  "\\.",
		'!':  "\\!",
	}

	var result []rune
	for _, char := range text {
		if replacement, found := replacements[char]; found {
			for _, r := range replacement {
				result = append(result, r)
			}
		} else {
			result = append(result, char)
		}
	}

	return string(result)
}
