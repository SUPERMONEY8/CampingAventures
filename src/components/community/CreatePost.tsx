/**
 * Create Post Component
 * 
 * Floating button and modal for creating new community posts.
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  X,
  Camera,
  FileText,
  HelpCircle,
  MapPin,
  Globe,
  Lock,
  UserCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Tabs } from '../navigation/Tabs';
import type { PostType, PostVisibility } from '../../types';

/**
 * CreatePost props
 */
interface CreatePostProps {
  /**
   * On post created
   */
  onCreate: (post: {
    type: PostType;
    content?: string;
    photoUrl?: string;
    visibility: PostVisibility;
    location?: string;
    taggedUsers?: string[];
    hashtags?: string[];
  }) => void;
}

/**
 * CreatePost Component
 */
export function CreatePost({ onCreate }: CreatePostProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [postType, setPostType] = useState<PostType>('reflection');
  const [content, setContent] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [location, setLocation] = useState('');
  const [hashtags, setHashtags] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file select
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handle create post
   */
  const handleCreate = (): void => {
    // Extract hashtags from content
    const extractedHashtags = content.match(/#\w+/g)?.map((tag) => tag.slice(1)) || [];
    const manualHashtags = hashtags.split(',').map((tag) => tag.trim()).filter(Boolean);
    const allHashtags = [...extractedHashtags, ...manualHashtags];

    onCreate({
      type: postType,
      content: content.trim() || undefined,
      photoUrl: photoPreview || undefined,
      visibility,
      location: location.trim() || undefined,
      hashtags: allHashtags.length > 0 ? allHashtags : undefined,
    });

    // Reset form
    setContent('');
    setPhotoPreview(null);
    setLocation('');
    setHashtags('');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-white shadow-2xl z-50 flex items-center justify-center"
        aria-label="Créer un post"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Create Post Modal */}
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Créer un post
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Post Type Tabs */}
          <Tabs
            tabs={[
              { id: 'reflection', label: 'Réflexion', icon: FileText },
              { id: 'photo', label: 'Photo', icon: Camera },
              { id: 'question', label: 'Question', icon: HelpCircle },
            ]}
            activeTab={postType}
            onChange={(tab) => setPostType(tab as PostType)}
            className="mb-6"
          />

          {/* Content Input */}
          <div className="mb-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                postType === 'question'
                  ? 'Posez votre question...'
                  : postType === 'photo'
                  ? 'Ajoutez une légende...'
                  : 'Partagez vos pensées...'
              }
              className="w-full medical-input min-h-[120px] resize-none"
              rows={4}
            />
          </div>

          {/* Photo Upload */}
          {postType === 'photo' && (
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setPhotoPreview(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary transition-colors flex flex-col items-center gap-2"
                >
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Cliquez pour ajouter une photo
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Location */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Localisation (optionnel)
              </label>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Où êtes-vous ?"
              className="w-full medical-input"
            />
          </div>

          {/* Hashtags */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              Hashtags (séparés par des virgules)
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#aventure #camping"
              className="w-full medical-input"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Vous pouvez aussi utiliser # dans votre texte
            </p>
          </div>

          {/* Visibility */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              Visibilité
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setVisibility('public')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  visibility === 'public'
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <Globe className="w-5 h-5 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300">Public</span>
              </button>
              <button
                onClick={() => setVisibility('friends')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  visibility === 'friends'
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <UserCheck className="w-5 h-5 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300">Amis</span>
              </button>
              <button
                onClick={() => setVisibility('private')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  visibility === 'private'
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <Lock className="w-5 h-5 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300">Privé</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={!content.trim() && !photoPreview}
              className="flex-1"
            >
              Publier
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

