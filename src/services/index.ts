/**
 * Services exports
 */

export * from './firebase';
export * from './auth.service';
export * from './trip.service';
// User service exports (avoid conflicts with auth.service)
export {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  getUserStats,
  getUserTrips,
  getUserBadges,
  updateMedicalInfo,
} from './user.service';

