package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// ── parseIDFromPath ─────────────────────────────────────────────────────────

func TestParseIDFromPath_Valid(t *testing.T) {
	cases := []struct {
		path     string
		expected uint
	}{
		{"/api/admin/services/42", 42},
		{"/api/admin/services/1", 1},
		{"/api/admin/snapshots/100", 100},
	}

	for _, tc := range cases {
		t.Run(tc.path, func(t *testing.T) {
			id, err := parseIDFromPath(tc.path)
			require.NoError(t, err)
			assert.Equal(t, tc.expected, id)
		})
	}
}

func TestParseIDFromPath_TrailingSlash(t *testing.T) {
	id, err := parseIDFromPath("/api/admin/services/42/")
	require.NoError(t, err)
	assert.Equal(t, uint(42), id)
}

func TestParseIDFromPath_WithSuffix(t *testing.T) {
	// /restore suffix is stripped before calling parseIDFromPath in handlers
	id, err := parseIDFromPath("/api/admin/snapshots/7")
	require.NoError(t, err)
	assert.Equal(t, uint(7), id)
}

func TestParseIDFromPath_NonNumeric(t *testing.T) {
	_, err := parseIDFromPath("/api/admin/services/abc")
	assert.Error(t, err)
}

func TestParseIDFromPath_Empty(t *testing.T) {
	_, err := parseIDFromPath("/api/admin/services/")
	assert.Error(t, err)
}

// ── response helpers ────────────────────────────────────────────────────────

func recordResponse(handler func(w http.ResponseWriter, r *http.Request)) *httptest.ResponseRecorder {
	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodGet, "/", nil)
	handler(w, r)
	return w
}

func decodeResponse(t *testing.T, w *httptest.ResponseRecorder) JSONResponse {
	t.Helper()
	var resp JSONResponse
	require.NoError(t, json.NewDecoder(w.Body).Decode(&resp))
	return resp
}

func TestSendSuccess(t *testing.T) {
	w := httptest.NewRecorder()
	sendSuccess(w, map[string]string{"key": "value"})

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, "application/json", w.Header().Get("Content-Type"))

	resp := decodeResponse(t, w)
	assert.True(t, resp.Success)
	assert.Nil(t, nil, resp.Error)
}

func TestSendCreated(t *testing.T) {
	w := httptest.NewRecorder()
	sendCreated(w, map[string]string{"id": "1"})

	assert.Equal(t, http.StatusCreated, w.Code)
	resp := decodeResponse(t, w)
	assert.True(t, resp.Success)
}

func TestSendSuccessMessage(t *testing.T) {
	w := httptest.NewRecorder()
	sendSuccessMessage(w, "done")

	assert.Equal(t, http.StatusOK, w.Code)
	resp := decodeResponse(t, w)
	assert.True(t, resp.Success)
	assert.Equal(t, "done", resp.Message)
}

func TestSendBadRequest(t *testing.T) {
	w := httptest.NewRecorder()
	sendBadRequest(w, "bad input")

	assert.Equal(t, http.StatusBadRequest, w.Code)
	resp := decodeResponse(t, w)
	assert.False(t, resp.Success)
	assert.Equal(t, "bad input", resp.Error)
}

func TestSendNotFound(t *testing.T) {
	w := httptest.NewRecorder()
	sendNotFound(w, "not found")

	assert.Equal(t, http.StatusNotFound, w.Code)
	resp := decodeResponse(t, w)
	assert.False(t, resp.Success)
}

func TestSendInternalError(t *testing.T) {
	w := httptest.NewRecorder()
	sendInternalError(w, "server error")

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	resp := decodeResponse(t, w)
	assert.False(t, resp.Success)
}

func TestSendMethodNotAllowed(t *testing.T) {
	w := httptest.NewRecorder()
	sendMethodNotAllowed(w)

	assert.Equal(t, http.StatusMethodNotAllowed, w.Code)
	resp := decodeResponse(t, w)
	assert.False(t, resp.Success)
}

func TestSendUnauthorized(t *testing.T) {
	w := httptest.NewRecorder()
	sendUnauthorized(w, "unauthorized")

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	resp := decodeResponse(t, w)
	assert.False(t, resp.Success)
	assert.Equal(t, "unauthorized", resp.Error)
}
