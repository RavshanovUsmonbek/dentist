package services

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

type Validator struct {
	validate *validator.Validate
}

func NewValidator() *Validator {
	return &Validator{
		validate: validator.New(),
	}
}

func (v *Validator) Validate(data interface{}) error {
	if err := v.validate.Struct(data); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			return formatValidationErrors(validationErrors)
		}
		return err
	}
	return nil
}

func formatValidationErrors(errors validator.ValidationErrors) error {
	var messages []string

	for _, err := range errors {
		var message string
		field := strings.ToLower(err.Field())

		switch err.Tag() {
		case "required":
			message = fmt.Sprintf("%s is required", field)
		case "email":
			message = fmt.Sprintf("%s must be a valid email address", field)
		case "min":
			message = fmt.Sprintf("%s must be at least %s characters long", field, err.Param())
		case "max":
			message = fmt.Sprintf("%s must not exceed %s characters", field, err.Param())
		default:
			message = fmt.Sprintf("%s is invalid", field)
		}

		messages = append(messages, message)
	}

	return fmt.Errorf(strings.Join(messages, "; "))
}
