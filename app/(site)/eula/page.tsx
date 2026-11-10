import Eula from "@/app/markdown/EULA.md";
import type { Metadata } from "next";
import { pageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "End User Licence Agreement",
  description:
    "Read the Ugle End User Licence Agreement. Understand your rights and responsibilities when using our software.",
  path: "/eula",
});

export default function TOSPage() {
  return <Eula />;
}
