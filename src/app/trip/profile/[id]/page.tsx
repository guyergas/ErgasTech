"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfileRedirect() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  useEffect(() => {
    router.push(`/trip?userId=${userId}`);
  }, [userId, router]);

  return null;
}
