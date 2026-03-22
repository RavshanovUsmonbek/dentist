# VPS Deployment — One-Time Setup

After completing this guide, all future deploys happen automatically on every push to `main`.

**Prerequisites:**
- VPS running Ubuntu 22.04+ with SSH access
- Repo hosted on GitHub

---

## Part A — Local machine (do this first)

### Step 1 — Set HTTP-only Nginx config

No domain yet, so use a plain HTTP config. Replace the entire contents of `nginx/conf.d/default.conf` with:

```nginx
~upstream backend {
    server backend:8080;
}

upstream frontend {
    server frontend:80;
}

server {
    listen 80;
    server_name _;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_request_buffering off;
    }

    location /uploads/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_intercept_errors on;
        error_page 404 = @frontend;
    }

    location @frontend {
        proxy_pass http://frontend;
    }
}~
```

Commit and push:

```bash
git add nginx/conf.d/default.conf
git commit -m "Nginx HTTP-only config (no domain yet)"
git push
```

---

## Part B — VPS (SSH in as the deploy user, run top to bottom)

### Step 2 — Install Docker and Git

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl

# Install Docker from Docker's official repo (includes the compose plugin)
curl -fsSL https://get.docker.com | sudo sh

# Allow your user to run Docker without sudo
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker compose version
```

### Step 3 — Clone the repository

```bash
sudo mkdir -p /opt/dentist
sudo chown $USER:$USER /opt/dentist
cd /opt/dentist

# Public repo
git clone https://github.com/<your-org>/<your-repo>.git .

# Private repo — use SSH (requires deploy key added to GitHub first; see Step 5)
# git clone git@github.com:<your-org>/<your-repo>.git .
```

### Step 4 — Create the production environment file

Generate secrets:

```bash
openssl rand -hex 20        # → use as POSTGRES_PASSWORD
openssl rand -base64 32     # → use as JWT_SECRET
```

Create the file:

```bash
nano /opt/dentist/.env.production
```

Paste and fill in your values:

```env
# ── Docker mode ────────────────────────────────────────
BACKEND_DOCKERFILE=Dockerfile
FRONTEND_DOCKERFILE=Dockerfile
BACKEND_COMMAND=./api
FRONTEND_COMMAND=nginx -g daemon off;
FRONTEND_INTERNAL_PORT=80

# ── PostgreSQL ─────────────────────────────────────────
POSTGRES_DB=dentist_db
POSTGRES_USER=dentist_user
POSTGRES_PASSWORD=<paste from openssl>
POSTGRES_PORT=5433

# ── Backend ────────────────────────────────────────────
DATABASE_URL=postgres://dentist_user:<POSTGRES_PASSWORD>@postgres:5432/dentist_db?sslmode=disable
JWT_SECRET=<paste from openssl>
JWT_EXPIRATION=24h
PORT=8080

# ── URLs — use VPS IP until a domain is set up ─────────
FRONTEND_URL=http://<your-vps-ip>
VITE_API_URL=http://<your-vps-ip>/api

# ── Telegram notifications (optional) ─────────────────
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Lock down the file:

```bash
chmod 600 /opt/dentist/.env.production
```

### Step 5 — Create the GitHub Actions SSH deploy key

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key -N ""

# Authorize the key so GitHub Actions can SSH in
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys

# Print both — you need them in Part C
cat ~/.ssh/deploy_key      # private key  → GitHub Actions secret
cat ~/.ssh/deploy_key.pub  # public key   → GitHub deploy key (private repos only)
```

### Step 6 — Smoke test (first manual deploy)

```bash
cd /opt/dentist
docker compose --env-file .env.production --profile production up --build -d

# Check all containers are running
docker compose --env-file .env.production --profile production ps

# Check the app responds
curl http://<your-vps-ip>/api/health
# Expected: {"status":"healthy",...}
```

---

## Part C — GitHub (in the browser)

### Step 7 — Add GitHub Actions secrets

Go to **repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret name   | Value |
|---------------|-------|
| `VPS_HOST`    | VPS IP address (e.g. `123.45.67.89`) |
| `VPS_USER`    | SSH username (e.g. `deploy`, `ubuntu`) |
| `VPS_SSH_KEY` | Entire private key from Step 5 (including `-----BEGIN...` and `-----END...` lines) |
| `VPS_APP_DIR` | `/opt/dentist` |

### Step 8 — Add GitHub deploy key (private repos only)

Go to **repo → Settings → Deploy keys → Add deploy key**

- Title: `VPS deploy`
- Key: paste the **public key** from Step 5
- Allow write access: **No**

---

## Part D — Verify automation

```bash
git commit --allow-empty -m "Test CI/CD pipeline"
git push
```

Watch it run: **GitHub → Actions → CI/CD**

Tests run first, then on pass the VPS is updated automatically. If the deploy job goes green, you're done.

---

## Adding a Domain + SSL Later

When you have a domain, do this once:

**1. Point DNS at the VPS** — add an `A` record: `yourdomain.com → <vps-ip>`

**2. Get an SSL certificate** (stop the app first so port 80 is free):

```bash
ssh deploy@<vps-ip>
cd /opt/dentist
docker compose --env-file .env.production --profile production down
sudo apt install -y certbot
sudo certbot certonly --standalone -d yourdomain.com
```

**3. Restore the HTTPS Nginx config locally** — replace `nginx/conf.d/default.conf` with the full HTTPS version (the one in git history before the HTTP-only commit), then replace `REPLACE_WITH_YOUR_DOMAIN` with your actual domain:

```bash
git show HEAD~1:nginx/conf.d/default.conf > nginx/conf.d/default.conf
# then edit the file to set your domain
nano nginx/conf.d/default.conf
git add nginx/conf.d/default.conf
git commit -m "Enable HTTPS for yourdomain.com"
git push
```

**4. Update `.env.production` on the VPS:**

```bash
nano /opt/dentist/.env.production
```

Change these three lines:

```env
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
NGINX_SSL_PATH=/etc/letsencrypt
```

**5. Redeploy:**

```bash
cd /opt/dentist
docker compose --env-file .env.production --profile production up --build -d
```

---

## Ongoing Operations

### Rotate a secret
```bash
ssh deploy@<vps-ip>
nano /opt/dentist/.env.production
cd /opt/dentist
docker compose --env-file .env.production --profile production up -d backend
```

### View logs
```bash
ssh deploy@<vps-ip>
cd /opt/dentist
docker compose --env-file .env.production --profile production logs -f
```

### Roll back to a previous version
```bash
ssh deploy@<vps-ip>
cd /opt/dentist
git log --oneline -10
git checkout <commit-hash>
docker compose --env-file .env.production --profile production up --build -d
```

### Renew SSL manually (if auto-renewal ever fails)
```bash
sudo certbot renew
docker compose --env-file .env.production --profile production restart nginx
```
