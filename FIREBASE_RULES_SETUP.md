# 🔥 Configuration des Règles Firestore

## ⚠️ Problème Résolu

Les règles Firestore dans les commentaires de `firebase.ts` contenaient des caractères spéciaux qui causaient des erreurs de syntaxe.

## ✅ Solution

Un fichier `firestore.rules` a été créé avec les règles correctes, sans caractères problématiques.

## 📝 Comment Appliquer les Règles

### Option 1: Via Firebase Console (Recommandé)

1. Allez sur [Firebase Console](https://console.firebase.google.com/project/camping-aventures/firestore/rules)
2. Ouvrez l'onglet "Rules"
3. Copiez le contenu du fichier `firestore.rules`
4. Collez-le dans l'éditeur
5. Cliquez sur "Publier"

### Option 2: Via Firebase CLI

```bash
# Déployer les règles
bunx firebase-tools deploy --only firestore:rules
```

## 🔒 Règles Configurées

- ✅ **Users**: Lecture pour tous les utilisateurs authentifiés, écriture uniquement sur son propre profil
- ✅ **Trips**: Lecture pour tous, écriture admin uniquement
- ✅ **Messages**: Lecture/écriture pour les participants du trip uniquement
- ✅ **Photos**: Lecture pour participants, écriture pour le propriétaire
- ✅ **SOS Alerts**: Lecture pour créateur et admin, création pour utilisateurs
- ✅ **User Progress**: Lecture pour le propriétaire, écriture système uniquement
- ✅ **Badges**: Lecture pour tous, écriture admin uniquement
- ✅ **Achievements**: Lecture pour le propriétaire, écriture système uniquement

## 🧪 Mode Test (Pour Développement)

Si vous voulez commencer en mode test (moins sécurisé mais plus facile):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

⚠️ **Attention**: Le mode test expire après la date spécifiée. Utilisez-le uniquement pour le développement.

## ✅ Vérification

Après avoir publié les règles:
1. Testez la création d'un utilisateur
2. Testez la lecture des trips
3. Vérifiez que les règles fonctionnent correctement

