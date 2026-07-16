import { useCallback, useEffect, useState } from "react";

import { FileText, Loader2, Plus, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { listCourses } from "@/features/courses/api/coursesApi";
import { CreateCourseDialog } from "@/features/courses/components/CreateCourseDialog";
import type { Course } from "@/features/courses/types/course";

function getReadableError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return "Something went wrong.";
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("en-CA", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export default function DashboardPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    useEffect(() => {
        let isCurrent = true;

        listCourses()
            .then((loadedCourses) => {
                if (!isCurrent) {
                    return;
                }

                setCourses(loadedCourses);
                setErrorMessage(null);
            })
            .catch((error: unknown) => {
                if (!isCurrent) {
                    return;
                }

                setErrorMessage(getReadableError(error));
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
    }, []);

    const handleRefreshCourses = useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            const loadedCourses = await listCourses();

            setCourses(loadedCourses);
        } catch (error) {
            setErrorMessage(getReadableError(error));
        } finally {
            setIsLoading(false);
        }
    }, []);

    function handleCourseCreated(course: Course) {
        setCourses((currentCourses) => [course, ...currentCourses]);
    }

    return (
        <AppLayout>
            <section className="mb-10">
                <p className="mb-3 text-sm font-medium text-muted-foreground">
                    Main Dashboard
                </p>

                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground">
                    Turn your notes into structured, interactive study
                    sessions.
                </h1>

                <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                    Write Markdown once, generate an outline automatically,
                    and study each section as focused blocks.
                </p>

                <div className="mt-6">
                    <Button
                        onClick={() => {
                            setIsCreateDialogOpen(true);
                        }}
                        size="lg"
                        type="button"
                    >
                        <Plus size={18} />
                        Create Study Guide
                    </Button>
                </div>
            </section>

            <section>
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                    Recent study guides
                </h2>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Link className="block" to="/documents/demo">
                        <Card className="border-border bg-card text-card-foreground transition hover:-translate-y-1 hover:shadow-md">
                            <CardHeader>
                                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <FileText size={20} />
                                </div>

                                <CardTitle>Demo Study Guide</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    A sample guide to test the editor,
                                    preview, outline, and study mode later.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </section>

            <section>
                <div className="mb-4 mt-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">
                            My study guides
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            These are loaded from the NestJS API and
                            PostgreSQL database.
                        </p>
                    </div>

                    <Button
                        disabled={isLoading}
                        onClick={() => {
                            void handleRefreshCourses();
                        }}
                        type="button"
                        variant="outline"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <RefreshCw size={16} />
                        )}
                        Refresh
                    </Button>
                </div>

                {errorMessage ? (
                    <p className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {errorMessage}
                    </p>
                ) : null}

                {isLoading ? (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                        <Loader2 className="mx-auto mb-3 animate-spin" />
                        Loading study guides...
                    </div>
                ) : courses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center">
                        <FileText className="mx-auto mb-3 text-muted-foreground" />

                        <p className="font-medium text-foreground">
                            No study guides yet
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Create one with the main button above to test
                            the full-stack connection.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Card
                                className="border-border bg-card text-card-foreground transition hover:-translate-y-1 hover:shadow-md"
                                key={course.id}
                            >
                                <CardHeader>
                                    <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
                                        <FileText size={20} />
                                    </div>

                                    <CardTitle>{course.title}</CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {course.description ??
                                            "No description provided."}
                                    </p>

                                    <p className="mt-4 text-xs text-muted-foreground">
                                        Updated{" "}
                                        {formatDate(course.updatedAt)}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            <CreateCourseDialog
                isOpen={isCreateDialogOpen}
                onClose={() => {
                    setIsCreateDialogOpen(false);
                }}
                onCourseCreated={handleCourseCreated}
            />
        </AppLayout>
    );
}