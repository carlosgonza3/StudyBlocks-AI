import {
    type FormEvent,
    useState,
} from "react";

import {
    Loader2,
    Settings2,
    Trash2,
    TriangleAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
    deleteCourse,
    updateCourse,
} from "@/features/courses/api/coursesApi";
import type { Course } from "@/features/courses/types/course";

type CourseDetailsDialogProps = {
    course: Course;
    onCourseUpdated: (course: Course) => void;
};

function getReadableError(error: unknown): string {
    return error instanceof Error
        ? error.message
        : "Something went wrong.";
}

export default function CourseDetailsDialog({
    course,
    onCourseUpdated,
}: CourseDetailsDialogProps) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] =
        useState(false);
    const [isSaving, setIsSaving] =
        useState(false);
    const [isDeleting, setIsDeleting] =
        useState(false);
    const [title, setTitle] =
        useState(course.title);
    const [description, setDescription] =
        useState(course.description ?? "");

    function resetForm() {
        setTitle(course.title);
        setDescription(course.description ?? "");
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            toast.add({
                title: "Course title is required",
                type: "error",
            });
            return;
        }

        try {
            setIsSaving(true);
            const updatedCourse = await updateCourse(
                course.id,
                {
                    title: trimmedTitle,
                    description:
                        description.trim() || null,
                },
            );

            onCourseUpdated(updatedCourse);
            setTitle(updatedCourse.title);
            setDescription(
                updatedCourse.description ?? "",
            );
            setIsOpen(false);
            toast.add({
                title: "Course details updated",
                description:
                    "Your changes have been saved.",
                type: "success",
            });
        } catch (error) {
            toast.add({
                title: "Could not update course",
                description:
                    getReadableError(error),
                type: "error",
            });
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        try {
            setIsDeleting(true);
            await deleteCourse(course.id);
            setIsDeleteOpen(false);
            setIsOpen(false);
            toast.add({
                title: "Course deleted",
                description: `${course.title} and its study guide were permanently deleted.`,
                type: "success",
            });
            void navigate("/");
        } catch (error) {
            toast.add({
                title: "Could not delete course",
                description:
                    getReadableError(error),
                type: "error",
            });
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (isSaving || isDeleting) {
                        return;
                    }

                    setIsOpen(open);
                    if (open) {
                        resetForm();
                    }
                }}
            >
                <DialogTrigger asChild>
                    <Button
                        size="sm"
                        type="button"
                        variant="outline"
                    >
                        <Settings2 size={15} />
                        Course settings
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            Course details
                        </DialogTitle>
                        <DialogDescription>
                            Update how this course appears
                            throughout StudyBlocks.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        className="space-y-5"
                        onSubmit={handleSubmit}
                    >
                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium"
                                htmlFor="course-title"
                            >
                                Course title
                            </label>
                            <input
                                id="course-title"
                                autoFocus
                                className="h-11 w-full rounded-xl border border-input bg-input/30 px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                disabled={isSaving}
                                maxLength={120}
                                value={title}
                                onChange={(event) => {
                                    setTitle(
                                        event.target.value,
                                    );
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium"
                                htmlFor="course-description"
                            >
                                Description
                            </label>
                            <Textarea
                                id="course-description"
                                className="min-h-28"
                                disabled={isSaving}
                                maxLength={500}
                                value={description}
                                onChange={(event) => {
                                    setDescription(
                                        event.target.value,
                                    );
                                }}
                            />
                            <p className="text-right text-xs text-muted-foreground">
                                {description.length}/500
                            </p>
                        </div>

                        <div className="border-t border-border pt-5">
                            <button
                                className="inline-flex items-center gap-2 text-sm font-medium text-destructive transition hover:opacity-75"
                                type="button"
                                onClick={() => {
                                    setIsDeleteOpen(true);
                                }}
                            >
                                <Trash2 size={15} />
                                Delete this course
                            </button>
                        </div>

                        <DialogFooter>
                            <Button
                                disabled={isSaving}
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    resetForm();
                                    setIsOpen(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={
                                    isSaving ||
                                    !title.trim()
                                }
                                type="submit"
                            >
                                {isSaving ? (
                                    <Loader2
                                        className="animate-spin"
                                        size={16}
                                    />
                                ) : null}
                                {isSaving
                                    ? "Saving..."
                                    : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={isDeleteOpen}
                onOpenChange={(open) => {
                    if (!isDeleting) {
                        setIsDeleteOpen(open);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogMedia className="bg-destructive/10 text-destructive">
                            <TriangleAlert />
                        </AlertDialogMedia>
                        <AlertDialogTitle>
                            Delete {course.title}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently removes the
                            course and its Main Study Guide
                            from the database. This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isDeleting}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            variant="destructive"
                            onClick={(event) => {
                                event.preventDefault();
                                void handleDelete();
                            }}
                        >
                            {isDeleting ? (
                                <Loader2
                                    className="animate-spin"
                                    size={16}
                                />
                            ) : (
                                <Trash2 size={16} />
                            )}
                            {isDeleting
                                ? "Deleting..."
                                : "Delete permanently"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
