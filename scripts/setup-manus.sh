#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# RusingAcademy Ecosystem — Manus Sandbox Setup Script
# ═══════════════════════════════════════════════════════════════════════════════
#
# This script automates the complete setup of a new Manus sandbox for the
# RusingAcademy EcosystemHub. It handles:
#   1. Cloning the repository from GitHub
#   2. Installing dependencies
#   3. Configuring environment variables from Manus secrets or Railway parity
#   4. Running database migrations
#   5. Building the project
#   6. Starting the development server
#
# Usage:
#   bash scripts/setup-manus.sh              # Full setup (clone + install + build)
#   bash scripts/setup-manus.sh --env-only   # Only configure .env (repo already cloned)
#   bash scripts/setup-manus.sh --no-build   # Skip the build step
#   bash scripts/setup-manus.sh --start      # Setup + start dev server
#   bash scripts/setup-manus.sh --status     # Check current setup status
#
# Prerequisites:
#   - GitHub CLI (gh) authenticated
#   - Node.js 22+ and pnpm installed
#   - Running inside a Manus sandbox
#
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────────────
GITHUB_REPO="RusingAcademy/rusingacademy-ecosystem"
PROJECT_DIR="/home/ubuntu/ecosystem"
BRANCH="main"
NODE_HEAP="6144"

# ─── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ─── Flags ────────────────────────────────────────────────────────────────────
ENV_ONLY=false
NO_BUILD=false
START_SERVER=false
STATUS_CHECK=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --env-only)  ENV_ONLY=true; shift ;;
        --no-build)  NO_BUILD=true; shift ;;
        --start)     START_SERVER=true; shift ;;
        --status)    STATUS_CHECK=true; shift ;;
        --branch)    BRANCH="$2"; shift 2 ;;
        -h|--help)
            echo "Usage: bash scripts/setup-manus.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --env-only   Only configure .env file (skip clone/install/build)"
            echo "  --no-build   Skip the build step"
            echo "  --start      Start dev server after setup"
            echo "  --status     Check current setup status"
            echo "  --branch     Specify branch (default: main)"
            echo "  -h, --help   Show this help message"
            exit 0
            ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# ─── Utility Functions ────────────────────────────────────────────────────────
header()  { echo -e "\n${CYAN}${BOLD}═══════════════════════════════════════════════════${NC}"; echo -e "${CYAN}${BOLD}  $1${NC}"; echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════${NC}\n"; }
ok()      { echo -e "${GREEN}  ✓ $1${NC}"; }
warn()    { echo -e "${YELLOW}  ⚠ $1${NC}"; }
fail()    { echo -e "${RED}  ✗ $1${NC}"; }
info()    { echo -e "${BLUE}  ℹ $1${NC}"; }

# ─── Status Check ─────────────────────────────────────────────────────────────
check_status() {
    header "EcosystemHub Sandbox Status"

    # Repository
    if [ -d "$PROJECT_DIR/.git" ]; then
        local sha=$(git -C "$PROJECT_DIR" rev-parse --short HEAD 2>/dev/null || echo "unknown")
        local branch=$(git -C "$PROJECT_DIR" branch --show-current 2>/dev/null || echo "unknown")
        ok "Repository cloned — branch: $branch, HEAD: $sha"
    else
        fail "Repository not cloned"
    fi

    # Dependencies
    if [ -d "$PROJECT_DIR/node_modules" ]; then
        ok "Dependencies installed (node_modules exists)"
    else
        fail "Dependencies not installed"
    fi

    # .env file
    if [ -f "$PROJECT_DIR/.env" ]; then
        local var_count=$(grep -c "^[A-Z]" "$PROJECT_DIR/.env" 2>/dev/null || echo "0")
        ok ".env configured ($var_count variables)"
    else
        fail ".env file missing"
    fi

    # Critical environment variables
    echo ""
    info "Environment Variable Status:"
    local critical_vars=(
        "DATABASE_URL"
        "OPENAI_API_KEY"
        "MINIMAX_API_KEY"
        "JWT_SECRET"
        "STRIPE_SECRET_KEY"
        "SMTP_HOST"
        "CRON_SECRET"
    )
    for var in "${critical_vars[@]}"; do
        if grep -q "^${var}=" "$PROJECT_DIR/.env" 2>/dev/null; then
            ok "$var — configured"
        else
            fail "$var — MISSING"
        fi
    done

    # Build
    if [ -d "$PROJECT_DIR/dist" ]; then
        ok "Build artifacts present (dist/)"
    else
        warn "Not built yet (no dist/)"
    fi

    # Server
    if pgrep -f "node.*ecosystem" > /dev/null 2>&1; then
        ok "Server running"
    else
        warn "Server not running"
    fi
}

if [ "$STATUS_CHECK" = true ]; then
    check_status
    exit 0
fi

# ─── Prerequisites Check ─────────────────────────────────────────────────────
header "Checking Prerequisites"

command -v git  >/dev/null 2>&1 && ok "git installed"   || { fail "git not found"; exit 1; }
command -v gh   >/dev/null 2>&1 && ok "gh CLI installed" || { fail "GitHub CLI not found"; exit 1; }
command -v node >/dev/null 2>&1 && ok "node $(node -v)"  || { fail "Node.js not found"; exit 1; }
command -v pnpm >/dev/null 2>&1 && ok "pnpm installed"   || { fail "pnpm not found"; exit 1; }

# Verify gh is authenticated
if gh auth status >/dev/null 2>&1; then
    ok "GitHub CLI authenticated"
else
    fail "GitHub CLI not authenticated — run: gh auth login"
    exit 1
fi

# ─── Clone Repository ────────────────────────────────────────────────────────
if [ "$ENV_ONLY" = false ]; then
    header "Cloning Repository"

    if [ -d "$PROJECT_DIR/.git" ]; then
        info "Repository already exists at $PROJECT_DIR"
        cd "$PROJECT_DIR"
        info "Fetching latest changes..."
        git fetch origin
        git checkout "$BRANCH"
        git pull --rebase origin "$BRANCH"
        ok "Updated to latest $BRANCH"
    else
        info "Cloning $GITHUB_REPO..."
        gh repo clone "$GITHUB_REPO" "$PROJECT_DIR"
        cd "$PROJECT_DIR"
        git checkout "$BRANCH"
        ok "Cloned successfully"
    fi

    local_sha=$(git rev-parse --short HEAD)
    ok "HEAD: $local_sha on branch $BRANCH"
fi

# ─── Configure Environment Variables ─────────────────────────────────────────
header "Configuring Environment Variables"

cd "$PROJECT_DIR"

# Build the .env file from available sources:
# 1. Manus sandbox environment variables (injected via project secrets)
# 2. Fallback defaults for non-sensitive values

ENV_FILE="$PROJECT_DIR/.env"

# If .env already exists, back it up
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    warn "Existing .env backed up"
fi

# Helper: get value from environment or use default
env_or_default() {
    local var_name="$1"
    local default_val="${2:-}"
    local current_val="${!var_name:-}"

    if [ -n "$current_val" ]; then
        echo "$current_val"
    elif [ -n "$default_val" ]; then
        echo "$default_val"
    else
        echo ""
    fi
}

# Write .env file
cat > "$ENV_FILE" << 'ENVEOF'
# ═══════════════════════════════════════════════════════════════════════════════
# RusingAcademy Ecosystem — Environment Configuration
# Auto-generated by setup-manus.sh
# ═══════════════════════════════════════════════════════════════════════════════
ENVEOF

# Core
{
    echo ""
    echo "# ─── Core ─────────────────────────────────────────────────────────────────────"
    echo "NODE_ENV=development"
    echo "PORT=$(env_or_default PORT 3000)"
    echo "DATABASE_URL=$(env_or_default DATABASE_URL)"
    echo "JWT_SECRET=$(env_or_default JWT_SECRET)"
} >> "$ENV_FILE"

# OpenAI
{
    echo ""
    echo "# ─── OpenAI (GPT + Whisper STT) ──────────────────────────────────────────────"
    echo "OPENAI_API_KEY=$(env_or_default OPENAI_API_KEY)"
    openai_base=$(env_or_default OPENAI_API_BASE)
    [ -n "$openai_base" ] && echo "OPENAI_API_BASE=$openai_base"
} >> "$ENV_FILE"

# MiniMax
{
    echo ""
    echo "# ─── MiniMax (Text-to-Speech) ────────────────────────────────────────────────"
    echo "MINIMAX_API_KEY=$(env_or_default MINIMAX_API_KEY)"
    echo "MINIMAX_GROUP_ID=$(env_or_default MINIMAX_GROUP_ID 1868089685693800449)"
} >> "$ENV_FILE"

# Voice Coach IDs
{
    echo ""
    echo "# ─── Coach Voice IDs (MiniMax Cloned Voices) ─────────────────────────────────"
    echo "STEVEN_VOICE_ID=$(env_or_default STEVEN_VOICE_ID moss_audio_b813fbba-c1d2-11f0-a527-aab150a40f84)"
    echo "PRECIOSA_VOICE_ID=$(env_or_default PRECIOSA_VOICE_ID moss_audio_a784f0fe-f448-11f0-9e6a-0a02ecbdcfa7)"
} >> "$ENV_FILE"

# Stripe
{
    echo ""
    echo "# ─── Stripe ───────────────────────────────────────────────────────────────────"
    echo "STRIPE_SECRET_KEY=$(env_or_default STRIPE_SECRET_KEY)"
    echo "STRIPE_WEBHOOK_SECRET=$(env_or_default STRIPE_WEBHOOK_SECRET)"
    stripe_pub=$(env_or_default STRIPE_PUBLISHABLE_KEY "$(env_or_default VITE_STRIPE_PUBLISHABLE_KEY)")
    [ -n "$stripe_pub" ] && echo "VITE_STRIPE_PUBLISHABLE_KEY=$stripe_pub"
} >> "$ENV_FILE"

# OAuth
{
    echo ""
    echo "# ─── OAuth ────────────────────────────────────────────────────────────────────"
    echo "GOOGLE_CLIENT_ID=$(env_or_default GOOGLE_CLIENT_ID)"
    echo "GOOGLE_CLIENT_SECRET=$(env_or_default GOOGLE_CLIENT_SECRET)"
    echo "MICROSOFT_CLIENT_ID=$(env_or_default MICROSOFT_CLIENT_ID)"
    echo "MICROSOFT_CLIENT_SECRET=$(env_or_default MICROSOFT_CLIENT_SECRET)"
    echo "MICROSOFT_TENANT=$(env_or_default MICROSOFT_TENANT common)"
} >> "$ENV_FILE"

# Email
{
    echo ""
    echo "# ─── Email (SMTP) ───────────────────────────────────────────────────────────"
    echo "SMTP_HOST=$(env_or_default SMTP_HOST smtp.gmail.com)"
    echo "SMTP_PORT=$(env_or_default SMTP_PORT 587)"
    echo "SMTP_USER=$(env_or_default SMTP_USER admin@rusingacademy.ca)"
    echo "SMTP_PASS=$(env_or_default SMTP_PASS)"
    echo "SMTP_FROM=$(env_or_default SMTP_FROM 'RusingAcademy <admin@rusingacademy.ca>')"
    echo "SMTP_FROM_NAME=$(env_or_default SMTP_FROM_NAME RusingAcademy)"
    echo "SMTP_SECURE=$(env_or_default SMTP_SECURE false)"
} >> "$ENV_FILE"

# Clerk (legacy)
{
    echo ""
    echo "# ─── Clerk (Legacy) ─────────────────────────────────────────────────────────"
    clerk_key=$(env_or_default CLERK_SECRET_KEY)
    [ -n "$clerk_key" ] && echo "CLERK_SECRET_KEY=$clerk_key"
    clerk_wh=$(env_or_default CLERK_WEBHOOK_SECRET)
    [ -n "$clerk_wh" ] && echo "CLERK_WEBHOOK_SECRET=$clerk_wh"
    clerk_pub=$(env_or_default VITE_CLERK_PUBLISHABLE_KEY)
    [ -n "$clerk_pub" ] && echo "VITE_CLERK_PUBLISHABLE_KEY=$clerk_pub"
} >> "$ENV_FILE"

# Security
{
    echo ""
    echo "# ─── Security ──────────────────────────────────────────────────────────────"
    echo "CRON_SECRET=$(env_or_default CRON_SECRET)"
    owner_email=$(env_or_default OWNER_EMAIL admin@rusingacademy.ca)
    echo "OWNER_EMAIL=$owner_email"
    owner_id=$(env_or_default OWNER_OPEN_ID)
    [ -n "$owner_id" ] && echo "OWNER_OPEN_ID=$owner_id"
} >> "$ENV_FILE"

# Frontend
{
    echo ""
    echo "# ─── Frontend ──────────────────────────────────────────────────────────────"
    echo "VITE_APP_ID=$(env_or_default VITE_APP_ID rusingacademy-ecosystem)"
    echo "VITE_APP_URL=$(env_or_default VITE_APP_URL https://www.rusingacademy.ca)"
    echo "VITE_CLOUDINARY_CLOUD_NAME=$(env_or_default VITE_CLOUDINARY_CLOUD_NAME djxhk76m9)"
    echo "VITE_FRONTEND_FORGE_API_URL=$(env_or_default VITE_FRONTEND_FORGE_API_URL https://forge.manus.ai)"
    oauth_enabled=$(env_or_default VITE_OAUTH_ENABLED false)
    echo "VITE_OAUTH_ENABLED=$oauth_enabled"
    oauth_portal=$(env_or_default VITE_OAUTH_PORTAL_URL)
    [ -n "$oauth_portal" ] && echo "VITE_OAUTH_PORTAL_URL=$oauth_portal"
} >> "$ENV_FILE"

# Count configured variables
total_vars=$(grep -c "^[A-Z]" "$ENV_FILE" 2>/dev/null || echo "0")
empty_vars=$(grep "^[A-Z].*=$" "$ENV_FILE" 2>/dev/null | wc -l || echo "0")
configured_vars=$((total_vars - empty_vars))

ok ".env created with $total_vars variables ($configured_vars configured, $empty_vars empty)"

# Warn about missing critical variables
echo ""
info "Critical Variable Check:"
MISSING_CRITICAL=0
for var in DATABASE_URL OPENAI_API_KEY MINIMAX_API_KEY JWT_SECRET; do
    val=$(grep "^${var}=" "$ENV_FILE" | cut -d'=' -f2-)
    if [ -z "$val" ]; then
        fail "$var is EMPTY — this feature will not work!"
        MISSING_CRITICAL=$((MISSING_CRITICAL + 1))
    else
        ok "$var — configured"
    fi
done

if [ "$MISSING_CRITICAL" -gt 0 ]; then
    echo ""
    warn "$MISSING_CRITICAL critical variable(s) missing!"
    warn "Configure them in Manus Project Settings > Secrets, or edit .env manually."
    warn "Required values can be found in Railway production variables."
fi

# ─── Install Dependencies ────────────────────────────────────────────────────
if [ "$ENV_ONLY" = false ]; then
    header "Installing Dependencies"

    cd "$PROJECT_DIR"
    info "Running pnpm install..."
    pnpm install --frozen-lockfile 2>/dev/null || pnpm install
    ok "Dependencies installed"
fi

# ─── Build ────────────────────────────────────────────────────────────────────
if [ "$ENV_ONLY" = false ] && [ "$NO_BUILD" = false ]; then
    header "Building Project"

    cd "$PROJECT_DIR"
    info "Building with NODE_OPTIONS='--max-old-space-size=$NODE_HEAP'..."
    NODE_OPTIONS="--max-old-space-size=$NODE_HEAP" pnpm build
    ok "Build successful"
fi

# ─── Start Server ─────────────────────────────────────────────────────────────
if [ "$START_SERVER" = true ]; then
    header "Starting Development Server"

    cd "$PROJECT_DIR"

    # Kill any existing server
    pkill -f "node.*ecosystem" 2>/dev/null || true
    sleep 2

    info "Starting server on port $(env_or_default PORT 3000)..."
    NODE_OPTIONS="--max-old-space-size=$NODE_HEAP" nohup pnpm dev > /tmp/ecosystem-server.log 2>&1 &
    SERVER_PID=$!

    # Wait for server to start
    sleep 5
    if kill -0 "$SERVER_PID" 2>/dev/null; then
        ok "Server started (PID: $SERVER_PID)"
        ok "Logs: tail -f /tmp/ecosystem-server.log"
    else
        fail "Server failed to start. Check logs: cat /tmp/ecosystem-server.log"
    fi
fi

# ─── Summary ──────────────────────────────────────────────────────────────────
header "Setup Complete"

echo -e "${BOLD}Repository:${NC}  $PROJECT_DIR"
if [ -d "$PROJECT_DIR/.git" ]; then
    echo -e "${BOLD}Branch:${NC}      $(git -C "$PROJECT_DIR" branch --show-current 2>/dev/null)"
    echo -e "${BOLD}HEAD:${NC}        $(git -C "$PROJECT_DIR" rev-parse --short HEAD 2>/dev/null)"
fi
echo -e "${BOLD}Environment:${NC} $total_vars variables ($configured_vars configured)"
echo ""

if [ "$MISSING_CRITICAL" -gt 0 ]; then
    warn "Action required: Configure $MISSING_CRITICAL missing critical variable(s) in .env"
fi

echo ""
info "Next steps:"
echo "  1. Verify .env: bash scripts/setup-manus.sh --status"
echo "  2. Start server: NODE_OPTIONS='--max-old-space-size=$NODE_HEAP' pnpm dev"
echo "  3. Or with script: bash scripts/setup-manus.sh --start"
echo ""
info "Quick reference:"
echo "  Build:    NODE_OPTIONS='--max-old-space-size=$NODE_HEAP' pnpm build"
echo "  Dev:      NODE_OPTIONS='--max-old-space-size=$NODE_HEAP' pnpm dev"
echo "  Status:   bash scripts/setup-manus.sh --status"
echo "  Sync:     bash scripts/sync-from-github.sh --force"
echo ""
