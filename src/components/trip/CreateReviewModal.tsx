/**
 * Create Review Modal Component
 * 
 * Modal for creating a review and rating for a trip.
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, X, Upload, Image as ImageIcon } from 'lucide-react';
import { createReview } from '../../services/review.service';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../hooks/useUser';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';

/**
 * CreateReviewModal props
 */
interface CreateReviewModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  tripTitle: string;
}

/**
 * CreateReviewModal Component
 */
export function CreateReviewModal({ open, onClose, tripId, tripTitle }: CreateReviewModalProps) {
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(user?.id);
  const queryClient = useQueryClient();
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  /**
   * Handle photo selection
   */
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 5) {
      alert('Vous ne pouvez ajouter que 5 photos maximum');
      return;
    }

    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    // Create previews
    const newPreviews = [...photoPreviews];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          setPhotoPreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * Remove photo
   */
  const handleRemovePhoto = (index: number): void => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  /**
   * Create review mutation
   */
  const createReviewMutation = useMutation({
    mutationFn: () => {
      if (!user?.id || !userProfile) {
        throw new Error('Vous devez être connecté pour laisser un avis');
      }
      if (rating === 0) {
        throw new Error('Veuillez sélectionner une note');
      }
      if (!comment.trim()) {
        throw new Error('Veuillez écrire un commentaire');
      }

      return createReview(
        tripId,
        user.id,
        userProfile.name,
        userProfile.avatarUrl,
        rating,
        comment,
        photos.length > 0 ? photos : undefined
      );
    },
    onSuccess: () => {
      // Invalidate queries to refresh reviews
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['tripReviews', tripId] });
      
      // Reset form
      setRating(0);
      setComment('');
      setPhotos([]);
      setPhotoPreviews([]);
      
      // Close modal
      onClose();
    },
    onError: (error: Error) => {
      alert(error.message || 'Erreur lors de la création de l\'avis');
    },
  });

  /**
   * Handle submit
   */
  const handleSubmit = (): void => {
    createReviewMutation.mutate();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Laisser un avis
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Partagez votre expérience pour <span className="font-semibold">{tripTitle}</span>
          </p>

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Commentaire *
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Décrivez votre expérience..."
              rows={5}
              className="w-full"
            />
          </div>

          {/* Photos */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Photos (optionnel, max 5)
            </label>
            <div className="flex flex-wrap gap-3 mb-3">
              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {photoPreviews.length < 5 && (
                <label className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {photoPreviews.length === 0 && (
              <Button
                variant="outline"
                size="sm"
                icon={ImageIcon}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.multiple = true;
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    handlePhotoSelect({ target } as React.ChangeEvent<HTMLInputElement>);
                  };
                  input.click();
                }}
              >
                Ajouter des photos
              </Button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} disabled={createReviewMutation.isPending}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={createReviewMutation.isPending}
            disabled={rating === 0 || !comment.trim() || createReviewMutation.isPending}
          >
            Publier l'avis
          </Button>
        </div>
      </div>
    </Modal>
  );
}

