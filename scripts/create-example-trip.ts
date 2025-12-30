/**
 * Script to create an example trip in Firestore
 * 
 * Run with: bun run scripts/create-example-trip.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import type { Trip } from '../src/types';

// Firebase config (same as in .env.local)
const firebaseConfig = {
  apiKey: "AIzaSyCLQ_9RsfXuADTNzcRLUu3ihfmLflNtzL8",
  authDomain: "camping-aventures.firebaseapp.com",
  projectId: "camping-aventures",
  storageBucket: "camping-aventures.firebasestorage.app",
  messagingSenderId: "57354850876",
  appId: "1:57354850876:web:97b68a125e664310b6e939",
  measurementId: "G-YMR7F4R6TZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Create example trip
 */
async function createExampleTrip(): Promise<void> {
  try {
    // Calculate dates
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // 7 days from now
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3); // 3 days trip

    // Create trip data
    const tripData = {
      title: "Randonnée dans les Aurès - Aventure Nature",
      date: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      duration: 3,
      location: {
        name: "Parc National des Aurès, Batna",
        coordinates: {
          lat: 35.3111,
          lng: 6.8444
        }
      },
      difficulty: "intermédiaire" as const,
      maxParticipants: 12,
      participants: [
        {
          userId: "guide1",
          userName: "Ahmed Benali",
          role: "guide",
          joinedAt: Timestamp.fromDate(new Date())
        },
        {
          userId: "user1",
          userName: "Fatima Zohra",
          role: "participant",
          joinedAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
        },
        {
          userId: "user2",
          userName: "Mohamed Amine",
          role: "participant",
          joinedAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000))
        }
      ],
      status: "upcoming" as const,
      description: "Découvrez la beauté sauvage des Aurès lors de cette randonnée de 3 jours à travers les montagnes et les vallées verdoyantes.",
      longDescription: `Cette aventure de 3 jours vous emmènera à travers les paysages époustouflants du Parc National des Aurès, l'une des régions les plus spectaculaires d'Algérie.

Jour après jour, vous découvrirez des panoramas à couper le souffle, des cascades cristallines, et une faune et flore exceptionnelles. Notre guide expérimenté vous accompagnera tout au long du parcours, partageant ses connaissances sur l'histoire et la géologie de la région.

Le soir, nous installerons notre campement dans des sites présélectionnés offrant des vues imprenables sur les montagnes. Autour du feu de camp, vous pourrez déguster des plats traditionnels préparés avec des ingrédients locaux.

Cette expérience est parfaite pour les amateurs de nature et de photographie, ainsi que pour ceux qui cherchent à se déconnecter du quotidien et à se reconnecter avec la nature.`,
      price: 15000,
      accommodation: "tente" as const,
      meals: ["Petit-déjeuner", "Déjeuner", "Dîner"],
      included: [
        "Transport aller-retour depuis Batna",
        "Guide expérimenté",
        "Tentes et matériel de camping",
        "Tous les repas",
        "Eau potable",
        "Assurance de base"
      ],
      notIncluded: [
        "Équipement personnel (sac de couchage, vêtements)",
        "Boissons alcoolisées",
        "Dépenses personnelles",
        "Pourboires (optionnel)"
      ],
      highlights: [
        "Vues panoramiques sur les montagnes des Aurès",
        "Observation de la faune locale (mouflons, aigles)",
        "Photographie de paysages exceptionnels",
        "Nuits sous les étoiles",
        "Rencontre avec la culture locale"
      ],
      meetingPoint: {
        name: "Gare routière de Batna",
        address: "Avenue de la Gare, Batna 05000",
        coordinates: {
          lat: 35.5556,
          lng: 6.1744
        },
        time: "07:00",
        notes: "Rendez-vous devant l'entrée principale. Le bus partira à 7h30 précises."
      },
      images: [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
        "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200",
        "https://images.unsplash.com/photo-1464822759844-d150ad8496e5?w=1200"
      ],
      itinerary: [
        {
          day: 1,
          date: Timestamp.fromDate(startDate),
          description: "Départ et première randonnée vers le camp de base",
          activities: [
            {
              id: "act1",
              tripId: "",
              name: "Départ de Batna",
              time: Timestamp.fromDate(new Date(startDate.getTime() + 7 * 60 * 60 * 1000)), // 7h
              type: "hiking" as const,
              points: 10,
              role: "participant",
              description: "Rassemblement et départ en bus vers le point de départ de la randonnée"
            },
            {
              id: "act2",
              tripId: "",
              name: "Randonnée vers le camp de base",
              time: Timestamp.fromDate(new Date(startDate.getTime() + 9 * 60 * 60 * 1000)), // 9h
              type: "hiking" as const,
              points: 50,
              role: "participant",
              description: "Randonnée de 4 heures à travers les vallées, pause déjeuner en chemin"
            },
            {
              id: "act3",
              tripId: "",
              name: "Installation du campement",
              time: Timestamp.fromDate(new Date(startDate.getTime() + 16 * 60 * 60 * 1000)), // 16h
              type: "camping" as const,
              points: 20,
              role: "participant",
              description: "Montage des tentes et préparation du dîner autour du feu"
            }
          ]
        },
        {
          day: 2,
          date: Timestamp.fromDate(new Date(startDate.getTime() + 24 * 60 * 60 * 1000)),
          description: "Journée complète d'exploration et de photographie",
          activities: [
            {
              id: "act4",
              tripId: "",
              name: "Lever de soleil et petit-déjeuner",
              time: Timestamp.fromDate(new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000)), // 6h
              type: "social" as const,
              points: 10,
              role: "participant",
              description: "Observation du lever de soleil et petit-déjeuner en plein air"
            },
            {
              id: "act5",
              tripId: "",
              name: "Randonnée vers le sommet",
              time: Timestamp.fromDate(new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000)), // 8h
              type: "hiking" as const,
              points: 100,
              role: "participant",
              description: "Ascension vers le point culminant de la journée, vue panoramique à 1800m"
            },
            {
              id: "act6",
              tripId: "",
              name: "Session photo",
              time: Timestamp.fromDate(new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000)), // 12h
              type: "photography" as const,
              points: 30,
              role: "participant",
              description: "Pause pour photographier les paysages et la faune"
            },
            {
              id: "act7",
              tripId: "",
              name: "Retour au camp et soirée",
              time: Timestamp.fromDate(new Date(startDate.getTime() + 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000)), // 17h
              type: "social" as const,
              points: 20,
              role: "participant",
              description: "Dîner traditionnel et partage d'expériences autour du feu"
            }
          ]
        },
        {
          day: 3,
          date: Timestamp.fromDate(new Date(startDate.getTime() + 48 * 60 * 60 * 1000)),
          description: "Dernière randonnée et retour",
          activities: [
            {
              id: "act8",
              tripId: "",
              name: "Randonnée matinale",
              time: Timestamp.fromDate(new Date(startDate.getTime() + 48 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000)), // 7h
              type: "hiking" as const,
              points: 50,
              role: "participant",
              description: "Dernière randonnée vers une cascade cachée"
            },
            {
              id: "act9",
              tripId: "",
              name: "Déjeuner et départ",
              time: Timestamp.fromDate(new Date(startDate.getTime() + 48 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000)), // 13h
              type: "social" as const,
              points: 10,
              role: "participant",
              description: "Dernier repas ensemble et retour vers Batna"
            }
          ]
        }
      ],
      equipment: [
        {
          id: "eq1",
          name: "Sac à dos (40-60L)",
          category: "gear" as const,
          required: true,
          description: "Sac à dos confortable avec système de répartition de charge"
        },
        {
          id: "eq2",
          name: "Sac de couchage",
          category: "gear" as const,
          required: true,
          description: "Température de confort -5°C minimum"
        },
        {
          id: "eq3",
          name: "Matelas de sol",
          category: "gear" as const,
          required: true,
          description: "Matelas isolant pour le confort"
        },
        {
          id: "eq4",
          name: "Chaussures de randonnée",
          category: "clothing" as const,
          required: true,
          description: "Chaussures montantes avec semelle anti-dérapante"
        },
        {
          id: "eq5",
          name: "Vêtements chauds",
          category: "clothing" as const,
          required: true,
          description: "Pull, veste polaire, bonnet, gants"
        },
        {
          id: "eq6",
          name: "Vêtements de pluie",
          category: "clothing" as const,
          required: false,
          description: "Veste et pantalon imperméables"
        },
        {
          id: "eq7",
          name: "Lampe frontale",
          category: "gear" as const,
          required: true,
          description: "Avec piles de rechange"
        },
        {
          id: "eq8",
          name: "Gourde (2L minimum)",
          category: "gear" as const,
          required: true,
          description: "Gourde ou camelbak"
        },
        {
          id: "eq9",
          name: "Trousse de secours",
          category: "safety" as const,
          required: true,
          description: "Basique avec pansements, désinfectant, etc."
        },
        {
          id: "eq10",
          name: "Crème solaire",
          category: "safety" as const,
          required: true,
          description: "SPF 50+"
        },
        {
          id: "eq11",
          name: "En-cas énergétiques",
          category: "food" as const,
          required: false,
          description: "Barres énergétiques, fruits secs, noix"
        }
      ],
      weatherForecast: [
        {
          date: Timestamp.fromDate(startDate),
          temperature: { min: 8, max: 22 },
          condition: "sunny" as const,
          icon: "sunny",
          advice: "Parfait pour la randonnée, n'oubliez pas la crème solaire"
        },
        {
          date: Timestamp.fromDate(new Date(startDate.getTime() + 24 * 60 * 60 * 1000)),
          temperature: { min: 10, max: 24 },
          condition: "cloudy" as const,
          icon: "cloudy",
          advice: "Nuages occasionnels, conditions idéales"
        },
        {
          date: Timestamp.fromDate(new Date(startDate.getTime() + 48 * 60 * 60 * 1000)),
          temperature: { min: 9, max: 20 },
          condition: "sunny" as const,
          icon: "sunny",
          advice: "Beau temps prévu, journée parfaite"
        },
        {
          date: Timestamp.fromDate(new Date(startDate.getTime() + 72 * 60 * 60 * 1000)),
          temperature: { min: 7, max: 18 },
          condition: "cloudy" as const,
          icon: "cloudy",
          advice: "Légère baisse de température"
        },
        {
          date: Timestamp.fromDate(new Date(startDate.getTime() + 96 * 60 * 60 * 1000)),
          temperature: { min: 6, max: 16 },
          condition: "rainy" as const,
          icon: "rainy",
          advice: "Pluie possible, prévoir vêtements imperméables"
        },
        {
          date: Timestamp.fromDate(new Date(startDate.getTime() + 120 * 60 * 60 * 1000)),
          temperature: { min: 8, max: 19 },
          condition: "sunny" as const,
          icon: "sunny",
          advice: "Retour du beau temps"
        },
        {
          date: Timestamp.fromDate(new Date(startDate.getTime() + 144 * 60 * 60 * 1000)),
          temperature: { min: 9, max: 21 },
          condition: "sunny" as const,
          icon: "sunny",
          advice: "Conditions optimales"
        }
      ],
      reviews: [
        {
          id: "rev1",
          userId: "user3",
          userName: "Sarah Khelil",
          userAvatar: "https://i.pravatar.cc/150?img=1",
          rating: 5,
          comment: "Une expérience inoubliable ! Les paysages sont à couper le souffle et notre guide Ahmed était exceptionnel. Je recommande vivement cette sortie.",
          date: Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
          photos: [
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800"
          ]
        },
        {
          id: "rev2",
          userId: "user4",
          userName: "Karim Bensaid",
          rating: 4,
          comment: "Très belle randonnée, bien organisée. Le seul point négatif est que 3 jours passent trop vite !",
          date: Timestamp.fromDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000))
        },
        {
          id: "rev3",
          userId: "user5",
          userName: "Amina Cherif",
          userAvatar: "https://i.pravatar.cc/150?img=5",
          rating: 5,
          comment: "Parfait pour les amateurs de nature et de photographie. Les repas étaient délicieux et le groupe était super sympa.",
          date: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
          photos: [
            "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800"
          ]
        },
        {
          id: "rev4",
          userId: "user6",
          userName: "Youssef Amrani",
          rating: 4,
          comment: "Bonne expérience globale. Le niveau était adapté pour un intermédiaire comme moi.",
          date: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000))
        }
      ],
      averageRating: 4.5,
      totalReviews: 4,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Add trip to Firestore
    const docRef = await addDoc(collection(db, 'trips'), tripData);
    
    console.log('✅ Sortie créée avec succès!');
    console.log('📋 ID du document:', docRef.id);
    console.log('🔗 URL de la page:', `https://camping-aventures.web.app/trips/${docRef.id}`);
    console.log('\n📝 Détails de la sortie:');
    console.log(`   Titre: ${tripData.title}`);
    console.log(`   Date: ${startDate.toLocaleDateString('fr-FR')}`);
    console.log(`   Durée: ${tripData.duration} jours`);
    console.log(`   Prix: ${tripData.price} DA`);
    console.log(`   Participants: ${tripData.participants.length}/${tripData.maxParticipants}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la sortie:', error);
    process.exit(1);
  }
}

// Run the script
createExampleTrip()
  .then(() => {
    console.log('\n✨ Script terminé avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });

