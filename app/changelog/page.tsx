import type { Metadata } from "next";
import PageHeader from "../components/sharedpages/PageHeader";
import ChangelogMain from "../components/changelog/ChangelogMain";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Release notes, performance improvements, and updates to Ugle.",
  openGraph: {
    title: "Changelog",
    description: "Release notes, performance improvements, and updates to Ugle.",
    url: "/changelog",
  },
};

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
