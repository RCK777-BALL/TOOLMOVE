#!/usr/bin/env bash
set -euo pipefail

LOG="/var/log/eb-hooks.log"
echo "[cf-origin] predeploy start" | tee -a "$LOG"

APP_HTTPS="/var/app/staging/.platform/nginx/conf.d/https.conf"
APP_HTTPS_DISABLED="/var/app/staging/.platform/nginx/conf.d/https.conf.disabled"

PROXY_HTTPS="/var/proxy/staging/nginx/conf.d/https.conf"
PROXY_HTTPS_DISABLED="/var/proxy/staging/nginx/conf.d/https.conf.disabled"

CERT_PATH="/etc/pki/tls/certs/cf_origin.crt"
KEY_PATH="/etc/pki/tls/private/cf_origin.key"
mkdir -p "$(dirname "$CERT_PATH")" "$(dirname "$KEY_PATH")"

disable_https () {
  echo "[cf-origin] disabling https.conf" | tee -a "$LOG"
  [[ -f "$APP_HTTPS" ]] && mv -f "$APP_HTTPS" "$APP_HTTPS_DISABLED" || true
  [[ -f "$PROXY_HTTPS" ]] && mv -f "$PROXY_HTTPS" "$PROXY_HTTPS_DISABLED" || true
}

enable_https () {
  echo "[cf-origin] enabling https.conf" | tee -a "$LOG"
  [[ -f "$APP_HTTPS_DISABLED" ]] && mv -f "$APP_HTTPS_DISABLED" "$APP_HTTPS" || true
  [[ -f "$PROXY_HTTPS_DISABLED" ]] && mv -f "$PROXY_HTTPS_DISABLED" "$PROXY_HTTPS" || true
}

# If vars missing, disable https and exit cleanly
if [[ -z "${CF_ORIGIN_CERT_B64:-}" || -z "${CF_ORIGIN_KEY_B64:-}" ]]; then
  echo "[cf-origin] vars missing; disabling https.conf" | tee -a "$LOG"
  disable_https
  exit 0
fi

# Vars exist: enable https + write files
enable_https

echo -n "$CF_ORIGIN_CERT_B64" | base64 -d > "$CERT_PATH"
echo -n "$CF_ORIGIN_KEY_B64"  | base64 -d > "$KEY_PATH"
chmod 644 "$CERT_PATH"
chmod 600 "$KEY_PATH"

echo "[cf-origin] wrote cert/key OK" | tee -a "$LOG"