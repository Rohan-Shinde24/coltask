import React, { useEffect, useRef } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string; // To allow custom width/padding (e.g. max-w-4xl)
  hideCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  hideCloseButton = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className={`modal-box rounded-sm shadow-2xl ${className}`} ref={modalRef}>
        {!hideCloseButton && (
          <button 
            onClick={onClose} 
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >
            ✕
          </button>
        )}
        
        {title && (
          <h3 className="font-bold text-lg mb-4 text-[#354052]">{title}</h3>
        )}
        
        {children}
      </div>
      
      {/* Backdrop */}
      <div 
        className="modal-backdrop bg-black/30" 
        onClick={onClose}
        aria-hidden="true"
      ></div>
    </div>
  );
};
