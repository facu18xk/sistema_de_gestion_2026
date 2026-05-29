"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { DefaultDashboard } from "@/components/dashboard/default-dashboard";
import { getStoredUser } from "@/lib/auth";
import type { User } from "@/types/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
        <p className="text-muted-foreground">
          No se encontró la sesión. Cierra sesión e inicia de nuevo.
        </p>
      </div>
    );
  }

  if (user.role === "ADMIN") {
    return <AdminDashboard user={user} />;
  }

  return <DefaultDashboard user={user} />;
}
