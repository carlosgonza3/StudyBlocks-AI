import { apiRequest } from "@/lib/api/apiClient";

import type {
    StudyGuide,
    UpdateStudyGuideInput,
} from "../types/study-guide";

export function getMainStudyGuide(courseId: string): Promise<StudyGuide> {
    return apiRequest<StudyGuide>(`/courses/${courseId}/study-guide`);
}

export function updateMainStudyGuide(
    courseId: string,
    input: UpdateStudyGuideInput,
): Promise<StudyGuide> {
    return apiRequest<StudyGuide>(`/courses/${courseId}/study-guide`, {
        method: "PATCH",
        body: input,
    });
}