# Instructions pour créer une sortie manuellement dans Firebase Console

## Étapes détaillées

### 1. Accéder à Firestore
- Allez sur : https://console.firebase.google.com/project/camping-aventures/firestore/data
- Si la collection `trips` n'existe pas, créez-la

### 2. Créer un nouveau document
- Cliquez sur **Ajouter un document**
- Laissez l'ID généré automatiquement (ex: `abc123xyz`)
- **Notez cet ID** - vous en aurez besoin pour accéder à la page !

### 3. Ajouter les champs

Copiez-collez ces champs un par un dans la console Firebase. Pour chaque champ :
1. Cliquez sur **Ajouter un champ**
2. Entrez le nom du champ
3. Sélectionnez le type approprié
4. Entrez la valeur

#### Champs simples (string, number, boolean)

| Nom du champ | Type | Valeur |
|-------------|------|--------|
| `title` | string | `Randonnée dans les Aurès - Aventure Nature` |
| `description` | string | `Découvrez la beauté sauvage des Aurès lors de cette randonnée de 3 jours à travers les montagnes et les vallées verdoyantes.` |
| `longDescription` | string | `Cette aventure de 3 jours vous emmènera à travers les paysages époustouflants du Parc National des Aurès, l'une des régions les plus spectaculaires d'Algérie.\n\nJour après jour, vous découvrirez des panoramas à couper le souffle, des cascades cristallines, et une faune et flore exceptionnelles.` |
| `difficulty` | string | `intermédiaire` |
| `maxParticipants` | number | `12` |
| `status` | string | `upcoming` |
| `price` | number | `15000` |
| `accommodation` | string | `tente` |
| `duration` | number | `3` |
| `averageRating` | number | `4.5` |
| `totalReviews` | number | `4` |

#### Champs date (Timestamp)

Pour les champs date, sélectionnez le type **timestamp** et entrez :
- `date`: `2025-01-06T00:00:00.000Z`
- `endDate`: `2025-01-09T00:00:00.000Z`
- `createdAt`: `2024-12-30T00:00:00.000Z`
- `updatedAt`: `2024-12-30T00:00:00.000Z`

#### Champs array (string)

| Nom du champ | Type | Valeurs (une par ligne) |
|-------------|------|------------------------|
| `meals` | array | `Petit-déjeuner`, `Déjeuner`, `Dîner` |
| `included` | array | `Transport aller-retour depuis Batna`, `Guide expérimenté`, `Tentes et matériel de camping`, `Tous les repas`, `Eau potable`, `Assurance de base` |
| `notIncluded` | array | `Équipement personnel (sac de couchage, vêtements)`, `Boissons alcoolisées`, `Dépenses personnelles`, `Pourboires (optionnel)` |
| `highlights` | array | `Vues panoramiques sur les montagnes des Aurès`, `Observation de la faune locale (mouflons, aigles)`, `Photographie de paysages exceptionnels`, `Nuits sous les étoiles`, `Rencontre avec la culture locale` |
| `images` | array | `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200`, `https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200`, `https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200`, `https://images.unsplash.com/photo-1464822759844-d150ad8496e5?w=1200` |

#### Champs map (géolocalisation)

**`location`** (type: map) :
- `name` (string): `Parc National des Aurès, Batna`
- `coordinates` (map):
  - `lat` (number): `35.3111`
  - `lng` (number): `6.8444`

**`meetingPoint`** (type: map) :
- `name` (string): `Gare routière de Batna`
- `address` (string): `Avenue de la Gare, Batna 05000`
- `time` (string): `07:00`
- `notes` (string): `Rendez-vous devant l'entrée principale. Le bus partira à 7h30 précises.`
- `coordinates` (map):
  - `lat` (number): `35.5556`
  - `lng` (number): `6.1744`

#### Champs array de maps (participants)

**`participants`** (type: array) - Ajoutez 3 éléments :

**Participant 1** (map) :
- `userId` (string): `guide1`
- `userName` (string): `Ahmed Benali`
- `role` (string): `guide`
- `joinedAt` (timestamp): `2024-12-30T00:00:00.000Z`

**Participant 2** (map) :
- `userId` (string): `user1`
- `userName` (string): `Fatima Zohra`
- `role` (string): `participant`
- `joinedAt` (timestamp): `2024-12-28T00:00:00.000Z`

**Participant 3** (map) :
- `userId` (string): `user2`
- `userName` (string): `Mohamed Amine`
- `role` (string): `participant`
- `joinedAt` (timestamp): `2024-12-29T00:00:00.000Z`

### 4. Accéder à la page

Une fois créé, notez l'ID du document et accédez à :
```
https://camping-aventures.web.app/trips/[ID_DU_DOCUMENT]
```

Par exemple, si l'ID est `abc123xyz` :
```
https://camping-aventures.web.app/trips/abc123xyz
```

## Note importante

Les champs complexes (itinerary, equipment, weatherForecast, reviews) sont optionnels pour un premier test. Vous pouvez les ajouter plus tard si nécessaire.

Pour un test rapide, créez au minimum :
- `title`
- `date` (timestamp)
- `location` (map avec name et coordinates)
- `difficulty`
- `maxParticipants`
- `status`
- `description`

