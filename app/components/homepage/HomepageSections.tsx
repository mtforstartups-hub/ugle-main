import Link from "next/link";
import { ProductHuntRatingBadge } from "@/app/components/ProductHuntProof";
import ReviewCarousel from "@/app/components/homepage/ReviewCarousel";

const PROOF_METRICS = [
  {
    value: "~22 hrs/hr",
    label: "M4 Pro Mac Indexing",
    context:
      "Base Mac mini indexes 100h in 6–8h; Live Demo 1h20m finishes in ~4 min",
  },
  {
    value: "~30s",
    label: "First File Searchable",
    context:
      "Smallest-to-largest auto-queue starts returning hits while larger files finish",
  },
  {
    value: "30ms",
    label: "Hybrid Search Latency",
    context:
      "Whisper Large v3 Turbo + Metal GPU BGE-M3 running at 60.2 texts/s",
  },
  {
    value: "99.4%",
    label: "Relevant Recall",
    context:
      "89% Top-1 best match across spoken dialogue and semantic concepts",
  },
  {
    value: "90–95%",
    label: "Transcription Accuracy",
    context:
      "99+ languages built in + optional 701 MB Indic-Transcribe Flex pack",
  },
  {
    value: "AES-256",
    label: "Local-Only Index",
    context:
      "Hardware-derived encryption, zero telemetry, Jamf PKG & Windows MSI ready",
  },
];

const NLE_EXPORTS = [
  {
    target: "DaVinci Resolve",
    label: "EDL Export",
    capability:
      "Multi-File Clip Lists exported directly as DaVinci Resolve EDL timelines",
  },
  {
    target: "Adobe Premiere Pro",
    label: "XML Export",
    capability:
      "Premiere Pro XML with automatic #/? special-character path relinking",
  },
  {
    target: "Final Cut Pro",
    label: "FCPXML Export",
    capability: "Native FCPXML timeline export from Multi-File Clip Lists",
  },
  {
    target: "Producers & Story Teams",
    label: "Producer Approval CSV",
    capability:
      "Structured CSV clip sheets with timecodes and dialogue for fast sign-off",
  },
  {
    target: "Direct Media Selects",
    label: "200ms Breath Pad MP3/MP4/ZIP",
    capability:
      "Export trimmed audio/video clips with 200ms breath padding bundled as MP3, MP4, or ZIP",
  },
  {
    target: "Transcripts & Captions",
    label: "SRT / VTT / TXT / Markdown",
    capability:
      "Clean timecoded subtitles and editable text/Markdown transcripts",
  },
];

const BENCHMARK_CARDS = [
  {
    label: "Live Demo Benchmark",
    value: "1h20m of footage indexed in ~4 min",
  },
  {
    label: "Base Mac mini Benchmark",
    value: "100 hours indexed in 6–8 hours overnight",
  },
  {
    label: "M4 Pro Mac Benchmark",
    value: "~22 hours of media indexed per hour",
  },
];

export function ProofBar() {
  return (
    <section className="w-full bg-[#F8FAF9] border-t border-ugle-light/60 py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROOF_METRICS.map((item) => (
            <div
              key={item.label}
              className="bg-white border border-ugle-light/60 rounded-2xl p-6 shadow-sm"
            >
              <div className="font-mono text-2xl md:text-3xl font-extrabold text-ugle-slate mb-1">
                {item.value}
              </div>
              <div className="text-sm font-bold text-[#5DA233] uppercase tracking-wider font-mono mb-2">
                {item.label}
              </div>
              <p className="text-sm text-ugle-gray leading-relaxed">
                {item.context}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NleExportStrip() {
  return (
    <section className="w-full bg-[#F8FAF9] border-t border-ugle-light/60 py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-ugle-slate tracking-tight mb-4">
            From Spoken Quote to Locked Timeline in One Click
          </h2>
          <p className="text-base md:text-lg text-ugle-gray leading-relaxed">
            Build Multi-File Clip Lists across hours of interviews and export
            production-ready timelines, producer review sheets, or clean
            audio/video selects.
          </p>
        </div>

        <div className="bg-white border border-ugle-light/60 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-160">
            <thead>
              <tr className="bg-ugle-slate text-white">
                <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider w-1/4">
                  Format / Target
                </th>
                <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-[#75C043] w-1/4">
                  Developer Label
                </th>
                <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider">
                  Exact v1.0.1 Capability
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ugle-light/50 text-sm">
              {NLE_EXPORTS.map((row) => (
                <tr
                  key={row.label}
                  className="hover:bg-[#F8FAF9]/70 transition-colors"
                >
                  <td className="py-4 px-6 font-semibold text-ugle-slate">
                    {row.target}
                  </td>
                  <td className="py-4 px-6 font-mono text-xs font-bold text-[#5DA233]">
                    {row.label}
                  </td>
                  <td className="py-4 px-6 text-ugle-gray">{row.capability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function BenchmarkSocialProof() {
  return (
    <section className="w-full bg-white border-t border-ugle-light/60 py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="font-mono text-xs tracking-[0.14em] uppercase text-[#5DA233] font-semibold mb-3">
            Built for Editors, Documentarians &amp; Post Teams
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-ugle-slate tracking-tight mb-4">
            Verified Performance on Real Workstations — Not Cloud Demos
          </h2>
          <p className="text-base md:text-lg text-ugle-gray mb-6">
            Featured on Product Hunt — Read editor feedback and launch notes on{" "}
            <a
              href="https://www.producthunt.com/products/ugle?launch=ugle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5DA233] font-semibold hover:underline"
            >
              UGLE.AI on Product Hunt
            </a>
            .
          </p>
          <div className="flex justify-center">
            <ProductHuntRatingBadge className="scale-90" />
          </div>
        </div>

        {/* Split layout: Left = Benchmark Proof Cards (no accordion), Right = Autoplay Review Carousel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-8">
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            {BENCHMARK_CARDS.map((card) => (
              <div
                key={card.label}
                className="bg-[#1C1C1C] text-white rounded-2xl p-6 shadow-sm flex-1 flex flex-col justify-center"
              >
                <div className="font-mono text-xs uppercase tracking-wider text-[#75C043] mb-1.5">
                  {card.label}
                </div>
                <div className="text-lg font-bold leading-snug">
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-7">
            <ReviewCarousel />
          </div>
        </div>

        <p className="text-center text-sm text-ugle-gray max-w-3xl mx-auto">
          Every benchmark is measured locally on real Apple Silicon and Windows
          hardware — no fiber upload queues, no cloud transcoding bills. Review
          every release milestone in the{" "}
          <Link
            href="/changelog"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            v1.0.1 Changelog
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

export function HomepageBottomCta() {
  return (
    <section className="w-full bg-[#F8FAF9] border-t border-ugle-light/60 py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-ugle-slate text-white rounded-3xl px-8 py-12 md:px-14 md:py-16 text-center shadow-lg">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 max-w-3xl mx-auto">
            Stop Paying Per Minute to Search Your Own Hard Drives.
          </h2>
          <p className="text-base md:text-xl text-white/75 max-w-2xl mx-auto mb-8 leading-relaxed">
            Download the native ~192 MB installer and index your first drive in
            minutes. Free for 15 days — no credit card, no account, and no file
            or hour limits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/download"
              className="bg-ugle-green hover:bg-[#86d950] transition-colors text-white font-bold py-4 px-8 rounded-xl shadow-md text-base w-full sm:w-auto"
            >
              Download UGLE.AI v1.0.1 Free
            </Link>
            <Link
              href="/pricing"
              className="bg-white/10 hover:bg-white/15 border border-white/20 transition-colors text-white font-bold py-4 px-8 rounded-xl text-base w-full sm:w-auto"
            >
              View Flat Annual Pricing ($225/yr)
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
