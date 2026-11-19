import { Folio } from "@/components/portfolio/folio";
export const metadata = {
  title: "Studio Market — Digital editions",
  alternates: { canonical: "/market" },
};
export default function MarketPage() {
  return <Folio page="market" />;
}
