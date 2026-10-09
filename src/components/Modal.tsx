import { useEffect, useRef, useId } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
export default function Modal({
  title,
  children,
  onClose,
  badge = "SYSTEM NOTIFICATION",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  badge?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const el = ref.current;
    el?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      el?.close();
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        close.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close.current();
      }}
      className="system-modal"
    >
      <div className="modal-content">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
          <div>
            <span className="system-badge">[ {badge} ]</span>
            <h2
              id={id}
              className="text-xl font-display font-semibold mt-2 mb-0"
            >
              {title}
            </h2>
          </div>
          <button
            className="icon-btn modal-close hover:bg-white/10"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={19} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
