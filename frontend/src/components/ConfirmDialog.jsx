import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger', isLoading = false }) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      confirmBg: 'bg-red-600 hover:bg-red-700',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200'
    },
    warning: {
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200'
    },
    info: {
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    }
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 backdrop-blur-sm bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-white rounded-lg shadow-xl max-w-md w-full border ${styles.borderColor}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 h-12" style={{marginLeft: 10}}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-6 h-6 ${styles.iconColor}`} />
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                  style={{marginRight: 10}}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 h-15"style={{marginLeft: 10}}>
                <p className="text-gray-700">{message}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 h-12">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-15 h-8 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-[20px] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                  }}
                  disabled={isLoading}
                  className={`h-8 w-15 px-4 py-2 text-white text-center ${styles.confirmBg} rounded-[20px] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                  style={{marginRight: 10}}
               >
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;

