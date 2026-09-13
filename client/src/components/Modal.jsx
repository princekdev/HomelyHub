import { useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-xl2 shadow-cardHover max-h-[90vh] overflow-y-auto animate-[fadeIn_0.15s_ease-out]`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 sticky top-0 bg-white rounded-t-xl2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-ink-100 text-ink-500"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
