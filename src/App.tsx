import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { LessonPage } from "./pages/LessonPage";
import { ModulePage } from "./pages/ModulePage";
import { SearchPage } from "./pages/SearchPage";
import { LabsPage } from "./pages/LabsPage";
import { NotFound } from "./pages/NotFound";
import { match, useRoute } from "./lib/router";

export function App() {
  const route = useRoute();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [route.path]);

  const moduleMatch = match(route, "/modulo/:id");
  const lessonMatch = match(route, "/leccion/:moduleId/:lessonId");

  let page = <NotFound />;
  if (route.path === "/" || route.path === "") page = <Home />;
  else if (moduleMatch) page = <ModulePage moduleId={moduleMatch[0]} />;
  else if (lessonMatch) page = <LessonPage moduleId={lessonMatch[0]} lessonId={lessonMatch[1]} />;
  else if (route.path === "/buscar") page = <SearchPage />;
  else if (route.path === "/labs" || route.path === "/laboratorios") page = <LabsPage />;

  return <Layout>{page}</Layout>;
}
