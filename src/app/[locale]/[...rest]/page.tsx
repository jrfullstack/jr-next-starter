import { notFound } from "next/navigation";

// Catches unknown paths inside a locale (/es/foo) so they render the translated not-found page
export default function CatchAllPage() {
  notFound();
}
