/**
 * Preparation AI Utilities
 * 
 * Intelligent functions for providing personalized trip preparation advice
 * based on user profile, trip details, weather, and difficulty level.
 */

import type { User, Trip, WeatherForecast, PhysicalLevel } from '../types';

/**
 * Get personalized checklist recommendations
 * 
 * @param user - User profile
 * @param trip - Trip details
 * @returns Array of personalized recommendations
 */
export function getPersonalizedChecklist(user: User | null, trip: Trip): string[] {
  const recommendations: string[] = [];

  if (!user) {
    return recommendations;
  }

  // Based on physical level
  if (user.physicalLevel === 'débutant') {
    recommendations.push('Prévoyez des bâtons de marche pour vous aider');
    recommendations.push('Emportez une trousse de secours complète');
  } else if (user.physicalLevel === 'avancé') {
    recommendations.push('Vous pouvez emporter un équipement plus léger');
  }

  // Based on interests
  if (user.interests.includes('photo')) {
    recommendations.push('N\'oubliez pas votre appareil photo et batteries de rechange');
    recommendations.push('Emportez un trépied si vous prévoyez des photos de nuit');
  }

  if (user.interests.includes('survie')) {
    recommendations.push('Ajoutez un couteau multifonction et une boussole');
  }

  // Based on age
  if (user.age > 50) {
    recommendations.push('Prévoyez des médicaments pour les douleurs articulaires');
    recommendations.push('Emportez des vêtements chauds supplémentaires');
  }

  // Based on trip difficulty
  if (trip.difficulty === 'avancé') {
    recommendations.push('Équipement technique recommandé : corde, mousquetons');
    recommendations.push('Prévoyez des vêtements de rechange complets');
  }

  // Based on duration
  if (trip.duration && trip.duration > 3) {
    recommendations.push('Prévoyez des vêtements de rechange pour plusieurs jours');
    recommendations.push('Emportez des produits d\'hygiène en quantité suffisante');
  }

  return recommendations;
}

/**
 * Get weather advice based on forecast
 * 
 * @param forecast - Weather forecast array
 * @param trip - Trip details
 * @returns Personalized weather advice
 */
export function getWeatherAdvice(forecast: WeatherForecast[] | undefined): string {
  if (!forecast || forecast.length === 0) {
    return 'Consultez les prévisions météo régulièrement avant le départ.';
  }

  const firstDay = forecast[0];
  const advice: string[] = [];

  // Temperature advice
  if (firstDay.temperature.max < 10) {
    advice.push('**Températures froides prévues** : Prévoyez des vêtements chauds en couches (sous-vêtements thermiques, polaire, veste imperméable).');
  } else if (firstDay.temperature.max > 25) {
    advice.push('**Températures élevées** : Hydratez-vous régulièrement, portez un chapeau et de la crème solaire SPF 50+.');
  }

  // Condition advice
  if (firstDay.condition === 'rainy' || firstDay.condition === 'stormy') {
    advice.push('**Pluie/orage prévu** : Vêtements imperméables obligatoires, protégez vos affaires dans des sacs étanches.');
    advice.push('Soyez prudent sur les sentiers glissants.');
  } else if (firstDay.condition === 'sunny') {
    advice.push('**Beau temps prévu** : Conditions idéales pour la randonnée. N\'oubliez pas la crème solaire et un chapeau.');
  } else if (firstDay.condition === 'snowy') {
    advice.push('**Neige prévue** : Équipement hivernal nécessaire (crampons, vêtements chauds, gants).');
  }

  // Multi-day advice
  if (forecast.length > 1) {
    const hasRain = forecast.some((f) => f.condition === 'rainy' || f.condition === 'stormy');
    if (hasRain) {
      advice.push('**Sur plusieurs jours** : Prévoyez des vêtements de rechange secs pour chaque jour.');
    }
  }

  return advice.length > 0 ? advice.join('\n\n') : 'Conditions météo favorables. Profitez bien de votre sortie !';
}

/**
 * Get physical preparation advice
 * 
 * @param userLevel - User's physical level
 * @param tripDifficulty - Trip difficulty
 * @returns Personalized physical preparation advice
 */
export function getPhysicalAdvice(userLevel: PhysicalLevel, tripDifficulty: PhysicalLevel): string {
  const advice: string[] = [];

  // If user level matches trip difficulty
  if (userLevel === tripDifficulty) {
    advice.push(`Votre niveau **${userLevel}** correspond parfaitement à cette sortie.`);
    advice.push('Maintenez votre condition actuelle avec des activités régulières.');
  } else if (
    (userLevel === 'débutant' && tripDifficulty === 'intermédiaire') ||
    (userLevel === 'intermédiaire' && tripDifficulty === 'avancé')
  ) {
    advice.push(`Cette sortie est d'un niveau supérieur à votre niveau actuel (**${tripDifficulty}** vs **${userLevel}**).`);
    advice.push('**Recommandations** :');
    advice.push('- Augmentez progressivement votre activité physique');
    advice.push('- Pratiquez des randonnées de 2-3h avec dénivelé');
    advice.push('- Renforcez vos jambes (squats, fentes)');
    advice.push('- Améliorez votre endurance cardio');
  } else if (userLevel === 'débutant' && tripDifficulty === 'avancé') {
    advice.push('⚠️ **Attention** : Cette sortie est de niveau **avancé** alors que vous êtes **débutant**.');
    advice.push('**Préparation intensive recommandée** :');
    advice.push('- Commencez par des randonnées faciles de 1-2h');
    advice.push('- Augmentez progressivement la durée et le dénivelé');
    advice.push('- Entraînez-vous 3-4 fois par semaine pendant 4-6 semaines');
    advice.push('- Consultez un médecin si nécessaire');
  } else {
    // User level is higher than trip difficulty
    advice.push(`Cette sortie est adaptée à votre niveau. Vous devriez être à l'aise.`);
  }

  // General advice based on trip difficulty
  if (tripDifficulty === 'avancé') {
    advice.push('\n**Pour un niveau avancé** :');
    advice.push('- Pratiquez des randonnées avec dénivelé important (500m+)');
    advice.push('- Entraînez-vous avec un sac à dos chargé (8-10kg)');
    advice.push('- Renforcez vos chevilles et genoux');
  } else if (tripDifficulty === 'intermédiaire') {
    advice.push('\n**Pour un niveau intermédiaire** :');
    advice.push('- Marchez régulièrement (30-45 min, 3x/semaine)');
    advice.push('- Pratiquez des montées d\'escaliers');
    advice.push('- Étirez-vous après chaque séance');
  }

  return advice.join('\n\n');
}

/**
 * Get equipment recommendations based on trip and weather
 * 
 * @param trip - Trip details
 * @param weather - Weather forecast
 * @returns Array of equipment recommendations
 */
export function getEquipmentRecommendations(trip: Trip, weather: WeatherForecast[] | undefined): string[] {
  const recommendations: string[] = [];

  // Based on weather
  if (weather && weather.length > 0) {
    const firstDay = weather[0];
    
    if (firstDay.condition === 'rainy' || firstDay.condition === 'stormy') {
      recommendations.push('Veste imperméable (Gore-Tex recommandé)');
      recommendations.push('Pantalon imperméable');
      recommendations.push('Sacs étanches pour protéger vos affaires');
      recommendations.push('Chaussures imperméables');
    }

    if (firstDay.temperature.min < 5) {
      recommendations.push('Sous-vêtements thermiques');
      recommendations.push('Gants et bonnet chauds');
      recommendations.push('Veste polaire épaisse');
    }

    if (firstDay.condition === 'sunny') {
      recommendations.push('Crème solaire SPF 50+');
      recommendations.push('Chapeau ou casquette');
      recommendations.push('Lunettes de soleil');
    }
  }

  // Based on trip difficulty
  if (trip.difficulty === 'avancé') {
    recommendations.push('Boussole et carte topographique');
    recommendations.push('Lampe frontale avec piles de rechange');
    recommendations.push('Corde légère (10m)');
    recommendations.push('Trousse de secours avancée');
  }

  // Based on accommodation
  if (trip.accommodation === 'tente') {
    recommendations.push('Tente (si non fournie)');
    recommendations.push('Matelas de sol isolant');
    recommendations.push('Sac de couchage adapté à la température');
  }

  // Based on duration
  if (trip.duration && trip.duration > 2) {
    recommendations.push('Vêtements de rechange pour chaque jour');
    recommendations.push('Produits d\'hygiène en quantité suffisante');
    recommendations.push('Batteries de rechange pour tous vos appareils');
  }

  // Based on location
  if (trip.location.name.toLowerCase().includes('montagne') || trip.location.name.toLowerCase().includes('aures')) {
    recommendations.push('Bâtons de marche (recommandés pour les descentes)');
    recommendations.push('Vêtements chauds en couches');
  }

  return recommendations;
}

/**
 * Match question to answer
 * 
 * @param question - User question
 * @param trip - Trip details
 * @param user - User profile
 * @param weather - Weather forecast
 * @returns Answer string
 */
export function matchQuestionToAnswer(
  question: string,
  trip: Trip,
  user: User | null,
  weather: WeatherForecast[] | undefined
): string {
  const lowerQuestion = question.toLowerCase();

  // Equipment/Checklist questions
  if (
    lowerQuestion.includes('emporter') ||
    lowerQuestion.includes('apporter') ||
    lowerQuestion.includes('équipement') ||
    lowerQuestion.includes('matériel') ||
    lowerQuestion.includes('checklist') ||
    lowerQuestion.includes('liste')
  ) {
    const recommendations = getEquipmentRecommendations(trip, weather);
    const personalized = getPersonalizedChecklist(user, trip);
    
    let answer = '**Équipement recommandé** :\n\n';
    
    if (recommendations.length > 0) {
      answer += recommendations.map((r) => `- ${r}`).join('\n');
    }
    
    if (personalized.length > 0) {
      answer += '\n\n**Recommandations personnalisées** :\n\n';
      answer += personalized.map((r) => `- ${r}`).join('\n');
    }
    
    answer += '\n\nConsultez votre checklist de préparation pour plus de détails.';
    
    return answer;
  }

  // Weather questions
  if (
    lowerQuestion.includes('météo') ||
    lowerQuestion.includes('temps') ||
    lowerQuestion.includes('pluie') ||
    lowerQuestion.includes('neige') ||
    lowerQuestion.includes('température')
  ) {
    return getWeatherAdvice(weather);
  }

  // Physical preparation questions
  if (
    lowerQuestion.includes('physique') ||
    lowerQuestion.includes('préparer') ||
    lowerQuestion.includes('entraînement') ||
    lowerQuestion.includes('condition') ||
    lowerQuestion.includes('exercice')
  ) {
    if (user) {
      return getPhysicalAdvice(user.physicalLevel, trip.difficulty);
    }
    return 'Pour des conseils personnalisés, connectez-vous à votre compte.';
  }

  // Emergency questions
  if (
    lowerQuestion.includes('urgence') ||
    lowerQuestion.includes('sécurité') ||
    lowerQuestion.includes('danger') ||
    lowerQuestion.includes('problème') ||
    lowerQuestion.includes('accident')
  ) {
    return `**En cas d'urgence** :\n\n` +
      `1. **Contactez immédiatement le guide** : ${trip.participants?.find(p => p.role === 'guide')?.userName || 'Guide'}\n` +
      `2. **Numéro d'urgence** : 17 (Police) / 14 (Protection civile)\n` +
      `3. **Vos informations médicales** doivent être à jour dans votre profil\n` +
      `4. **Restez calme** et suivez les instructions du guide\n` +
      `5. **Ne vous éloignez pas** du groupe sans prévenir\n\n` +
      `Le guide est formé aux premiers secours et connaît les procédures d'urgence.`;
  }

  // Meeting point questions
  if (
    lowerQuestion.includes('rendez-vous') ||
    lowerQuestion.includes('point de départ') ||
    lowerQuestion.includes('où') ||
    lowerQuestion.includes('lieu')
  ) {
    if (trip.meetingPoint) {
      return `**Point de rendez-vous** :\n\n` +
        `📍 ${trip.meetingPoint.name}\n` +
        `${trip.meetingPoint.address}\n\n` +
        `⏰ **Heure de départ** : ${trip.meetingPoint.time}\n\n` +
        `Rendez-vous **15 minutes avant** l'heure de départ.\n` +
        (trip.meetingPoint.notes ? `\n**Note** : ${trip.meetingPoint.notes}` : '');
    }
    return 'Le point de rendez-vous sera communiqué prochainement.';
  }

  // Default answer
  return `Je peux vous aider avec :\n\n` +
    `- **Équipement à emporter** : Demandez "Que dois-je emporter ?"\n` +
    `- **Météo** : Demandez "Quel temps fera-t-il ?"\n` +
    `- **Préparation physique** : Demandez "Comment me préparer physiquement ?"\n` +
    `- **Urgences** : Demandez "Que faire en cas d'urgence ?"\n` +
    `- **Point de rendez-vous** : Demandez "Où est le point de rendez-vous ?"\n\n` +
    `Posez-moi une question plus spécifique et je vous aiderai !`;
}

