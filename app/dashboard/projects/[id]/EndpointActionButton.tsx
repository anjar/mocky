"use client";

import { useId, useRef } from "react";
import { useFormStatus } from "react-dom";

type EndpointActionButtonProps = {
  children: React.ReactNode;
  className?: string;
  confirmMessage?: string;
  disabled?: boolean;
  pendingLabel: string;
};

export function EndpointActionButton({
  children,
  className,
  confirmMessage,
  disabled = false,
  pendingLabel,
}: EndpointActionButtonProps) {
  const { pending } = useFormStatus();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  if (confirmMessage) {
    return (
      <>
        <button
          className={className}
          type="button"
          disabled={pending || disabled}
          aria-disabled={pending || disabled}
          onClick={() => dialogRef.current?.showModal()}
        >
          {children}
        </button>

        <dialog
          ref={dialogRef}
          className="confirm-dialog"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          onClick={(event) => {
            if (event.target === dialogRef.current) {
              dialogRef.current?.close();
            }
          }}
        >
          <div className="confirm-dialog-icon" aria-hidden="true">!</div>
          <div className="confirm-dialog-copy">
            <p className="confirm-dialog-label">DESTRUCTIVE ACTION</p>
            <h2 id={titleId}>Delete this route?</h2>
            <p id={descriptionId}>{confirmMessage}</p>
          </div>
          <div className="confirm-dialog-actions">
            <button
              type="button"
              className="confirm-dialog-cancel"
              onClick={() => dialogRef.current?.close()}
            >
              Keep route
            </button>
            <button
              type="submit"
              className="confirm-dialog-delete"
              disabled={pending || disabled}
              aria-disabled={pending || disabled}
            >
              {pending ? pendingLabel : "Delete permanently"}
            </button>
          </div>
        </dialog>
      </>
    );
  }

  return (
    <button
      className={className}
      type="submit"
      disabled={pending || disabled}
      aria-disabled={pending || disabled}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
