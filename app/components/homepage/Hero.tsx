import Link from "next/link";
import Image from "next/image";
import HeroStats from "./HeroStats";

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10 text-center">
      <div className="flex flex-col items-center gap-10">
        <div className="space-y-6 flex flex-col items-center">
          <h1 className="text-[2.3rem] sm:text-[2.6rem] md:text-7xl lg:text-[5.8rem] font-bold tracking-tight leading-[1.2] text-ugle-slate max-w-7xl">
            <span className="inline-block">
              Find Your{" "}
              <span className="whitespace-nowrap inline-flex items-baseline">
                M
                {/* Relative wrapper keeps 'o' in the flow as the exact layout spacer */}
                <span className="relative inline-block w-[0.64em] mx-[-0.02em] h-auto">
                  <span className="text-transparent select-none">o</span>
                  <Image
                    src="/ugle-icon.png"
                    alt=""
                    aria-hidden="true"
                    fill
                    priority
                    sizes="(max-width: 768px) 36px, 64px"
                    className="absolute inset-0 object-contain pointer-events-none select-none"
                  />
                </span>
                ment.
              </span>
            </span>
            <br />
            <span className="text-[2.3rem] sm:text-[2.6rem] lg:text-[4rem]">
              From Your Videos. On Your Machine.
            </span>
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-ugle-gray leading-relaxed max-w-2xl font-medium">
            Ugle indexes every word spoken in your archive. Search by meaning in
            30ms, refine with Confidence Bubbles &amp; Replace All, and export to
            Resolve EDL, Premiere XML, FCPXML, or Approval CSV.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-ugle-gray">
            <span className="px-3 py-1 rounded-full bg-white border border-ugle-light/70">
              macOS 13.4+
            </span>
            <span className="px-3 py-1 rounded-full bg-white border border-ugle-light/70">
              Windows 10 64-bit+
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 items-center w-full justify-center">
          <Link
            href="/download"
            className="bg-ugle-green hover:bg-[#86d950] transition-colors text-white font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl text-base md:text-lg text-center flex items-center justify-center gap-3 w-full sm:w-auto"
          >
            Start 15-Day Free Trial
          </Link>
          <Link
            href="/how-it-works"
            className="bg-white hover:bg-gray-50 border-2 border-ugle-light/60 transition-colors text-ugle-slate font-bold py-4 px-10 rounded-xl text-base md:text-lg text-center flex items-center justify-center gap-2 w-full sm:w-auto hover:border-black/10"
          >
            See how it works &rarr;
          </Link>
        </div>

        <div className="mt-4 w-full">
          <HeroStats />
        </div>
      </div>
    </section>
  );
}
