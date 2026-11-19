import { Folio } from "@/components/portfolio/folio";
export const metadata = {
  title: "Project index — Altraware & Mwijay Studio",
  description:
    "Explore Mwijay Davie’s selected projects and their published development statuses.",
  alternates: { canonical: "/projects" },
};
export default function ProjectsPage() {
  return <Folio page="work" />;
}
