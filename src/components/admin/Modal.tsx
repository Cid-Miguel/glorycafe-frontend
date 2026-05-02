import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /**
   * Optional footer slot; usually buttons. The modal itself never
   * submits — wrap the body in a <form> and put submit buttons here.
   */
  footer?: ReactNode;
}

/**
 * Lightweight admin modal. Closes on Escape and on backdrop click.
 * Body scroll is locked while open.
 */
export default function Modal({ open, title, onClose, children, footer }: Props) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-full w-full max-w-lg flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
          <h2 className="text-base font-semibold text-stone-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700"
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="flex justify-end gap-2 border-t border-stone-200 bg-stone-50 px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
