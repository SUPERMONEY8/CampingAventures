#!/bin/bash
# Script de déploiement Firebase

echo "🔥 Déploiement sur Firebase Hosting..."

# Vérifier que le build existe
if [ ! -d "dist" ]; then
    echo "❌ Le dossier dist/ n'existe pas. Lancez 'bun run build' d'abord."
    exit 1
fi

# Se connecter à Firebase (si pas déjà connecté)
echo "📝 Connexion à Firebase..."
firebase login --no-localhost

# Initialiser Firebase Hosting (si pas déjà fait)
if [ ! -f ".firebaserc" ]; then
    echo "⚙️  Initialisation de Firebase Hosting..."
    firebase init hosting --project camping-aventures
fi

# Déployer
echo "🚀 Déploiement en cours..."
firebase deploy --only hosting

echo "✅ Déploiement terminé!"
echo "🌐 Votre app est disponible sur: https://camping-aventures.web.app"



