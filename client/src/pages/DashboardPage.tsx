import { FileText, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    return (
        <AppLayout>
            <section className="mb-10">
                <p className="mb-3 text-sm font-medium text-zinc-500">
                    Main Dashboard
                </p>

                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-950">
                    Turn your notes into structured, interactive study sessions.
                </h1>

                <p className="mt-4 max-w-2xl text-lg text-zinc-600">
                    Write Markdown once, generate an outline automatically, and study each
                    section as a focused card.
                </p>

                <div className="mt-6">
                    <Button asChild size="lg">
                        <Link to="/documents/demo">
                            <Plus size={18} />
                            Create Study Guide
                        </Link>
                    </Button>
                </div>
            </section>

            <section>
                <h2 className="mb-4 text-xl font-semibold">Recent study guides</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Link to="/documents/demo">
                        <Card className="transition hover:-translate-y-1 hover:shadow-md">
                            <CardHeader>
                                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-zinc-100">
                                    <FileText size={20} />
                                </div>

                                <CardTitle>Demo Study Guide</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm text-zinc-600">
                                    A sample guide to test the editor, preview, outline, and study
                                    mode later.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </section>

            <section>
                <h2 className="mt-10 mb-4 text-xl font-semibold">My study guides</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Link to="/documents/demo">
                        <Card className="transition hover:-translate-y-1 hover:shadow-md">
                            <CardHeader>
                                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-zinc-100">
                                    <FileText size={20} />
                                </div>

                                <CardTitle>Demo Study Guide</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm text-zinc-600">
                                    A sample guide to test the editor, preview, outline, and study
                                    mode later.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </section>
        </AppLayout>
    );
}