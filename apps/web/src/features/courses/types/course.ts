export type Course = {
    id: string;
    title: string;
    description: string | null;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
};

export type CreateCourseInput = {
    title: string;
    description?: string | null;
};