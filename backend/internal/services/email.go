package services

import (
	"fmt"
	"strconv"

	"github.com/usmonbek/dentist-backend/internal/models"
	"gopkg.in/gomail.v2"
)

type EmailService struct {
	Host       string
	Port       int
	Username   string
	Password   string
	Recipient  string
}

func NewEmailService(host, port, username, password, recipient string) (*EmailService, error) {
	portInt, err := strconv.Atoi(port)
	if err != nil {
		return nil, fmt.Errorf("invalid SMTP port: %w", err)
	}

	return &EmailService{
		Host:       host,
		Port:       portInt,
		Username:   username,
		Password:   password,
		Recipient:  recipient,
	}, nil
}

func (s *EmailService) SendContactEmail(contact *models.ContactRequest) error {
	m := gomail.NewMessage()
	m.SetHeader("From", s.Username)
	m.SetHeader("To", s.Recipient)
	m.SetHeader("Subject", "New Contact Form Submission - Dentist Website")

	phoneInfo := contact.Phone
	if phoneInfo == "" {
		phoneInfo = "Not provided"
	}

	body := fmt.Sprintf(`
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background-color: #0369a1; color: white; padding: 20px; text-align: center; }
				.content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
				.field { margin-bottom: 15px; }
				.label { font-weight: bold; color: #0369a1; }
				.value { margin-left: 10px; }
				.footer { margin-top: 20px; padding: 10px; text-align: center; font-size: 12px; color: #666; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h2>New Contact Form Submission</h2>
				</div>
				<div class="content">
					<div class="field">
						<span class="label">Name:</span>
						<span class="value">%s</span>
					</div>
					<div class="field">
						<span class="label">Email:</span>
						<span class="value">%s</span>
					</div>
					<div class="field">
						<span class="label">Phone:</span>
						<span class="value">%s</span>
					</div>
					<div class="field">
						<span class="label">Message:</span>
						<div class="value" style="margin-top: 10px; padding: 10px; background-color: white; border-left: 3px solid #0369a1;">
							%s
						</div>
					</div>
					<div class="field">
						<span class="label">Submitted at:</span>
						<span class="value">%s</span>
					</div>
				</div>
				<div class="footer">
					This email was sent from your dentist website contact form.
				</div>
			</div>
		</body>
		</html>
	`, contact.Name, contact.Email, phoneInfo, contact.Message, contact.Timestamp.Format("January 2, 2006 at 3:04 PM"))

	m.SetBody("text/html", body)

	d := gomail.NewDialer(s.Host, s.Port, s.Username, s.Password)

	if err := d.DialAndSend(m); err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}
