import type { Metadata } from "next";
import GetAccessHero from "../components/getaccess/GetAccessHero";
import GetAccessForm from "../components/getaccess/GetAccessForm";
import { pageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Request Trial",
  description:
    "Request your 15-day free trial of Ugle. Experience local-first, lightning-fast audio and video search on your own machine.",
  path: "/request-trial",
});

export default function RequestTrialPage() {
  return (
    <div className="bg-[#F8FAF9] min-h-[80vh] pt-8 md:pt-12 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <GetAccessHero />

        <GetAccessForm />
      </div>
    </div>
  );
}
