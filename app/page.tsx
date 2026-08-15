import type { Metadata } from "next";
import { CleanSprintApp } from "./clean-sprint-app";

export const metadata: Metadata = {
  title: "LFG × Clean Sprint",
  description: "One shared household reset sprint. One home for every item.",
};

export default function Home() {
  return <CleanSprintApp />;
}
