import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, X } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoCloseSeconds?: number;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  isOpen,
  onClose,
  autoCloseSeconds = 3
}) => {
  const [countdown, setCountdown] = useState(autoCloseSeconds);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(autoCloseSeconds);
      return;
    }

    setCountdown(autoCloseSeconds);

    // Decrement visual countdown timer
    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    // Auto close after timeout completes
    const timeout = setTimeout(() => {
      onClose();
    }, autoCloseSeconds * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isOpen, autoCloseSeconds, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="disclaimer-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs transition-opacity duration-300"
    >
      <div
        id="disclaimer-modal"
        className="w-full max-w-xl bg-white rounded-lg p-6 border border-gray-200 shadow-2xl relative animate-in fade-in zoom-in duration-200"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
          aria-label="Close disclaimer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-3 mb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-red-600 tracking-wide">DISCLAIMER</h2>
        </div>

        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
          This website and API system are strictly for{' '}
          <strong>educational, informational, and demonstration purposes only</strong>. The service
          is demonstrated using standard public telecom numbering series allocations and sample data.
          We do not support unauthorized access, privacy violations, stalking, harassment, fraud, or
          misuse of personal information. Do not use this service to target, identify, track,
          harass, or harm any individual. Users are responsible for complying with applicable laws,
          telecom regulations, and privacy policies. No real person&apos;s private confidential information
          is stored or disclosed.
        </p>

        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Auto closing in <strong className="text-gray-800">{countdown}</strong>s...</span>
          </div>

          <button
            id="acknowledge-disclaimer-btn"
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded transition"
          >
            I Acknowledge & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
