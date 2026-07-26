import {
    AlertTriangle,
    Loader2,
    Save,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type UnsavedChangesDialogProps = {
    isSaving: boolean;
    onCancel: () => void;
    onExitWithoutSaving: () => void;
    onSaveAndExit: () => void;
};

export default function UnsavedChangesDialog({
    isSaving,
    onCancel,
    onExitWithoutSaving,
    onSaveAndExit,
}: UnsavedChangesDialogProps) {
    return (
        <div
            aria-labelledby="unsaved-changes-title"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 p-4 backdrop-blur-sm"
            role="dialog"
            onMouseDown={(event) => {
                if (
                    event.target ===
                        event.currentTarget &&
                    !isSaving
                ) {
                    onCancel();
                }
            }}
        >
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <AlertTriangle
                                size={20}
                            />
                        </span>
                        <div>
                            <h2
                                className="font-semibold"
                                id="unsaved-changes-title"
                            >
                                Unsaved changes
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                Your latest edits have not
                                been saved. Save them before
                                leaving this Study Guide?
                            </p>
                        </div>
                    </div>

                    <Button
                        aria-label="Close"
                        className="h-8 w-8 shrink-0 p-0"
                        disabled={isSaving}
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                    >
                        <X size={16} />
                    </Button>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                        disabled={isSaving}
                        type="button"
                        variant="ghost"
                        onClick={
                            onExitWithoutSaving
                        }
                    >
                        Exit without saving
                    </Button>
                    <Button
                        disabled={isSaving}
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={isSaving}
                        type="button"
                        onClick={onSaveAndExit}
                    >
                        {isSaving ? (
                            <Loader2
                                className="animate-spin"
                                size={16}
                            />
                        ) : (
                            <Save size={16} />
                        )}
                        {isSaving
                            ? "Saving…"
                            : "Save and exit"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
