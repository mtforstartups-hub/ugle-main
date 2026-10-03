import type { Metadata } from "next";
import DownloadMain from "@/app/components/download/DownloadMain";
import { pageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Download",
  description: "Download Ugle for macOS and Windows. 100% on-device indexing, no account required, and zero cloud uploads.",
  path: "/download",
});

export default function DownloadPage() {
  return <DownloadMain />;
}
