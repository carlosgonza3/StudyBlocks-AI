export type SourceDocumentStatus =
    | "PROCESSING"
    | "READY"
    | "FAILED";

export type SourceDocument = {
    id: string;
    courseId: string;
    originalName: string;
    storedName: string;
    mimeType: string;
    sizeBytes: number;
    storagePath: string;
    extractedText: string;
    status: SourceDocumentStatus;
    errorMessage: string | null;
    createdAt: string;
    updatedAt: string;
};
