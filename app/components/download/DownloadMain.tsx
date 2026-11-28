"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import DownloadButton from "@/app/components/DownloadButton";

const TRIAL_REASSURANCE = [
  "No credit card required",
  "No account or login wall",
  "No file or hour limits during your 15-day trial",
  "Read-only searchable index retained after Day 15",
];

const FIRST_LAUNCH_STEPS = [
  "Point UGLE.AI at any local folder or external drive.",
  "Smallest-to-largest auto-queue makes your first file searchable in ~30s (Live Demo 1h20m finishes in ~4 min; Base Mac mini indexes 100h in 6–8h; M4 Pro hits ~22 hrs/hr).",
  "Search in 30ms, refine with Green/Orange/Red Confidence Bubbles and Cmd+Enter Edit-in-Place, and export straight to DaVinci Resolve (EDL), Premiere Pro (XML with #/? relinking), Final Cut Pro (FCPXML), Producer Approval CSV, or 200ms breath pad MP3/MP4/ZIP.",
];

export default function DownloadMain() {
  return (
    <div className="bg-[#1C1C1C] min-h-screen text-white pt-20 pb-28">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 text-white leading-tight">
            Download UGLE.AI v1.0.1
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-4 font-light leading-relaxed">
            Native desktop indexing for macOS and Windows. Start your ungated
            15-day free trial in under a minute.
          </p>
          <p className="text-sm md:text-base text-white/65 mb-8 leading-relaxed">
            Instant Ungated 15-Day Free Trial — No Credit Card, No File Limit.
            Your local index stays searchable in read-only mode after Day 15.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <DownloadButton
              platform="macos"
              variant="filled"
              size="sm"
              subLabel="Download for"
              label="macOS (~192 MB)"
              href="/request-trial?platform=macos"
            />
            <DownloadButton
              platform="windows"
              variant="outline"
              size="sm"
              subLabel="Download for"
              label="Windows (~192 MB)"
              href="/request-trial?platform=windows"
            />
          </div>
          <p className="text-xs font-mono text-white/50 mb-10">
            ~192 MB Native Installer &bull; 100% Local Processing &bull; Zero
            Telemetry &bull; AES-256 Local Index
          </p>

          {/* OS Selector Table */}
          <div className="border border-white/10 rounded-xl overflow-x-auto bg-white/5 backdrop-blur mb-8">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-black/30 text-white/90">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Operating System</th>
                  <th className="py-3.5 px-5 font-semibold">
                    System Requirement
                  </th>
                  <th className="py-3.5 px-5 font-semibold">Installer</th>
                  <th className="py-3.5 px-5 font-semibold">Enterprise IT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-white">
                    macOS
                  </td>
                  <td className="py-3.5 px-5 text-white/75">
                    macOS 13.4+ (Apple Silicon &amp; Intel)
                  </td>
                  <td className="py-3.5 px-5">
                    <Link
                      href="/request-trial?platform=macos"
                      className="text-[#75C043] hover:underline font-medium"
                    >
                      Download for macOS (~192 MB)
                    </Link>
                  </td>
                  <td className="py-3.5 px-5">
                    <Link
                      href="/security"
                      className="text-white/75 hover:text-white underline"
                    >
                      Download Jamf PKG (IT Admin)
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-white">
                    Windows
                  </td>
                  <td className="py-3.5 px-5 text-white/75">
                    Windows 10 64-bit+
                  </td>
                  <td className="py-3.5 px-5">
                    <Link
                      href="/request-trial?platform=windows"
                      className="text-[#75C043] hover:underline font-medium"
                    >
                      Download for Windows (~192 MB)
                    </Link>
                  </td>
                  <td className="py-3.5 px-5">
                    <Link
                      href="/security"
                      className="text-white/75 hover:text-white underline"
                    >
                      Download Windows MSI (IT Admin)
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Ungated Trial Reassurance Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {TRIAL_REASSURANCE.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white/85"
              >
                <Check className="size-4 shrink-0 text-[#75C043]" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Optional Language Pack Callout */}
          <div className="bg-white/5 border border-[#75C043]/30 rounded-xl p-5 text-sm text-white/80 leading-relaxed">
            <span className="font-semibold text-[#75C043]">
              Optional Language Pack Callout (Indic-Transcribe Flex):
            </span>{" "}
            Working in Indian languages? Inside the app, download the optional
            701 MB Indic-Transcribe Flex pack (Bodhan AI / AI4Bharat) for
            Bengali, Gujarati, Hindi, Kannada, Malayalam, Marathi, Punjabi,
            Tamil, and Telugu — with English kept in Latin script and
            cross-script search across all 9 scripts.
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-14 border-t border-white/10 pt-12 flex flex-col md:flex-row gap-12"
        >
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold mb-3 text-white">
              System requirements
            </h2>
            <p className="text-sm font-mono text-white/50 mb-6">
              macOS 13.4+ &middot; Windows 10 64-bit+ &middot; v1.0.1
            </p>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5 backdrop-blur">
              <table className="w-full text-left">
                <tbody className="divide-y divide-white/5">
                  <tr className="bg-black/20">
                    <td className="py-3.5 px-5 font-semibold text-sm w-1/3 text-white/90">
                      Requirement
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-sm text-white/90">
                      Specification
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-sm text-white/90">
                      OS
                    </td>
                    <td className="py-3.5 px-5 text-white/70 text-sm">
                      macOS 13.4+ (Apple Silicon &amp; Intel) / Windows 10
                      64-bit+
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-sm text-white/90">
                      RAM
                    </td>
                    <td className="py-3.5 px-5 text-white/70 text-sm">
                      8GB minimum. 16GB recommended for large archives.
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-sm text-white/90">
                      Storage
                    </td>
                    <td className="py-3.5 px-5 text-white/70 text-sm">
                      ~192 MB installer; 4GB minimum for application and index.
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-sm text-white/90">
                      Processor
                    </td>
                    <td className="py-3.5 px-5 text-white/70 text-sm">
                      Any modern CPU. Apple M-series provides fastest indexing.
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-sm text-white/90">
                      Internet
                    </td>
                    <td className="py-3.5 px-5 text-white/70 text-sm">
                      Initial download and optional updates only.
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-sm text-white/90">
                      Account
                    </td>
                    <td className="py-3.5 px-5 text-white/70 text-sm">
                      None required.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold mb-6 text-white">
              What to Expect on First Launch
            </h2>
            <ol className="space-y-5 list-decimal pl-5 text-white/90 font-normal text-sm md:text-base leading-relaxed marker:text-[#75C043] marker:font-bold">
              {FIRST_LAUNCH_STEPS.map((step, idx) => (
                <li
                  key={idx}
                  className="pl-3 pb-5 border-b border-white/10 last:border-b-0"
                >
                  {step}
                </li>
              ))}
            </ol>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-x-5 gap-y-2 text-xs font-mono text-white/60">
              <Link href="/security" className="hover:text-[#75C043]">
                Security Architecture
              </Link>
              <Link href="/pricing" className="hover:text-[#75C043]">
                Pricing ($225/user/year)
              </Link>
              <Link href="/changelog" className="hover:text-[#75C043]">
                v1.0.1 Changelog
              </Link>
              <a
                href="https://www.producthunt.com/products/ugle?launch=ugle"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#75C043]"
              >
                UGLE.AI on Product Hunt
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
