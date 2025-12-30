# 🔧 Correction des Champs de la Sortie

## ❌ Problèmes identifiés dans votre document Firestore

Vos champs ne correspondent pas aux noms et types attendus par le code.

## ✅ Corrections à faire dans Firebase Console

### 1. Renommer les champs incorrects

| ❌ Nom actuel (incorrect) | ✅ Nom correct | Type |
|--------------------------|----------------|------|
| `Durée` | `duration` | **number** |
| `Participants` | `maxParticipants` | **number** |
| `Prix` | `price` | **number** |
| `Image` + `Image 2` | `images` | **array** |
| `status` (valeur "A venir") | `status` | **string** (valeur: "upcoming") |

### 2. Corriger les types

#### `duration` (number)
- ❌ Actuel: `"3 jours"` (string)
- ✅ Correct: `3` (number)

#### `maxParticipants` (number)
- ❌ Actuel: `"12"` (string)
- ✅ Correct: `12` (number)

#### `price` (number)
- ❌ Actuel: `"6000 DA"` (string)
- ✅ Correct: `6000` (number)

#### `status` (string)
- ❌ Actuel: `"A venir"`
- ✅ Correct: `"upcoming"` (ou "ongoing", "completed", "cancelled")

#### `images` (array)
- ❌ Actuel: Deux champs séparés `Image` et `Image 2`
- ✅ Correct: Un seul champ `images` (type: array) avec toutes les URLs

### 3. Ajouter les champs manquants OBLIGATOIRES

#### `date` (timestamp) - **OBLIGATOIRE**
- Type: **timestamp**
- Valeur: `2025-01-06T00:00:00.000Z` (ou une date future)

#### `location.coordinates` (map) - **OBLIGATOIRE**
Dans le champ `location` (map), ajoutez :
- `coordinates` (map):
  - `lat` (number): `35.3111`
  - `lng` (number): `6.8444`

#### `createdAt` et `updatedAt` (timestamps)
- Type: **timestamp**
- Valeur: Date actuelle

## 📋 Structure correcte complète

Voici la structure exacte à avoir dans Firestore :

```
title: "Randonnée dans les Aurès - Aventure Nature" (string)
description: "Découvrez la beauté sauvage..." (string)
difficulty: "intermédiaire" (string)
status: "upcoming" (string) ← IMPORTANT: pas "A venir"
duration: 3 (number) ← pas "3 jours"
maxParticipants: 12 (number) ← pas "12"
price: 6000 (number) ← pas "6000 DA"
date: [timestamp] 2025-01-06T00:00:00.000Z ← OBLIGATOIRE
createdAt: [timestamp] 2024-12-30T00:00:00.000Z
updatedAt: [timestamp] 2024-12-30T00:00:00.000Z

location (map):
  name: "Parc National des Aurès, Batna" (string)
  coordinates (map): ← OBLIGATOIRE
    lat: 35.3111 (number)
    lng: 6.8444 (number)

images (array): ← Un seul champ array
  [0]: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200"
  [1]: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200"
```

## 🚀 Étapes de correction rapide

1. **Supprimez** les champs incorrects : `Durée`, `Participants`, `Prix`, `Image`, `Image 2`
2. **Ajoutez** les champs corrects avec les bons types
3. **Vérifiez** que `date` existe (timestamp)
4. **Vérifiez** que `location.coordinates` existe (map avec lat/lng)
5. **Changez** `status` de "A venir" à "upcoming"

## 💡 Astuce

Le code a été amélioré pour gérer automatiquement certains cas (comme extraire le nombre de "3 jours"), mais il est préférable d'utiliser les bons noms et types dès le départ.

Une fois corrigé, la page devrait fonctionner ! 🎉

