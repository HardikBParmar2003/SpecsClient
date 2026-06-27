import { HiOutlineExclamationTriangle, HiXMark } from 'react-icons/hi2';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", isDestructive = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-md overflow-hidden shadow-[var(--shadow-card)] animate-fade-in-up">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-[var(--border-color)]">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--text-primary)] flex items-center gap-2">
            {isDestructive && <HiOutlineExclamationTriangle className="w-5 h-5 text-red-500" />}
            {title}
          </h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
            <HiXMark className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 text-[var(--text-secondary)] text-sm leading-relaxed">
          {message}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/50 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-6 py-2 rounded-md text-xs font-semibold uppercase tracking-widest text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            className={`px-6 py-2 rounded-md text-xs font-semibold uppercase tracking-widest cursor-pointer shadow-lg transition-all transform hover:-translate-y-0.5 ${
              isDestructive 
                ? 'bg-red-600/90 hover:bg-red-500 text-white shadow-red-900/50' 
                : 'bg-luxury-gold hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] text-black shadow-luxury-gold/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default ConfirmModal;
