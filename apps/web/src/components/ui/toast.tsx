import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import {
    CheckCircle2,
    CircleAlert,
    Info,
    LoaderCircle,
    TriangleAlert,
    X,
} from "lucide-react";

import { cn } from "@/lib/utils";

// eslint-disable-next-line react-refresh/only-export-components
export const toast =
    ToastPrimitive.createToastManager();

const statusIcons = {
    error: CircleAlert,
    info: Info,
    loading: LoaderCircle,
    success: CheckCircle2,
    warning: TriangleAlert,
} as const;

function ToastList() {
    const { toasts } =
        ToastPrimitive.useToastManager();

    return toasts.map((item) => {
        const type =
            item.type as keyof typeof statusIcons;
        const StatusIcon =
            statusIcons[type] ?? Info;

        return (
            <ToastPrimitive.Root
                key={item.id}
                className={cn(
                    "pointer-events-auto absolute right-0 bottom-0 w-[min(24rem,calc(100vw-2rem))] origin-bottom rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-xl transition-[transform,opacity] duration-200",
                    "translate-y-[calc(var(--toast-offset-y)*-1)] [z-index:calc(100-var(--toast-index))]",
                    "data-[starting-style]:translate-y-4 data-[starting-style]:opacity-0 data-[ending-style]:translate-x-[calc(100%+1rem)] data-[ending-style]:opacity-0",
                    "data-[swipe-direction=right]:translate-x-[var(--toast-swipe-movement-x)]",
                )}
                swipeDirection="right"
                toast={item}
            >
                <ToastPrimitive.Content className="flex items-start gap-3">
                    <StatusIcon
                        className={cn(
                            "mt-0.5 size-5 shrink-0",
                            type === "success" &&
                                "text-emerald-600 dark:text-emerald-400",
                            type === "error" &&
                                "text-destructive",
                            type === "warning" &&
                                "text-amber-600 dark:text-amber-400",
                            type === "loading" &&
                                "animate-spin text-primary",
                            (!type ||
                                type === "info") &&
                                "text-primary",
                        )}
                    />
                    <div className="min-w-0 flex-1">
                        <ToastPrimitive.Title className="text-sm font-semibold" />
                        <ToastPrimitive.Description className="mt-1 text-sm text-muted-foreground" />
                        <ToastPrimitive.Action className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground" />
                    </div>
                    <ToastPrimitive.Close
                        aria-label="Dismiss notification"
                        className="rounded-lg p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <X size={15} />
                    </ToastPrimitive.Close>
                </ToastPrimitive.Content>
            </ToastPrimitive.Root>
        );
    });
}

export function Toaster() {
    return (
        <ToastPrimitive.Provider
            limit={4}
            toastManager={toast}
        >
            <ToastPrimitive.Portal>
                <ToastPrimitive.Viewport className="pointer-events-none fixed right-4 bottom-4 z-[100]">
                    <ToastList />
                </ToastPrimitive.Viewport>
            </ToastPrimitive.Portal>
        </ToastPrimitive.Provider>
    );
}
