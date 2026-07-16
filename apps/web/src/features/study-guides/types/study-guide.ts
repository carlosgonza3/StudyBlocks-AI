export type StudyGuide = {
    id: string;
    title: string;
    contentMarkdown: string;
    courseId: string;
    createdAt: string;
    updatedAt: string;
};

export type UpdateStudyGuideInput = {
    title?: string;
    contentMarkdown?: string;
};