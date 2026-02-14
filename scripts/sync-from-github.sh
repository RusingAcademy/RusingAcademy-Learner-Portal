#!/bin/bash
#
# Script de synchronisation GitHub → Manus
# =========================================
#
# Ce script permet de synchroniser les modifications du repository GitHub
# vers le projet Manus local.
#
# Usage:
#   ./scripts/sync-from-github.sh [options]
#
# Options:
#   --dry-run    Affiche les modifications sans les appliquer
#   --force      Force la synchronisation (écrase les modifications locales)
#   --backup     Crée une sauvegarde avant la synchronisation
#

set -e

# Configuration
GITHUB_REPO="RusingAcademy/rusingacademy-ecosystem"
BRANCH="main"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_ROOT/.sync-backups"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Options
DRY_RUN=false
FORCE=false
BACKUP=false

# Parsing des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --backup)
            BACKUP=true
            shift
            ;;
        --branch)
            BRANCH="$2"
            shift 2
            ;;
        *)
            echo "Option inconnue: $1"
            exit 1
            ;;
    esac
done

# Fonctions d'affichage
print_header() {
    echo -e "\n${CYAN}${BOLD}============================================================${NC}"
    echo -e "${CYAN}${BOLD}$1${NC}"
    echo -e "${CYAN}${BOLD}============================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Vérifications préliminaires
check_prerequisites() {
    if ! command -v git &> /dev/null; then
        print_error "Git n'est pas installé"
        exit 1
    fi
    
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI n'est pas installé"
        exit 1
    fi
}

# Obtenir le commit local
get_local_commit() {
    git -C "$PROJECT_ROOT" rev-parse --short HEAD 2>/dev/null || echo "unknown"
}

# Obtenir le commit remote
get_remote_commit() {
    gh api "repos/$GITHUB_REPO/commits/$BRANCH" --jq '.sha' 2>/dev/null | cut -c1-8 || echo "unknown"
}

# Créer une sauvegarde
create_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_path="$BACKUP_DIR/backup_$timestamp"
    
    mkdir -p "$backup_path"
    
    # Copier les fichiers importants
    for dir in client server shared drizzle; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            cp -r "$PROJECT_ROOT/$dir" "$backup_path/" 2>/dev/null || true
        fi
    done
    
    # Copier package.json
    cp "$PROJECT_ROOT/package.json" "$backup_path/" 2>/dev/null || true
    
    echo "$backup_path"
}

# Fonction principale
main() {
    print_header "Synchronisation GitHub → Manus"
    
    check_prerequisites
    
    cd "$PROJECT_ROOT"
    
    # Informations actuelles
    local_commit=$(get_local_commit)
    remote_commit=$(get_remote_commit)
    
    print_info "Commit local:  $local_commit"
    print_info "Commit GitHub: $remote_commit"
    print_info "Branche:       $BRANCH"
    
    # Vérifier si à jour
    if [ "$local_commit" = "$remote_commit" ]; then
        print_success "Le projet est déjà à jour!"
        exit 0
    fi
    
    # Vérifier les modifications locales
    local_changes=$(git status --porcelain 2>/dev/null)
    if [ -n "$local_changes" ] && [ "$FORCE" = false ]; then
        print_warning "Modifications locales détectées:"
        echo "$local_changes" | head -10
        
        if [ "$DRY_RUN" = false ]; then
            print_error "Utilisez --force pour écraser les modifications locales"
            exit 1
        fi
    fi
    
    # Configurer le remote si nécessaire
    if ! git remote | grep -q "github"; then
        print_info "Ajout du remote GitHub..."
        git remote add github "https://github.com/$GITHUB_REPO.git"
    fi
    
    # Fetch les modifications
    print_info "Récupération des modifications depuis GitHub..."
    git fetch github "$BRANCH"
    
    # Afficher les fichiers modifiés
    diff_files=$(git diff --name-only HEAD "github/$BRANCH" 2>/dev/null || true)
    if [ -n "$diff_files" ]; then
        file_count=$(echo "$diff_files" | wc -l)
        print_info "$file_count fichiers à synchroniser:"
        echo "$diff_files" | head -20 | while read -r f; do
            echo "  • $f"
        done
        
        if [ "$file_count" -gt 20 ]; then
            echo "  ... et $((file_count - 20)) autres fichiers"
        fi
    fi
    
    # Mode dry-run
    if [ "$DRY_RUN" = true ]; then
        print_warning "[DRY-RUN] Aucune modification appliquée"
        exit 0
    fi
    
    # Créer une sauvegarde si demandé
    if [ "$BACKUP" = true ]; then
        print_info "Création d'une sauvegarde..."
        backup_path=$(create_backup)
        print_success "Sauvegarde créée: $backup_path"
    fi
    
    # Fusionner les modifications
    print_info "Fusion des modifications..."
    
    if [ "$FORCE" = true ]; then
        # Reset hard vers le remote
        git reset --hard "github/$BRANCH"
    else
        # Merge normal
        if ! git merge "github/$BRANCH" --no-edit; then
            print_error "Conflits détectés! Résolution manuelle requise."
            git diff --name-only --diff-filter=U
            exit 1
        fi
    fi
    
    # Succès
    new_commit=$(get_local_commit)
    print_success "Synchronisation réussie!"
    print_success "Nouveau commit local: $new_commit"
    
    # Rappels
    if echo "$diff_files" | grep -q "package.json"; then
        print_warning "package.json a été modifié. Exécutez: pnpm install"
    fi
    
    if echo "$diff_files" | grep -q "drizzle/"; then
        print_warning "Le schéma de base de données a été modifié. Exécutez: pnpm db:push"
    fi
}

main "$@"
