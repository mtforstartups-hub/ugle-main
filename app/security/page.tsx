import React from "react";
import type { Metadata } from "next";
import PageHeader from "../components/sharedpages/PageHeader";
import SecurityMain from "../components/security/SecurityMain";

export const metadata: Metadata = {
  title: "Security & Privacy",
  description:
    "Learn about Ugle's local-first security architecture. 100% on-device processing, zero telemetry, and no cloud uploads.",
  openGraph: {
    title: "Security & Privacy",
    description:
      "Learn about Ugle's local-first security architecture. 100% on-device processing, zero telemetry, and no cloud uploads.",
    url: "/security",
  },
};

export default function Security() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-24 ">
      <PageHeader
        badge="Security Architecture"
        title="Your files never leave your machine."
        subtitle="Not a privacy policy. An architecture decision. Ugle has no server-side infrastructure to receive your recordings."
      />

      <SecurityMain />
    </div>
  );
}
