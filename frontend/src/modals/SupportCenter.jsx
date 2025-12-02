import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, AlertTriangle, Send, ChevronDown } from 'lucide-react';

const SupportCenter = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('feedback');
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueSteps, setIssueSteps] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isIssueDropdownOpen, setIsIssueDropdownOpen] = useState(false);
  
  const modalRef = useRef(null);
  const dropdownRef = useRef(null);
  const issueDropdownRef = useRef(null);

  const feedbackTypes = [
    { value: 'suggestion', label: 'Feature Suggestion' },
    { value: 'improvement', label: 'Improvement Idea' },
    { value: 'compliment', label: 'Compliment' },
    { value: 'other', label: 'Other Feedback' },
  ];

  const issueTypes = [
    { value: 'bug', label: 'Bug / Error' },
    { value: 'performance', label: 'Performance Issue' },
    { value: 'ui', label: 'UI / Design Issue' },
    { value: 'account', label: 'Account Problem' },
    { value: 'recipe', label: 'Recipe Issue' },
    { value: 'other', label: 'Other Issue' },
  ];

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (issueDropdownRef.current && !issueDropdownRef.current.contains(e.target)) {
        setIsIssueDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetForm = () => {
    setFeedbackType('');
    setFeedbackMessage('');
    setIssueType('');
    setIssueDescription('');
    setIssueSteps('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    // UI only - no backend submission yet
    console.log('Feedback submitted:', { feedbackType, feedbackMessage });
    // Show success state (UI only)
    alert('Thank you for your feedback! (UI Demo - No backend yet)');
    resetForm();
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    // UI only - no backend submission yet
    console.log('Issue reported:', { issueType, issueDescription, issueSteps });
    // Show success state (UI only)
    alert('Thank you for reporting this issue! (UI Demo - No backend yet)');
    resetForm();
  };

  const getFeedbackTypeLabel = () => {
    const type = feedbackTypes.find(t => t.value === feedbackType);
    return type ? type.label : 'Select feedback type';
  };

  const getIssueTypeLabel = () => {
    const type = issueTypes.find(t => t.value === issueType);
    return type ? type.label : 'Select issue type';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[520px] lg:max-w-[580px] xl:max-w-[620px] 2xl:max-w-[680px] bg-white rounded-[28px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: '0 40px 90px rgba(15, 23, 42, 0.28)' }}
          >
            {/* Header */}
            <div 
              className="border-b border-gray-100 flex items-center justify-between"
              style={{ paddingLeft: '28px', paddingRight: '28px', paddingTop: '20px', paddingBottom: '20px' }}
            >
              <div className="flex items-center gap-3" style={{ paddingLeft: '8px' }}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 font-['Poppins']">
                  Support Center
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-orange-50 flex items-center justify-center transition-all duration-200 hover:scale-105 group"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500 group-hover:text-orange-500 transition-colors" />
              </button>
            </div>

            {/* Tab Buttons */}
            <div style={{ paddingLeft: '32px', paddingRight: '32px', paddingTop: '24px' }}>
              <div className="flex bg-gray-100 rounded-2xl p-2 gap-2">
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`flex-1 py-4 px-6 rounded-xl text-base font-semibold font-['Poppins'] transition-all duration-300 flex items-center justify-center gap-2.5 ${
                    activeTab === 'feedback'
                      ? 'bg-white text-orange-600 shadow-md shadow-orange-100'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ paddingTop: '5px', paddingBottom: '5px' }}
                >
                  <MessageSquare className={`w-5 h-5 ${activeTab === 'feedback' ? 'text-orange-500' : ''}`} />
                  Feedback
                </button>
                <button
                  onClick={() => setActiveTab('report')}
                  className={`flex-1 py-4 px-6 rounded-xl text-base font-semibold font-['Poppins'] transition-all duration-300 flex items-center justify-center gap-2.5 ${
                    activeTab === 'report'
                      ? 'bg-white text-orange-600 shadow-md shadow-orange-100'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ paddingTop: '5px', paddingBottom: '5px' }}
                >
                  <AlertTriangle className={`w-5 h-5 ${activeTab === 'report' ? 'text-orange-500' : ''}`} />
                  Report an Issue
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div style={{ paddingLeft: '32px', paddingRight: '32px', paddingTop: '28px', paddingBottom: '28px' }}>
              <AnimatePresence mode="wait">
                {activeTab === 'feedback' ? (
                  <motion.form
                    key="feedback"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleFeedbackSubmit}
                    className="space-y-5"
                  >
                    {/* Feedback Description */}
                    <p className="text-gray-600 text-sm font-['Poppins'] leading-relaxed">
                      We'd love to hear your thoughts! Share your suggestions, ideas, or compliments to help us improve Cooktopia.
                    </p>

                    {/* Feedback Type Dropdown */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 font-['Poppins']">
                        Feedback Type <span className="text-orange-500">*</span>
                      </label>
                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className={`w-full px-4 py-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 font-['Poppins'] ${
                            isDropdownOpen
                              ? 'border-orange-400 ring-2 ring-orange-100 bg-white'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          } ${feedbackType ? 'text-gray-800' : 'text-gray-400'}`}
                          style={{ paddingLeft: '10px' }}
                        >
                          <span className="text-sm">{getFeedbackTypeLabel()}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                          {isDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                            >
                              {feedbackTypes.map((type) => (
                                <button
                                  key={type.value}
                                  type="button"
                                  onClick={() => {
                                    setFeedbackType(type.value);
                                    setIsDropdownOpen(false);
                                  }}
                                  className={`w-full px-4 py-3 text-left text-sm font-['Poppins'] transition-colors ${
                                    feedbackType === type.value
                                      ? 'bg-orange-50 text-orange-600 font-medium'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {type.label}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Feedback Message */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 font-['Poppins']">
                        Your Feedback <span className="text-orange-500">*</span>
                      </label>
                      <textarea
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        placeholder="Share your thoughts with us..."
                        rows={4}
                        className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-['Poppins'] text-gray-800 placeholder:text-gray-400 resize-none transition-all duration-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none"
                        style={{ paddingLeft: '10px' }}
                      />
                      <p className="text-xs text-gray-400 font-['Poppins'] text-right">
                        {feedbackMessage.length}/500 characters
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={!feedbackType || !feedbackMessage.trim()}
                      className="w-full py-5 rounded-2xl text-white text-base font-semibold font-['Poppins'] transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 hover:-translate-y-0.5 active:translate-y-0"
                      style={{ marginTop: '20px' }}
                    >
                      <Send className="w-5 h-5" />
                      Submit Feedback
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="report"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleIssueSubmit}
                    className="space-y-5"
                  >
                    {/* Report Description */}
                    <p className="text-gray-600 text-sm font-['Poppins'] leading-relaxed">
                      Found a bug or experiencing issues? Let us know and we'll work on fixing it as soon as possible.
                    </p>

                    {/* Issue Type Dropdown */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 font-['Poppins']">
                        Issue Type <span className="text-orange-500">*</span>
                      </label>
                      <div className="relative" ref={issueDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsIssueDropdownOpen(!isIssueDropdownOpen)}
                          className={`w-full px-4 py-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 font-['Poppins'] ${
                            isIssueDropdownOpen
                              ? 'border-orange-400 ring-2 ring-orange-100 bg-white'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          } ${issueType ? 'text-gray-800' : 'text-gray-400'}`}
                          style={{ paddingLeft: '10px' }}
                        >
                          <span className="text-sm">{getIssueTypeLabel()}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isIssueDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                          {isIssueDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                            >
                              {issueTypes.map((type) => (
                                <button
                                  key={type.value}
                                  type="button"
                                  onClick={() => {
                                    setIssueType(type.value);
                                    setIsIssueDropdownOpen(false);
                                  }}
                                  className={`w-full px-4 py-3 text-left text-sm font-['Poppins'] transition-colors ${
                                    issueType === type.value
                                      ? 'bg-orange-50 text-orange-600 font-medium'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {type.label}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Issue Description */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 font-['Poppins']">
                        Description <span className="text-orange-500">*</span>
                      </label>
                      <textarea
                        value={issueDescription}
                        onChange={(e) => setIssueDescription(e.target.value)}
                        placeholder="Describe the issue you're experiencing..."
                        rows={3}
                        className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-['Poppins'] text-gray-800 placeholder:text-gray-400 resize-none transition-all duration-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none"
                        style={{ paddingLeft: '10px' }}
                      />
                    </div>

                    {/* Steps to Reproduce */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 font-['Poppins']">
                        Steps to Reproduce <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <textarea
                        value={issueSteps}
                        onChange={(e) => setIssueSteps(e.target.value)}
                        placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                        rows={3}
                        className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-['Poppins'] text-gray-800 placeholder:text-gray-400 resize-none transition-all duration-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white outline-none"
                        style={{ paddingLeft: '10px' }}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={!issueType || !issueDescription.trim()}
                      className="w-full py-5 rounded-2xl text-white text-base font-semibold font-['Poppins'] transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 hover:-translate-y-0.5 active:translate-y-0"
                      style={{ marginTop: '20px' }}
                    >
                      <AlertTriangle className="w-5 h-5" />
                      Report Issue
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div 
              className="bg-gray-50 border-t border-gray-100"
              style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '10px', paddingBottom: '10px' }}
            >
              <p className="text-[10px] text-gray-400 text-center font-['Poppins']">
                Your feedback helps us improve Cooktopia for everyone. Thank you! 🍳
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SupportCenter;

