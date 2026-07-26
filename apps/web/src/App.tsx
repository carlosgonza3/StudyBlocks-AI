import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./app/routes/AppRoutes";
import { Toaster } from "@/components/ui/toast";

export default function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
            <Toaster />
        </BrowserRouter>
    );
}
