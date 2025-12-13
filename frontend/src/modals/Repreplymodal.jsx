import React, { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Random admin names
const adminNames = ["Admin Sarah", "Admin Mike", "Admin Jane", "Admin John", "Admin Lisa", "Admin Chris"];

const getRandomAdminName = () => {
  return adminNames[Math.floor(Math.random() * adminNames.length)];
};

const getCurrentDate = () => {
  const options = { year: 'numeric', month: 'long', day: '2-digit' };
  return new Date().toLocaleDateString('en-US', options);
};

export default function Repreplymodal({ isOpen, onClose, report, onReplySubmit }) {
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyText.trim() && report) {
      const replyData = {
        id: report.id,
        adminReply: replyText,
        adminName: getRandomAdminName(),
        replyDate: getCurrentDate(),
        hasReply: true,
      };
      
      if (onReplySubmit) {
        onReplySubmit(replyData);
      }
      
      console.log("Reply submitted:", replyData);
      alert("Reply submitted successfully!");
      setReplyText("");
      onClose();
    }
  };

  const handleClose = () => {
    setReplyText("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && report && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl mx-4 bg-white rounded-[20px] shadow-2xl p-6 sm:p-8 max-h-[95vh] overflow-y-auto relative"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors shadow-md z-10"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Report Content */}
            <div className="flex flex-col gap-6 sm:gap-8 items-center pt-2" style={{paddingTop: 15, paddingBottom: 15, paddingLeft: 15, paddingRight: 15}}>
              {/* User Info */}
              <div className="flex flex-col items-center gap-3" style={{paddingTop: 10}}>
                <img
                  className="w-16 h-16 rounded-full shadow-lg object-cover"
                  src={report.avatar}
                  alt={report.username}
                />
                <div className="text-center">
                  <div className="text-black text-xl font-bold font-['Poppins'] mb-0.5">
                    {report.username}
                  </div>
                  <div className="text-neutral-500 text-sm font-normal font-['Afacad']">
                    {report.date}
                  </div>
                </div>
              </div>

              {/* Title and Content */}
              <div className="flex flex-col gap-3 items-start text-left w-full max-w-3xl px-4" style={{paddingTop: 10, paddingBottom: 10}}>
                <div className="text-black text-3xl font-extrabold font-['Poppins']">
                  {report.title}
                </div>
                <div className="text-black text-base font-normal font-['Afacad'] leading-relaxed border-t border-b border-gray-100 py-4 w-full">
                  {report.content}
                </div>
              </div>

              {/* Admin Replies (if exists) */}
              {report.hasReply && report.adminReplies && report.adminReplies.length > 0 && (
                <div className="w-full px-4 flex flex-col gap-3" style={{paddingTop: 10, paddingBottom: 10}}>
                  {report.adminReplies.map((reply, index) => (
                    <div key={index} className="w-full rounded-xl bg-gray-50 p-4 shadow-sm border border-gray-100" style={{boxShadow: '0 2px 8px rgba(0,0,0,0.08)', paddingLeft: 15, paddingTop: 15, paddingRight: 15, paddingBottom: 15}}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#005236] flex items-center justify-center">
                          <span className="text-white text-xs font-bold">A</span>
                        </div>
                        <div className="text-[#005236] text-sm font-bold font-['Poppins']">
                          {reply.adminName || "Admin"}
                        </div>
                        <div className="text-neutral-400 text-xs font-normal font-['Afacad']">
                          • {reply.replyDate || "Replied"}
                        </div>
                      </div>
                      <div className="text-black text-sm font-normal font-['Afacad'] leading-relaxed" style={{paddingLeft: 40}}>
                        {reply.adminReply}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              <form
                onSubmit={handleReplySubmit}
                className="flex flex-col gap-4 pt-6 border-t border-gray-200 w-full"
                style={{paddingTop: 15, paddingBottom: 10}}
              >
                <label className="text-black text-xl font-bold font-['Poppins'] text-left">
                  Reply to Report
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full min-h-[140px] px-4 py-3 bg-zinc-100/80 rounded-xl border-2 border-transparent outline-none text-black text-base font-normal font-['Afacad'] resize-none focus:border-[#6BC4A6] focus:ring-4 focus:ring-[#6BC4A6]/20 placeholder:text-gray-500 placeholder:opacity-80"
                  style={{paddingLeft: 8}}
                />
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="min-w-[120px] h-11 px-6 bg-[#6BC4A6] rounded-full text-black text-base font-bold font-['Poppins'] hover:bg-[#005236] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    Send Reply
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

