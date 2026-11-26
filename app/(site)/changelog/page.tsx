import type { Metadata } from "next";
import PageHeader from "@/app/components/sharedpages/PageHeader";
import ChangelogMain from "@/app/components/changelog/ChangelogMain";
import { pageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Changelog",
  description: "Release notes, performance improvements, and updates to Ugle.",
  path: "/changelog",
});

export default function page() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <PageHeader
        title="Changelog"
        subtitle="Release notes and updates to the Ugle engine."
      />

      <ChangelogMain />
    </div>
  );
}
