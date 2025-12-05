import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Video, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadMultipleImages } from '../services/cloudinary';
import { updateSavedRecipe } from '../services/interactions';
import { getRecipeById } from '../services/recipes';
import toast from 'react-hot-toast';
import './EditSavedRecipeModal.css';

const EditSavedRecipeModal = ({ isOpen, onClose, savedRecipe, onSave }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeLink: '',
    difficulty: '',
    duration: '',
    ingredients: [''],
    steps: [''],
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [originalRecipe, setOriginalRecipe] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && savedRecipe) {
      const loadRecipe = async () => {
        try {
          setIsLoading(true);
          // Load original recipe if we have originalPostId
          if (savedRecipe.originalPostId) {
            const original = await getRecipeById(savedRecipe.originalPostId);
            setOriginalRecipe(original);
          }

          // Pre-fill form with saved recipe data (customized or original)
          setFormData({
            title: savedRecipe.title || '',
            description: savedRecipe.description || '',
            youtubeLink: savedRecipe.youtubeLink || '',
            difficulty: savedRecipe.difficulty || '',
            duration: savedRecipe.duration?.toString() || '',
            ingredients: savedRecipe.ingredients && savedRecipe.ingredients.length > 0 
              ? savedRecipe.ingredients 
              : [''],
            steps: savedRecipe.steps && savedRecipe.steps.length > 0 
              ? savedRecipe.steps 
              : [''],
          });

          // Set existing images
          if (savedRecipe.imageUrls && savedRecipe.imageUrls.length > 0) {
            setExistingImageUrls(savedRecipe.imageUrls);
            const previews = savedRecipe.imageUrls.map((url, index) => ({
              file: null,
              preview: url,
              id: `existing-${index}`,
              isExisting: true,
            }));
            setImagePreviews(previews);
          }
        } catch (error) {
          console.error('Error loading saved recipe:', error);
          toast.error('Failed to load recipe');
        } finally {
          setIsLoading(false);
        }
      };

      loadRecipe();
    } else {
      // Reset when modal closes
      setFormData({
        title: '',
        description: '',
        youtubeLink: '',
        difficulty: '',
        duration: '',
        ingredients: [''],
        steps: [''],
      });
      setImages([]);
      setImagePreviews([]);
      setExistingImageUrls([]);
      setErrors({});
      setIsLoading(false);
    }
  }, [isOpen, savedRecipe]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleImageSelect = (files) => {
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random(),
      isExisting: false,
    }));

    setImages((prev) => [...prev, ...newImages]);
    setImagePreviews((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setImagePreviews((prev) => {
      const item = prev.find((img) => img.id === id);
      if (item && item.preview && !item.isExisting) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
    setImages((prev) => prev.filter((img) => img.id !== id));
    setExistingImageUrls((prev) => prev.filter((url, index) => {
      const previewItem = imagePreviews.find((img) => img.id === `existing-${index}`);
      return previewItem && previewItem.id !== id;
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.difficulty) {
      newErrors.difficulty = 'Difficulty is required';
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Duration must be a positive number';
    }

    const validIngredients = formData.ingredients.filter((i) => i.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    }

    const validSteps = formData.steps.filter((s) => s.trim());
    if (validSteps.length === 0) {
      newErrors.steps = 'At least one step is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload new images
      let imageUrls = [...existingImageUrls];
      const newImageFiles = images.map((img) => img.file).filter(Boolean);
      if (newImageFiles.length > 0) {
        const uploadedUrls = await uploadMultipleImages(newImageFiles);
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      // Update saved recipe with customized fields
      await updateSavedRecipe(savedRecipe.savedRecipeId, user.uid, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        ingredients: formData.ingredients.filter((i) => i.trim()),
        steps: formData.steps.filter((s) => s.trim()),
        imageUrls,
      });

      toast.success('Saved recipe updated successfully!');
      onSave?.();
      onClose();
    } catch (error) {
      console.error('Error updating saved recipe:', error);
      toast.error(error.message || 'Failed to update saved recipe');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-saved-modal-overlay" onClick={onClose}>
      <div className="edit-saved-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-saved-modal-header">
          <h2>Edit Saved Recipe</h2>
          <button
            type="button"
            onClick={onClose}
            className="edit-saved-modal-close"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {originalRecipe && originalRecipe.authorId !== user?.uid && (
          <div className="edit-saved-modal-credit">
            <p>
              Credit: <strong>@{originalRecipe.authorName || 'Original Author'}</strong>
            </p>
            <p className="edit-saved-modal-credit-note">
              You're editing your saved copy. The original recipe remains unchanged.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="edit-saved-modal-loading">
            <p>Loading recipe...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="edit-saved-modal-form">
            <div className="edit-saved-form-section">
              <label className="edit-saved-form-label">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`edit-saved-form-input ${errors.title ? 'error' : ''}`}
                placeholder="Recipe title"
              />
              {errors.title && <p className="edit-saved-form-error">{errors.title}</p>}
            </div>

            <div className="edit-saved-form-section">
              <label className="edit-saved-form-label">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`edit-saved-form-textarea ${errors.description ? 'error' : ''}`}
                placeholder="Recipe description"
                rows={4}
              />
              {errors.description && <p className="edit-saved-form-error">{errors.description}</p>}
            </div>

            <div className="edit-saved-form-section">
              <label className="edit-saved-form-label">Images</label>
              <div className="edit-saved-image-upload">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="edit-saved-upload-button"
                >
                  <Upload size={20} />
                  Add Images
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageSelect(Array.from(e.target.files || []))}
                  style={{ display: 'none' }}
                />
                <div className="edit-saved-image-preview">
                  {imagePreviews.map((img) => (
                    <div key={img.id} className="edit-saved-image-item">
                      <img src={img.preview} alt="Preview" />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="edit-saved-image-remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="edit-saved-form-row">
              <div className="edit-saved-form-section">
                <label className="edit-saved-form-label">Difficulty *</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className={`edit-saved-form-input ${errors.difficulty ? 'error' : ''}`}
                >
                  <option value="">Select difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                {errors.difficulty && <p className="edit-saved-form-error">{errors.difficulty}</p>}
              </div>

              <div className="edit-saved-form-section">
                <label className="edit-saved-form-label">Duration (minutes) *</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className={`edit-saved-form-input ${errors.duration ? 'error' : ''}`}
                  placeholder="30"
                  min="1"
                />
                {errors.duration && <p className="edit-saved-form-error">{errors.duration}</p>}
              </div>
            </div>

            <div className="edit-saved-form-section">
              <label className="edit-saved-form-label">Ingredients *</label>
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="edit-saved-array-item">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleArrayChange('ingredients', index, e.target.value)}
                    className="edit-saved-form-input"
                    placeholder={`Ingredient ${index + 1}`}
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('ingredients', index)}
                      className="edit-saved-remove-item"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('ingredients')}
                className="edit-saved-add-item"
              >
                <Plus size={16} />
                Add Ingredient
              </button>
              {errors.ingredients && <p className="edit-saved-form-error">{errors.ingredients}</p>}
            </div>

            <div className="edit-saved-form-section">
              <label className="edit-saved-form-label">Steps *</label>
              {formData.steps.map((step, index) => (
                <div key={index} className="edit-saved-array-item">
                  <textarea
                    value={step}
                    onChange={(e) => handleArrayChange('steps', index, e.target.value)}
                    className="edit-saved-form-textarea"
                    placeholder={`Step ${index + 1}`}
                    rows={2}
                  />
                  {formData.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('steps', index)}
                      className="edit-saved-remove-item"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('steps')}
                className="edit-saved-add-item"
              >
                <Plus size={16} />
                Add Step
              </button>
              {errors.steps && <p className="edit-saved-form-error">{errors.steps}</p>}
            </div>

            <div className="edit-saved-modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="edit-saved-modal-cancel"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="edit-saved-modal-save"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditSavedRecipeModal;

