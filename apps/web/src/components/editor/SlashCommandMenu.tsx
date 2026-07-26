import {
    useEffect,
    useRef,
} from "react";

import type { LucideIcon } from "lucide-react";

export type SlashCommandItem = {
    description: string;
    icon: LucideIcon;
    id: string;
    keywords: string[];
    label: string;
    shortcut?: string;
};

type SlashCommandMenuProps = {
    items: SlashCommandItem[];
    left: number;
    onSelect: (item: SlashCommandItem) => void;
    selectedIndex: number;
    top: number;
};

export default function SlashCommandMenu({
    items,
    left,
    onSelect,
    selectedIndex,
    top,
}: SlashCommandMenuProps) {
    const listRef =
        useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const list = listRef.current;
        const selectedItem =
            list?.querySelector<HTMLElement>(
                '[aria-selected="true"]',
            );

        if (!list || !selectedItem) {
            return;
        }

        const itemTop = selectedItem.offsetTop;
        const itemBottom =
            itemTop + selectedItem.offsetHeight;
        const visibleTop = list.scrollTop;
        const visibleBottom =
            visibleTop + list.clientHeight;

        if (itemTop < visibleTop) {
            list.scrollTo({
                behavior: "smooth",
                top: itemTop,
            });
        } else if (itemBottom > visibleBottom) {
            list.scrollTo({
                behavior: "smooth",
                top:
                    itemBottom -
                    list.clientHeight,
            });
        }
    }, [selectedIndex]);

    return (
        <div
            aria-label="Insert element"
            className="study-guide-slash-menu"
            role="listbox"
            style={{
                left,
                top,
            }}
        >
            <div className="border-b border-border px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Insert an element
                </p>
            </div>

            <div
                ref={listRef}
                className="max-h-80 overflow-y-auto p-1.5"
            >
                {items.length > 0 ? (
                    items.map((item, index) => {
                        const Icon = item.icon;
                        const isSelected =
                            index === selectedIndex;

                        return (
                            <button
                                key={item.id}
                                aria-selected={
                                    isSelected
                                }
                                className="study-guide-slash-menu-item"
                                role="option"
                                type="button"
                                onClick={() => {
                                    onSelect(item);
                                }}
                                onMouseDown={(
                                    event,
                                ) => {
                                    event.preventDefault();
                                }}
                            >
                                <span className="study-guide-slash-menu-icon">
                                    <Icon size={17} />
                                </span>
                                <span className="min-w-0 flex-1 text-left">
                                    <span className="block text-sm font-medium">
                                        {item.label}
                                    </span>
                                    <span className="block truncate text-xs text-muted-foreground">
                                        {
                                            item.description
                                        }
                                    </span>
                                </span>
                                {item.shortcut ? (
                                    <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground sm:inline">
                                        {item.shortcut}
                                    </kbd>
                                ) : null}
                            </button>
                        );
                    })
                ) : (
                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                        No matching elements.
                    </p>
                )}
            </div>
        </div>
    );
}
