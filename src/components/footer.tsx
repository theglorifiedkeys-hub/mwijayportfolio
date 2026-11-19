import { StudioFooter } from "@/components/portfolio/studio-chrome";

// Legacy public routes import this adapter. Keep one studio identity across both shells.
export function Footer() {
  return (
    <div className="ed ed-chrome">
      <StudioFooter />
    </div>
  );
}
