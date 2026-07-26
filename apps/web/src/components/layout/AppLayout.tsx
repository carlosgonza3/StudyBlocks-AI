import type { ReactNode } from "react";

import HeaderLayout from "@/components/layout/HeaderLayout";

type AppLayoutProps = {
    children: ReactNode;
    fullWidth?: boolean;
    onNavigateRequest?: (path: string) => void;
};

export default function AppLayout({
    children,
    fullWidth = false,
    onNavigateRequest,
}: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <HeaderLayout
                onNavigateRequest={onNavigateRequest}
            />

            <main
                className={
                    fullWidth
                        ? "w-full"
                        : "mx-auto max-w-[92%] px-6 py-8"
                }
            >
                {children}
            </main>
        </div>
    );
}
