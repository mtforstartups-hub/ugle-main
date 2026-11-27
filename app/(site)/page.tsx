import type { Metadata } from "next";
import Hero from "@/app/components/homepage/Hero";
import ProductHuntProof from "@/app/components/ProductHuntProof";
import HowItWorks from "@/app/components/homepage/HowItWorks";
import Problem from "@/app/components/homepage/Problem";
import Workflow from "@/app/components/homepage/Workflow";
import { canonicalFor } from "@/app/lib/seo";

export const metadata: Metadata = {
  alternates: canonicalFor("/"),
};

export default function Home() {
  return (
    <>
      <Hero />
      <ProductHuntProof />
      <Problem />
      <HowItWorks />
      <Workflow />
    </>
  );
}
