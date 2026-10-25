import type { ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders its children directly under <body>, invisible on screen.
 * While printing, everything else in <body> (your app shell, sidebar,
 * scroll containers) is hidden, so only this copy is printed.
 */
export default function PrintPortal({ children }: { children: ReactNode }) {
  return createPortal(
    <div data-print-root className="hidden print:block">
      <style>{`@media print { body > *:not([data-print-root]) { display: none !important; } }`}</style>
      {children}
    </div>,
    document.body,
  );
}