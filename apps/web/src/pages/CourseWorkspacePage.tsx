import { useEffect, useState } from "react";

import {
    ArrowLeft,
    BookOpen,
    Brain,
    FileText,
    GitBranch,
    Loader2,
    MessageSquareText,
    Upload,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getCourse } from "@/features/courses/api/coursesApi";
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

export default function CourseWorkspacePage() {
    const { courseId } = useParams<{ courseId: string }>();

    const [course, setCourse] = useState<Course | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
    }, [courseId]);

    return (
        <AppLayout>
            <div className="mb-8">
                <Button asChild variant="outline">
                    <Link to="/">
                        <ArrowLeft size={16} />
                        Back to dashboard
                    </Link>
                </Button>
            </div>

            {!courseId ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
                    <p className="font-medium text-destructive">
                        Could not load course
                    </p>
                    <p className="mt-1 text-sm text-destructive">
                        Course id is missing.
                    </p>
                </div>
            ) : isLoading ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    <Loader2 className="mx-auto mb-3 animate-spin" />
                    Loading course workspace...
                </div>
            ) : errorMessage ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
                    <p className="font-medium text-destructive">
                        Could not load course
                    </p>
                    <p className="mt-1 text-sm text-destructive">
                        {errorMessage}
                    </p>
                </div>
            ) : course ? (
                <>
                    <section className="mb-10">
                        <p className="mb-3 text-sm font-medium text-muted-foreground">
                            Course Workspace
                        </p>

                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground">
                                    {course.title}
                                </h1>

                                <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                                    {course.description ??
                                        "No description provided yet."}
                                </p>
                            </div>

                            <Card className="w-full border-border bg-card text-card-foreground lg:max-w-sm">
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Workspace details
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-2 text-sm text-muted-foreground">
                                    <p>
                                        <span className="font-medium text-foreground">
                                            Owner:
                                        </span>{" "}
                                        {course.ownerId}
                                    </p>

                                    <p>
                                        <span className="font-medium text-foreground">
                                            Updated:
                                        </span>{" "}
                                        {formatDate(course.updatedAt)}
                                    </p>

                                    <p className="break-all">
                                        <span className="font-medium text-foreground">
                                            ID:
                                        </span>{" "}
                                        {course.id}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Card className="border-border bg-card text-card-foreground">
                            <CardHeader>
                                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <Upload size={20} />
                                </div>

                                <CardTitle>Upload material</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Upload Markdown, text, or PDF files for
                                    this course.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card text-card-foreground">
                            <CardHeader>
                                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <FileText size={20} />
                                </div>

                                <CardTitle>Documents</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Manage parsed study guides and source
                                    documents.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card text-card-foreground">
                            <CardHeader>
                                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <GitBranch size={20} />
                                </div>

                                <CardTitle>Knowledge graph</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Visualize extracted concepts and their
                                    relationships.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card text-card-foreground">
                            <CardHeader>
                                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <MessageSquareText size={20} />
                                </div>

                                <CardTitle>AI tutor</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Ask questions grounded in your uploaded
                                    course material.
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                        <Card className="border-border bg-card text-card-foreground">
                            <CardHeader>
                                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <BookOpen size={20} />
                                </div>

                                <CardTitle>Course activity</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                                    <p className="font-medium text-foreground">
                                        No documents uploaded yet
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        The next phase will add document
                                        upload and persistence for this
                                        workspace.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card text-card-foreground">
                            <CardHeader>
                                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <Brain size={20} />
                                </div>

                                <CardTitle>Learning system</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    <li>Document upload: planned</li>
                                    <li>Structured parsing: planned</li>
                                    <li>Concept extraction: planned</li>
                                    <li>AI grounded answers: planned</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </section>
                </>
            ) : null}
        </AppLayout>
    );
}