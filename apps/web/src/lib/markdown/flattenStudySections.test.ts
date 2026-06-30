import { describe, expect, it } from "vitest";

import { flattenStudySections } from "@/lib/markdown/flattenStudySections";
import type { StudySection } from "@/types/study-section";

function createSection(
    id: string,
    title: string,
    level: number,
    order: number,
    children: StudySection[] = [],
): StudySection {
    return {
        id,
        title,
        level,
        content: "",
        children,
        parentId: null,
        order,
    };
}

describe("flattenStudySections", () => {
    it("returns an empty array when no sections are provided", () => {
        expect(flattenStudySections([])).toEqual([]);
    });

    it("returns root sections in their existing order", () => {
        const first = createSection("first-1", "First", 1, 1);
        const second = createSection("second-2", "Second", 1, 2);

        const result = flattenStudySections([first, second]);

        expect(result).toEqual([first, second]);
    });

    it("flattens nested sections using depth-first pre-order traversal", () => {
        const ratioTest = createSection(
            "ratio-test-3",
            "Ratio Test",
            3,
            3,
        );

        const convergenceTests = createSection(
            "convergence-tests-2",
            "Convergence Tests",
            2,
            2,
            [ratioTest],
        );

        const infiniteSeries = createSection(
            "infinite-series-1",
            "Infinite Series",
            1,
            1,
            [convergenceTests],
        );

        const result = flattenStudySections([infiniteSeries]);

        expect(result).toEqual([
            infiniteSeries,
            convergenceTests,
            ratioTest,
        ]);
    });

    it("preserves sibling order while flattening nested sections", () => {
        const geometricSeries = createSection(
            "geometric-series-2",
            "Geometric Series",
            2,
            2,
        );

        const ratioTest = createSection(
            "ratio-test-3",
            "Ratio Test",
            2,
            3,
        );

        const series = createSection(
            "series-1",
            "Series",
            1,
            1,
            [geometricSeries, ratioTest],
        );

        const integration = createSection(
            "integration-4",
            "Integration",
            1,
            4,
        );

        const result = flattenStudySections([
            series,
            integration,
        ]);

        expect(result.map((section) => section.title)).toEqual([
            "Series",
            "Geometric Series",
            "Ratio Test",
            "Integration",
        ]);
    });

    it("does not mutate the original section hierarchy", () => {
        const child = createSection(
            "child-2",
            "Child",
            2,
            2,
        );

        const parent = createSection(
            "parent-1",
            "Parent",
            1,
            1,
            [child],
        );

        const originalChildren = [...parent.children];

        flattenStudySections([parent]);

        expect(parent.children).toEqual(originalChildren);
        expect(parent.children).toHaveLength(1);
        expect(parent.children[0]).toBe(child);
    });

    it("returns references to the original section objects", () => {
        const section = createSection(
            "original-1",
            "Original",
            1,
            1,
        );

        const result = flattenStudySections([section]);

        expect(result[0]).toBe(section);
    });
});