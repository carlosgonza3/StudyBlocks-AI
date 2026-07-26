import { Navigate, Route, Routes } from "react-router-dom";

import CourseWorkspacePage from "@/pages/CourseWorkspacePage";
import DashboardPage from "@/pages/DashboardPage";
import EditorPreferencesPage from "@/pages/EditorPreferencesPage";
import EditorPage from "@/pages/EditorPage";

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<DashboardPage />} path="/" />

            <Route
                element={<CourseWorkspacePage />}
                path="/courses/:courseId"
            />

            <Route
                element={<EditorPage />}
                path="/courses/:courseId/study-guide"
            />

            <Route element={<EditorPage />} path="/documents/:documentId" />

            <Route
                element={<EditorPreferencesPage />}
                path="/settings/editor"
            />

            <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
    );
}
