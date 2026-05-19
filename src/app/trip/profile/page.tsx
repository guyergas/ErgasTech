"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/trip/auth");
        if (res.ok) {
          const data = await res.json();
          if (data.isAdmin && data.userId) {
            router.replace(`/trip/profile/${data.userId}`);
          } else {
            router.replace("/trip/login");
          }
        } else {
          router.replace("/trip/login");
        }
      } catch {
        router.replace("/trip/login");
      }
    })();
  }, [router]);

  return null;
}
