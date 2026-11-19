import { redirect } from "next/navigation";

// Preserve bookmarks to the former duplicate editor.
export default function LegacySettings() { redirect("/admin/site-config"); }
