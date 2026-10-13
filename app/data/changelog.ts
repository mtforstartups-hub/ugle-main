export type ChangelogTag =
  | "Feature"
  | "Improvement"
  | "Performance"
  | "Fix"
  | "Licence"
  | "Removed"
  | string;

export interface ChangelogItem {
  t: ChangelogTag;
  text: string;
  c?: string;
}

export interface ChangelogRelease {
  v: string;
  date: string;
  items: ChangelogItem[];
}

export const changelogData: ChangelogRelease[] = [
  {
    v: "v0.6.0",
    date: "October 6, 2026",
    items: [
      {
        t: "Improvement",
        text: "Installer is now ~192 MB (was ~1.1 GB): the transcription and search models download on first launch, with the exact size shown first, pause/resume, and automatic fallback to Hugging Face if our server is unreachable. Existing installs download nothing. If a model goes missing, Ugle still opens your library and offers to re-download it.",
      },
      {
        t: "Licence",
        text: "Activating a licence now asks you to agree to the EULA, with links to the EULA and third-party notices (both open offline). The EULA is now version 1.0: a one-year licence with no auto-renewal.",
      },
      {
        t: "Fix",
        text: "Changing your media folder no longer deletes your library. Ugle now asks whether to keep the files already indexed (the default) or delete them, and files on disk are never touched. If you moved your media, Keep carries your transcripts, edits and speaker names over to the new location.",
      },
      {
        t: "Fix",
        text: "Renaming or moving a file no longer re-transcribes it — it keeps its transcript, edits, speaker names and multitrack session. Moving a file while keeping an identical copy reuses the transcript for both.",
      },
      {
        t: "Fix",
        text: "An unplugged drive inside another library folder no longer loses its transcripts; they are kept until the drive comes back.",
      },
      {
        t: "Fix",
        text: "Refresh Transcript works again (broken since 0.5.5), and Identify Speakers no longer leaves a copy of the audio on disk.",
      },
      {
        t: "Fix",
        text: "Ugle refuses a system folder or your whole home folder as the media folder.",
      },
      {
        t: "Fix",
        text: "Stop indexing now also stops the file scan.",
      },
      {
        t: "Fix",
        text: "In a multitrack session, a result previews the track the words came from, not the session's first file.",
      },
      {
        t: "Fix",
        text: "Premiere and Final Cut exports relink files with `#` or `?` in their name.",
      },
      {
        t: "Fix",
        text: "Hindi, Chinese and other non-Latin transcripts no longer lose real speech to the repetition filter.",
      },
      {
        t: "Fix",
        text: "Warnings are readable in both light and dark mode.",
      },
      {
        t: "Fix",
        text: "No more suggestion chips that find nothing while your first index is running.",
      },
      {
        t: "Fix",
        text: "Notifications (\"Transcript refreshed\", save confirmations, error messages) are visible again.",
      },
      {
        t: "Fix",
        text: "A moved or deleted original now says so in preview and clip export, and \"Open in player\" is greyed out for it.",
      },
      {
        t: "Fix",
        text: "Library and licence problems show an error with a Retry button instead of an empty screen.",
      },
      {
        t: "Fix",
        text: "Your search and results survive a visit to the Library; a failed search no longer also shows \"No matches found\"; an open preview recovers if its cached clip was cleared.",
      },
      {
        t: "Improvement",
        text: "\"Open in player\" opens the whole file in your default media player instead of preferring VLC.",
      },
      {
        t: "Improvement",
        text: "Support bundles, logs and the feedback email no longer show your username, media folder names or drive names.",
      },
    ],
  },
  {
    v: "v0.5.9",
    date: "September 14, 2026",
    items: [
      {
        t: "Feature",
        text: "Search suggestions come from your own library. The chips under the empty search box are now up to four topics drawn from what is actually indexed, each verified to return results, refreshed at the end of every indexing run. Works in every script Ugle transcribes — Devanagari and Tamil phrases match in their own script, Japanese, Chinese and Thai topics are kept, and each language in a mixed library gets a fair share of the slots.",
      },
      {
        t: "Improvement",
        text: "Proper nouns such as “Republic Day” survive the filler filter, spelling variants from transcription (“Cloud Code” / “claude code”) merge into one chip, and chips clear when the library is replaced.",
      },
      {
        t: "Performance",
        text: "An indexing run finishes slightly later while suggestions are computed (about 40–60 s on a 100-chunk library). Stop still works during it.",
      },
    ],
  },
  {
    v: "v0.5.8",
    date: "September 7, 2026",
    items: [
      {
        t: "Feature",
        text: "Search works while indexing is still running. Each file becomes searchable within about 30 seconds of finishing transcription (the first file immediately) instead of only at the end of the run — on a large first library that means searching in minutes rather than hours.",
      },
      {
        t: "Fix",
        text: "The preview panel plays what you click, including the moment already loaded. Mute and volume carry over to the next preview instead of resetting on every result.",
      },
      {
        t: "Fix",
        text: "“Open in player” opens one VLC window. Each click used to launch another instance with the old window staying in front.",
      },
      {
        t: "Fix",
        text: "The sidebar no longer says “Indexed” while an indexing run is still in progress.",
      },
      {
        t: "Performance",
        text: "The vector index is built once over the whole library at the end of a run, and superseded index versions are pruned, so disk use no longer grows with every flush.",
      },
    ],
  },
  {
    v: "v0.5.7",
    date: "August 31, 2026",
    items: [
      {
        t: "Licence",
        text: "Ugle is now proprietary software. Versions up to and including 0.5.6 remain AGPL-3.0; from 0.5.7 onward the terms are in the LICENSE and EULA that ship inside the app. Third-party component licences are unaffected and listed in NOTICE.",
      },
      {
        t: "Performance",
        text: "Embeddings run on the GPU (Metal). Measured on Apple Silicon: 19.8 → 60.2 texts/s idle, and 16.9 → 40.0 texts/s while a transcription is decoding at the same time.",
      },
      {
        t: "Fix",
        text: "Calibration telemetry no longer appears in normal session logs.",
      },
    ],
  },
  {
    v: "v0.5.6",
    date: "August 21, 2026",
    items: [
      {
        t: "Fix",
        text: "Embedding failed on every Mac without Homebrew — the bundled embedding binaries were linked against Homebrew's OpenSSL, so semantic search never worked on a clean machine. They now link only OS libraries, and the release build fails if any bundled executable references a Homebrew library.",
      },
    ],
  },
  {
    v: "v0.5.5",
    date: "August 21, 2026",
    items: [
      {
        t: "Feature",
        text: "Update notifications. Ugle checks for a newer version on launch and from “Check for updates” in the sidebar, and offers a browser download. Nothing is installed in-app.",
      },
      {
        t: "Feature",
        text: "Word-tightened clip bounds. Clips created from a search result now trim leading and trailing dead air using per-word timestamps, with a 200 ms breath-room pad. Media cuts and NLE/CSV exports share the same bounds.",
      },
      {
        t: "Feature",
        text: "Cross-script search. Keyword queries match across nine Indic scripts, so a query typed in Latin finds Devanagari transcript text and vice versa.",
      },
      {
        t: "Improvement",
        text: "Licence terms (NOTICE and EULA) ship inside the app bundle.",
      },
      {
        t: "Fix",
        text: "Activation errors are described accurately. A machine already registered to a different licence is pointed at support instead of an unwinnable “try again” loop.",
      },
      {
        t: "Removed",
        text: "AI transcript summaries and “Enhance Search Results” (introduced in 0.4.0 / 0.5.2) have been removed. Search runs on transcripts directly.",
      },
      {
        t: "Removed",
        text: "The in-app auto-updater from 0.4.0 has been replaced by the notify-only update check above.",
      },
    ],
  },
  {
    v: "v0.5.4",
    date: "June 4, 2026",
    items: [
      {
        t: "Improvement",
        text: "Brand refresh: green accent, Manrope typeface for UI text, monospaced timecodes and file paths, and copy aligned to brand voice — verified in light and dark themes.",
      },
      {
        t: "Fix",
        text: "Search filter dropdowns (Media / Scene / Activity / People / More) never opened; filtering is usable again.",
      },
      {
        t: "Fix",
        text: "Keyboard focus is visible on the filter search and speaker rename inputs.",
      },
      {
        t: "Improvement",
        text: "Speaker rename controls are labelled for screen readers.",
      },
    ],
  },
  {
    v: "v0.5.3",
    date: "June 3, 2026",
    items: [
      {
        t: "Fix",
        text: "Summary panels no longer come up blank when the model deviates from the instructed heading format (common on news-style transcripts).",
      },
      {
        t: "Fix",
        text: "A bare “Rules” at the start of a line no longer truncates legitimate summary topics.",
      },
    ],
  },
  {
    v: "v0.5.2",
    date: "June 1, 2026",
    items: [
      {
        t: "Feature",
        text: "Enhance Search Results: bulk AI summarisation across the whole library (TL;DR, key points, topics), embedded into the search index alongside transcript text. The summary model (~806 MB) downloads on first use.",
      },
      {
        t: "Feature",
        text: "Re-summarise a single file from the Media Library after editing its transcript.",
      },
      {
        t: "Fix",
        text: "Summary text no longer leaks into result excerpts or skews result ranking.",
      },
      {
        t: "Fix",
        text: "Speaker identification timeout now scales with file duration; long files are no longer silently cut off.",
      },
      {
        t: "Fix",
        text: "Search with active filters and zero results keeps the filter bar and “Clear filters” visible instead of going blank.",
      },
      {
        t: "Improvement",
        text: "Filter bar redesign: lighter chip styling, grouped filters, active-filter count on Clear, and location/resolution filters hidden when the library has nothing to filter on.",
      },
    ],
  },
  {
    v: "v0.4.0",
    date: "May 21, 2026",
    items: [
      {
        t: "Feature",
        text: "Speaker identification per file, with rename UI above the segment list and an optional speaker-count hint for better accuracy.",
      },
      {
        t: "Feature",
        text: "Transcript export to SRT, VTT, TXT and Markdown, with speaker labels embedded in SRT/VTT.",
      },
      {
        t: "Feature",
        text: "Clip export: cut a single audio or video clip to MP3/MP4, or export several clips as a zip.",
      },
      {
        t: "Feature",
        text: "Search filters: date range, folder, duration, detected language, and speaker presence.",
      },
      {
        t: "Feature",
        text: "Per-transcript AI summary with streaming display (model downloaded on demand).",
      },
      {
        t: "Fix",
        text: "Keyword matches with weak relevance no longer rank above strong semantic matches.",
      },
    ],
  },
  {
    v: "v0.3.0",
    date: "May 17, 2026",
    items: [
      {
        t: "Feature",
        text: "Hybrid search: full-text keyword matching fused with semantic vector search, so exact phrases surface alongside meaning-based results.",
      },
      {
        t: "Performance",
        text: "Persistent embedding server on machines with 8 GB+ RAM. Re-indexing an already-indexed library drops from ~13 s to ~4–5 s.",
      },
      {
        t: "Improvement",
        text: "Chunks carry a short prefix from the previous chunk, preserving context at split boundaries.",
      },
      {
        t: "Improvement",
        text: "Search scores use rank-based star ratings with a per-query quality floor — no more 5/5 inflation.",
      },
      {
        t: "Performance",
        text: "macOS installer ~1.2 GB smaller (Metal-only Whisper build).",
      },
      {
        t: "Fix",
        text: "Licence keys pasted with trailing whitespace now activate.",
      },
    ],
  },
  {
    v: "v0.2.1",
    date: "May 6, 2026",
    items: [
      {
        t: "Improvement",
        text: "Whisper Large v3 Turbo and BGE-M3 models are bundled in the app — no separate download at first launch.",
      },
    ],
  },
  {
    v: "v0.2.0",
    date: "May 5, 2026 · Initial release",
    items: [
      { t: "Feature", text: "On-device transcription in 99+ languages." },
      { t: "Feature", text: "Natural-language semantic search over your media library." },
      { t: "Feature", text: "Audio and video import, moment preview, and clip list." },
    ],
  },
];
