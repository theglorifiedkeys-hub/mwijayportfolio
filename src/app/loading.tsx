/** Route fallback: give feedback without covering the page with a timed splash. */
export default function Loading() {
  return (
    <div className="route-loading" role="status">
      <span className="sr-only">Loading page…</span>
    </div>
  );
}
