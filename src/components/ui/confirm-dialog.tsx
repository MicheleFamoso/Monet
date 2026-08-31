"use client";

import { Modal } from "./modal";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="mt-4 font-sans text-body-sm leading-6 text-secondary">
        {message}
      </p>
      <div className="mt-6 flex items-center gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Annulla
        </Button>
        <Button type="button" variant="destructive" onClick={onConfirm}>
          Elimina
        </Button>
      </div>
    </Modal>
  );
}
