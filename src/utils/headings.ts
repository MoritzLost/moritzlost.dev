import type { MarkdownHeading } from "astro"

export interface HierarchyItem {
    heading: MarkdownHeading,
    children: HierarchyItem[],
};

export const createHeadingsHierarchy = (headings: MarkdownHeading[]) => {
    const levels: HierarchyItem[] = []
    const minimumDepth: number = headings[0].depth;

    const parents = new Map();
    headings.forEach(heading => {
        const level = { heading, children: [], };
        parents.set(heading.depth, level);
        if (heading.depth === minimumDepth) {
            levels.push(level);
        } else {
            parents.get(heading.depth - 1).children.push(level);
        }
    })
    return levels;
}
