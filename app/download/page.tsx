import type { Metadata } from "next";
import DownloadMain from "@/app/components/download/DownloadMain";

export const metadata: Metadata = {
  title: "Download",
  description:
    "Download Ugle for macOS and Windows. 100% on-device indexing, no account required, and zero cloud uploads.",
  openGraph: {
    title: "Download",
    description:
      "Download Ugle for macOS and Windows. 100% on-device indexing, no account required, and zero cloud uploads.",
    url: "/download",
  },
};

export default function DownloadPage() {
  return <DownloadMain />;
}
