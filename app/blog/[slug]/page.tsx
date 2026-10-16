import React from "react";
import type { Metadata } from "next";
import BlogPost from "@/app/components/blog/BlogPost";
import SocialShare from "@/app/components/blog/SocialShare";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import GlobalCTA from "@/app/components/GlobalCTA";
import BreadcrumbJsonLd from "@/app/components/Seo/BreadcrumbJsonLd";
import {
  SITE_URL,
  absoluteUrl,
  pageMetadata,
  serializeJsonLd,
} from "@/app/lib/seo";

const BLOG_POST_DATA: Record<
  string,
  {
    title: string;
    description: string;
    meta: string;
    tag: string;
    image: string;
    publishedAt: string;
    updatedAt: string;
    content: React.ReactNode;
  }
> = {
  "why-local-first": {
    title: "Why we built Ugle local-first",
    description:
      "Why on-device transcription and zero cloud uploads is the only architecture that respects journalistic integrity and source privacy.",
    meta: "4 min read",
    tag: "Product philosophy",
    image: "/images/blogs/why-local-first.jpg",
    publishedAt: "2026-06-25",
    updatedAt: "2026-07-16",
    content: (
      <>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-8">
          The first version of what became Ugle uploaded files to a server. We
          built it that way because it was easier — existing transcription APIs,
          no on-device model to maintain, faster to ship.
        </p>
        <p>
          We showed it to an investigative journalist we respect. She looked at
          the interface and said, without hesitating:
        </p>
        <blockquote>&ldquo;Where does the audio go?&rdquo;</blockquote>
        <p>We told her. She closed the laptop.</p>
        <p>
          That was the answer. Not the architecture decision — the moment before
          it. The fact that the first question a professional journalist asked
          about a tool for her source recordings was about data location told us
          everything about what kind of tool this needed to be.
        </p>
        <p>
          The cloud version worked. Fast, accurate, reasonably priced. It also
          required trust we had no right to ask for — trust that the server was
          secure, that data was not being used to train models, that a legal
          demand would not reveal a source. Not unreasonable conditions for a
          transcription tool. Unreasonable conditions for a journalism tool.
        </p>
        <p>
          On-device transcription was technically harder. Larger models. Tighter
          engineering constraints. We wrote a custom inference pipeline, managed
          model distribution, and solved for hardware variation across consumer
          machines.
        </p>
        <p>
          Worth it. Not because local-first is a feature. Because for the
          workflows Ugle is built for, it is the only architecture that respects
          the user&apos;s actual situation.
        </p>

        <div className="not-prose mt-14 p-10 bg-[#3A3A3A] text-white rounded-2xl text-center shadow-lg">
          <h3 className="text-[22px] font-bold mb-2 text-white mt-0 border-0">
            Index once. Search forever.
          </h3>
          <p className="text-[#c3c5cd] text-[17px] mb-0! max-w-md mx-auto">
            Your archive never leaves your machine.
          </p>
        </div>
      </>
    ),
  },
  "cost-of-scrubbing-timelines": {
    title: "The real cost of scrubbing timelines",
    description:
      "A documentary editor spends 6-10 hours a week scrubbing timelines. Here is how local-first search changes media archiving.",
    meta: "3 min read",
    tag: "Workflow",
    image: "/images/blogs/cost-of-scrubbing.jpg",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    content: (
      <>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-8">
          A documentary editor we spoke to last year spends six to ten hours a
          week scrubbing through footage to find moments she already knows
          exist.
        </p>
        <p>
          She has watched most of it once. She cannot remember timestamps. She
          scrubs to the rough third of a clip where a subject seemed agitated,
          plays from there, rewinds, tries again.
        </p>
        <p>
          This is not unusual. It is the default workflow for anyone who works
          with recorded media and has more footage than they can hold in active
          memory. Which is everyone.
        </p>
        <p>
          The problem is not a lack of tools. There are transcription tools.
          Annotation tools. Summary tools. None of them make the archive
          searchable the way a text document is searchable.
        </p>
        <p>
          When you open a 15,000-word transcript and press Cmd+F, you find every
          instance of a word in under a second. The entire document is equally
          accessible. No part is harder to retrieve than any other.
        </p>
        <p>
          That is what Ugle does for recorded media. Once indexed, a recording
          becomes as findable as a text file. Type what you are looking for. 30
          milliseconds.
        </p>
        <div className="mt-12 p-8 bg-[#F7F7F5] rounded-xl border border-ugle-light/60">
          <p className="text-[18px] font-bold text-ugle-slate m-0! line-height-[1.5]">
            The editor we mentioned still uses a timeline. She does not have to
            scrub it anymore.
          </p>
        </div>
      </>
    ),
  },
  "what-transcription-accuracy-means": {
    title: "What 95% transcription accuracy actually means",
    description:
      "A breakdown of transcription word error rates across accents, recording conditions, and noise levels — and what it means for search.",
    meta: "5 min read",
    tag: "Product",
    image: "/images/blogs/transcription-accuracy.jpg",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    content: (
      <>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-8">
          We say 95% accuracy. That number is word error rate measured against
          manually transcribed ground truth across languages, accents, recording
          conditions, and speaker types.
        </p>
        <p>
          In practice: in a 1,000-word recording, approximately 50 words will be
          wrong. Errors cluster around proper nouns, field-specific terminology,
          heavy regional accents, and poor audio quality.
        </p>
        <p>
          For search, this matters less than it sounds. You are searching{" "}
          <em>&apos;rent control&rsquo;</em>, not{" "}
          <em>&lsquo;Councillor Singh&rsquo;</em>. The model is unlikely to miss{" "}
          <em>&lsquo;rent control&rsquo;</em> in a clean recording.
        </p>
        <p>
          For verbatim quotation, always verify against the source. Ugle makes
          this fast — click any result and the audio plays from that timestamp.
        </p>

        <div className="my-14 border border-ugle-light/60 rounded-[14px] overflow-hidden not-prose shadow-sm">
          <table className="w-full text-left text-[15px] border-collapse bg-white">
            <thead>
              <tr className="bg-[#3A3A3A] text-white">
                <th className="py-3 px-5 font-semibold font-sans w-2/3">
                  Condition
                </th>
                <th className="py-3 px-5 font-semibold font-sans">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ugle-light/40">
              <tr className="hover:bg-[#F7F7F5] transition-colors border-l-4 border-l-[#75C043]">
                <td className="py-3.5 px-5 font-medium text-ugle-slate">
                  Studio-quality, single speaker
                </td>
                <td className="py-3.5 px-5 text-ugle-slate font-mono text-[13.5px]">
                  97–99%
                </td>
              </tr>
              <tr className="bg-[#F7F7F5] border-l-4 border-l-emerald-500">
                <td className="py-3.5 px-5 font-medium text-ugle-slate">
                  Standard broadcast audio
                </td>
                <td className="py-3.5 px-5 text-ugle-slate font-mono text-[13.5px]">
                  95–97%
                </td>
              </tr>
              <tr className="hover:bg-[#F7F7F5] transition-colors border-l-4 border-l-yellow-400">
                <td className="py-3.5 px-5 font-medium text-ugle-slate">
                  Video conference, single speaker
                </td>
                <td className="py-3.5 px-5 text-ugle-slate font-mono text-[13.5px]">
                  94–96%
                </td>
              </tr>
              <tr className="bg-[#F7F7F5] border-l-4 border-l-orange-400">
                <td className="py-3.5 px-5 font-medium text-ugle-slate">
                  Phone recording
                </td>
                <td className="py-3.5 px-5 text-ugle-slate font-mono text-[13.5px]">
                  85–88%
                </td>
              </tr>
              <tr className="hover:bg-[#F7F7F5] transition-colors border-l-4 border-l-orange-500">
                <td className="py-3.5 px-5 font-medium text-ugle-slate">
                  Multiple overlapping speakers
                </td>
                <td className="py-3.5 px-5 text-ugle-slate font-mono text-[13.5px]">
                  80–88%
                </td>
              </tr>
              <tr className="bg-[#F7F7F5] border-l-4 border-l-red-500">
                <td className="py-3.5 px-5 font-medium text-ugle-slate">
                  Consistent background noise (&gt;60dB)
                </td>
                <td className="py-3.5 px-5 text-ugle-slate font-mono text-[13.5px]">
                  75–85%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-5.5 bg-[#F7F7F5] rounded-xl border border-ugle-light/60">
          <p className="text-[14.5px] font-mono text-ugle-gray m-0 leading-relaxed font-medium">
            We benchmark every model update against the same test set. If
            accuracy drops, we do not ship. The 95% figure is a floor, not an
            aspiration.
          </p>
        </div>
      </>
    ),
  },
  "languages-supported": {
    title: "The 90+ Languages Supported by Ugle",
    description:
      "Explore the 90+ languages supported locally by Ugle for fast, on-device audio and video transcription with no cloud required.",
    meta: "4 min read",
    tag: "Product",
    image: "/images/blogs/languages-supported.png",
    publishedAt: "2026-06-27",
    updatedAt: "2026-07-16",
    content: (
      <>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-8">
          A search tool is only as useful as the language it can index. From the
          start, we designed Ugle&apos;s local-first engine to recognize more
          than just English. By utilizing highly optimized transcription models,
          Ugle can handle over 90 languages right on your machine.
        </p>
        <p>
          Whether you are transcribing an interview in Spanish, analyzing a
          podcast in Japanese, or archiving historical footage in Welsh, Ugle
          extracts the text securely without ever sending a byte to the cloud.
        </p>

        <div className="not-prose my-10 p-8 md:p-10 rounded-2xl bg-[#1C1C1C] text-white flex flex-col sm:flex-row items-center gap-6 shadow-lg">
          <div className="text-center sm:text-left shrink-0">
            <p className="text-[52px] font-extrabold text-[#75C043] leading-none tracking-tight">
              90+
            </p>
            <p className="text-[14px] font-mono text-white/60 uppercase tracking-widest mt-1">
              Languages
            </p>
          </div>
          <div className="w-px self-stretch bg-white/10 hidden sm:block" />
          <p className="text-[17px] text-white/80 leading-relaxed font-light">
            Every language is processed on-device at the same speed and quality.
            No internet required. No per-language pricing.
          </p>
        </div>

        <h2>Fully Supported Languages</h2>
        <p>
          Below is the complete list of languages our transcription model
          supports. This coverage allows international newsrooms and global
          research teams to rely on one tool for their entire archive.
        </p>

        <div className="not-prose my-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[
            "English",
            "Chinese",
            "German",
            "Spanish",
            "Russian",
            "Korean",
            "French",
            "Japanese",
            "Portuguese",
            "Turkish",
            "Polish",
            "Catalan",
            "Dutch",
            "Arabic",
            "Swedish",
            "Italian",
            "Indonesian",
            "Hindi",
            "Finnish",
            "Vietnamese",
            "Hebrew",
            "Ukrainian",
            "Greek",
            "Malay",
            "Czech",
            "Romanian",
            "Danish",
            "Hungarian",
            "Tamil",
            "Norwegian",
            "Thai",
            "Urdu",
            "Croatian",
            "Bulgarian",
            "Lithuanian",
            "Latin",
            "Māori",
            "Malayalam",
            "Welsh",
            "Slovak",
            "Telugu",
            "Persian",
            "Latvian",
            "Bengali",
            "Serbian",
            "Azerbaijani",
            "Slovenian",
            "Kannada",
            "Estonian",
            "Macedonian",
            "Breton",
            "Basque",
            "Icelandic",
            "Armenian",
            "Nepali",
            "Mongolian",
            "Bosnian",
            "Kazakh",
            "Albanian",
            "Swahili",
            "Galician",
            "Marathi",
            "Panjabi",
            "Sinhala",
            "Khmer",
            "Shona",
            "Yoruba",
            "Somali",
            "Afrikaans",
            "Occitan",
            "Georgian",
            "Belarusian",
            "Tajik",
            "Sindhi",
            "Gujarati",
            "Amharic",
            "Yiddish",
            "Lao",
            "Uzbek",
            "Faroese",
            "Haitian",
            "Pashto",
            "Turkmen",
            "Norwegian Nynorsk",
            "Maltese",
            "Sanskrit",
            "Luxembourgish",
            "Burmese",
            "Tibetan",
            "Tagalog",
            "Malagasy",
            "Assamese",
            "Tatar",
            "Hawaiian",
            "Lingala",
            "Hausa",
            "Bashkir",
            "jw",
            "Sundanese",
          ].map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-[#F0F4EE] border border-[#75C043]/20 text-[13.5px] font-medium text-ugle-slate hover:bg-[#75C043]/10 transition-colors"
            >
              {lang}
            </span>
          ))}
        </div>

        <p>
          As our models improve, this list will grow. And because the models run
          locally, you will never be charged a premium for transcribing less
          common languages.
        </p>

        <div className="not-prose mt-14 p-10 bg-[#3A3A3A] text-white rounded-2xl text-center shadow-lg">
          <h3 className="text-[22px] font-bold mb-2 text-white">
            A truly global archive.
          </h3>
          <p className="text-[#c3c5cd] text-[17px] mb-0 max-w-md mx-auto">
            No language packs to download. No internet required.
          </p>
        </div>
      </>
    ),
  },
  "find-quote-in-video-without-exact-words": {
    title: "How to Find a Quote in a Video Without the Exact Words",
    description:
      "Remember what someone said but not the exact wording or timestamp? Learn how semantic media search helps you find the right moment inside video recordings.",
    meta: "4 min read",
    tag: "Workflow",
    image: "/images/blogs/find-quote-in-video.png",
    publishedAt: "2026-09-28",
    updatedAt: "2026-09-28",
    content: (
      <>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          You remember the idea.
        </p>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          You remember who said it.
        </p>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          You might even remember the interview.
        </p>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-8">
          What you do not remember is the exact sentence or timestamp.
        </p>
        <p>That is where normal keyword search starts to break down.</p>
        <p>
          If the speaker said, &ldquo;We had to delay the launch because the
          suppliers were not ready,&rdquo; searching for{" "}
          <em>production problem</em> may return nothing. The meaning matches.
          The words do not.
        </p>

        <h2>Search for the idea, not only the wording</h2>
        <p>
          Keyword search works well when you already know the phrase you are
          trying to find.
        </p>
        <p>
          Semantic search solves a different problem. It tries to find passages
          that are similar in meaning to your query, even when the wording is
          different.
        </p>

        <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
          <div className="p-5 rounded-xl bg-[#F7F7F5] border border-ugle-light/60">
            <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-ugle-gray block mb-2">
              Instead of searching:
            </span>
            <p className="text-[17px] font-bold text-ugle-slate m-0">
              &ldquo;supplier delay&rdquo;
            </p>
          </div>
          <div className="p-5 rounded-xl bg-[#F0F4EE] border border-[#75C043]/30">
            <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-[#5DA233] block mb-2">
              You might describe what you remember:
            </span>
            <p className="text-[17px] font-bold text-ugle-slate m-0">
              &ldquo;the part where she explained why the launch was
              postponed&rdquo;
            </p>
          </div>
        </div>

        <p>
          A useful media-search result should then take you back to the relevant
          recording and timestamp.
        </p>
        <p>The goal is not to generate an answer about the recording.</p>
        <p>The goal is to retrieve the source.</p>

        <h2>Why this matters with long recordings</h2>
        <p>
          Finding a quote manually usually means opening the file, moving
          through the timeline, listening, rewinding and trying another section.
        </p>
        <p>That may be manageable for one ten-minute recording.</p>
        <p>
          It becomes a different problem when you have dozens or hundreds of{" "}
          <Link
            href="/use-cases/journalists"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            interviews
          </Link>
          .
        </p>
        <p>The recording is not lost. The moment is buried.</p>
        <p>
          Once recordings are indexed,{" "}
          <Link
            href="/how-it-works"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            Ugle
          </Link>{" "}
          lets you search across the spoken content of your archive rather than
          relying on filenames or your memory of exact wording.
        </p>

        <div className="my-8 p-6 bg-[#F7F7F5] rounded-xl border border-ugle-light/60 space-y-3 not-prose">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#75C043] text-white flex items-center justify-center font-bold text-sm shrink-0">
              1
            </span>
            <p className="text-[16px] font-semibold text-ugle-slate m-0">
              Search for what you remember.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#75C043] text-white flex items-center justify-center font-bold text-sm shrink-0">
              2
            </span>
            <p className="text-[16px] font-semibold text-ugle-slate m-0">
              Review the matching Moments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#75C043] text-white flex items-center justify-center font-bold text-sm shrink-0">
              3
            </span>
            <p className="text-[16px] font-semibold text-ugle-slate m-0">
              Open the original recording at the relevant timestamp.
            </p>
          </div>
        </div>

        <h2>Always verify the original source</h2>
        <p>Semantic search is retrieval, not proof.</p>
        <p>
          Automatic transcripts can contain errors. Search ranking can also
          surface passages that are related but not identical to what you
          intended.
        </p>
        <p>
          If you plan to publish a direct quotation, play the original recording
          and confirm the words in context.
        </p>
        <p>That final source check matters.</p>
        <p>Ugle is designed to make the route back to that source short.</p>

        <div className="not-prose mt-14 p-10 bg-[#3A3A3A] text-white rounded-2xl text-center shadow-lg">
          <h3 className="text-[22px] font-bold mb-2 text-white mt-0 border-0">
            Remember the idea. Find the Moment.
          </h3>
          <p className="text-[#c3c5cd] text-[17px] mb-4 max-w-md mx-auto">
            You should not need to remember the filename, timestamp and exact
            sentence to find something you already recorded.
          </p>
          <p className="text-white font-medium text-[16px] mb-8">
            Search inside your archive with Ugle.
          </p>
          <div className="flex justify-center">
            <Link
              href="/download"
              className="bg-ugle-green hover:bg-[#86d950] transition-colors text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl text-base text-center inline-flex items-center justify-center gap-2"
            >
              Request Trial
            </Link>
          </div>
        </div>
      </>
    ),
  },
  "search-across-multiple-audio-recordings": {
    title: "How to Search Across Multiple Audio Recordings",
    description:
      "Learn how to search spoken content across multiple audio recordings from one place instead of opening files and transcripts individually.",
    meta: "4 min read",
    tag: "Workflow",
    image: "/images/blogs/search-across-multiple-audio-recordings.png",
    publishedAt: "2026-09-23",
    updatedAt: "2026-09-23",
    content: (
      <>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          One recording is easy to search manually.
        </p>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          A hundred recordings are an archive problem.
        </p>
        <p>
          You may know that someone discussed a subject somewhere in your
          interviews, meetings or{" "}
          <Link
            href="/use-cases"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            podcast recordings
          </Link>{" "}
          without remembering which file contains it.
        </p>
        <p>Opening files one by one does not scale.</p>

        <h2>Make the spoken content searchable</h2>
        <p>
          Traditional folders organise recordings by things such as filename,
          date and project.
        </p>
        <p>Those attributes help when you remember the file.</p>
        <p>They help much less when you remember what was said.</p>
        <p>
          A searchable audio archive adds another layer: the spoken content
          inside the recordings.
        </p>
        <p>
          With Ugle,{" "}
          <Link
            href="/how-it-works"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            audio is indexed locally
          </Link>{" "}
          so a search can run across the indexed Library rather than one file at
          a time.
        </p>
        <p>
          You can search for a word, phrase or concept and review matching
          Moments from different recordings.
        </p>

        <h2>A typical retrieval problem</h2>
        <p>
          Imagine you have forty recorded interviews from a six-month research
          project.
        </p>
        <p>
          You remember that several participants discussed difficulty finding
          affordable housing.
        </p>
        <p>You do not remember their exact words.</p>
        <p>
          Instead of opening forty recordings individually, search the indexed
          archive for:
        </p>

        <div className="my-6 p-5 rounded-xl bg-[#F0F4EE] border border-[#75C043]/30 not-prose">
          <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-[#5DA233] block mb-1">
            Search Query
          </span>
          <p className="text-[18px] font-bold text-ugle-slate m-0">
            &ldquo;difficulty finding affordable housing&rdquo;
          </p>
        </div>

        <p>The useful output is not a generated summary of the interviews.</p>
        <p>
          It is a set of relevant passages that lead back to specific source
          files and timestamps.
        </p>
        <p>That distinction matters.</p>
        <p>Search should help you recover evidence, not replace it.</p>

        <h2>
          Semantic and keyword search solve different parts of the problem
        </h2>
        <p>An exact keyword search is useful when you know the phrase.</p>
        <p>
          Search for <em>rent control</em>, and exact references to those words
          are useful.
        </p>
        <p>Semantic search is useful when vocabulary changes.</p>
        <p>
          One speaker may say &ldquo;rent is becoming impossible to
          afford.&rdquo; Another may discuss &ldquo;housing costs pushing people
          out of the area.&rdquo;
        </p>
        <p>The language differs.</p>
        <p>The subject is related.</p>
        <p>
          A media archive becomes much more useful when both types of retrieval
          are possible.
        </p>

        <h2>Build the archive once, search it repeatedly</h2>
        <p>The value of indexing grows with the archive.</p>
        <p>Today you may need one quote.</p>
        <p>
          Next month you may need every interview in which a source discussed
          the same issue.
        </p>
        <p>
          The original recording remains the source of truth. Search simply
          makes the relevant parts easier to recover.
        </p>

        <div className="not-prose mt-14 p-10 bg-[#3A3A3A] text-white rounded-2xl text-center shadow-lg">
          <h3 className="text-[22px] font-bold mb-2 text-white mt-0 border-0">
            Stop opening recordings one at a time.
          </h3>
          <p className="text-[#c3c5cd] text-[17px] mb-8 max-w-md mx-auto">
            Index your audio archive once, then search across it when you need
            something back.
          </p>
          <div className="flex justify-center">
            <Link
              href="/download"
              className="bg-ugle-green hover:bg-[#86d950] transition-colors text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl text-base text-center inline-flex items-center justify-center gap-2"
            >
              Request Trial
            </Link>
          </div>
        </div>
      </>
    ),
  },
  "search-podcast-back-catalogue": {
    title: "How to Search a Podcast Back Catalogue for Past Guest Answers",
    description:
      "Search across years of podcast recordings to find past guest answers, themes and soundbites without listening through old episodes again.",
    meta: "4 min read",
    tag: "Workflow",
    image: "/images/blogs/search-podcast-back-catalogue.png",
    publishedAt: "2026-09-18",
    updatedAt: "2026-09-18",
    content: (
      <>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          A{" "}
          <Link
            href="/use-cases/podcasts"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            podcast archive
          </Link>{" "}
          gets more valuable every time you publish.
        </p>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          It also gets harder to remember.
        </p>
        <p>
          After a few years, you may have hundreds of hours of conversations
          containing opinions, predictions, stories and soundbites that could be
          useful again.
        </p>
        <p>The problem is retrieval.</p>

        <h2>Show notes are not the archive</h2>
        <p>Episode titles and show notes describe what an episode was about.</p>
        <p>They do not necessarily capture everything that was said.</p>
        <p>
          A guest may spend two minutes discussing an idea that never appears in
          the episode description.
        </p>
        <p>Six months later, that may be exactly the passage you need.</p>
        <p>
          <Link
            href="/how-it-works"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            Searching the spoken content
          </Link>{" "}
          gives you another way into the catalogue.
        </p>

        <h2>Search by what the guest discussed</h2>
        <p>Suppose you are producing an episode about remote work.</p>
        <p>
          You remember several previous guests discussing hiring people outside
          major cities, but you cannot remember which episodes.
        </p>
        <p>You could search the archive for:</p>

        <div className="my-6 p-5 rounded-xl bg-[#F0F4EE] border border-[#75C043]/30 not-prose">
          <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-[#5DA233] block mb-1">
            Search Query
          </span>
          <p className="text-[18px] font-bold text-ugle-slate m-0">
            &ldquo;hiring people outside expensive cities&rdquo;
          </p>
        </div>

        <p>
          Relevant passages can surface even when every guest used different
          wording.
        </p>
        <p>
          From there, review the timestamped Moments and play the original
          audio.
        </p>

        <h2>Use the archive before the next interview</h2>
        <p>Archive search is not only useful for repurposing.</p>
        <p>A returning guest may have appeared eighteen months earlier.</p>
        <p>
          Before the new recording, search their previous conversation for
          topics such as:
        </p>

        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
          <div className="p-5 rounded-xl bg-[#F7F7F5] border border-ugle-light/60">
            <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-ugle-gray block mb-2">
              Topic Query 1
            </span>
            <p className="text-[16px] font-bold text-ugle-slate m-0">
              &ldquo;what she predicted about interest rates&rdquo;
            </p>
          </div>
          <div className="p-5 rounded-xl bg-[#F7F7F5] border border-ugle-light/60">
            <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-ugle-gray block mb-2">
              Topic Query 2
            </span>
            <p className="text-[16px] font-bold text-ugle-slate m-0">
              &ldquo;the part where he discussed expanding
              internationally&rdquo;
            </p>
          </div>
        </div>

        <p>That gives the producer specific threads to revisit.</p>
        <p>
          The archive becomes research material rather than a folder of finished
          episodes.
        </p>

        <h2>Reuse still requires editorial judgment</h2>
        <p>Finding an old passage is only the first step.</p>
        <p>Listen to the original context.</p>
        <p>Check whether the statement still makes sense today.</p>
        <p>
          Confirm that the excerpt represents what the guest actually intended.
        </p>
        <p>Then decide whether it belongs in the new piece.</p>
        <p>Search accelerates retrieval.</p>
        <p>It should not remove editorial judgment.</p>

        <div className="not-prose mt-14 p-10 bg-[#3A3A3A] text-white rounded-2xl text-center shadow-lg">
          <h3 className="text-[22px] font-bold mb-2 text-white mt-0 border-0">
            Your back catalogue already contains your next useful clip.
          </h3>
          <p className="text-[#c3c5cd] text-[17px] mb-8 max-w-md mx-auto">
            Make the spoken content searchable.
          </p>
          <div className="flex justify-center">
            <Link
              href="/download"
              className="bg-ugle-green hover:bg-[#86d950] transition-colors text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl text-base text-center inline-flex items-center justify-center gap-2"
            >
              Get Ugle for Podcasts
            </Link>
          </div>
        </div>
      </>
    ),
  },
  "search-journalist-interview-recordings-locally": {
    title: "How Journalists Can Search Interview Recordings Locally",
    description:
      "Learn how journalists can create a searchable local archive of interview recordings while keeping media, transcripts and search activity on their own machine.",
    meta: "5 min read",
    tag: "Journalism",
    image: "/images/blogs/search-journalist-interview-recordings-locally.png",
    publishedAt: "2026-09-13",
    updatedAt: "2026-09-13",
    content: (
      <>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          Interview recordings accumulate quickly.
        </p>
        <p className="text-[20px] text-ugle-slate font-bold leading-[1.55] mb-6">
          The reporting question six months later is often simple:
        </p>
        <blockquote className="font-bold text-ugle-slate my-6">
          &ldquo;Where did that source say that?&rdquo;
        </blockquote>
        <p>The answer may be somewhere across dozens of recordings.</p>
        <p>
          Finding it manually means reconstructing the interview from filenames,
          dates, notes and memory.
        </p>
        <p>
          There is another approach: make the recordings searchable on the
          machine where you keep them.
        </p>

        <h2>What local media search means</h2>
        <p>
          In a local-first workflow, the core processing happens on your device.
        </p>
        <p>
          For Ugle, the media is transcribed and indexed locally. Search queries
          run against that local index.
        </p>
        <p>
          That means the reporting workflow does not require uploading source
          recordings and transcripts to a remote processing service during
          normal operation.
        </p>
        <p>
          Operational functions such as software licensing and updates are
          separate from the media-search workflow. Current details should always
          be checked on Ugle&apos;s{" "}
          <Link
            href="/security"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            Security
          </Link>{" "}
          and licence pages.
        </p>

        <h2>Search what you remember</h2>
        <p>
          <Link
            href="/use-cases/journalists"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            Journalists
          </Link>{" "}
          often remember meaning better than filenames.
        </p>
        <p>You may remember:</p>

        <div className="my-6 p-5 rounded-xl bg-[#F0F4EE] border border-[#75C043]/30 not-prose">
          <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-[#5DA233] block mb-1">
            Remembered Concept
          </span>
          <p className="text-[17px] font-bold text-ugle-slate m-0">
            &ldquo;the source explained why the contract was changed after the
            first bid&rdquo;
          </p>
        </div>

        <p>but not which interview contained it.</p>
        <p>
          Semantic retrieval lets you search for the remembered idea rather than
          depend entirely on exact words.
        </p>
        <p>
          Matching Moments can then lead back to their original recordings and
          timestamps.
        </p>

        <h2>Source protection does not end with software architecture</h2>
        <p>Local processing reduces one type of exposure.</p>
        <p>It does not automatically make a reporting workflow secure.</p>
        <p>
          Device encryption, access control, backups, source-handling procedures
          and organisational security policies still matter.
        </p>
        <p>
          A sensitive recording stored carelessly on a laptop remains sensitive
          regardless of which search application indexes it.
        </p>
        <p>
          Local-first software should therefore be treated as one component of a
          wider source-protection workflow.
        </p>

        <h2>Retrieval should end at the source</h2>
        <p>A transcript is useful for finding a passage.</p>
        <p>It should not automatically be treated as a verbatim record.</p>
        <p>
          Names, accents, overlapping speakers and poor recording conditions can
          all affect transcription.
        </p>
        <p>For anything important, play the original recording.</p>
        <p>The shortest trustworthy workflow is:</p>

        <div className="my-8 p-6 bg-[#F7F7F5] rounded-xl border border-ugle-light/60 not-prose text-center">
          <p className="text-[18px] md:text-[20px] font-bold text-ugle-slate m-0">
            Remember <span className="text-[#75C043]">&rarr;</span> search{" "}
            <span className="text-[#75C043]">&rarr;</span> retrieve{" "}
            <span className="text-[#75C043]">&rarr;</span> listen{" "}
            <span className="text-[#75C043]">&rarr;</span> verify.
          </p>
        </div>

        <p>That is the workflow Ugle is designed around.</p>

        <div className="not-prose mt-14 p-10 bg-[#3A3A3A] text-white rounded-2xl text-center shadow-lg">
          <h3 className="text-[22px] font-bold mb-2 text-white mt-0 border-0">
            Search your reporting archive without turning it into someone
            else&apos;s archive.
          </h3>
          <p className="text-[#c3c5cd] text-[17px] mb-8 max-w-md mx-auto">
            Find the conversation. Open the Moment. Verify the source.
          </p>
          <div className="flex justify-center">
            <Link
              href="/download"
              className="bg-ugle-green hover:bg-[#86d950] transition-colors text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl text-base text-center inline-flex items-center justify-center gap-2"
            >
              Request Trial
            </Link>
          </div>
        </div>
      </>
    ),
  },
  "keyword-search-vs-semantic-search-recorded-interviews": {
    title: "Keyword Search vs Semantic Search for Recorded Interviews",
    description:
      "Understand the difference between keyword and semantic search when looking for quotes, topics and Moments inside recorded interviews.",
    meta: "4 min read",
    tag: "Product",
    image: "/images/blogs/keyword-search-vs-semantic-search.png",
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    content: (
      <>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-4">
          Keyword search asks:
        </p>
        <blockquote className="font-bold text-ugle-slate my-4">
          &ldquo;Where were these words used?&rdquo;
        </blockquote>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-4">
          Semantic search asks:
        </p>
        <blockquote className="font-bold text-ugle-slate my-4">
          &ldquo;Where was this idea discussed?&rdquo;
        </blockquote>
        <p>For recorded interviews, both are useful.</p>
        <p>They solve different retrieval problems.</p>

        <h2>When keyword search works best</h2>
        <p>Use keyword search when you know the language you expect to find.</p>
        <p>Examples:</p>
        <ul>
          <li>a person&apos;s surname</li>
          <li>a product name</li>
          <li>&ldquo;interest rates&rdquo;</li>
          <li>&ldquo;planning permission&rdquo;</li>
          <li>a distinctive phrase you remember clearly</li>
        </ul>
        <p>Exact terms can narrow the archive quickly.</p>
        <p>The weakness appears when the speaker used different wording.</p>
        <p>
          Search for <em>job losses</em> and you may miss a passage about{" "}
          <em>reducing headcount</em>.
        </p>

        <h2>When semantic search works better</h2>
        <p>
          Semantic search compares meaning rather than relying only on exact
          term overlap.
        </p>
        <p>
          That makes it useful when you remember the substance of a conversation
          but not the sentence itself.
        </p>

        <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
          <div className="p-5 rounded-xl bg-[#F7F7F5] border border-ugle-light/60">
            <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-ugle-gray block mb-2">
              You might search
            </span>
            <p className="text-[17px] font-bold text-ugle-slate m-0">
              &ldquo;the point where she was worried customers would reject the
              higher price&rdquo;
            </p>
          </div>
          <div className="p-5 rounded-xl bg-[#F0F4EE] border border-[#75C043]/30">
            <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-[#5DA233] block mb-2">
              The interview might contain
            </span>
            <p className="text-[17px] font-bold text-ugle-slate m-0">
              &ldquo;I wasn&apos;t sure people would accept what we needed to
              charge.&rdquo;
            </p>
          </div>
        </div>

        <p>The wording differs.</p>
        <p>The idea is similar.</p>

        <h2>Why recorded media needs both</h2>
        <p>Human memory is inconsistent.</p>
        <p>Sometimes we remember a precise term.</p>
        <p>Sometimes we remember a theme.</p>
        <p>Sometimes we remember only the emotional or editorial point.</p>
        <p>
          Restricting a media archive to exact keywords means asking your memory
          to behave like a transcript.
        </p>
        <p>It does not.</p>
        <p>
          <Link
            href="/how-it-works"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            Ugle
          </Link>{" "}
          combines keyword and semantic retrieval so you can approach the
          archive from either direction.
        </p>

        <h2>Search is still retrieval</h2>
        <p>
          Semantic search does not mean asking a model to invent an answer about
          your recordings.
        </p>
        <p>For editorial work, the valuable result is the original passage.</p>
        <p>
          Search should point you toward the source, show you where it occurred,
          and let you check it yourself.
        </p>

        <div className="not-prose mt-14 p-10 bg-[#3A3A3A] text-white rounded-2xl text-center shadow-lg">
          <h3 className="text-[22px] font-bold mb-2 text-white mt-0 border-0">
            Keywords find words. Semantic search finds related meaning.
          </h3>
          <p className="text-[#c3c5cd] text-[17px] mb-8 max-w-md mx-auto">
            Use both to find the Moment you remember.
          </p>
          <div className="flex justify-center">
            <Link
              href="/download"
              className="bg-ugle-green hover:bg-[#86d950] transition-colors text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl text-base text-center inline-flex items-center justify-center gap-2"
            >
              Request Trial
            </Link>
          </div>
        </div>
      </>
    ),
  },
  "find-archive-soundbite-news-segment": {
    title: "How to Find an Archive Soundbite for a News Segment",
    description:
      "Need an old interview clip before deadline? Learn a faster workflow for searching newsroom recordings by topic and returning to the exact source moment.",
    meta: "4 min read",
    tag: "Newsrooms",
    image: "/images/blogs/find-archive-soundbite-news-segment.jpg",
    publishedAt: "2026-09-03",
    updatedAt: "2026-09-03",
    content: (
      <>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          The segment closes soon.
        </p>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          The producer remembers the interview.
        </p>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          Everyone remembers the quote.
        </p>
        <p className="text-[20px] text-ugle-slate font-bold leading-[1.55] mb-6">
          Nobody remembers the timestamp.
        </p>
        <p>That is a retrieval problem.</p>

        <h2>The normal archive workflow is backwards</h2>
        <p>
          <Link
            href="/use-cases/newsrooms"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            Editorial teams
          </Link>{" "}
          often start with the file.
        </p>
        <ul className="space-y-1">
          <li>Which interview was it?</li>
          <li>Which day?</li>
          <li>Which camera card?</li>
          <li>Which folder?</li>
        </ul>
        <p>
          Then they open a likely recording and scrub until they recognise the
          moment.
        </p>
        <p>But the editor usually remembers the content before the file.</p>
        <p>The search workflow should start there.</p>

        <h2>Describe the soundbite you need</h2>
        <p>Imagine you are covering a new planning dispute.</p>
        <p>
          You remember interviewing a resident months earlier who explained why
          the previous proposal failed.
        </p>
        <p>Search:</p>

        <div className="my-6 p-5 rounded-xl bg-[#F0F4EE] border border-[#75C043]/30 not-prose">
          <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-[#5DA233] block mb-1">
            Search Query
          </span>
          <p className="text-[18px] font-bold text-ugle-slate m-0">
            &ldquo;resident explaining why the earlier planning proposal was
            rejected&rdquo;
          </p>
        </div>

        <p>
          Relevant passages from the indexed archive can surface as candidate
          Moments.
        </p>
        <p>Preview the source.</p>
        <p>Check the surrounding conversation.</p>
        <p>Choose the passage that works editorially.</p>

        <h2>Archive retrieval is different from generation</h2>
        <p>A generated summary can tell you what a recording might contain.</p>
        <p>That is not the same as locating the soundbite.</p>
        <p>News production needs the source media.</p>
        <p>
          A useful retrieval system should tell you which recording contains the
          passage and where it occurs.
        </p>
        <p>The archive remains the evidence.</p>
        <p>Search becomes the route into it.</p>

        <h2>Build retrieval before deadline day</h2>
        <p>
          The best time to{" "}
          <Link
            href="/how-it-works"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            make footage searchable
          </Link>{" "}
          is not fifteen minutes before transmission.
        </p>
        <p>
          Indexing the archive as material arrives means future searches can
          operate across footage that has already been prepared.
        </p>
        <p>The benefit compounds.</p>
        <p>
          Every indexed interview becomes part of a reusable editorial memory.
        </p>

        <div className="not-prose mt-14 p-10 bg-[#3A3A3A] text-white rounded-2xl text-center shadow-lg">
          <h3 className="text-[22px] font-bold mb-2 text-white mt-0 border-0">
            The soundbite already exists.
          </h3>
          <p className="text-[#c3c5cd] text-[17px] mb-4 max-w-md mx-auto">
            The problem is finding it before the segment closes.
          </p>
          <p className="text-white font-medium text-[16px] mb-8">
            Search your newsroom archive with Ugle.
          </p>
          <div className="flex justify-center">
            <Link
              href="/download"
              className="bg-ugle-green hover:bg-[#86d950] transition-colors text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl text-base text-center inline-flex items-center justify-center gap-2"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </>
    ),
  },
  "local-vs-cloud-media-search": {
    title: "Local vs Cloud Media Search: What to Compare",
    description:
      "Compare local and cloud media search across privacy, hardware, access, collaboration, indexing and ongoing connectivity before choosing a workflow.",
    meta: "5 min read",
    tag: "Product philosophy",
    image: "/images/blogs/local-vs-cloud-media-search.png",
    publishedAt: "2026-08-29",
    updatedAt: "2026-08-29",
    content: (
      <>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          The question is not whether local software is always better than cloud
          software.
        </p>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          It is not.
        </p>
        <p className="text-[20px] text-ugle-slate font-bold leading-[1.55] mb-8">
          The useful question is: Which architecture fits the media you work
          with and the way your team works?
        </p>

        <h2>Where does the media get processed?</h2>
        <p>
          A cloud-first tool usually sends content to remote infrastructure for
          processing.
        </p>
        <p>
          A{" "}
          <Link
            href="/how-it-works"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            local-first tool
          </Link>{" "}
          performs the core media processing on your machine.
        </p>
        <p>
          That distinction matters when recordings are sensitive, large or
          controlled by internal data-handling policies.
        </p>
        <p>
          With Ugle, media transcription, indexing and search{" "}
          <Link
            href="/security"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            happen locally
          </Link>{" "}
          during normal operation.
        </p>
        <p>
          That does not mean the application never communicates with a network.
          Licensing, validation and software updates are separate operational
          functions.
        </p>
        <p>The important question is what happens to the content itself.</p>

        <h2>What happens when the connection disappears?</h2>
        <p>Cloud workflows depend on remote infrastructure.</p>
        <p>
          That can be an advantage when teams need browser access or central
          collaboration.
        </p>
        <p>
          Local workflows place more responsibility on the computer running the
          application, but the core search workload does not need to travel to a
          remote service.
        </p>
        <p>Think about where you work.</p>
        <p>
          A newsroom with controlled workstations may have different
          requirements from a distributed production company.
        </p>

        <h2>Who provides the computing power?</h2>
        <p>Cloud processing uses someone else&apos;s infrastructure.</p>
        <p>Local processing uses yours.</p>
        <p>That affects speed, hardware requirements and economics.</p>
        <p>A powerful workstation may make local processing attractive.</p>
        <p>Older hardware may process large archives more slowly.</p>
        <p>
          There is no meaningful performance claim without specifying the
          machine, media and workload being tested.
        </p>

        <h2>What happens to your archive over time?</h2>
        <p>Ask practical questions:</p>
        <ul className="space-y-1">
          <li>Where is the transcript stored?</li>
          <li>Where is the index stored?</li>
          <li>Can the archive be moved?</li>
          <li>What happens when a subscription or licence ends?</li>
          <li>Can you still access the original files?</li>
          <li>What operational network connections are required?</li>
        </ul>
        <p>Architecture becomes meaningful when it changes those answers.</p>

        <h2>Choose based on workflow, not ideology</h2>
        <p>Cloud tools can be excellent for collaboration and remote access.</p>
        <p>
          Local tools can be excellent when content control, predictable local
          retrieval and workstation-based workflows matter.
        </p>
        <p>The right choice depends on the job.</p>
        <p>
          Ugle was built for media professionals who want searchable recorded
          archives while keeping the core content workflow on their own
          machines.
        </p>

        <div className="not-prose mt-14 p-10 bg-[#3A3A3A] text-white rounded-2xl text-center shadow-lg">
          <h3 className="text-[22px] font-bold mb-2 text-white mt-0 border-0">
            Know where your media goes.
          </h3>
          <p className="text-[#c3c5cd] text-[17px] mb-8 max-w-md mx-auto">
            Then choose the workflow that fits your archive.
          </p>
          <div className="flex justify-center">
            <Link
              href="/download"
              className="bg-ugle-green hover:bg-[#86d950] transition-colors text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl text-base text-center inline-flex items-center justify-center gap-2"
            >
              Request Trial
            </Link>
          </div>
        </div>
      </>
    ),
  },
  "build-searchable-interview-archive": {
    title: "How to Build a Searchable Interview Archive",
    description:
      "Turn a growing folder of interview recordings into a searchable archive that lets you retrieve topics, quotes and source Moments later.",
    meta: "5 min read",
    tag: "Workflow",
    image: "/images/blogs/build-searchable-interview-archive.jpg",
    publishedAt: "2026-08-24",
    updatedAt: "2026-08-24",
    content: (
      <>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          A folder of recordings is storage.
        </p>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          A searchable archive is something you can retrieve knowledge from.
        </p>
        <p className="text-[20px] text-ugle-slate font-bold leading-[1.55] mb-8">
          The difference matters once you stop remembering every{" "}
          <Link
            href="/use-cases/journalists"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            interview
          </Link>{" "}
          you have recorded.
        </p>

        <h2>Keep the source files organised</h2>
        <p>Search does not replace basic file management.</p>
        <p>Use stable folders and sensible filenames.</p>
        <p>Preserve original recordings.</p>
        <p>Keep project information where your team can understand it later.</p>
        <p>
          A search index should sit on top of a well-managed archive rather than
          become the only way to understand it.
        </p>

        <h2>Index the spoken content</h2>
        <p>The next layer is the material inside the files.</p>
        <p>
          <Link
            href="/how-it-works"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            Transcription
          </Link>{" "}
          turns speech into searchable text.
        </p>
        <p>
          Semantic indexing adds another capability: retrieving passages based
          on meaning as well as exact wording.
        </p>
        <p>That means you can search:</p>

        <div className="my-6 p-5 rounded-xl bg-[#F0F4EE] border border-[#75C043]/30 not-prose">
          <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-[#5DA233] block mb-1">
            Search Query
          </span>
          <p className="text-[18px] font-bold text-ugle-slate m-0">
            &ldquo;concerns about the acquisition falling through&rdquo;
          </p>
        </div>

        <p>
          without needing to remember the precise phrase the interviewee used.
        </p>

        <h2>Search across the archive</h2>
        <p>
          The important shift happens when retrieval stops being file-by-file.
        </p>
        <p>You are no longer asking:</p>
        <blockquote className="my-4 font-semibold text-ugle-slate">
          &ldquo;Which interview should I open?&rdquo;
        </blockquote>
        <p>You are asking:</p>
        <blockquote className="my-4 font-semibold text-ugle-slate">
          &ldquo;Where in my archive was this discussed?&rdquo;
        </blockquote>
        <p>
          The result should identify relevant source recordings and the
          timestamps where those passages occur.
        </p>

        <h2>Keep verification connected to retrieval</h2>
        <p>A transcript is an index into the recording.</p>
        <p>It is not automatically the final evidence.</p>
        <p>
          When you find a quotation, claim or important passage, return to the
          source recording.
        </p>
        <p>Listen before publishing.</p>
        <p>Check the words around it.</p>
        <p>Confirm the speaker.</p>
        <p>This keeps search fast without weakening editorial standards.</p>

        <h2>Treat the archive as reusable research</h2>
        <p>
          A good interview has value beyond the story for which it was recorded.
        </p>
        <p>
          Months later, it may contain background, historical context, a
          prediction or a quote that becomes relevant again.
        </p>
        <p>Searchability changes the lifespan of recorded material.</p>
        <p>
          The archive becomes something you can ask questions of without giving
          up the original source.
        </p>

        <div className="not-prose mt-14 p-10 bg-[#3A3A3A] text-white rounded-2xl text-center shadow-lg">
          <h3 className="text-[22px] font-bold mb-2 text-white mt-0 border-0">
            Store the recording once. Find the Moment again.
          </h3>
          <p className="text-[#c3c5cd] text-[17px] mb-8 max-w-md mx-auto">
            Build a searchable local media archive with Ugle.
          </p>
          <div className="flex justify-center">
            <Link
              href="/download"
              className="bg-ugle-green hover:bg-[#86d950] transition-colors text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl text-base text-center inline-flex items-center justify-center gap-2"
            >
              Request Trial
            </Link>
          </div>
        </div>
      </>
    ),
  },
  "verify-quote-against-original-recording": {
    title: "How to Verify a Quote Against the Original Recording",
    description:
      "Found a quote in a transcript or media search result? Learn why source playback, timestamp verification and context checks still matter.",
    meta: "4 min read",
    tag: "Workflow",
    image: "/images/blogs/verify-quote-against-original-recording.png",
    publishedAt: "2026-08-19",
    updatedAt: "2026-08-19",
    content: (
      <>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          Finding a sentence in a transcript is not the end of a reporting
          workflow.
        </p>
        <p className="text-[20px] text-ugle-slate font-bold leading-[1.55] mb-6">
          It is the start of verification.
        </p>
        <p>
          Automatic transcription is useful because it makes spoken material
          searchable.
        </p>
        <p>The original recording remains the source.</p>

        <h2>Why transcripts need verification</h2>
        <p>Speech recognition can mishear:</p>
        <ul>
          <li>names</li>
          <li>technical terms</li>
          <li>accented speech</li>
          <li>overlapping speakers</li>
          <li>quiet passages</li>
          <li>speech with background noise</li>
        </ul>
        <p>
          A transcript can look convincing while still containing an important
          error.
        </p>
        <p>For direct quotation, that matters.</p>

        <h2>Open the exact Moment</h2>
        <p>
          The safest retrieval workflow connects every search result back to its
          source.
        </p>
        <p>Find the relevant passage.</p>
        <p>Open the recording at the timestamp.</p>
        <p>Listen to the sentence.</p>
        <p>Then listen a little before and after it.</p>
        <p>This lets you confirm both the wording and the context.</p>

        <h2>Check more than the words</h2>
        <p>
          A technically accurate sentence can still be misleading if removed
          from its surrounding conversation.
        </p>
        <p>Ask:</p>
        <ul className="space-y-1">
          <li>Was the speaker answering the question you think they were?</li>
          <li>Were they quoting someone else?</li>
          <li>Was the statement conditional?</li>
          <li>Did the next sentence change the meaning?</li>
          <li>Was the tone sarcastic or uncertain?</li>
        </ul>
        <p>Search helps you reach the material.</p>
        <p>Editorial judgment determines how it should be used.</p>

        <h2>Retrieval is stronger when it is auditable</h2>
        <p>
          This is one reason Ugle is designed around{" "}
          <Link
            href="/how-it-works"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            timestamped Moments and source playback
          </Link>{" "}
          rather than generated answers.
        </p>
        <p>A result should be inspectable.</p>
        <p>
          You should be able to ask, &ldquo;Where did this come from?&rdquo; and
          immediately return to the recording.
        </p>
        <p>
          That matters for{" "}
          <Link
            href="/use-cases/journalists"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            journalism
          </Link>
          .
        </p>
        <p>
          It also matters for documentary work, research, podcast production and
          any workflow where the source itself matters.
        </p>

        <div className="not-prose mt-14 p-10 bg-[#3A3A3A] text-white rounded-2xl text-center shadow-lg">
          <h3 className="text-[22px] font-bold mb-2 text-white mt-0 border-0">
            Find fast. Verify at the source.
          </h3>
          <p className="text-[#c3c5cd] text-[17px] mb-8 max-w-md mx-auto">
            Search is useful because it shortens the path back to the evidence.
          </p>
          <div className="flex justify-center">
            <Link
              href="/download"
              className="bg-ugle-green hover:bg-[#86d950] transition-colors text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl text-base text-center inline-flex items-center justify-center gap-2"
            >
              Request Trial
            </Link>
          </div>
        </div>
      </>
    ),
  },
  "transcription-search-quality-recorded-media": {
    title: "What Affects Transcription and Search Quality in Recorded Media?",
    description:
      "Audio quality, accents, languages, overlapping speakers and terminology can all affect transcription and media search. Here is what to understand before relying on results.",
    meta: "5 min read",
    tag: "Product",
    image: "/images/blogs/transcription-search-quality-recorded-media.jpg",
    publishedAt: "2026-08-14",
    updatedAt: "2026-08-14",
    content: (
      <>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          There is no single transcription accuracy number that describes every
          recording.
        </p>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          A clean studio interview and a noisy street recording are different
          recognition problems.
        </p>
        <p className="text-[20px] text-ugle-slate font-bold leading-[1.55] mb-6">
          The same is true for search.
        </p>
        <p>
          Understanding those differences is more useful than chasing a{" "}
          <Link
            href="/blog/what-transcription-accuracy-means"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            universal percentage
          </Link>
          .
        </p>

        <h2>Recording quality matters</h2>
        <p>
          Clear speech gives a{" "}
          <Link
            href="/how-it-works"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            transcription system
          </Link>{" "}
          more information to work with.
        </p>
        <p>
          Noise, clipping, distance from the microphone and low recording levels
          can make words harder to distinguish.
        </p>
        <p>
          A recording can still be searchable, but difficult audio increases
          uncertainty.
        </p>

        <h2>Speaker overlap matters</h2>
        <p>
          Two people speaking simultaneously is harder to process than one
          speaker at a time.
        </p>
        <p>It can affect both the transcript and speaker attribution.</p>
        <p>
          If a retrieved passage matters, playback is the safest way to confirm
          who said what.
        </p>

        <h2>Language and accent matter</h2>
        <p>
          Multilingual speech recognition models can cover many languages, but
          model support does not mean identical quality across all languages,
          accents and dialects.
        </p>
        <p>Code-switching can introduce another layer of difficulty.</p>
        <p>
          Language coverage and measured quality should therefore be treated as
          separate claims.
        </p>

        <h2>Names and specialist vocabulary matter</h2>
        <p>
          Proper nouns are difficult because the model may not have enough
          contextual information to identify the spelling.
        </p>
        <p>
          The same applies to unusual company names, scientific terminology,
          places and internal jargon.
        </p>
        <p>
          For retrieval, however, the most important question is not always
          whether every word is perfect.
        </p>
        <p>
          A useful search system needs enough of the passage to be represented
          correctly for the right Moment to surface.
        </p>

        <h2>
          Search quality and transcript quality are related, but not identical
        </h2>
        <p>
          A transcript can contain mistakes while the surrounding passage still
          carries enough meaning for semantic retrieval.
        </p>
        <p>
          The opposite can also happen. A clean transcript does not guarantee
          that every broad semantic query will rank the passage where you
          expect.
        </p>
        <p>
          That is why search results should be treated as candidates to inspect
          rather than unquestionable answers.
        </p>

        <div className="not-prose mt-14 p-10 bg-[#3A3A3A] text-white rounded-2xl text-center shadow-lg">
          <h3 className="text-[22px] font-bold mb-2 text-white mt-0 border-0">
            Search gets you to the Moment. The recording confirms it.
          </h3>
          <p className="text-[#c3c5cd] text-[17px] mb-8 max-w-md mx-auto">
            Use Ugle to retrieve the source, then verify anything important
            directly against the media.
          </p>
          <div className="flex justify-center">
            <Link
              href="/download"
              className="bg-ugle-green hover:bg-[#86d950] transition-colors text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl text-base text-center inline-flex items-center justify-center gap-2"
            >
              Request Trial
            </Link>
          </div>
        </div>
      </>
    ),
  },
  "evaluate-media-search-software": {
    title: "How to Evaluate Media Search Software With Your Own Recordings",
    description:
      "A practical test for comparing media search tools using real interviews, difficult queries, source verification, privacy and archive workflows.",
    meta: "6 min read",
    tag: "Comparison",
    image: "/images/blogs/evaluate-media-search-software.jpg",
    publishedAt: "2026-08-09",
    updatedAt: "2026-08-09",
    content: (
      <>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          The best{" "}
          <Link
            href="/how-it-works"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            media-search benchmark
          </Link>{" "}
          is not a polished vendor demo.
        </p>
        <p className="text-[20px] text-ugle-slate font-bold leading-[1.55] mb-6">
          It is your archive.
        </p>
        <p>
          Before choosing a search tool, test it with recordings that represent
          the work you actually do.
        </p>

        <h2>Start with recordings you know well</h2>
        <p>Choose several files where you already know what was discussed.</p>
        <p>Include a mix of:</p>
        <ul>
          <li>clean interviews</li>
          <li>ordinary production audio</li>
          <li>multiple speakers</li>
          <li>a longer recording</li>
          <li>a difficult recording</li>
        </ul>
        <p>
          The goal is not to find the easiest possible example. It is to see how
          the product behaves on your material.
        </p>

        <h2>Test exact retrieval</h2>
        <p>Search for a phrase you know appears in the recording.</p>
        <ul className="space-y-1">
          <li>Can the system find it?</li>
          <li>Does the result point to the right source?</li>
          <li>Can you reach the correct timestamp quickly?</li>
        </ul>
        <p>This tests basic lexical retrieval.</p>

        <h2>Test remembered meaning</h2>
        <p>Now stop using the actual words. Search for the idea instead.</p>

        <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
          <div className="p-5 rounded-xl bg-[#F7F7F5] border border-ugle-light/60">
            <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-ugle-gray block mb-2">
              If the speaker said
            </span>
            <p className="text-[17px] font-bold text-ugle-slate m-0">
              &ldquo;customers were not willing to pay what we originally
              expected&rdquo;
            </p>
          </div>
          <div className="p-5 rounded-xl bg-[#F0F4EE] border border-[#75C043]/30">
            <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-[#5DA233] block mb-2">
              Try searching
            </span>
            <p className="text-[17px] font-bold text-ugle-slate m-0">
              &ldquo;the part where pricing was becoming a problem&rdquo;
            </p>
          </div>
        </div>

        <p>
          This is the more realistic test for semantic search. It reflects how
          people often remember recordings.
        </p>

        <h2>Test source verification</h2>
        <p>
          A result without a route back to the source is much less useful for
          professional media work.
        </p>
        <p>
          Check whether you can: open the recording, play the relevant passage,
          see the timestamp, inspect surrounding context, and confirm the source
          file.
        </p>
        <p>Retrieval should remain auditable.</p>

        <h2>Test the architecture</h2>
        <p>Ask where processing occurs.</p>
        <p>
          Ask where{" "}
          <Link
            href="/security"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            transcripts are stored
          </Link>
          .
        </p>
        <p>Ask where indexes live.</p>
        <p>Ask what network communication occurs.</p>
        <p>
          Ask what happens to data after the{" "}
          <Link
            href="/pricing"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            licence ends
          </Link>
          .
        </p>
        <p>
          Do not settle for a one-word answer such as &ldquo;private.&rdquo;
        </p>
        <p>Understand the mechanism.</p>

        <h2>Test the workflow, not only the model</h2>
        <p>
          A technically impressive model can still sit inside a frustrating
          product.
        </p>
        <p>Measure how many steps it takes to move from:</p>
        <div className="my-6 p-6 bg-[#F7F7F5] rounded-xl border border-ugle-light/60 not-prose text-center">
          <p className="text-[17px] md:text-[19px] font-bold text-ugle-slate m-0">
            I remember something <span className="text-[#75C043]">&rarr;</span>{" "}
            Here is the exact source Moment.
          </p>
        </div>
        <p>That is the job.</p>

        <div className="not-prose mt-14 p-10 bg-[#3A3A3A] text-white rounded-2xl text-center shadow-lg">
          <h3 className="text-[22px] font-bold mb-2 text-white mt-0 border-0">
            Use your own archive as the benchmark.
          </h3>
          <p className="text-[#c3c5cd] text-[17px] mb-8 max-w-md mx-auto">
            Request a Ugle trial and test it with the recordings you actually
            work with.
          </p>
          <div className="flex justify-center">
            <Link
              href="/download"
              className="bg-ugle-green hover:bg-[#86d950] transition-colors text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl text-base text-center inline-flex items-center justify-center gap-2"
            >
              Request Trial
            </Link>
          </div>
        </div>
      </>
    ),
  },
  "retrieved-interview-passage-to-clip": {
    title: "How to Turn a Retrieved Interview Passage Into a Reusable Clip",
    description:
      "Find an interview passage, verify it in context, define the useful section and move it into your editing workflow as a reusable clip.",
    meta: "4 min read",
    tag: "Workflow",
    image: "/images/blogs/retrieved-interview-passage-to-clip.jpg",
    publishedAt: "2026-08-04",
    updatedAt: "2026-08-04",
    content: (
      <>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          The difficult part of repurposing an old interview is often not
          editing.
        </p>
        <p className="text-[20px] text-ugle-gray leading-[1.55] mb-6">
          It is finding the passage again.
        </p>
        <p>
          You remember the guest made a strong point. You do not remember when.
        </p>

        <h2>Start with the editorial idea</h2>
        <p>Search for what you want the clip to communicate.</p>
        <p>For example:</p>

        <div className="my-6 p-5 rounded-xl bg-[#F0F4EE] border border-[#75C043]/30 not-prose">
          <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-[#5DA233] block mb-1">
            Search Query
          </span>
          <p className="text-[18px] font-bold text-ugle-slate m-0">
            &ldquo;the guest explaining why the company nearly ran out of
            money&rdquo;
          </p>
        </div>

        <p>The exact wording in the interview may be different.</p>
        <p>
          Semantic retrieval helps surface candidate Moments based on the
          meaning of the passage.
        </p>

        <h2>Listen before you cut</h2>
        <p>Open the original recording at the matching timestamp.</p>
        <p>Listen to the full thought.</p>
        <p>Then listen before and after it.</p>
        <p>The most searchable sentence is not always the best edit.</p>
        <p>
          A good clip may need the setup immediately before the quote or the
          explanation immediately after it.
        </p>

        <h2>Define the usable Moment</h2>
        <p>
          Once you know the section you want, choose a clean start and end
          point.
        </p>
        <p>
          Remove unnecessary lead-in while preserving enough context for the
          clip to make sense on its own.
        </p>
        <p>
          The current Ugle workflow supports previewing retrieved media and{" "}
          <Link
            href="/how-it-works"
            className="text-[#5DA233] font-semibold hover:underline"
          >
            working with selected passages as clips
          </Link>{" "}
          for downstream use.
        </p>
        <p>The editor still makes the editorial decision.</p>
        <p>Ugle shortens the search.</p>

        <h2>Keep the source connected</h2>
        <p>
          When repurposing old material, retain the relationship between the
          excerpt and the original interview.
        </p>
        <p>
          That makes it easier to re-check wording, date, speaker and context
          later.
        </p>
        <p>
          Search should make an archive easier to reuse without separating clips
          from their provenance.
        </p>

        <div className="not-prose mt-14 p-10 bg-[#3A3A3A] text-white rounded-2xl text-center shadow-lg">
          <h3 className="text-[22px] font-bold mb-2 text-white mt-0 border-0">
            Find it. Verify it. Reuse it.
          </h3>
          <p className="text-[#c3c5cd] text-[17px] mb-8 max-w-md mx-auto">
            Your archive already contains material worth using again. Ugle helps
            you get back to the right Moment.
          </p>
          <div className="flex justify-center">
            <Link
              href="/download"
              className="bg-ugle-green hover:bg-[#86d950] transition-colors text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl text-base text-center inline-flex items-center justify-center gap-2"
            >
              Request Trial
            </Link>
          </div>
        </div>
      </>
    ),
  },
};

export function generateStaticParams() {
  return Object.keys(BLOG_POST_DATA).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blogPost = BLOG_POST_DATA[slug];

  if (!blogPost) {
    return {
      title: "Article Not Found",
      description: "The requested blog article could not be found.",
      robots: { index: false, follow: false },
    };
  }

  return pageMetadata({
    title: blogPost.title,
    description: blogPost.description,
    path: `/blog/${slug}`,
    ogType: "article",
    socialImage: {
      url: blogPost.image,
      alt: blogPost.title,
      width: 1200,
      height: 630,
    },
  });
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blogPost = BLOG_POST_DATA[slug];

  if (!blogPost) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${absoluteUrl(`/blog/${slug}`)}#article`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${slug}`),
    },
    headline: blogPost.title,
    description: blogPost.description,
    image: [`${absoluteUrl(blogPost.image)}`],
    url: absoluteUrl(`/blog/${slug}`),
    datePublished: blogPost.publishedAt,
    dateModified: blogPost.updatedAt,
    inLanguage: "en-US",
    articleSection: blogPost.tag,
    isAccessibleForFree: true,
    author: {
      "@type": "Organization",
      name: "Ugle",
      url: SITE_URL,
    },
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: blogPost.title, href: `/blog/${slug}` },
        ]}
      />
      <div className="max-w-3xl mx-auto px-6 py-20 pb-32">
        <Link
          href="/blog"
          className="inline-flex items-center text-[15px] font-semibold text-ugle-gray hover:text-[#5DA233] transition-colors mb-12"
        >
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" strokeWidth={2.5} />{" "}
          Back to Blog
        </Link>
        <div className="text-[13px] font-mono text-ugle-gray mb-3 flex flex-wrap items-center gap-2.5">
          <span className="inline-block bg-[#75C043]/10 text-[#5DA233] text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            {blogPost.tag}
          </span>
          <span className="text-ugle-gray/40">•</span>
          <span>{blogPost.meta}</span>
          <span className="text-ugle-gray/40">•</span>
          <time dateTime={blogPost.publishedAt}>
            {formatDate(blogPost.publishedAt)}
          </time>
          {blogPost.updatedAt &&
            blogPost.updatedAt !== blogPost.publishedAt && (
              <>
                <span className="text-ugle-gray/40">•</span>
                <span className="text-ugle-gray/70">
                  Updated{" "}
                  <time dateTime={blogPost.updatedAt}>
                    {formatDate(blogPost.updatedAt)}
                  </time>
                </span>
              </>
            )}
        </div>
        <h1 className="text-[36px] md:text-[46px] font-extrabold tracking-[-0.02em] mb-10 text-ugle-slate leading-[1.1]">
          {blogPost.title}
        </h1>

        {/* Hero image */}
        <div className="relative w-full rounded-2xl overflow-hidden border border-ugle-light/60 shadow-sm mb-14 aspect-video bg-[#F0F2F0]">
          <Image
            src={blogPost.image}
            alt={blogPost.title}
            fill
            className="object-cover object-top"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        <BlogPost>{blogPost.content}</BlogPost>

        <SocialShare
          title={blogPost.title}
          url={`https://ugle.ai/blog/${slug}`}
        />
      </div>
      <section className="w-full border-t border-ugle-light/60 bg-[#F8FAF9] py-16 md:py-20">
        <GlobalCTA
          title="Take control of your media."
          subtitle="Get 15 days trial and see for yourself."
        />
      </section>
    </>
  );
}
