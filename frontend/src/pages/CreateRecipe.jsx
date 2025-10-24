import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Video, Plus, X, Clock, ChefHat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadMultipleImages } from '../services/cloudinary';
import { createRecipe } from '../services/recipes';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreateRecipe = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isFileInputOpen, setIsFileInputOpen] = useState(false);

  // Form state
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Fix for double file dialog opening
  useEffect(() => {
    const handleWindowClick = (e) => {
      if (isFileInputOpen && fileInputRef.current && !fileInputRef.current.contains(e.target)) {
        setIsFileInputOpen(false);
      }
    };

    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, [isFileInputOpen]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle image selection with fixed double opening issue
  const handleImageClick = () => {
    if (!isFileInputOpen) {
      setIsFileInputOpen(true);
      fileInputRef.current?.click();
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Reset file input
    e.target.value = '';
    setIsFileInputOpen(false);
    
    // Validate file types
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      toast.error('Please select only image files');
    }

    // Validate file sizes (max 2MB each)
    const oversizedFiles = validFiles.filter(file => file.size > 2 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Some files are too large. Maximum size is 2MB per file.');
    }

    const validSizedFiles = validFiles.filter(file => file.size <= 2 * 1024 * 1024);
    
    if (validSizedFiles.length > 0) {
      setImages(prev => [...prev, ...validSizedFiles]);
      
      // Create previews
      const newPreviews = validSizedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: Date.now() + Math.random()
      }));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // Remove image
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prev[index].preview);
      return newPreviews;
    });
  };

  // Add ingredient field
  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  // Remove ingredient field
  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  // Update ingredient
  const updateIngredient = (index, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => 
        i === index ? value : ingredient
      )
    }));
  };

  // Add step field
  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }));
  };

  // Remove step field
  const removeStep = (index) => {
    if (formData.steps.length > 1) {
      setFormData(prev => ({
        ...prev,
        steps: prev.steps.filter((_, i) => i !== index)
      }));
    }
  };

  // Update step
  const updateStep = (index, value) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? value : step
      )
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.difficulty) {
      newErrors.difficulty = 'Please select a difficulty level';
    }

    if (!formData.duration || isNaN(formData.duration) || formData.duration <= 0) {
      newErrors.duration = 'Please enter a valid duration in minutes';
    }

    const validIngredients = formData.ingredients.filter(ingredient => ingredient.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    }

    const validSteps = formData.steps.filter(step => step.trim());
    if (validSteps.length === 0) {
      newErrors.steps = 'At least one step is required';
    }

    // Validate YouTube link if provided
    if (formData.youtubeLink && formData.youtubeLink.trim()) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      if (!youtubeRegex.test(formData.youtubeLink)) {
        newErrors.youtubeLink = 'Please enter a valid YouTube URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images to Cloudinary
      let imageUrls = [];
      if (images.length > 0) {
        toast.loading('Uploading images...', { id: 'upload' });
        const uploadResults = await uploadMultipleImages(images);
        imageUrls = uploadResults.map(result => result.secure_url);
        toast.success('Images uploaded successfully!', { id: 'upload' });
      }

      // Prepare recipe data
      const recipeData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        youtubeLink: formData.youtubeLink.trim() || null,
        imageUrls,
        difficulty: formData.difficulty,
        duration: parseInt(formData.duration),
        ingredients: formData.ingredients.filter(ingredient => ingredient.trim()),
        steps: formData.steps.filter(step => step.trim()),
        authorId: user.uid,
        authorName: user.displayName || user.email
      };

      // Save to Firestore
      toast.loading('Saving recipe...', { id: 'save' });
      const recipeId = await createRecipe(recipeData);
      toast.success('Recipe created successfully!', { id: 'save' });

      // Navigate to home or recipe page
      navigate('/home');
    } catch (error) {
      console.error('Error creating recipe:', error);
      toast.error(error.message || 'Failed to create recipe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="bg-white border-b-2 border-amber-600 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-amber-700 font-['Poppins']">
                Create Recipe
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 w-full">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-6 lg:space-y-8 w-full"
        >
          {/* Image Upload and Video Link Section */}
          <section className="bg-white rounded-2xl shadow-md p-6 lg:p-8 w-full">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 w-full">
              {/* Image Upload */}
              <div className="space-y-4">
                <label className="block text-amber-700 text-lg lg:text-xl font-medium">
                  Recipe Images
                </label>
                <div
                  onClick={handleImageClick}
                  className="relative border-2 border-dashed border-amber-600 rounded-2xl bg-gradient-to-b from-orange-50 via-orange-100 to-orange-150 p-6 lg:p-8 flex flex-col items-center justify-center min-h-[200px] hover:bg-orange-100 transition-colors cursor-pointer group w-full"
                  role="button"
                  tabIndex={0}
                  aria-label="Upload recipe images"
                  onKeyPress={(e) => e.key === 'Enter' && handleImageClick()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Select recipe images"
                  />
                  <Upload className="w-12 h-12 lg:w-16 lg:h-16 text-amber-700 mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-amber-700 text-center font-medium text-base">
                    Click to upload images
                  </p>
                  <p className="text-amber-600 text-sm mt-2">PNG, JPG up to 2MB each</p>
                </div>

                {/* Image Previews */}
                <AnimatePresence>
                  {imagePreviews.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                    >
                      {imagePreviews.map((preview, index) => (
                        <motion.div
                          key={preview.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="relative group"
                        >
                          <img
                            src={preview.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 lg:h-28 object-cover rounded-lg shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg"
                            aria-label={`Remove image ${index + 1}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Video Link */}
              <div className="space-y-4">
                <label htmlFor="video-link" className="block text-amber-700 text-lg lg:text-xl font-medium">
                  Video Link (Optional)
                </label>
                <div className="relative">
                  <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600" />
                  <input
                    id="video-link"
                    type="url"
                    value={formData.youtubeLink}
                    onChange={(e) => handleInputChange('youtubeLink', e.target.value)}
                    placeholder="https://youtube.com/..."
                    className={`w-full pl-12 pr-4 py-3 lg:py-4 rounded-xl border-2 focus:border-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 outline-none transition-all shadow-sm ${
                      errors.youtubeLink ? 'border-red-500' : 'border-amber-600'
                    }`}
                    aria-label="Video link URL"
                  />
                </div>
                {errors.youtubeLink && (
                  <p className="text-sm text-red-600">{errors.youtubeLink}</p>
                )}
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="text-amber-700 text-sm">
                    <strong>Tip:</strong> Add a YouTube link to help users follow along with your recipe
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Basic Information */}
          <section className="bg-white rounded-2xl shadow-md p-6 lg:p-8 w-full">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="recipe-title" className="block text-amber-700 text-lg lg:text-xl font-medium mb-3">
                  Recipe Title *
                </label>
                <input
                  id="recipe-title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Classic Chicken Adobo"
                  className={`w-full px-4 py-3 lg:py-4 rounded-xl border-2 focus:border-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 outline-none transition-all shadow-sm ${
                    errors.title ? 'border-red-500' : 'border-amber-600'
                  }`}
                  aria-required="true"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="recipe-description" className="block text-amber-700 text-lg lg:text-xl font-medium mb-3">
                  Description *
                </label>
                <textarea
                  id="recipe-description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your recipe..."
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:border-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 outline-none transition-all resize-vertical shadow-sm ${
                    errors.description ? 'border-red-500' : 'border-amber-600'
                  }`}
                  aria-required="true"
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Difficulty and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="difficulty" className="block text-amber-700 text-lg lg:text-xl font-medium mb-3">
                    Difficulty Level *
                  </label>
                  <select
                    id="difficulty"
                    required
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className={`w-full px-4 py-3 lg:py-4 rounded-xl border-2 focus:border-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 outline-none transition-all shadow-sm bg-white ${
                      errors.difficulty ? 'border-red-500' : 'border-amber-600'
                    }`}
                    aria-required="true"
                  >
                    <option value="">Select difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  {errors.difficulty && (
                    <p className="mt-2 text-sm text-red-600">{errors.difficulty}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="duration" className="block text-amber-700 text-lg lg:text-xl font-medium mb-3">
                    Duration (minutes) *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600" />
                    <input
                      id="duration"
                      type="number"
                      required
                      min="1"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="30"
                      className={`w-full pl-12 pr-4 py-3 lg:py-4 rounded-xl border-2 focus:border-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 outline-none transition-all shadow-sm ${
                        errors.duration ? 'border-red-500' : 'border-amber-600'
                      }`}
                      aria-required="true"
                    />
                  </div>
                  {errors.duration && (
                    <p className="mt-2 text-sm text-red-600">{errors.duration}</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Ingredients and Instructions */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 w-full">
            {/* Ingredients */}
            <section className="bg-white rounded-2xl shadow-md p-6 lg:p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-medium text-gray-900">
                      Ingredients *
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Enter one ingredient per line with quantity
                    </p>
                  </div>
                  <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                    {formData.ingredients.filter(i => i.trim()).length} added
                  </div>
                </div>
                {errors.ingredients && (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{errors.ingredients}</p>
                )}

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {formData.ingredients.map((ingredient, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 items-start group"
                    >
                      <span className="text-gray-400 font-medium pt-3 min-w-[2rem] text-sm">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={ingredient}
                        onChange={(e) => updateIngredient(index, e.target.value)}
                        placeholder="e.g., 2 cups rice"
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-amber-600 focus:border-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 outline-none transition-all shadow-sm"
                        aria-label={`Ingredient ${index + 1}`}
                      />
                      {formData.ingredients.length > 1 && (
                        <motion.button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 mt-2"
                          aria-label={`Remove ingredient ${index + 1}`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  type="button"
                  onClick={addIngredient}
                  className="w-full py-3 border-2 border-dashed border-amber-600 text-amber-700 rounded-xl hover:bg-amber-50 transition-colors font-medium flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
                  aria-label="Add new ingredient"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-5 h-5" />
                  Add Ingredient
                </motion.button>
              </div>
            </section>

            {/* Instructions */}
            <section className="bg-white rounded-2xl shadow-md p-6 lg:p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-medium text-gray-900">
                      Instructions *
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Step-by-step cooking instructions
                    </p>
                  </div>
                  <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                    {formData.steps.filter(s => s.trim()).length} steps
                  </div>
                </div>
                {errors.steps && (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{errors.steps}</p>
                )}

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {formData.steps.map((step, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 items-start group"
                    >
                      <span className="text-gray-400 font-medium pt-4 min-w-[2rem] text-sm flex-shrink-0">
                        {index + 1}.
                      </span>
                      <div className="flex-1 space-y-2">
                        <textarea
                          value={step}
                          onChange={(e) => updateStep(index, e.target.value)}
                          placeholder="Describe this step..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border-2 border-amber-600 focus:border-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 outline-none transition-all resize-vertical shadow-sm"
                          aria-label={`Instruction step ${index + 1}`}
                        />
                      </div>
                      {formData.steps.length > 1 && (
                        <motion.button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 mt-3"
                          aria-label={`Remove instruction ${index + 1}`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  type="button"
                  onClick={addStep}
                  className="w-full py-3 border-2 border-dashed border-amber-600 text-amber-700 rounded-xl hover:bg-amber-50 transition-colors font-medium flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
                  aria-label="Add new instruction"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-5 h-5" />
                  Add Step
                </motion.button>
              </div>
            </section>
          </div>

          {/* Submit Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-amber-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              type="button"
              onClick={() => navigate('/home')}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              aria-label="Cancel and go back"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              aria-label="Submit and post recipe"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Recipe...</span>
                </div>
              ) : (
                'Post Recipe'
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </main>
    </div>
  );
};

export default CreateRecipe;