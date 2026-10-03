import TermsofService from "@/app/markdown/Terms of Service.md";
import type { Metadata } from "next";
import { pageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "Read the Ugle Terms of Service. Understand your rights and responsibilities when using our software.",
  path: "/terms",
});

export default function TOSPage() {
  return <TermsofService />;
}
