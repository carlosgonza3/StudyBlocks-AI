import { apiRequest } from "@/lib/api/apiClient";

import type {
    Course,
    CreateCourseInput,
    UpdateCourseInput,
} from "../types/course";

export function listCourses(): Promise<Course[]> {
    return apiRequest<Course[]>("/courses");
}

export function getCourse(courseId: string): Promise<Course> {
    return apiRequest<Course>(`/courses/${courseId}`);
}

export function createCourse(input: CreateCourseInput): Promise<Course> {
    return apiRequest<Course>("/courses", {
        method: "POST",
        body: input,
    });
}

export function updateCourse(
    courseId: string,
    input: UpdateCourseInput,
): Promise<Course> {
    return apiRequest<Course>(`/courses/${courseId}`, {
        method: "PATCH",
        body: input,
    });
}

export function deleteCourse(
    courseId: string,
): Promise<Course> {
    return apiRequest<Course>(`/courses/${courseId}`, {
        method: "DELETE",
    });
}
