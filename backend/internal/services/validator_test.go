package services

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type testStruct struct {
	Name  string `validate:"required,min=2,max=50"`
	Email string `validate:"required,email"`
	Note  string `validate:"omitempty,max=10"`
}

func TestValidate_Valid(t *testing.T) {
	v := NewValidator()
	data := testStruct{Name: "Alice", Email: "alice@example.com", Note: "short"}
	assert.NoError(t, v.Validate(&data))
}

func TestValidate_MissingRequired(t *testing.T) {
	v := NewValidator()
	data := testStruct{Email: "alice@example.com"}
	err := v.Validate(&data)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "name is required")
}

func TestValidate_InvalidEmail(t *testing.T) {
	v := NewValidator()
	data := testStruct{Name: "Alice", Email: "notanemail"}
	err := v.Validate(&data)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "must be a valid email")
}

func TestValidate_MinLength(t *testing.T) {
	v := NewValidator()
	data := testStruct{Name: "a", Email: "alice@example.com"}
	err := v.Validate(&data)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "at least 2 characters")
}

func TestValidate_MaxLength(t *testing.T) {
	v := NewValidator()
	data := testStruct{Name: "Alice", Email: "alice@example.com", Note: "12345678901"} // 11 chars
	err := v.Validate(&data)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "must not exceed 10")
}

func TestValidate_MultipleErrors(t *testing.T) {
	v := NewValidator()
	data := testStruct{} // both Name and Email missing
	err := v.Validate(&data)
	require.Error(t, err)
	// Both errors should be in the message, joined by "; "
	assert.True(t, strings.Contains(err.Error(), "name") && strings.Contains(err.Error(), "email"))
}

func TestValidate_OptionalFieldEmpty(t *testing.T) {
	v := NewValidator()
	data := testStruct{Name: "Alice", Email: "alice@example.com", Note: ""}
	assert.NoError(t, v.Validate(&data))
}
