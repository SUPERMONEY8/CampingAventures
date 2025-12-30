/**
 * Live Trip Service
 * 
 * Service for managing real-time trip activities, challenges, location sharing,
 * photos, and group messaging during an active trip.
 */

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type {
  Challenge,
  LiveParticipant,
  TripPhoto,
  GroupMessage,
} from '../types';

/**
 * Start an activity
 * 
 * @param activityId - Activity ID
 * @param userId - User ID
 */
export async function startActivity(activityId: string, userId: string): Promise<void> {
  try {
    const activityRef = doc(db, 'activities', activityId);
    await updateDoc(activityRef, {
      status: 'active',
      startedAt: Timestamp.now(),
      'participants.active': userId,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error starting activity:', err);
    throw new Error(`Failed to start activity: ${err.message}`);
  }
}

/**
 * Complete an activity
 * 
 * @param activityId - Activity ID
 * @param userId - User ID
 */
export async function completeActivity(activityId: string, userId: string): Promise<void> {
  try {
    const activityRef = doc(db, 'activities', activityId);
    const activitySnap = await getDocs(query(collection(db, 'activities'), where('id', '==', activityId)));
    
    if (!activitySnap.empty) {
      const activityData = activitySnap.docs[0].data() as DocumentData;
      const completedParticipants = activityData.completedParticipants || [];
      
      if (!completedParticipants.includes(userId)) {
        completedParticipants.push(userId);
      }

      await updateDoc(activityRef, {
        status: 'completed',
        completedAt: Timestamp.now(),
        completedParticipants,
      });
    }
  } catch (error) {
    const err = error as Error;
    console.error('Error completing activity:', err);
    throw new Error(`Failed to complete activity: ${err.message}`);
  }
}

/**
 * Share location
 * 
 * @param tripId - Trip ID
 * @param userId - User ID
 * @param coords - Coordinates
 */
export async function shareLocation(
  tripId: string,
  userId: string,
  coords: { lat: number; lng: number }
): Promise<void> {
  try {
    const participantsRef = collection(db, 'liveParticipants');
    const q = query(
      participantsRef,
      where('tripId', '==', tripId),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // Update existing
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, {
        location: {
          lat: coords.lat,
          lng: coords.lng,
          timestamp: Timestamp.now(),
          shared: true,
        },
        lastSeen: Timestamp.now(),
      });
    } else {
      // Create new
      await addDoc(participantsRef, {
        tripId,
        userId,
        location: {
          lat: coords.lat,
          lng: coords.lng,
          timestamp: Timestamp.now(),
          shared: true,
        },
        lastSeen: Timestamp.now(),
        status: 'active',
      });
    }
  } catch (error) {
    const err = error as Error;
    console.error('Error sharing location:', err);
    throw new Error(`Failed to share location: ${err.message}`);
  }
}

/**
 * Update challenge progress
 * 
 * @param challengeId - Challenge ID
 * @param userId - User ID
 * @param progress - Progress value
 */
export async function updateChallenge(
  challengeId: string,
  userId: string,
  progress: number
): Promise<void> {
  try {
    const challengeRef = doc(db, 'challenges', challengeId);
    const challengeSnap = await getDocs(query(collection(db, 'challenges'), where('id', '==', challengeId)));
    
    if (!challengeSnap.empty) {
      const challengeData = challengeSnap.docs[0].data() as DocumentData;
      const currentValue = challengeData.currentValue || 0;
      const newValue = Math.max(currentValue, progress);
      const completed = newValue >= challengeData.targetValue;
      const participants = challengeData.participants || [];
      
      if (completed && !participants.includes(userId)) {
        participants.push(userId);
      }

      await updateDoc(challengeRef, {
        currentValue: newValue,
        completed,
        participants,
        ...(completed && !challengeData.completedAt ? { completedAt: Timestamp.now() } : {}),
      });
    }
  } catch (error) {
    const err = error as Error;
    console.error('Error updating challenge:', err);
    throw new Error(`Failed to update challenge: ${err.message}`);
  }
}

/**
 * Upload trip photo
 * 
 * @param tripId - Trip ID
 * @param userId - User ID
 * @param file - Photo file
 * @param caption - Optional caption
 * @param location - Optional location
 * @returns Photo URL
 */
export async function uploadTripPhoto(
  tripId: string,
  userId: string,
  file: File,
  caption?: string,
  location?: { lat: number; lng: number }
): Promise<string> {
  try {
    // Upload to Firebase Storage
    const storageRef = ref(storage, `trips/${tripId}/photos/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const photoUrl = await getDownloadURL(storageRef);

    // Create thumbnail (simplified - in production, use image processing)
    const thumbnailUrl = photoUrl; // TODO: Generate thumbnail

    // Save photo metadata to Firestore
    const photosRef = collection(db, 'tripPhotos');
    await addDoc(photosRef, {
      tripId,
      userId,
      url: photoUrl,
      thumbnailUrl,
      caption: caption || '',
      timestamp: Timestamp.now(),
      likes: [],
      comments: [],
      location: location || null,
    });

    return photoUrl;
  } catch (error) {
    const err = error as Error;
    console.error('Error uploading trip photo:', err);
    throw new Error(`Failed to upload photo: ${err.message}`);
  }
}

/**
 * Send group message
 * 
 * @param tripId - Trip ID
 * @param senderId - Sender user ID
 * @param senderName - Sender name
 * @param senderAvatar - Sender avatar URL
 * @param content - Message content
 * @param type - Message type
 * @param isGuide - Whether sender is guide
 * @param location - Optional location
 * @param photoUrl - Optional photo URL
 */
export async function sendGroupMessage(
  tripId: string,
  senderId: string,
  senderName: string,
  senderAvatar: string | undefined,
  content: string,
  type: 'text' | 'photo' | 'location' = 'text',
  isGuide: boolean = false,
  location?: { lat: number; lng: number },
  photoUrl?: string
): Promise<void> {
  try {
    const messagesRef = collection(db, 'groupMessages');
    await addDoc(messagesRef, {
      tripId,
      senderId,
      senderName,
      senderAvatar: senderAvatar || null,
      content,
      type,
      isGuide,
      timestamp: Timestamp.now(),
      location: location || null,
      photoUrl: photoUrl || null,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error sending group message:', err);
    throw new Error(`Failed to send message: ${err.message}`);
  }
}

/**
 * Get live participants for a trip
 * 
 * @param tripId - Trip ID
 * @returns Array of live participants
 */
export async function getLiveParticipants(tripId: string): Promise<LiveParticipant[]> {
  try {
    const participantsRef = collection(db, 'liveParticipants');
    const q = query(participantsRef, where('tripId', '==', tripId));

    const snapshot = await getDocs(q);
    const participants: LiveParticipant[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as DocumentData;
      participants.push({
        userId: data.userId,
        userName: data.userName || 'Unknown',
        avatarUrl: data.avatarUrl,
        status: data.status || 'active',
        lastSeen: data.lastSeen?.toDate ? data.lastSeen.toDate() : new Date(data.lastSeen),
        location: data.location ? {
          lat: data.location.lat,
          lng: data.location.lng,
          timestamp: data.location.timestamp?.toDate ? data.location.timestamp.toDate() : new Date(data.location.timestamp),
          shared: data.location.shared || false,
        } : undefined,
      });
    });

    return participants;
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching live participants:', err);
    throw new Error(`Failed to fetch participants: ${err.message}`);
  }
}

/**
 * Subscribe to live participants updates
 * 
 * @param tripId - Trip ID
 * @param callback - Callback function
 * @returns Unsubscribe function
 */
export function subscribeToLiveParticipants(
  tripId: string,
  callback: (participants: LiveParticipant[]) => void
): Unsubscribe {
  const participantsRef = collection(db, 'liveParticipants');
  const q = query(participantsRef, where('tripId', '==', tripId));

  return onSnapshot(
    q,
    (snapshot) => {
      const participants: LiveParticipant[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DocumentData;
        participants.push({
          userId: data.userId,
          userName: data.userName || 'Unknown',
          avatarUrl: data.avatarUrl,
          status: data.status || 'active',
          lastSeen: data.lastSeen?.toDate ? data.lastSeen.toDate() : new Date(data.lastSeen),
          location: data.location ? {
            lat: data.location.lat,
            lng: data.location.lng,
            timestamp: data.location.timestamp?.toDate ? data.location.timestamp.toDate() : new Date(data.location.timestamp),
            shared: data.location.shared || false,
          } : undefined,
        });
      });
      callback(participants);
    },
    (error) => {
      console.error('Error in live participants subscription:', error);
    }
  );
}

/**
 * Subscribe to group messages
 * 
 * @param tripId - Trip ID
 * @param callback - Callback function
 * @returns Unsubscribe function
 */
export function subscribeToGroupMessages(
  tripId: string,
  callback: (messages: GroupMessage[]) => void
): Unsubscribe {
  const messagesRef = collection(db, 'groupMessages');
  const q = query(
    messagesRef,
    where('tripId', '==', tripId)
    // Note: In production, add orderBy('timestamp', 'desc') with index
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const messages: GroupMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DocumentData;
        messages.push({
          id: docSnap.id,
          tripId: data.tripId,
          senderId: data.senderId,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          content: data.content,
          type: data.type || 'text',
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
          isGuide: data.isGuide || false,
          location: data.location ? {
            lat: data.location.lat,
            lng: data.location.lng,
          } : undefined,
          photoUrl: data.photoUrl,
        });
      });
      // Sort by timestamp
      messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      callback(messages);
    },
    (error) => {
      console.error('Error in group messages subscription:', error);
    }
  );
}

/**
 * Get trip challenges
 * 
 * @param tripId - Trip ID
 * @returns Array of challenges
 */
export async function getTripChallenges(tripId: string): Promise<Challenge[]> {
  try {
    const challengesRef = collection(db, 'challenges');
    const q = query(challengesRef, where('tripId', '==', tripId));

    const snapshot = await getDocs(q);
    const challenges: Challenge[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as DocumentData;
      challenges.push({
        id: docSnap.id,
        tripId: data.tripId,
        name: data.name,
        description: data.description,
        objective: data.objective,
        targetValue: data.targetValue,
        currentValue: data.currentValue || 0,
        points: data.points,
        timeLimit: data.timeLimit,
        startTime: data.startTime?.toDate ? data.startTime.toDate() : (data.startTime ? new Date(data.startTime) : undefined),
        endTime: data.endTime?.toDate ? data.endTime.toDate() : (data.endTime ? new Date(data.endTime) : undefined),
        completed: data.completed || false,
        participants: data.participants || [],
      });
    });

    return challenges;
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching challenges:', err);
    throw new Error(`Failed to fetch challenges: ${err.message}`);
  }
}

/**
 * Get trip photos
 * 
 * @param tripId - Trip ID
 * @returns Array of trip photos
 */
export async function getTripPhotos(tripId: string): Promise<TripPhoto[]> {
  try {
    const photosRef = collection(db, 'tripPhotos');
    const q = query(photosRef, where('tripId', '==', tripId));

    const snapshot = await getDocs(q);
    const photos: TripPhoto[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as DocumentData;
      photos.push({
        id: docSnap.id,
        tripId: data.tripId,
        userId: data.userId,
        userName: data.userName || 'Unknown',
        avatarUrl: data.avatarUrl,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        caption: data.caption,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
        likes: data.likes || [],
        comments: data.comments || [],
        location: data.location ? {
          lat: data.location.lat,
          lng: data.location.lng,
        } : undefined,
      });
    });

    // Sort by timestamp (newest first)
    photos.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return photos;
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching trip photos:', err);
    throw new Error(`Failed to fetch photos: ${err.message}`);
  }
}

