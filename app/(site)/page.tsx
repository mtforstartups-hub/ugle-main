import type { Metadata } from "next";
import Hero from "@/app/components/homepage/Hero";
import {
  ProofBar,
  FeatureColumns,
  NleExportStrip,
  BenchmarkSocialProof,
  HomepageBottomCta,
} from "@/app/components/homepage/HomepageSections";
import { canonicalFor } from "@/app/lib/seo";

export const metadata: Metadata = {
  alternates: canonicalFor("/"),
};

export default function Home() {
  return (
    <>
      <Hero />
      <ProofBar />
      <FeatureColumns />
      <NleExportStrip />
      <BenchmarkSocialProof />
      <HomepageBottomCta />
    </>
  );
}
