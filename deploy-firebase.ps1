# Script de déploiement Firebase pour Windows PowerShell

Write-Host "🔥 Déploiement sur Firebase Hosting..." -ForegroundColor Cyan

# Vérifier que le build existe
if (-not (Test-Path "dist")) {
    Write-Host "❌ Le dossier dist/ n'existe pas. Lancez 'bun run build' d'abord." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build trouvé dans dist/" -ForegroundColor Green

# Se connecter à Firebase
Write-Host "📝 Connexion à Firebase..." -ForegroundColor Yellow
Write-Host "Si vous n'êtes pas connecté, suivez les instructions dans le navigateur." -ForegroundColor Yellow

# Utiliser npx pour exécuter firebase
npx firebase-tools login --no-localhost

# Vérifier la connexion
Write-Host "🔍 Vérification de la connexion..." -ForegroundColor Yellow
npx firebase-tools projects:list

# Déployer
Write-Host "🚀 Déploiement en cours..." -ForegroundColor Cyan
npx firebase-tools deploy --only hosting

Write-Host "✅ Déploiement terminé!" -ForegroundColor Green
Write-Host "🌐 Votre app est disponible sur: https://camping-aventures.web.app" -ForegroundColor Green



