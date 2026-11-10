import Notice from "@/app/markdown/NOTICE.md";
import type { Metadata } from "next";
import { pageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Third-Party & Open Source Notices",
  description:
    "Read the third-party software, open-source components, and machine-learning model notices for Ugle.",
  path: "/notice",
});

export default function NoticePage() {
  return <Notice />;
}
