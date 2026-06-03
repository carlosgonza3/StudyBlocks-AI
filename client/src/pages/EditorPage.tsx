import { ArrowLeft, Play } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const SAMPLE_MARKDOWN = `# Calculus 2 Study Guide

## Series

### Geometric Series

A geometric series has the form:

- a + ar + ar² + ar³
- It converges if |r| < 1
- It diverges if |r| >= 1

---

### Ratio Test

Use the ratio test when the series has factorials, exponentials, or powers.
`;

export default function EditorPage() {
    const { documentId } = useParams();

    return (
        <AppLayout>
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <Button asChild variant="ghost" className="mb-3 px-0">
                        <Link to="/">
                            <ArrowLeft size={16} />
                            Back to dashboard
                        </Link>
                    </Button>

                    <h1 className="text-3xl font-bold tracking-tight">
                        Demo Study Guide
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Document ID: {documentId}
                    </p>
                </div>

                <Button>
                    <Play size={16} />
                    Study
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                <Card className="overflow-hidden p-0">
                    <div className="border-b border-zinc-200 px-4 py-3">
                        <h2 className="font-semibold">Markdown Editor</h2>
                    </div>

                    <Textarea
                        defaultValue={SAMPLE_MARKDOWN}
                        className="min-h-[600px] resize-none rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
                    />
                </Card>

                <Card className="overflow-hidden p-0">
                    <div className="border-b border-zinc-200 px-4 py-3">
                        <h2 className="font-semibold">Live Preview</h2>
                    </div>

                    <div className="min-h-[600px] p-6 text-zinc-500">
                        Preview will be added in Phase 2.
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}