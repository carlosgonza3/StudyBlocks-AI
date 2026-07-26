import { apiRequest } from "@/lib/api/apiClient";

import type { SourceDocument } from "../types/source-document";

export function listSourceDocuments(
    courseId: string,
): Promise<SourceDocument[]> {
    return apiRequest<SourceDocument[]>(
        `/courses/${courseId}/source-documents`,
    );
}

export function uploadSourceDocument(
    courseId: string,
    file: File,
): Promise<SourceDocument> {
    const formData = new FormData();
    formData.set("file", file);

    return apiRequest<SourceDocument>(
        `/courses/${courseId}/source-documents`,
        {
            method: "POST",
            body: formData,
        },
    );
}

export function deleteSourceDocument(
    courseId: string,
    documentId: string,
): Promise<SourceDocument> {
    return apiRequest<SourceDocument>(
        `/courses/${courseId}/source-documents/${documentId}`,
        {
            method: "DELETE",
        },
    );
}
