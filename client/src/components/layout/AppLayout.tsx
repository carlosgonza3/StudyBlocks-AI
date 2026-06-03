import HeaderLayout from "@/components/layout/HeaderLayout.tsx";
import type {ReactNode} from "react";


type AppLayoutProps = {
    children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
    return (

        <div className="min-h-screen bg-[#f8f7f4] text-zinc-950">
           <HeaderLayout />
            <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        </div>
    );
}