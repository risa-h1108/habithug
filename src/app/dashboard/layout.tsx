"use client";

import { useRouteGuard } from "@/app/dashboard/_hooks/useRouteGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useRouteGuard();

  return <div>{children}</div>;
}
