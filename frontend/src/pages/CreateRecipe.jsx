import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Video, Plus, X, Clock, ChefHat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadMultipleImages } from '../services/cloudinary';
import { createRecipe, updateRecipe, getRecipeById } from '../services/recipes';
import toast from 'react-hot-toast';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './CreateRecipe.css';

// ============= REUSABLE COMPONENTS =============

const FormInput = ({ label, id, error, required, icon: Icon, ...props }) => (
  <div className="form-input-container">
    <label htmlFor={id} className="form-label">
      {label} {required && <span className="required-asterisk">*</span>}
    </label>
    <div className="form-input-wrapper">
      {Icon && (
        <div className="form-input-icon">
          <Icon className="icon" />
        </div>
      )}
      <input
        id={id}
        className={`form-input ${Icon ? 'with-icon' : ''} ${error ? 'error' : ''}`}
        aria-required={required}
        {...props}
      />
    </div>
    {error && <p className="error-message">{error}</p>}
  </div>
);

const FormTextarea = ({ label, id, error, required, ...props }) => (
  <div className="form-input-container">
    <label htmlFor={id} className="form-label">
      {label} {required && <span className="required-asterisk">*</span>}
    </label>
    <textarea
      id={id}
      className={`form-textarea ${error ? 'error' : ''}`}
      aria-required={required}
      {...props}
    />
    {error && <p className="error-message">{error}</p>}
  </div>
);

const FormSelect = ({ label, id, error, required, options, ...props }) => (
  <div className="form-input-container">
    <label htmlFor={id} className="form-label">
      {label} {required && <span className="required-asterisk">*</span>}
    </label>
    <select
      id={id}
      className={`form-select ${error ? 'error' : ''}`}
      aria-required={required}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="error-message">{error}</p>}
  </div>
);

const ImageUploadZone = ({ onFileSelect, previews, onRemove }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      toast.error('Please select only image files');
    }

    const oversizedFiles = validFiles.filter(file => file.size > 2 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Some files are too large. Maximum size is 2MB per file.');
    }

    const validSizedFiles = validFiles.filter(file => file.size <= 2 * 1024 * 1024);
    if (validSizedFiles.length > 0) {
      onFileSelect(validSizedFiles);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="image-upload-container">
      <div
        onClick={handleClick}
        onKeyDown={handleKeyPress}
        className="image-upload-zone"
        role="button"
        tabIndex={0}
        aria-label="Upload recipe images"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="image-upload-input"
          aria-label="Select recipe images"
          onClick={(e) => e.stopPropagation()} // Stop propagation on the input itself
        />
        <Upload className="upload-icon" />
        <p className="upload-text">Click to upload images</p>
        <p className="upload-subtext">PNG, JPG up to 2MB each</p>
      </div>

      <AnimatePresence>
        {previews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="image-previews-grid"
          >
            {previews.map((preview, index) => (
              <motion.div
                key={preview.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="image-preview-container"
              >
                <img
                  src={preview.preview}
                  alt={`Preview ${index + 1}`}
                  className="image-preview"
                />
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="remove-image-button"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="remove-icon" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
const DynamicList = ({ 
  title, 
  items, 
  onAdd, 
  onRemove, 
  onUpdate, 
  error,
  itemType = 'text',
  placeholder 
}) => (
  <div className="dynamic-list-container">
    <div className="dynamic-list-header">
      <div>
        <h2 className="dynamic-list-title">
          {title} <span className="required-asterisk">*</span>
        </h2>
        <p className="dynamic-list-subtitle">
          {itemType === 'textarea' ? 'Step-by-step instructions' : 'One item per line'}
        </p>
      </div>
      <div className="item-count-badge">
        {items.filter(i => i.trim()).length} {itemType === 'textarea' ? 'steps' : 'items'}
      </div>
    </div>

    {error && (
      <p className="dynamic-list-error">{error}</p>
    )}

    <div className="dynamic-list-items">
      {items.map((item, index) => (
        <motion.div 
          key={index} 
          initial={{ opacity: 0, x: itemType === 'textarea' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="dynamic-list-item"
        >
          <span className="item-number">
            {index + 1}.
          </span>
          {itemType === 'textarea' ? (
            <textarea
              value={item}
              onChange={(e) => onUpdate(index, e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="dynamic-list-textarea"
              aria-label={`${title} ${index + 1}`}
            />
          ) : (
            <input
              type="text"
              value={item}
              onChange={(e) => onUpdate(index, e.target.value)}
              placeholder={placeholder}
              className="dynamic-list-input"
              aria-label={`${title} ${index + 1}`}
            />
          )}
          {items.length > 1 && (
            <motion.button
              type="button"
              onClick={() => onRemove(index)}
              className="remove-item-button"
              aria-label={`Remove ${title} ${index + 1}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="remove-item-icon" />
            </motion.button>
          )}
        </motion.div>
      ))}
    </div>

    <motion.button
      type="button"
      onClick={onAdd}
      className="add-item-button"
      aria-label={`Add new ${title.toLowerCase()}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Plus className="add-item-icon" />
      Add {itemType === 'textarea' ? 'Step' : 'Item'}
    </motion.button>
  </div>
);

// ============= MAIN COMPONENT =============

const CreateRecipe = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { recipeId } = useParams();
  // Determine edit mode based on route path (not just params)
  const isEditMode = location.pathname.startsWith('/edit-recipe') && !!recipeId;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeLink: '',
    difficulty: '',
    duration: '',
    ingredients: [''],
    steps: ['']
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load recipe data if in edit mode
  useEffect(() => {
    if (isEditMode && recipeId) {
      const loadRecipe = async () => {
        try {
          setIsLoading(true);
          const recipeData = await getRecipeById(recipeId);
          
          if (!recipeData) {
            toast.error('Recipe not found');
            navigate('/home');
            return;
          }

          // Check if user is the owner
          if (recipeData.authorId !== user?.uid) {
            toast.error('You do not have permission to edit this recipe');
            navigate('/home');
            return;
          }

          // Pre-fill form with recipe data
          setFormData({
            title: recipeData.title || '',
            description: recipeData.description || '',
            youtubeLink: recipeData.youtubeLink || '',
            difficulty: recipeData.difficulty || '',
            duration: recipeData.duration?.toString() || '',
            ingredients: recipeData.ingredients && recipeData.ingredients.length > 0 
              ? recipeData.ingredients 
              : [''],
            steps: recipeData.steps && recipeData.steps.length > 0 
              ? recipeData.steps 
              : ['']
          });

          // Set existing images
          if (recipeData.imageUrls && recipeData.imageUrls.length > 0) {
            setExistingImageUrls(recipeData.imageUrls);
            // Create previews for existing images
            const previews = recipeData.imageUrls.map((url, index) => ({
              file: null,
              preview: url,
              id: `existing-${index}`,
              isExisting: true
            }));
            setImagePreviews(previews);
          }
        } catch (error) {
          console.error('Error loading recipe:', error);
          toast.error('Failed to load recipe');
          navigate('/home');
        } finally {
          setIsLoading(false);
        }
      };

      loadRecipe();
    } else {
      // Reset form when switching from edit to create mode
      setFormData({
        title: '',
        description: '',
        youtubeLink: '',
        difficulty: '',
        duration: '',
        ingredients: [''],
        steps: ['']
      });
      setImages([]);
      setImagePreviews([]);
      setExistingImageUrls([]);
      setIsLoading(false);
    }
  }, [isEditMode, recipeId, user, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageSelect = (files) => {
    setImages(prev => [...prev, ...files]);
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const preview = imagePreviews[index];
    if (!preview) return;
    
    // Only revoke URL if it's a blob URL (newly uploaded), not an existing image
    if (preview.file && !preview.isExisting) {
      URL.revokeObjectURL(preview.preview);
      // Remove the file from images array
      setImages(prev => prev.filter(file => file !== preview.file));
    }
    
    // Remove from previews
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    // If it's an existing image, also remove from existingImageUrls
    if (preview.isExisting) {
      setExistingImageUrls(prev => prev.filter(url => url !== preview.preview));
    }
  };

  const updateListItem = (list, index, value) => {
    setFormData(prev => ({
      ...prev,
      [list]: prev[list].map((item, i) => i === index ? value : item)
    }));
  };

  const addListItem = (list) => {
    setFormData(prev => ({
      ...prev,
      [list]: [...prev[list], '']
    }));
  };

  const removeListItem = (list, index) => {
    if (formData[list].length > 1) {
      setFormData(prev => ({
        ...prev,
        [list]: prev[list].filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.difficulty) newErrors.difficulty = 'Please select a difficulty level';
    if (!formData.duration || isNaN(formData.duration) || formData.duration <= 0) {
      newErrors.duration = 'Please enter a valid duration in minutes';
    }

    const validIngredients = formData.ingredients.filter(i => i.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    }

    const validSteps = formData.steps.filter(s => s.trim());
    if (validSteps.length === 0) {
      newErrors.steps = 'At least one step is required';
    }

    if (formData.youtubeLink && formData.youtubeLink.trim()) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      if (!youtubeRegex.test(formData.youtubeLink)) {
        newErrors.youtubeLink = 'Please enter a valid YouTube URL';
      }
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

    setIsSubmitting(true);

    try {
      let imageUrls = [...existingImageUrls];
      
      // Upload new images if any
      if (images.length > 0) {
        const uploadResults = await uploadMultipleImages(images);
        const newImageUrls = uploadResults.map(result => result.secure_url);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      const recipeData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        youtubeLink: formData.youtubeLink.trim() || null,
        imageUrls,
        difficulty: formData.difficulty,
        duration: parseInt(formData.duration),
        ingredients: formData.ingredients.filter(i => i.trim()),
        steps: formData.steps.filter(s => s.trim()),
      };

      if (isEditMode) {
        // Update existing recipe
        toast.loading('Updating recipe...', { id: 'save' });
        await updateRecipe(recipeId, recipeData);
        toast.success('Recipe updated successfully!', { id: 'save' });
      } else {
        // Create new recipe
        recipeData.authorId = user.uid;
        recipeData.authorName = user.displayName || user.email;
        toast.loading('Saving recipe...', { id: 'save' });
        await createRecipe(recipeData);
        toast.success('Recipe created successfully!', { id: 'save' });
      }
      
      navigate('/home');
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} recipe:`, error);
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} recipe`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while fetching recipe data in edit mode
  if (isLoading) {
    return (
      <div className="create-recipe-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading recipe...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-recipe-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-container">
          <div className="header-content">
            <ChefHat className="header-icon" />
            <h1 className="header-title">{isEditMode ? 'Edit Recipe' : 'Create Recipe'}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onSubmit={handleSubmit}
          className="recipe-form"
        >
          {/* Images & Video Section */}
          <section className="form-section">
            <div className="section-grid">
              <div className="section-column">
                <label className="section-label">Recipe Images</label>
                <ImageUploadZone
                  onFileSelect={handleImageSelect}
                  previews={imagePreviews}
                  onRemove={removeImage}
                />
              </div>

              <div className="section-column">
                <FormInput
                  label="Video Link (Optional)"
                  id="video-link"
                  type="url"
                  value={formData.youtubeLink}
                  onChange={(e) => handleInputChange('youtubeLink', e.target.value)}
                  placeholder="https://youtube.com/..."
                  icon={Video}
                  error={errors.youtubeLink}
                />
                <div className="tip-box">
                  <p className="tip-text">
                    <strong>Tip:</strong> Add a YouTube link to help users follow along
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Basic Information */}
          <section className="form-section">
            <div className="section-content">
              <FormInput
                label="Recipe Title"
                id="recipe-title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Classic Chicken Adobo"
                error={errors.title}
              />

              <FormTextarea
                label="Description"
                id="recipe-description"
                required
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your recipe..."
                error={errors.description}
              />

              <div className="form-row">
                <FormSelect
                  label="Difficulty Level"
                  id="difficulty"
                  required
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  options={[
                    { value: '', label: 'Select difficulty' },
                    { value: 'Easy', label: 'Easy' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Hard', label: 'Hard' }
                  ]}
                  error={errors.difficulty}
                />

                <FormInput
                  label="Duration (minutes)"
                  id="duration"
                  type="number"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="30"
                  icon={Clock}
                  error={errors.duration}
                />
              </div>
            </div>
          </section>

          {/* Ingredients & Instructions */}
          <div className="form-sections-grid">
            <section className="form-section">
              <DynamicList
                title="Ingredients"
                items={formData.ingredients}
                onAdd={() => addListItem('ingredients')}
                onRemove={(i) => removeListItem('ingredients', i)}
                onUpdate={(i, v) => updateListItem('ingredients', i, v)}
                error={errors.ingredients}
                placeholder="e.g., 2 cups rice"
              />
            </section>

            <section className="form-section">
              <DynamicList
                title="Instructions"
                items={formData.steps}
                onAdd={() => addListItem('steps')}
                onRemove={(i) => removeListItem('steps', i)}
                onUpdate={(i, v) => updateListItem('steps', i, v)}
                error={errors.steps}
                itemType="textarea"
                placeholder="Describe this step..."
              />
            </section>
          </div>

          {/* Submit Buttons */}
          <motion.div 
            className="form-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              type="button"
              onClick={() => navigate('/home')}
              disabled={isSubmitting}
              className="cancel-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="submit-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <span className="button-loading">
                  <span className="loading-spinner"></span>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                isEditMode ? 'Update Recipe' : 'Post Recipe'
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </main>
    </div>
  );
};

export default CreateRecipe;