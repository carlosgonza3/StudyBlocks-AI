import { apiRequest } from '@/lib/api/apiClient';

import type {
    Course,
    CreateCourseInput,
} from '../types/course';

export function listCourses(): Promise<Course[]> {
    return apiRequest<Course[]>('/courses');
}

export function createCourse(
    input: CreateCourseInput,
): Promise<Course> {
    return apiRequest<Course>('/courses', {
        method: 'POST',
        body: input,
    });
}