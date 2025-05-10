"use client";

import { useRouteGuard } from "@/app/dashboard/_hooks/useRouteGuard";
import { Footer } from "@/app/_components/Footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useRouteGuard();

  return (
    <div>
      {children}
      <Footer />
    </div>
  );
}
