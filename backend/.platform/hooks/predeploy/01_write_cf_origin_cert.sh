#!/usr/bin/env bash
set -u  # don't use -e, we want fail-open

LOG="/var/log/eb-hooks.log"
echo "[cf-origin] predeploy start" | tee -a "$LOG"

CERT_PATH="/etc/pki/tls/certs/cf_origin.crt"
KEY_PATH="/etc/pki/tls/private/cf_origin.key"

mkdir -p /etc/pki/tls/certs /etc/pki/tls/private

# --- your EB bucket paths ---
S3_CERT="s3://elasticbeanstalk-ca-central-1-743298170995/secrets/cloudflare/origin-cert.pem"
S3_KEY="s3://elasticbeanstalk-ca-central-1-743298170995/secrets/cloudflare/origin-key.pem"

# nginx conf locations in EB AL2023:
HTTPS_CONF_SRC="/var/app/staging/.platform/nginx/conf.d/https.conf"
HTTPS_CONF_DST="/var/proxy/staging/nginx/conf.d/https.conf"

disable_https_conf () {
  if [ -f "$HTTPS_CONF_SRC" ]; then
    mv "$HTTPS_CONF_SRC" "${HTTPS_CONF_SRC}.disabled" 2>/dev/null
    echo "[cf-origin] disabled source https.conf (missing cert/key)" | tee -a "$LOG"
  fi
  if [ -f "$HTTPS_CONF_DST" ]; then
    mv "$HTTPS_CONF_DST" "${HTTPS_CONF_DST}.disabled" 2>/dev/null
    echo "[cf-origin] disabled proxy https.conf (missing cert/key)" | tee -a "$LOG"
  fi
}

enable_https_conf () {
  if [ -f "${HTTPS_CONF_SRC}.disabled" ]; then
    mv "${HTTPS_CONF_SRC}.disabled" "$HTTPS_CONF_SRC" 2>/dev/null
    echo "[cf-origin] re-enabled source https.conf" | tee -a "$LOG"
  fi
  if [ -f "${HTTPS_CONF_DST}.disabled" ]; then
    mv "${HTTPS_CONF_DST}.disabled" "$HTTPS_CONF_DST" 2>/dev/null
    echo "[cf-origin] re-enabled proxy https.conf" | tee -a "$LOG"
  fi
}

# Try to download from S3 (FAIL-OPEN)
echo "[cf-origin] pulling cert/key from S3" | tee -a "$LOG"

aws s3 cp "$S3_CERT" "$CERT_PATH" 2>>"$LOG"
CERT_OK=$?
aws s3 cp "$S3_KEY"  "$KEY_PATH"  2>>"$LOG"
KEY_OK=$?

if [ $CERT_OK -ne 0 ] || [ $KEY_OK -ne 0 ]; then
  echo "[cf-origin] WARNING: s3 cp failed (CERT_OK=$CERT_OK KEY_OK=$KEY_OK). HTTPS will be disabled." | tee -a "$LOG"
  rm -f "$CERT_PATH" "$KEY_PATH" 2>/dev/null
  disable_https_conf
  exit 0
fi

# Validate files exist and are non-empty
if [ ! -s "$CERT_PATH" ] || [ ! -s "$KEY_PATH" ]; then
  echo "[cf-origin] WARNING: cert/key empty or missing after download. HTTPS will be disabled." | tee -a "$LOG"
  rm -f "$CERT_PATH" "$KEY_PATH" 2>/dev/null
  disable_https_conf
  exit 0
fi

chmod 644 "$CERT_PATH"
chmod 600 "$KEY_PATH"

# Optional sanity check: key matches cert (non-fatal)
openssl x509 -noout -modulus -in "$CERT_PATH" | openssl md5 >/tmp/cert.md5 2>>"$LOG" || true
openssl rsa  -noout -modulus -in "$KEY_PATH"  | openssl md5 >/tmp/key.md5  2>>"$LOG" || true
if [ -f /tmp/cert.md5 ] && [ -f /tmp/key.md5 ] && ! cmp -s /tmp/cert.md5 /tmp/key.md5; then
  echo "[cf-origin] WARNING: cert/key do not match. HTTPS will be disabled." | tee -a "$LOG"
  rm -f "$CERT_PATH" "$KEY_PATH" 2>/dev/null
  disable_https_conf
  exit 0
fi

enable_https_conf
echo "[cf-origin] cert/key installed; HTTPS enabled" | tee -a "$LOG"
exit 0