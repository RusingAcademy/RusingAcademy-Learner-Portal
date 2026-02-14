#!/bin/bash
# =============================================================================
# MANUS → GITHUB SYNCHRONIZATION SCRIPT
# =============================================================================
# This script synchronizes changes from the Manus project to GitHub
# 
# Usage: ./scripts/sync-to-github.sh [commit_message]
#
# Prerequisites:
#   - GitHub CLI (gh) must be installed and authenticated
#   - Git must be configured with user.name and user.email
#
# Workflow:
#   1. Creates a temporary clone of the GitHub repository
#   2. Copies all source files from Manus project (excluding node_modules, etc.)
#   3. Commits and pushes changes to GitHub
#   4. Railway automatically deploys from GitHub
#
# Author: Manus AI
# Date: January 25, 2026
# =============================================================================

set -e  # Exit on error

# Configuration
GITHUB_REPO="RusingAcademy/rusingacademy-ecosystem"
MANUS_PROJECT_DIR="/home/ubuntu/ecosystemhub-preview"
TEMP_DIR="/home/ubuntu/github-sync-temp"
BRANCH="main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get commit message from argument or prompt
COMMIT_MESSAGE="${1:-}"
if [ -z "$COMMIT_MESSAGE" ]; then
    COMMIT_MESSAGE="sync: Update from Manus $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo ""
echo "=============================================="
echo "  MANUS → GITHUB SYNCHRONIZATION"
echo "=============================================="
echo ""

# Step 1: Clean up any existing temp directory
log_info "Cleaning up temporary directory..."
rm -rf "$TEMP_DIR"

# Step 2: Clone the GitHub repository
log_info "Cloning GitHub repository: $GITHUB_REPO"
gh repo clone "$GITHUB_REPO" "$TEMP_DIR" -- --branch "$BRANCH" --single-branch

# Step 3: Remove old files (except .git)
log_info "Preparing sync directory..."
cd "$TEMP_DIR"
find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

# Step 4: Copy files from Manus project
log_info "Copying files from Manus project..."
rsync -av --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '.env' \
    --exclude '.env.local' \
    --exclude '.manus-logs' \
    --exclude '*.log' \
    --exclude '.DS_Store' \
    --exclude 'coverage' \
    --exclude '.turbo' \
    --exclude '.next' \
    --exclude '.cache' \
    "$MANUS_PROJECT_DIR/" "$TEMP_DIR/"

# Step 5: Check for changes
log_info "Checking for changes..."
cd "$TEMP_DIR"
git add -A

if git diff --cached --quiet; then
    log_warning "No changes detected. Nothing to sync."
    rm -rf "$TEMP_DIR"
    exit 0
fi

# Step 6: Show changes summary
echo ""
log_info "Changes to be committed:"
echo "----------------------------------------"
git diff --cached --stat
echo "----------------------------------------"
echo ""

# Step 7: Commit changes
log_info "Committing changes..."
git commit -m "$COMMIT_MESSAGE"

# Step 8: Push to GitHub
log_info "Pushing to GitHub..."
git push origin "$BRANCH"

# Step 9: Get the new commit SHA
NEW_COMMIT=$(git rev-parse HEAD)
log_success "Successfully pushed to GitHub!"
echo ""
echo "=============================================="
echo "  SYNCHRONIZATION COMPLETE"
echo "=============================================="
echo ""
echo "  Repository: $GITHUB_REPO"
echo "  Branch: $BRANCH"
echo "  Commit: $NEW_COMMIT"
echo "  Message: $COMMIT_MESSAGE"
echo ""
echo "  Railway will automatically deploy this commit."
echo "  Monitor deployment at: https://railway.com"
echo ""
echo "=============================================="

# Step 10: Cleanup
log_info "Cleaning up temporary directory..."
rm -rf "$TEMP_DIR"

log_success "Done!"
