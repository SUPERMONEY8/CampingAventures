# 🎯 Guide Rapide : Créer une Sortie d'Exemple

## Méthode la plus simple : Console Firebase

### 1. Accéder à Firestore
👉 https://console.firebase.google.com/project/camping-aventures/firestore/data

### 2. Créer la collection (si elle n'existe pas)
- Cliquez sur **Commencer** ou **Ajouter une collection**
- Nom : `trips`
- Cliquez sur **Suivant**

### 3. Créer un document
- Cliquez sur **Ajouter un document**
- Laissez l'ID généré automatiquement (ex: `abc123xyz`)
- **📝 NOTEZ CET ID** - vous en aurez besoin !

### 4. Ajouter les champs essentiels

Copiez-collez ces champs dans la console :

#### Champs de base (minimum requis)

| Champ | Type | Valeur |
|-------|------|--------|
| `title` | string | `Randonnée dans les Aurès - Aventure Nature` |
| `description` | string | `Découvrez la beauté sauvage des Aurès lors de cette randonnée de 3 jours` |
| `difficulty` | string | `intermédiaire` |
| `maxParticipants` | number | `12` |
| `status` | string | `upcoming` |
| `price` | number | `15000` |
| `duration` | number | `3` |
| `date` | **timestamp** | `2025-01-06T00:00:00.000Z` |
| `endDate` | **timestamp** | `2025-01-09T00:00:00.000Z` |
| `createdAt` | **timestamp** | `2024-12-30T00:00:00.000Z` |
| `updatedAt` | **timestamp** | `2024-12-30T00:00:00.000Z` |

#### Localisation (type: map)

**Champ `location`** :
- Cliquez sur **Ajouter un champ** → Type: **map**
- Nom: `location`
- Ajoutez ces sous-champs :
  - `name` (string): `Parc National des Aurès, Batna`
  - `coordinates` (map):
    - `lat` (number): `35.3111`
    - `lng` (number): `6.8444`

#### Images (type: array)

**Champ `images`** :
- Type: **array**
- Ajoutez ces URLs (une par ligne) :
  ```
  https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200
  https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200
  https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200
  https://images.unsplash.com/photo-1464822759844-d150ad8496e5?w=1200
  ```

#### Participants (type: array de maps)

**Champ `participants`** :
- Type: **array**
- Ajoutez 3 éléments (maps) :

**Élément 1** :
- `userId`: `guide1`
- `userName`: `Ahmed Benali`
- `role`: `guide`
- `joinedAt`: timestamp `2024-12-30T00:00:00.000Z`

**Élément 2** :
- `userId`: `user1`
- `userName`: `Fatima Zohra`
- `role`: `participant`
- `joinedAt`: timestamp `2024-12-28T00:00:00.000Z`

**Élément 3** :
- `userId`: `user2`
- `userName`: `Mohamed Amine`
- `role`: `participant`
- `joinedAt`: timestamp `2024-12-29T00:00:00.000Z`

### 5. Accéder à la page

Une fois créé, utilisez l'ID du document :
```
https://camping-aventures.web.app/trips/[VOTRE_ID]
```

Par exemple : `https://camping-aventures.web.app/trips/abc123xyz`

---

## 📋 Champs optionnels (pour une sortie complète)

Vous pouvez ajouter ces champs plus tard pour tester toutes les fonctionnalités :

- `longDescription` (string) - Description détaillée
- `highlights` (array) - Points forts
- `included` / `notIncluded` (array) - Ce qui est inclus/non inclus
- `meals` (array) - Repas inclus
- `accommodation` (string) - Type d'hébergement
- `meetingPoint` (map) - Point de rendez-vous
- `itinerary` (array) - Programme détaillé
- `equipment` (array) - Checklist équipement
- `weatherForecast` (array) - Prévisions météo
- `reviews` (array) - Avis et notes

Consultez `scripts/example-trip.json` pour voir tous les champs disponibles.

---

## ⚡ Alternative : Modifier temporairement les règles

Si vous voulez utiliser le script automatique :

1. Modifiez `firestore.rules` ligne 38 :
```javascript
allow write: if true; // TEMPORAIRE
```

2. Exécutez :
```bash
bun run scripts/create-example-trip.ts
```

3. **IMPORTANT** : Remettez les règles après !

