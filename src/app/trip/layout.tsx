import type { Metadata } from "next";
import TripLayout from "@/trip/TripLayout";

export const metadata: Metadata = {
  title: "ErgasTrip — יומן המסע של משפחת ארגס",
  description: "יומן מסע פרטי לשנה בתאילנד ואסיה",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TripLayout>{children}</TripLayout>;
}
