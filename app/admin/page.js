"use client";
import useUserRole from "../../lib/useUserRole";
import { useRouter } from "next/navigation";
import AdminAnalytics from "../AdminAnalytics";

export default function AdminPage() {
  const { role, loading } = useUserRole();
  const router = useRouter();

  if (loading) return <p>Loading...</p>;

  if (role !== "admin") {
    router.replace("/dashboard"); // normal user page
    return null;
  }

  return <AdminAnalytics />;
}
