import { type FormEvent, useEffect, useId, useState } from "react";

import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { createCourse } from "../api/coursesApi";
import type { Course } from "../types/course";

type CreateCourseDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onCourseCreated: (course: Course) => void;
};

function getReadableError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return "Something went wrong.";
}

export function CreateCourseDialog({
                                       isOpen,
                                       onClose,
                                       onCourseCreated,
                                   }: CreateCourseDialogProps) {
    const titleId = useId();
    const descriptionId = useId();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape" && !isSubmitting) {
                onClose();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, isSubmitting, onClose]);

    function resetForm() {
        setTitle("");
        setDescription("");
        setErrorMessage(null);
    }

    function handleClose() {
        if (isSubmitting) {
            return;
        }

        resetForm();
        onClose();
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();

        if (!trimmedTitle) {
            setErrorMessage("Study guide title is required.");
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMessage(null);

            const createdCourse = await createCourse({
                title: trimmedTitle,
                description:
                    trimmedDescription.length > 0
                        ? trimmedDescription
                        : null,
            });

            onCourseCreated(createdCourse);
            resetForm();
            onClose();
        } catch (error) {
            setErrorMessage(getReadableError(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
            <section
                aria-labelledby={titleId}
                aria-modal="true"
                className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl"
                role="dialog"
            >
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h2
                            className="text-2xl font-semibold tracking-tight text-foreground"
                            id={titleId}
                        >
                            Create new Course
                        </h2>
                    </div>

                    <button
                        aria-label="Close create study guide dialog"
                        className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        disabled={isSubmitting}
                        onClick={handleClose}
                        type="button"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <label
                        className="block text-sm font-medium text-foreground"
                        htmlFor={titleId}
                    >
                        Course title
                    </label>

                    <input
                        autoFocus
                        className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        id={titleId}
                        maxLength={120}
                        value={title}
                        onChange={(event) => {
                            setTitle(event.target.value);
                        }}
                    />

                    <label
                        className="block text-sm font-medium text-foreground"
                        htmlFor={descriptionId}
                    >
                        Short description
                    </label>

                    <textarea
                        className="min-h-28 w-full resize-none rounded-md border border-input bg-background px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        id={descriptionId}
                        maxLength={500}
                        value={description}
                        onChange={(event) => {
                            setDescription(event.target.value);
                        }}
                    />

                    {errorMessage ? (
                        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {errorMessage}
                        </p>
                    ) : null}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            disabled={isSubmitting}
                            onClick={handleClose}
                            type="button"
                            variant="outline"
                        >
                            Cancel
                        </Button>

                        <Button disabled={isSubmitting} type="submit">
                            {isSubmitting ? (
                                <Loader2
                                    className="animate-spin"
                                    size={16}
                                />
                            ) : null}
                            Create study guide
                        </Button>
                    </div>
                </form>
            </section>
        </div>
    );
}