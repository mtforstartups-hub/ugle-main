import type { Metadata } from "next";
import Hero from "./components/homepage/Hero";
import HowItWorks from "./components/homepage/HowItWorks";
import Problem from "./components/homepage/Problem";
import Workflow from "./components/homepage/Workflow";
import { canonicalFor } from "@/app/lib/seo";

export const metadata: Metadata = {
  alternates: canonicalFor("/"),
};

export default function Home() {
  return (
    <>
      <Hero />
      <Problem />
      <HowItWorks />
      <Workflow />
    </>
  );
}
