import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    ChevronDown,
    File,
    FileText,
    Loader2,
    RefreshCw,
    Trash2,
    Upload,
} from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
    deleteSourceDocument,
    listSourceDocuments,
    uploadSourceDocument,
} from "@/features/source-documents/api/sourceDocumentsApi";
import type { SourceDocument } from "@/features/source-documents/types/source-document";

type SourceDocumentsSectionProps = {
    courseId: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [
    ".pdf",
    ".md",
    ".markdown",
    ".txt",
];

function getReadableError(error: unknown): string {
    return error instanceof Error
        ? error.message
        : "Something went wrong.";
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("en-CA", {
        dateStyle: "medium",
    }).format(new Date(value));
}

export default function SourceDocumentsSection({
    courseId,
}: SourceDocumentsSectionProps) {
    const inputRef =
        useRef<HTMLInputElement | null>(null);
    const [documents, setDocuments] = useState<
        SourceDocument[]
    >([]);
    const [isLoading, setIsLoading] =
        useState(true);
    const [isUploading, setIsUploading] =
        useState(false);
    const [isDragging, setIsDragging] =
        useState(false);
    const [documentToDelete, setDocumentToDelete] =
        useState<SourceDocument | null>(null);
    const [isDeleting, setIsDeleting] =
        useState(false);

    const loadDocuments = useCallback(async () => {
        try {
            setIsLoading(true);
            setDocuments(
                await listSourceDocuments(courseId),
            );
        } catch (error) {
            toast.add({
                title: "Could not load source documents",
                description:
                    getReadableError(error),
                type: "error",
            });
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        let isCurrent = true;

        listSourceDocuments(courseId)
            .then((loadedDocuments) => {
                if (isCurrent) {
                    setDocuments(loadedDocuments);
                }
            })
            .catch((error: unknown) => {
                if (isCurrent) {
                    toast.add({
                        title: "Could not load source documents",
                        description:
                            getReadableError(error),
                        type: "error",
                    });
                }
            })
            .finally(() => {
                if (isCurrent) {
                    setIsLoading(false);
                }
            });

        return () => {
            isCurrent = false;
        };
    }, [courseId]);

    async function handleFile(file: File) {
        const extension = `.${file.name
            .split(".")
            .pop()
            ?.toLowerCase()}`;

        if (!ACCEPTED_EXTENSIONS.includes(extension)) {
            toast.add({
                title: "Unsupported document",
                description:
                    "Choose a PDF, Markdown, or plain-text file.",
                type: "error",
            });
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.add({
                title: "Document is too large",
                description:
                    "Source documents must be 10 MB or smaller.",
                type: "error",
            });
            return;
        }

        try {
            setIsUploading(true);
            const uploadedDocument =
                await uploadSourceDocument(
                    courseId,
                    file,
                );
            setDocuments((current) => [
                uploadedDocument,
                ...current,
            ]);

            if (
                uploadedDocument.status === "FAILED"
            ) {
                toast.add({
                    title: "Document uploaded, but processing failed",
                    description:
                        uploadedDocument.errorMessage ??
                        "Text could not be extracted.",
                    type: "error",
                });
            } else {
                toast.add({
                    title: "Source document ready",
                    description: `${file.name} was uploaded and processed.`,
                    type: "success",
                });
            }
        } catch (error) {
            toast.add({
                title: "Could not upload document",
                description:
                    getReadableError(error),
                type: "error",
            });
        } finally {
            setIsUploading(false);
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    }

    async function handleDelete() {
        if (!documentToDelete) {
            return;
        }

        try {
            setIsDeleting(true);
            await deleteSourceDocument(
                courseId,
                documentToDelete.id,
            );
            setDocuments((current) =>
                current.filter(
                    (document) =>
                        document.id !==
                        documentToDelete.id,
                ),
            );
            toast.add({
                title: "Source document deleted",
                type: "success",
            });
            setDocumentToDelete(null);
        } catch (error) {
            toast.add({
                title: "Could not delete document",
                description:
                    getReadableError(error),
                type: "error",
            });
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <section className="mt-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        Course material
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                        Source documents
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Upload the notes and readings
                        that will power this course.
                    </p>
                </div>
                <Button
                    disabled={
                        isLoading || isUploading
                    }
                    type="button"
                    variant="outline"
                    onClick={() => {
                        void loadDocuments();
                    }}
                >
                    <RefreshCw
                        className={
                            isLoading
                                ? "animate-spin"
                                : ""
                        }
                        size={15}
                    />
                    Refresh
                </Button>
            </div>

            <button
                className={[
                    "mt-6 flex w-full flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-8 text-center outline-none transition",
                    isDragging
                        ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                        : "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40",
                    isUploading
                        ? "cursor-wait opacity-70"
                        : "",
                ].join(" ")}
                disabled={isUploading}
                type="button"
                onClick={() => {
                    inputRef.current?.click();
                }}
                onDragEnter={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                }}
                onDragOver={(event) => {
                    event.preventDefault();
                }}
                onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    const file =
                        event.dataTransfer.files[0];
                    if (file) {
                        void handleFile(file);
                    }
                }}
            >
                <span className="grid size-11 place-items-center rounded-xl bg-background text-foreground ring-1 ring-border">
                    {isUploading ? (
                        <Loader2
                            className="animate-spin"
                            size={19}
                        />
                    ) : (
                        <Upload size={19} />
                    )}
                </span>
                <span className="mt-4 font-medium">
                    {isUploading
                        ? "Uploading and extracting text…"
                        : "Drop a document here or browse"}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                    PDF, Markdown, or TXT · Maximum
                    10 MB
                </span>
            </button>
            <input
                ref={inputRef}
                accept=".pdf,.md,.markdown,.txt,application/pdf,text/markdown,text/plain"
                className="sr-only"
                type="file"
                onChange={(event) => {
                    const file =
                        event.target.files?.[0];
                    if (file) {
                        void handleFile(file);
                    }
                }}
            />

            <div className="mt-7 border-t border-border">
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                        <Loader2
                            className="animate-spin"
                            size={16}
                        />
                        Loading documents…
                    </div>
                ) : documents.length === 0 ? (
                    <div className="py-10 text-center">
                        <FileText className="mx-auto text-muted-foreground" />
                        <p className="mt-3 text-sm font-medium">
                            No source documents yet
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Upload your first file to
                            start building this course’s
                            knowledge base.
                        </p>
                    </div>
                ) : (
                    documents.map((document) => (
                        <div
                            key={document.id}
                            className="border-b border-border py-4"
                        >
                            <div className="flex items-center gap-3">
                                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                                    <File size={17} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {
                                            document.originalName
                                        }
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {formatFileSize(
                                            document.sizeBytes,
                                        )}{" "}
                                        ·{" "}
                                        {formatDate(
                                            document.createdAt,
                                        )}
                                    </p>
                                </div>
                                <span
                                    className={[
                                        "rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide",
                                        document.status ===
                                        "READY"
                                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                            : document.status ===
                                                "FAILED"
                                              ? "bg-destructive/10 text-destructive"
                                              : "bg-muted text-muted-foreground",
                                    ].join(" ")}
                                >
                                    {document.status}
                                </span>
                                <Button
                                    aria-label={`Delete ${document.originalName}`}
                                    className="text-muted-foreground hover:text-destructive"
                                    size="icon-sm"
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setDocumentToDelete(
                                            document,
                                        );
                                    }}
                                >
                                    <Trash2 size={15} />
                                </Button>
                            </div>

                            {document.status ===
                                "READY" &&
                            document.extractedText ? (
                                <details className="group ml-13 mt-3">
                                    <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-foreground">
                                        <ChevronDown className="transition group-open:rotate-180" size={13} />
                                        Preview extracted text
                                    </summary>
                                    <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-muted/60 p-4 font-sans text-xs leading-5 text-muted-foreground">
                                        {
                                            document.extractedText
                                        }
                                    </pre>
                                </details>
                            ) : document.errorMessage ? (
                                <p className="ml-13 mt-2 text-xs text-destructive">
                                    {
                                        document.errorMessage
                                    }
                                </p>
                            ) : null}
                        </div>
                    ))
                )}
            </div>

            <AlertDialog
                open={Boolean(documentToDelete)}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setDocumentToDelete(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete source document?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {documentToDelete?.originalName}{" "}
                            and its extracted text will be
                            permanently removed.
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
                                    size={15}
                                />
                            ) : (
                                <Trash2 size={15} />
                            )}
                            {isDeleting
                                ? "Deleting..."
                                : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}
