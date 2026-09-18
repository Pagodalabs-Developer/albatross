"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "DELETE",
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent hideCloseButton className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-left text-base font-semibold text-foreground">
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
            >
              <TriangleAlert className="size-4" />
            </span>
            {title}
          </DialogTitle>
          <DialogDescription className="text-left text-sm text-muted-foreground">
            {body}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            autoFocus
            onClick={onCancel}
            className="font-semibold"
          >
            CANCEL
          </Button>
          <Button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="bg-destructive font-semibold text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? "DELETING…" : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
