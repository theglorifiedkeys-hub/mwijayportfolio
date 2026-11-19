"use client";
import Link from "next/link";
import {
  useUser,
  useFirestore,
  useMemoFirebase,
  useCollection,
} from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { ArrowUpRight, Package } from "lucide-react";
import { formatTZS } from "@/lib/order-utils";
export default function Orders() {
  const { user } = useUser(),
    db = useFirestore();
  const q = useMemoFirebase(
    () =>
      db && user
        ? query(
            collection(db, "orders"),
            where("uid", "==", user.uid),
            orderBy("submittedAt", "desc"),
          )
        : null,
    [db, user],
  );
  const { data: orders, isLoading, error } = useCollection(q, { enabled: !!q });
  const totals = [
    ["Total orders", orders?.length],
    [
      "In progress",
      orders?.filter((o) =>
        [
          "payment_confirmed",
          "architecture_phase",
          "testing_phase",
          "VERIFIED",
        ].includes(o.status),
      ).length,
    ],
    ["Delivered", orders?.filter((o) => o.status === "delivered").length],
    [
      "Order value",
      orders
        ? formatTZS(
            orders.reduce(
              (sum, o) =>
                sum +
                (["cancelled", "REJECTED"].includes(o.status)
                  ? 0
                  : Number(String(o.amount).replaceAll(",", "")) || 0),
              0,
            ),
          )
        : undefined,
    ],
  ];
  return (
    <>
      <div className="cp-project-hero">
        <small className="cp-label">
          <i /> Client workspace / Orders
        </small>
        <h1>
          Your <em>orders.</em>
        </h1>
        <p>Review your studio orders and follow their delivery status.</p>
        <Link href="/client-portal/dashboard">
          Open project overview <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="cp-order-metrics">
        {totals.map(([label, value]) => (
          <div key={label}>
            <small>{label}</small>
            <b>{error || isLoading ? "—" : (value ?? "—")}</b>
          </div>
        ))}
      </div>
      <section className="cp-orders">
        <h2>Order history</h2>
        {error ? (
          <p role="alert">Orders could not be loaded.</p>
        ) : isLoading ? (
          <p role="status">Loading orders…</p>
        ) : orders?.length ? (
          orders.map((o) => (
            <Link
              className="cp-order"
              key={o.id}
              href={`/track-order#${encodeURIComponent(o.orderId)}`}
            >
              <Package size={19} />
              <div>
                <small>{o.orderId}</small>
                <h3>{o.productName || o.planName || "Studio project"}</h3>
                <p>
                  {(o.status || "Pending").replaceAll("_", " ")} ·{" "}
                  {formatTZS(o.amount || 0)}
                </p>
              </div>
              <ArrowUpRight size={17} />
            </Link>
          ))
        ) : (
          <p>No orders yet. Your purchases will appear here.</p>
        )}
        <Link href="/book" className="cp-order-link">
          Start a project ↗
        </Link>
      </section>
    </>
  );
}
