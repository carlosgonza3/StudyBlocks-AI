export function stripInlineMarkdown(
    markdown: string,
): string {
    return markdown
        .replace(
            /!\[([^\]]*)]\([^)]*\)/g,
            "$1",
        )
        .replace(
            /\[([^\]]+)]\([^)]*\)/g,
            "$1",
        )
        .replace(/<[^>]+>/g, "")
        .replace(/`+([^`]+)`+/g, "$1")
        .replace(
            /(\*\*|__|~~|\*|_)(.*?)\1/g,
            "$2",
        )
        .replace(/\\([\\`*_[\]{}()#+.!~-])/g, "$1")
        .replace(/\$+([^$]+)\$+/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
}
