/**
 * Avatar Upload Component
 * 
 * Handles avatar image upload with preview and crop.
 */

import { useState, useRef, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * AvatarUpload props
 */
interface AvatarUploadProps {
  /**
   * Current avatar URL
   */
  currentAvatar?: string;

  /**
   * Upload handler
   */
  onUpload: (file: File) => Promise<void>;

  /**
   * Delete handler
   */
  onDelete?: () => Promise<void>;

  /**
   * Loading state
   */
  loading?: boolean;
}

/**
 * AvatarUpload Component
 */
export function AvatarUpload({
  currentAvatar,
  onUpload,
  onDelete,
  loading = false,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      setUploading(true);
      await onUpload(file);
    } catch (error) {
      console.error('Upload error:', error);
      setPreview(currentAvatar || null);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = async (): Promise<void> => {
    if (!onDelete) return;
    try {
      setUploading(true);
      await onDelete();
      setPreview(null);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 dark:border-primary/40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          {preview ? (
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <Camera className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Upload Overlay */}
        {uploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"
          >
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </motion.div>
        )}

        {/* Delete Button */}
        {preview && onDelete && !uploading && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={handleDelete}
            className="absolute -top-2 -right-2 w-8 h-8 bg-danger-500 text-white rounded-full flex items-center justify-center hover:bg-danger-600 transition-colors"
            aria-label="Supprimer l'avatar"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || loading}
        />
        <Button
          variant="outline"
          size="sm"
          icon={Camera}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || loading}
        >
          {preview ? 'Changer' : 'Ajouter une photo'}
        </Button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
        Formats acceptés: JPG, PNG, GIF (max 5MB)
      </p>
    </div>
  );
}

