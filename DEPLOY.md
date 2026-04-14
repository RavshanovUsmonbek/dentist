# VPS Deployment — One-Time Setup

After completing this guide, all future deploys happen automatically on every push to `main`.

---

## Part A — Local Machine

### Step 1 — Generate SSH deploy key

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/dentist_deploy -N ""
```

### Step 2 — Add public key to VPS (run as root on VPS)

```bash
ssh root@YOUR_VPS_IP

useradd -m -s /bin/bash deploy
usermod -aG docker deploy
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
mkdir -p /home/deploy/dentist
chown deploy:deploy /home/deploy/dentist
```

Get the public key with:

```bash
cat ~/.ssh/dentist_deploy.pub
```

### Step 3 — Test SSH connection

```bash
ssh -i ~/.ssh/dentist_deploy deploy@YOUR_VPS_IP
```

---

## Part B — VPS (logged in as deploy user)

### Step 4 — Create production environment file

Replace `CHANGE_ME` with your chosen Postgres password and `YOUR_VPS_IP` with your server IP:

```bash
POSTGRES_PASS=CHANGE_ME
JWT=$(openssl rand -base64 32)

cat > /home/deploy/dentist/.env.production << EOF
BACKEND_DOCKERFILE=Dockerfile
FRONTEND_DOCKERFILE=Dockerfile
BACKEND_COMMAND=./api
FRONTEND_COMMAND=nginx -g daemon off;
FRONTEND_INTERNAL_PORT=80

POSTGRES_DB=dentist_db
POSTGRES_USER=dentist_user
POSTGRES_PASSWORD=$POSTGRES_PASS
POSTGRES_PORT=5433

DATABASE_URL=postgres://dentist_user:$POSTGRES_PASS@postgres:5432/dentist_db?sslmode=disable

BACKEND_PORT=8080
FRONTEND_URL=http://144.91.106.251

JWT_SECRET=$JWT
JWT_EXPIRATION=24h

UPLOAD_PATH=./uploads
UPLOAD_URL_PREFIX=/uploads

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

VITE_API_URL=http://144.91.106.251/api

BACKEND_IMAGE=ghcr.io/usmonbekravshanov/dentist/backend:latest
FRONTEND_IMAGE=ghcr.io/usmonbekravshanov/dentist/frontend:latest
EOF

chmod 600 /home/deploy/dentist/.env.production
```

Verify:

```bash
cat /home/deploy/dentist/.env.production
```

---

## Part C — GitHub (in the browser)

### Step 5 — Add repository secrets

Go to **Repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|---|---|
| `VPS_HOST` | VPS IP address |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Output of `cat ~/.ssh/dentist_deploy` (entire private key) |
| `VPS_APP_DIR` | `/home/deploy/dentist` |
| `GHCR_TOKEN` | GitHub classic PAT with `read:packages` scope |
| `VITE_API_URL` | `http://YOUR_VPS_IP/api` |

To create `GHCR_TOKEN`: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → check `read:packages` only.

---

## Part D — Trigger first deploy

```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

Watch it run: **GitHub → Actions → Deploy**

All 5 jobs run in order: test → build → push images → deploy. If the deploy job goes green, the app is live at `http://YOUR_VPS_IP`.

---

## Adding a Domain + SSL Later

**1. Point DNS at the VPS** — add an `A` record: `yourdomain.com → YOUR_VPS_IP`

**2. Get an SSL certificate:**

```bash
ssh deploy@YOUR_VPS_IP
sudo apt install -y certbot
sudo certbot certonly --standalone -d yourdomain.com
```

**3. Update `.env.production` on the VPS:**

```bash
nano /home/deploy/dentist/.env.production
```

Change:

```env
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
NGINX_SSL_PATH=/etc/letsencrypt
```

**4. Push to main to redeploy.**

---

## Ongoing Operations

### View logs

```bash
ssh -i ~/.ssh/dentist_deploy deploy@YOUR_VPS_IP
cd /home/deploy/dentist
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production --profile production logs -f
```

### Rotate a secret

```bash
nano /home/deploy/dentist/.env.production
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production --profile production up -d backend
```

### Check container status

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production --profile production ps
```
