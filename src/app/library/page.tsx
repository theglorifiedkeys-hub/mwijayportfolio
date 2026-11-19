import { Folio } from "@/components/portfolio/folio";
export const metadata = {
  title: "Studio Library — Articles & client guides",
  alternates: { canonical: "/library" },
};
export default function LibraryPage() {
  return <Folio page="library" />;
}
