#!/usr/bin/env python3
"""
Script de synchronisation GitHub → Manus
=========================================

Ce script permet de synchroniser les modifications du repository GitHub
vers le projet Manus local. Il effectue un pull des dernières modifications
et gère les conflits de manière intelligente.

Usage:
    python3 scripts/sync-from-github.py [options]

Options:
    --dry-run       Affiche les modifications sans les appliquer
    --force         Force la synchronisation même en cas de modifications locales
    --branch NAME   Spécifie la branche à synchroniser (défaut: main)
    --backup        Crée une sauvegarde avant la synchronisation
"""

import os
import sys
import subprocess
import shutil
import argparse
from datetime import datetime
from pathlib import Path

# Configuration
GITHUB_REPO = "RusingAcademy/rusingacademy-ecosystem"
DEFAULT_BRANCH = "main"
PROJECT_ROOT = Path(__file__).parent.parent
BACKUP_DIR = PROJECT_ROOT / ".sync-backups"

# Fichiers à exclure de la synchronisation (spécifiques à Manus)
EXCLUDE_PATTERNS = [
    ".manus-logs/",
    ".sync-backups/",
    "node_modules/",
    "dist/",
    ".env",
    ".env.local",
    "*.log",
    ".git/",
    "scripts/sync-*.py",
    "scripts/sync-*.sh",
    "WORKFLOW-MANUS-GITHUB-RAILWAY.md",
]

# Fichiers à préserver (ne jamais écraser)
PRESERVE_FILES = [
    "todo.md",
    ".env",
    ".env.local",
]


class Colors:
    """Codes couleur ANSI pour l'affichage"""
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")


def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.ENDC}")


def print_warning(text):
    print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")


def print_error(text):
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")


def print_info(text):
    print(f"{Colors.CYAN}ℹ {text}{Colors.ENDC}")


def run_command(cmd, cwd=None, capture=True):
    """Exécute une commande shell et retourne le résultat"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=cwd or PROJECT_ROOT,
            capture_output=capture,
            text=True
        )
        return result.returncode == 0, result.stdout.strip(), result.stderr.strip()
    except Exception as e:
        return False, "", str(e)


def check_git_installed():
    """Vérifie que git est installé"""
    success, _, _ = run_command("git --version")
    return success


def check_gh_installed():
    """Vérifie que GitHub CLI est installé"""
    success, _, _ = run_command("gh --version")
    return success


def get_local_changes():
    """Détecte les modifications locales non commitées"""
    success, stdout, _ = run_command("git status --porcelain", cwd=PROJECT_ROOT)
    if success and stdout:
        return stdout.split('\n')
    return []


def get_current_branch():
    """Retourne la branche actuelle"""
    success, stdout, _ = run_command("git branch --show-current", cwd=PROJECT_ROOT)
    return stdout if success else None


def get_local_commit():
    """Retourne le SHA du commit local actuel"""
    success, stdout, _ = run_command("git rev-parse HEAD", cwd=PROJECT_ROOT)
    return stdout[:8] if success else None


def get_remote_commit(branch):
    """Retourne le SHA du dernier commit sur GitHub"""
    success, stdout, _ = run_command(
        f"gh api repos/{GITHUB_REPO}/commits/{branch} --jq '.sha'",
        cwd=PROJECT_ROOT
    )
    return stdout[:8] if success else None


def create_backup():
    """Crée une sauvegarde du projet avant synchronisation"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = BACKUP_DIR / f"backup_{timestamp}"
    
    BACKUP_DIR.mkdir(exist_ok=True)
    
    # Copier les fichiers importants
    files_to_backup = ["client/", "server/", "shared/", "drizzle/", "package.json"]
    
    for file_pattern in files_to_backup:
        src = PROJECT_ROOT / file_pattern
        if src.exists():
            dst = backup_path / file_pattern
            if src.is_dir():
                shutil.copytree(src, dst, ignore=shutil.ignore_patterns('node_modules', '.git'))
            else:
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dst)
    
    return backup_path


def fetch_github_changes(branch):
    """Récupère les modifications depuis GitHub"""
    print_info(f"Récupération des modifications depuis GitHub ({branch})...")
    
    # Vérifier si le remote existe
    success, stdout, _ = run_command("git remote -v", cwd=PROJECT_ROOT)
    
    if "github" not in stdout:
        # Ajouter le remote
        print_info("Ajout du remote GitHub...")
        run_command(f"git remote add github https://github.com/{GITHUB_REPO}.git", cwd=PROJECT_ROOT)
    
    # Fetch les modifications
    success, _, stderr = run_command(f"git fetch github {branch}", cwd=PROJECT_ROOT)
    
    if not success:
        print_error(f"Erreur lors du fetch: {stderr}")
        return False
    
    return True


def get_diff_files(branch):
    """Retourne la liste des fichiers modifiés entre local et remote"""
    success, stdout, _ = run_command(
        f"git diff --name-only HEAD github/{branch}",
        cwd=PROJECT_ROOT
    )
    
    if success and stdout:
        return stdout.split('\n')
    return []


def merge_changes(branch, force=False):
    """Fusionne les modifications depuis GitHub"""
    strategy = "--strategy-option=theirs" if force else ""
    
    success, stdout, stderr = run_command(
        f"git merge github/{branch} {strategy} --no-edit",
        cwd=PROJECT_ROOT
    )
    
    if not success:
        if "CONFLICT" in stderr or "conflict" in stderr.lower():
            return False, "conflicts"
        return False, stderr
    
    return True, stdout


def sync_from_github(args):
    """Fonction principale de synchronisation"""
    print_header("Synchronisation GitHub → Manus")
    
    # Vérifications préliminaires
    if not check_git_installed():
        print_error("Git n'est pas installé")
        return False
    
    if not check_gh_installed():
        print_error("GitHub CLI n'est pas installé")
        return False
    
    # Informations actuelles
    local_commit = get_local_commit()
    remote_commit = get_remote_commit(args.branch)
    
    print_info(f"Commit local:  {local_commit}")
    print_info(f"Commit GitHub: {remote_commit}")
    print_info(f"Branche:       {args.branch}")
    
    if local_commit == remote_commit:
        print_success("Le projet est déjà à jour!")
        return True
    
    # Vérifier les modifications locales
    local_changes = get_local_changes()
    if local_changes and not args.force:
        print_warning("Modifications locales détectées:")
        for change in local_changes[:10]:
            print(f"  {change}")
        if len(local_changes) > 10:
            print(f"  ... et {len(local_changes) - 10} autres fichiers")
        
        if not args.dry_run:
            print_error("Utilisez --force pour écraser les modifications locales")
            return False
    
    # Fetch les modifications
    if not fetch_github_changes(args.branch):
        return False
    
    # Afficher les fichiers modifiés
    diff_files = get_diff_files(args.branch)
    if diff_files:
        print_info(f"\n{len(diff_files)} fichiers à synchroniser:")
        for f in diff_files[:20]:
            print(f"  • {f}")
        if len(diff_files) > 20:
            print(f"  ... et {len(diff_files) - 20} autres fichiers")
    
    if args.dry_run:
        print_warning("\n[DRY-RUN] Aucune modification appliquée")
        return True
    
    # Créer une sauvegarde si demandé
    if args.backup:
        print_info("Création d'une sauvegarde...")
        backup_path = create_backup()
        print_success(f"Sauvegarde créée: {backup_path}")
    
    # Fusionner les modifications
    print_info("Fusion des modifications...")
    success, result = merge_changes(args.branch, args.force)
    
    if not success:
        if result == "conflicts":
            print_error("Conflits détectés! Résolution manuelle requise.")
            print_info("Fichiers en conflit:")
            run_command("git diff --name-only --diff-filter=U", cwd=PROJECT_ROOT, capture=False)
            return False
        else:
            print_error(f"Erreur lors de la fusion: {result}")
            return False
    
    # Succès
    new_commit = get_local_commit()
    print_success(f"\nSynchronisation réussie!")
    print_success(f"Nouveau commit local: {new_commit}")
    
    # Rappel pour installer les dépendances si package.json a changé
    if any("package.json" in f for f in diff_files):
        print_warning("\npackage.json a été modifié. Exécutez: pnpm install")
    
    # Rappel pour les migrations si le schéma a changé
    if any("drizzle/" in f for f in diff_files):
        print_warning("Le schéma de base de données a été modifié. Exécutez: pnpm db:push")
    
    return True


def main():
    parser = argparse.ArgumentParser(
        description="Synchronise les modifications GitHub vers Manus"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Affiche les modifications sans les appliquer"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force la synchronisation même en cas de modifications locales"
    )
    parser.add_argument(
        "--branch",
        default=DEFAULT_BRANCH,
        help=f"Branche à synchroniser (défaut: {DEFAULT_BRANCH})"
    )
    parser.add_argument(
        "--backup",
        action="store_true",
        help="Crée une sauvegarde avant la synchronisation"
    )
    
    args = parser.parse_args()
    
    try:
        success = sync_from_github(args)
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print_warning("\nSynchronisation annulée par l'utilisateur")
        sys.exit(1)
    except Exception as e:
        print_error(f"Erreur inattendue: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
