import {
  collection,
  Firestore,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

// Keep public queries aligned with the publisher flags and Firestore read rules.
export function publishedBlogs(db: Firestore, count?: number) {
  return query(
    collection(db, "blogs"),
    where("isPublished", "==", true),
    orderBy("publishedAt", "desc"),
    ...(count ? [limit(count)] : []),
  );
}
export function availableProducts(db: Firestore) {
  return query(collection(db, "products"), where("isAvailable", "==", true));
}
/** Old market listings stored formatted TZS strings. Never coerce invalid input to a free order. */
export function listingPrice(value: unknown): number | null {
  const text = String(value ?? "").trim();
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(text)) return null;
  const amount = Number(text.replaceAll(",", ""));
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}
