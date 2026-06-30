import type { StudySection } from "@/types/study-section";

export function flattenStudySections(sections: StudySection[]): StudySection[] {
    const result: StudySection[] = [];

    function walk(sectionList: StudySection[]) {
        for (const section of sectionList) {
            result.push(section);

            if (section.children.length > 0) {
                walk(section.children);
            }
        }
    }

    walk(sections);

    return result;
}