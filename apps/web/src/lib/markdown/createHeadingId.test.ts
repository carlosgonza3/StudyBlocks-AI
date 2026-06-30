import { describe, expect, it } from "vitest";

import { createHeadingId } from "@/lib/markdown/createHeadingId";

describe("createHeadingId", () => {
    it("creates a lowercase slug from a heading title", () => {
        expect(createHeadingId("Geometric Series", 1)).toBe(
            "geometric-series-1",
        );
    });

    it("trims leading and trailing whitespace", () => {
        expect(createHeadingId("   Ratio Test   ", 2)).toBe(
            "ratio-test-2",
        );
    });

    it("replaces consecutive whitespace with one hyphen", () => {
        expect(createHeadingId("Limit   Comparison    Test", 3)).toBe(
            "limit-comparison-test-3",
        );
    });

    it("removes punctuation and special characters", () => {
        expect(createHeadingId("Series: When & Why?", 4)).toBe(
            "series-when-why-4",
        );
    });

    it("preserves existing hyphens", () => {
        expect(createHeadingId("Step-by-Step Method", 5)).toBe(
            "step-by-step-method-5",
        );
    });

    it("uses section as a fallback when the title has no slug characters", () => {
        expect(createHeadingId("!!!", 6)).toBe("section-6");
    });

    it("uses section as a fallback for an empty title", () => {
        expect(createHeadingId("", 7)).toBe("section-7");
    });

    it("creates unique IDs for duplicate titles using the index", () => {
        const firstId = createHeadingId("Introduction", 1);
        const secondId = createHeadingId("Introduction", 2);

        expect(firstId).toBe("introduction-1");
        expect(secondId).toBe("introduction-2");
        expect(firstId).not.toBe(secondId);
    });
});