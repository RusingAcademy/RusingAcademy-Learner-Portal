#!/usr/bin/env python3
"""
MANUS → GITHUB SYNCHRONIZATION SCRIPT
=====================================

This script synchronizes changes from the Manus project to GitHub.

Usage:
    python3 scripts/sync-to-github.py [--message "commit message"] [--dry-run]

Options:
    --message, -m    Custom commit message (default: auto-generated)
    --dry-run        Show what would be done without making changes
    --force          Skip confirmation prompt

Prerequisites:
    - GitHub CLI (gh) must be installed and authenticated
    - Git must be configured with user.name and user.email

Workflow:
    1. Creates a temporary clone of the GitHub repository
    2. Copies all source files from Manus project (excluding node_modules, etc.)
    3. Commits and pushes changes to GitHub
    4. Railway automatically deploys from GitHub

Author: Manus AI
Date: January 25, 2026
"""

import os
import sys
import shutil
import subprocess
import argparse
from datetime import datetime
from pathlib import Path

# Configuration
GITHUB_REPO = "RusingAcademy/rusingacademy-ecosystem"
MANUS_PROJECT_DIR = Path("/home/ubuntu/ecosystemhub-preview")
TEMP_DIR = Path("/home/ubuntu/github-sync-temp")
BRANCH = "main"

# Files and directories to exclude from sync
EXCLUDE_PATTERNS = [
    'node_modules',
    '.git',
    'dist',
    '.env',
    '.env.local',
    '.env.production',
    '.manus-logs',
    '*.log',
    '.DS_Store',
    'coverage',
    '.turbo',
    '.next',
    '.cache',
    '__pycache__',
    '*.pyc',
    '.pytest_cache',
    'scripts/sync-to-github.py',  # Don't sync this script itself
    'scripts/sync-to-github.sh',
]

# ANSI colors
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'  # No Color

def log_info(msg):
    print(f"{Colors.BLUE}[INFO]{Colors.NC} {msg}")

def log_success(msg):
    print(f"{Colors.GREEN}[SUCCESS]{Colors.NC} {msg}")

def log_warning(msg):
    print(f"{Colors.YELLOW}[WARNING]{Colors.NC} {msg}")

def log_error(msg):
    print(f"{Colors.RED}[ERROR]{Colors.NC} {msg}")

def run_command(cmd, cwd=None, capture_output=False):
    """Run a shell command and return the result."""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=cwd,
            capture_output=capture_output,
            text=True,
            check=True
        )
        return result.stdout if capture_output else None
    except subprocess.CalledProcessError as e:
        log_error(f"Command failed: {cmd}")
        if e.stderr:
            print(e.stderr)
        raise

def should_exclude(path, base_path):
    """Check if a path should be excluded from sync."""
    rel_path = str(path.relative_to(base_path))
    
    for pattern in EXCLUDE_PATTERNS:
        if pattern.startswith('*'):
            # Wildcard pattern (e.g., *.log)
            if rel_path.endswith(pattern[1:]):
                return True
        elif pattern in rel_path.split(os.sep):
            # Directory or file name match
            return True
        elif rel_path == pattern:
            # Exact match
            return True
    
    return False

def copy_project_files(src, dst):
    """Copy project files excluding specified patterns."""
    copied_files = 0
    
    for item in src.rglob('*'):
        if item.is_file() and not should_exclude(item, src):
            rel_path = item.relative_to(src)
            dst_path = dst / rel_path
            dst_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, dst_path)
            copied_files += 1
    
    return copied_files

def main():
    parser = argparse.ArgumentParser(description='Sync Manus project to GitHub')
    parser.add_argument('-m', '--message', help='Commit message')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done')
    parser.add_argument('--force', action='store_true', help='Skip confirmation')
    args = parser.parse_args()

    # Generate commit message
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    commit_message = args.message or f"sync: Update from Manus {timestamp}"

    print()
    print("=" * 50)
    print("  MANUS → GITHUB SYNCHRONIZATION")
    print("=" * 50)
    print()

    if args.dry_run:
        log_warning("DRY RUN MODE - No changes will be made")
        print()

    # Step 1: Verify prerequisites
    log_info("Verifying prerequisites...")
    try:
        run_command("gh auth status", capture_output=True)
        log_success("GitHub CLI authenticated")
    except:
        log_error("GitHub CLI not authenticated. Run 'gh auth login' first.")
        sys.exit(1)

    # Step 2: Clean up temp directory
    log_info("Cleaning up temporary directory...")
    if TEMP_DIR.exists():
        shutil.rmtree(TEMP_DIR)

    if args.dry_run:
        log_info(f"Would clone {GITHUB_REPO} to {TEMP_DIR}")
        log_info(f"Would copy files from {MANUS_PROJECT_DIR}")
        log_info(f"Would commit with message: {commit_message}")
        log_info(f"Would push to {BRANCH} branch")
        print()
        log_success("Dry run complete!")
        return

    # Step 3: Clone repository
    log_info(f"Cloning GitHub repository: {GITHUB_REPO}")
    run_command(f"gh repo clone {GITHUB_REPO} {TEMP_DIR} -- --branch {BRANCH} --single-branch")

    # Step 4: Remove old files (except .git)
    log_info("Preparing sync directory...")
    for item in TEMP_DIR.iterdir():
        if item.name != '.git':
            if item.is_dir():
                shutil.rmtree(item)
            else:
                item.unlink()

    # Step 5: Copy files from Manus project
    log_info("Copying files from Manus project...")
    copied = copy_project_files(MANUS_PROJECT_DIR, TEMP_DIR)
    log_info(f"Copied {copied} files")

    # Step 6: Check for changes
    log_info("Checking for changes...")
    run_command("git add -A", cwd=TEMP_DIR)
    
    try:
        run_command("git diff --cached --quiet", cwd=TEMP_DIR)
        log_warning("No changes detected. Nothing to sync.")
        shutil.rmtree(TEMP_DIR)
        return
    except subprocess.CalledProcessError:
        pass  # Changes exist, continue

    # Step 7: Show changes summary
    print()
    log_info("Changes to be committed:")
    print("-" * 40)
    diff_stat = run_command("git diff --cached --stat", cwd=TEMP_DIR, capture_output=True)
    print(diff_stat)
    print("-" * 40)
    print()

    # Step 8: Confirm (unless --force)
    if not args.force:
        response = input(f"{Colors.YELLOW}Proceed with sync? [y/N]: {Colors.NC}")
        if response.lower() != 'y':
            log_warning("Sync cancelled by user")
            shutil.rmtree(TEMP_DIR)
            return

    # Step 9: Commit changes
    log_info("Committing changes...")
    run_command(f'git commit -m "{commit_message}"', cwd=TEMP_DIR)

    # Step 10: Push to GitHub
    log_info("Pushing to GitHub...")
    run_command(f"git push origin {BRANCH}", cwd=TEMP_DIR)

    # Step 11: Get new commit SHA
    new_commit = run_command("git rev-parse HEAD", cwd=TEMP_DIR, capture_output=True).strip()

    print()
    print("=" * 50)
    print("  SYNCHRONIZATION COMPLETE")
    print("=" * 50)
    print()
    print(f"  Repository: {GITHUB_REPO}")
    print(f"  Branch: {BRANCH}")
    print(f"  Commit: {new_commit}")
    print(f"  Message: {commit_message}")
    print()
    print("  Railway will automatically deploy this commit.")
    print("  Monitor deployment at: https://railway.com")
    print()
    print("=" * 50)

    # Step 12: Cleanup
    log_info("Cleaning up temporary directory...")
    shutil.rmtree(TEMP_DIR)

    log_success("Done!")

if __name__ == "__main__":
    main()
