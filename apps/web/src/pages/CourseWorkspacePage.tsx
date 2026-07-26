import { useEffect, useState } from "react";

import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Check,
    Clock3,
    GitBranch,
    Loader2,
    MessageSquareText,
    PencilLine,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { getCourse } from "@/features/courses/api/coursesApi";
import CourseDetailsDialog from "@/features/courses/components/CourseDetailsDialog";
import type { Course } from "@/features/courses/types/course";
import SourceDocumentsSection from "@/features/source-documents/components/SourceDocumentsSection";

function getReadableError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return "Something went wrong.";
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("en-CA", {
        dateStyle: "medium",
    }).format(new Date(value));
}

const workspaceTools = [
    {
        description:
            "Explore concepts and how they connect.",
        icon: GitBranch,
        label: "Knowledge graph",
        status: "Planned",
    },
    {
        description:
            "Ask questions grounded in your material.",
        icon: MessageSquareText,
        label: "AI tutor",
        status: "Planned",
    },
] as const;

const featureAvailability = [
    {
        label: "Study Guide editor",
        ready: true,
        status: "Available",
    },
    {
        label: "Document library",
        ready: true,
        status: "Available",
    },
    {
        label: "Knowledge graph",
        ready: false,
        status: "Planned",
    },
    {
        label: "AI tutor",
        ready: false,
        status: "Planned",
    },
] as const;

export default function CourseWorkspacePage() {
    const { courseId } =
        useParams<{ courseId: string }>();

    const [course, setCourse] =
        useState<Course | null>(null);
    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);
    const [isLoading, setIsLoading] =
        useState(true);

    useEffect(() => {
        if (!courseId) {
            return undefined;
        }

        let isCurrent = true;

        getCourse(courseId)
            .then((loadedCourse) => {
                if (!isCurrent) {
                    return;
                }

                setCourse(loadedCourse);
                setErrorMessage(null);
            })
            .catch((error: unknown) => {
                if (!isCurrent) {
                    return;
                }

                setErrorMessage(
                    getReadableError(error),
                );
            })
            .finally(() => {
                if (!isCurrent) {
                    return;
                }

                setIsLoading(false);
            });

        return () => {
            isCurrent = false;
        };
    }, [courseId]);

    return (
        <AppLayout fullWidth>
            {!courseId ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6">
                    <p className="font-medium text-destructive">
                        Could not load course
                    </p>
                    <p className="mt-1 text-sm text-destructive">
                        Course id is missing.
                    </p>
                </div>
            ) : isLoading ? (
                <div className="grid min-h-[55vh] place-items-center text-center text-sm text-muted-foreground">
                    <div>
                        <Loader2 className="mx-auto mb-3 animate-spin" />
                        Loading course workspace...
                    </div>
                </div>
            ) : errorMessage ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6">
                    <p className="font-medium text-destructive">
                        Could not load course
                    </p>
                    <p className="mt-1 text-sm text-destructive">
                        {errorMessage}
                    </p>
                </div>
            ) : course ? (
                <div className="w-full px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-10">
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                        <nav
                            aria-label="Breadcrumb"
                            className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground"
                        >
                            <Link
                                className="inline-flex shrink-0 items-center gap-2 transition hover:text-foreground"
                                to="/"
                            >
                                <ArrowLeft size={14} />
                                Dashboard
                            </Link>
                            <span aria-hidden="true">
                                /
                            </span>
                            <span className="max-w-48 truncate text-foreground">
                                {course.title}
                            </span>
                        </nav>

                        <CourseDetailsDialog
                            course={course}
                            onCourseUpdated={
                                setCourse
                            }
                        />
                    </div>

                    <header className="relative overflow-hidden border-y border-border py-10 md:py-14">
                        <div
                            aria-hidden="true"
                            className="absolute -right-24 -top-40 size-96 rounded-full bg-primary/5 blur-3xl"
                        />

                        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
                            <div>
                                <div className="mb-5 flex items-center gap-3">
                                    <span className="grid size-10 place-items-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                                        {course.title
                                            .trim()
                                            .charAt(0)
                                            .toUpperCase()}
                                    </span>
                                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                        Class workspace
                                    </span>
                                </div>

                                <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
                                    {course.title}
                                </h1>
                                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                                    {course.description ??
                                        "Build your central study guide, connect course material, and turn your notes into focused learning sessions."}
                                </p>
                            </div>

                            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-l border-border pl-6 text-sm lg:grid-cols-1">
                                <div>
                                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                                        Last updated
                                    </dt>
                                    <dd className="mt-1.5 flex items-center gap-2 font-medium text-foreground">
                                        <Clock3 size={14} />
                                        {formatDate(
                                            course.updatedAt,
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                                        Workspace
                                    </dt>
                                    <dd
                                        className="mt-1.5 truncate font-mono text-xs text-foreground"
                                        title={course.id}
                                    >
                                        {course.id.slice(
                                            0,
                                            12,
                                        )}
                                        …
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </header>

                    <main className="mt-10 grid gap-12 xl:grid-cols-[minmax(0,1fr)_19rem]">
                        <div className="min-w-0">
                            <section>
                                <div className="mb-5 flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                                            Continue working
                                        </p>
                                        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                                            Your learning space
                                        </h2>
                                    </div>
                                </div>

                                <div className="group relative overflow-hidden rounded-[1.5rem] bg-primary px-6 py-6 text-primary-foreground shadow-[0_20px_60px_-42px_var(--foreground)] sm:px-7">
                                    <div
                                        aria-hidden="true"
                                        className="absolute -right-14 -top-20 size-72 rounded-full border border-primary-foreground/10"
                                    />
                                    <div
                                        aria-hidden="true"
                                        className="absolute -right-3 -top-10 size-48 rounded-full border border-primary-foreground/10"
                                    />

                                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <BookOpen
                                                    className="text-primary-foreground/70"
                                                    size={20}
                                                />
                                                <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                                    Main Study Guide
                                                </h3>
                                            </div>
                                        </div>

                                        <Button
                                            asChild
                                            className="h-11 shrink-0 bg-background px-5 text-foreground hover:bg-background/90"
                                        >
                                            <Link
                                                to={`/courses/${course.id}/study-guide`}
                                            >
                                                <PencilLine
                                                    size={16}
                                                />
                                                Open editor
                                                <ArrowRight
                                                    size={16}
                                                />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </section>

                            <SourceDocumentsSection
                                courseId={course.id}
                            />

                            <section className="mt-12">
                                <div className="mb-2">
                                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                                        Coming next
                                    </p>
                                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                                        AI learning tools
                                    </h2>
                                </div>

                                <div className="mt-6 border-t border-border">
                                    {workspaceTools.map(
                                        (tool) => {
                                            const Icon =
                                                tool.icon;

                                            return (
                                                <div
                                                    key={
                                                        tool.label
                                                    }
                                                    className="group grid gap-4 border-b border-border py-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center"
                                                >
                                                    <span className="grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground transition group-hover:bg-accent group-hover:text-foreground">
                                                        <Icon
                                                            size={
                                                                19
                                                            }
                                                        />
                                                    </span>
                                                    <div>
                                                        <h3 className="font-medium text-foreground">
                                                            {
                                                                tool.label
                                                            }
                                                        </h3>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {
                                                                tool.description
                                                            }
                                                        </p>
                                                    </div>
                                                    <span className="w-fit rounded-full border border-border px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-wide text-muted-foreground">
                                                        {
                                                            tool.status
                                                        }
                                                    </span>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </section>
                        </div>

                        <aside className="space-y-10 xl:border-l xl:border-border xl:pl-8">
                            <section>
                                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                                    Feature availability
                                </p>
                                <h2 className="mt-2 font-semibold">
                                    What you can use
                                </h2>

                                <ul className="mt-5 border-t border-border">
                                    {featureAvailability.map(
                                        (feature) => (
                                            <li
                                                key={feature.label}
                                                className="flex items-center gap-3 border-b border-border py-3.5"
                                            >
                                                <span
                                                    className={[
                                                        "grid size-7 shrink-0 place-items-center rounded-lg",
                                                        feature.ready
                                                            ? "border-primary bg-primary text-primary-foreground"
                                                            : "bg-muted text-muted-foreground",
                                                    ].join(
                                                        " ",
                                                    )}
                                                >
                                                    {feature.ready ? (
                                                        <Check
                                                            size={
                                                                12
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="size-1 rounded-full bg-current" />
                                                    )}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium">
                                                        {
                                                            feature.label
                                                        }
                                                    </p>
                                                </div>
                                                <span className="text-[0.68rem] font-medium uppercase tracking-wide text-muted-foreground">
                                                    {
                                                        feature.status
                                                    }
                                                </span>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </section>

                            <section className="border-t border-border pt-8">
                                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                                    Recent activity
                                </p>
                                <div className="mt-5 flex gap-3">
                                    <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            Workspace created
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            Ready for your first
                                            notes and study guide.
                                        </p>
                                        <p className="mt-2 text-[0.7rem] text-muted-foreground">
                                            {formatDate(
                                                course.createdAt,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </main>
                </div>
            ) : null}
        </AppLayout>
    );
}
