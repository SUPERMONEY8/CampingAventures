# Comment créer une sortie d'exemple dans Firestore

## Option 1 : Via la Console Firebase (Recommandé)

1. Allez sur [Firebase Console](https://console.firebase.google.com/project/camping-aventures/firestore)
2. Cliquez sur **Firestore Database**
3. Cliquez sur **Commencer** si c'est la première fois
4. Cliquez sur **Démarrer en mode test** (pour le développement)
5. Cliquez sur **Ajouter une collection**
6. Nommez la collection : `trips`
7. Cliquez sur **Ajouter un document**
8. Laissez l'ID généré automatiquement ou créez-en un
9. Copiez-collez le contenu du fichier `example-trip.json` dans les champs

**Important** : Les dates doivent être converties en Timestamp Firestore. Dans la console :
- Pour chaque champ de type date, cliquez sur le type et sélectionnez **timestamp**
- Entrez la date au format ISO (ex: `2025-01-06T00:00:00.000Z`)

## Option 2 : Via le script (nécessite permissions admin)

Si vous avez les permissions admin, vous pouvez modifier temporairement les règles Firestore :

1. Dans `firestore.rules`, changez temporairement :
```javascript
match /trips/{tripId} {
  allow read: if true;
  allow write: if true; // TEMPORAIRE - À REMETTRE EN PRODUCTION
}
```

2. Exécutez le script :
```bash
bun run scripts/create-example-trip.ts
```

3. **IMPORTANT** : Remettez les règles de sécurité après !

## Option 3 : Utiliser Firebase Admin SDK

Pour un script plus robuste, utilisez Firebase Admin SDK avec un compte de service.

## Structure des données

Le fichier `example-trip.json` contient toutes les propriétés nécessaires :
- ✅ Hero section (images, titre, localisation)
- ✅ Info cards (date, durée, participants, prix, etc.)
- ✅ Description longue avec highlights
- ✅ Itinéraire complet (3 jours avec activités)
- ✅ Prévisions météo (7 jours)
- ✅ Checklist équipement (11 items)
- ✅ Point de rendez-vous
- ✅ Participants (3 personnes)
- ✅ Avis et notes (4 avis avec photos)

Une fois créée, la sortie sera visible sur :
`https://camping-aventures.web.app/trips/[ID_DU_DOCUMENT]`

