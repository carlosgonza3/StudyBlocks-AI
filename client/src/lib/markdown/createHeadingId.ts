export function createHeadingId(title: string, index: number) {
    const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

    return `${slug || "section"}-${index}`;
}