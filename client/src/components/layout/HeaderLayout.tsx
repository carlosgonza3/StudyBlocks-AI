import { Sparkles } from "lucide-react";

import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

import Settings from "@/settings/main.json"

import AppLogo from "@/assets/studyblocks-icon.svg";


export default function HeaderLayout() {
    return (
        <>
            <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
                <div className="mx-auto flex h-16 items-center justify-between px-6">
                    <Link to="/" className="flex items-center gap-2 font-semibold">
                        <img
                            src={AppLogo}
                            alt={`${Settings.appname} logo`}
                            className="h-9 w-auto"
                        />

                        <span>{Settings.appname}</span>
                    </Link>

                    <Button asChild>
                        <Link to="/documents/demo">
                            <Sparkles size={16} />
                            Open Demo
                        </Link>
                    </Button>
                </div>
            </header>
        </>
    );
}