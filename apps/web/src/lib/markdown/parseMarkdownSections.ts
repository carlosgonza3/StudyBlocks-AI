import { createHeadingId } from "@/lib/markdown/createHeadingId";
import type { StudySection } from "@/types/study-section";

type SectionStackItem = StudySection;

function getHeadingLevel(line: string) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);

    if (!match) {
        return null;
    }

    return {
        level: match[1].length,
        title: match[2].trim(),
    };
}

export function parseMarkdownSections(markdown: string): StudySection[] {
    const lines = markdown.split("\n");

    const rootSections: StudySection[] = [];
    const stack: SectionStackItem[] = [];

    let currentSection: StudySection | null = null;
    let sectionCount = 0;

    for (const line of lines) {
        const heading = getHeadingLevel(line);

        if (heading) {
            sectionCount += 1;

            const newSection: StudySection = {
                id: createHeadingId(heading.title, sectionCount),
                title: heading.title,
                level: heading.level,
                content: "",
                children: [],
                parentId: null,
                order: sectionCount,
            };

            while (
                stack.length > 0 &&
                stack[stack.length - 1].level >= newSection.level
                ) {
                stack.pop();
            }

            const parent = stack[stack.length - 1];

            if (parent) {
                newSection.parentId = parent.id;
                parent.children.push(newSection);
            } else {
                rootSections.push(newSection);
            }

            stack.push(newSection);
            currentSection = newSection;

            continue;
        }

        if (currentSection) {
            currentSection.content += `${line}\n`;
        }
    }

    return rootSections;
}