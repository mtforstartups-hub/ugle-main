# Changelog

All notable changes to Ugle are documented in this file.

## v1.0.1 — October 30, 2026

- **[Fix]** A free trial shows its days remaining and ends after 15 days.
- **[Improvement]** Trial licences show what a trial can do: no deactivate controls (a trial works on one Mac), and a **Buy Ugle** link to the pricing page.
- **[Improvement]** Clearer activation messages, with a **Buy Ugle** link: a Mac that already used its free trial, a trial already in use on another Mac, and an expired key each say so.
- **[Improvement]** The licence panel's actions each sit on their own line with an icon.
- **[Improvement]** The first-launch privacy note now lists every time Ugle goes online: model downloads, license activation and renewal (trial or paid), and update checks.
- **[Fix]** A connection hiccup while re-activating on the same Mac now asks you to retry instead of saying every seat is in use.

## v1.0.0 — October 27, 2026

- **[Feature]** Indic language pack (optional, about 701 MB): much better transcripts in Bengali, Gujarati, Hindi, Kannada, Malayalam, Marathi, Punjabi, Tamil and Telugu, with English words kept in Latin letters. Install it from the sidebar; it runs only on your computer, and Remove deletes it. Built with Indic-Transcribe Flex from Bodhan AI / AI4Bharat.
- **[Feature]** Choose a file's transcription language from the transcript editor, and re-transcribe in that language.
- **[Feature]** A new Library filter lists files whose detected language is uncertain.
- **[Improvement]** Tidier transcript header: Export and Copy sit beside the file name.
- **[Fix]** Refresh Transcript after hand edits shows the transcript as auto-generated again.
- **[Fix]** The search date filter works again: a "From" date no longer hides every result.
- **[Fix]** Speaker names can be confirmed or cancelled from the keyboard and with VoiceOver.
- **[Improvement]** With the Indic language pack, Hindi, Marathi, Tamil and other recordings mixed with English are recognised on Automatic even when they sound like English at first. The language menu lists Hindi as "Hindi (also Hinglish)".
- **[Improvement]** Clearer labels: language names in the search filter, the folder shown for copies of the same file, a plain message for damaged files, and highlighted Chinese and Japanese search words.
- **[Changed]** Ugle now needs macOS 13.4 or later (was 13.0).

## v0.6.0 — October 6, 2026

- **[Improvement]** Installer is now ~192 MB (was ~1.1 GB): the transcription and search models download on first launch, with the exact size shown first, pause/resume, and automatic fallback to Hugging Face if our server is unreachable. Existing installs download nothing. If a model goes missing, Ugle still opens your library and offers to re-download it.
- **[Licence]** Activating a licence now asks you to agree to the EULA, with links to the EULA and third-party notices (both open offline). The EULA is now version 1.0: a one-year licence with no auto-renewal.
- **[Fix]** Changing your media folder no longer deletes your library. Ugle now asks whether to keep the files already indexed (the default) or delete them, and files on disk are never touched. If you moved your media, Keep carries your transcripts, edits and speaker names over to the new location.
- **[Fix]** Renaming or moving a file no longer re-transcribes it — it keeps its transcript, edits, speaker names and multitrack session. Moving a file while keeping an identical copy reuses the transcript for both.
- **[Fix]** An unplugged drive inside another library folder no longer loses its transcripts; they are kept until the drive comes back.
- **[Fix]** Refresh Transcript works again (broken since 0.5.5), and Identify Speakers no longer leaves a copy of the audio on disk.
- **[Fix]** Ugle refuses a system folder or your whole home folder as the media folder.
- **[Fix]** Stop indexing now also stops the file scan.
- **[Fix]** In a multitrack session, a result previews the track the words came from, not the session's first file.
- **[Fix]** Premiere and Final Cut exports relink files with `#` or `?` in their name.
- **[Fix]** Hindi, Chinese and other non-Latin transcripts no longer lose real speech to the repetition filter.
- **[Fix]** Warnings are readable in both light and dark mode.
- **[Fix]** No more suggestion chips that find nothing while your first index is running.
- **[Fix]** Notifications ("Transcript refreshed", save confirmations, error messages) are visible again.
- **[Fix]** A moved or deleted original now says so in preview and clip export, and "Open in player" is greyed out for it.
- **[Fix]** Library and licence problems show an error with a Retry button instead of an empty screen.
- **[Fix]** Your search and results survive a visit to the Library; a failed search no longer also shows "No matches found"; an open preview recovers if its cached clip was cleared.
- **[Improvement]** "Open in player" opens the whole file in your default media player instead of preferring VLC.
- **[Improvement]** Support bundles, logs and the feedback email no longer show your username, media folder names or drive names.

## v0.5.9 — September 14, 2026

- **[Feature]** Search suggestions come from your own library. The chips under the empty search box are now up to four topics drawn from what is actually indexed, each verified to return results, refreshed at the end of every indexing run. Works in every script Ugle transcribes — Devanagari and Tamil phrases match in their own script, Japanese, Chinese and Thai topics are kept, and each language in a mixed library gets a fair share of the slots.
- **[Improvement]** Proper nouns such as “Republic Day” survive the filler filter, spelling variants from transcription (“Cloud Code” / “claude code”) merge into one chip, and chips clear when the library is replaced.
- **[Performance]** An indexing run finishes slightly later while suggestions are computed (about 40–60 s on a 100-chunk library). Stop still works during it.

## v0.5.8 — September 7, 2026

- **[Feature]** Search works while indexing is still running. Each file becomes searchable within about 30 seconds of finishing transcription (the first file immediately) instead of only at the end of the run — on a large first library that means searching in minutes rather than hours.
- **[Fix]** The preview panel plays what you click, including the moment already loaded. Mute and volume carry over to the next preview instead of resetting on every result.
- **[Fix]** “Open in player” opens one VLC window. Each click used to launch another instance with the old window staying in front.
- **[Fix]** The sidebar no longer says “Indexed” while an indexing run is still in progress.
- **[Performance]** The vector index is built once over the whole library at the end of a run, and superseded index versions are pruned, so disk use no longer grows with every flush.

## v0.5.7 — August 31, 2026

- **[Licence]** Ugle is now proprietary software. Versions up to and including 0.5.6 remain AGPL-3.0; from 0.5.7 onward the terms are in the LICENSE and EULA that ship inside the app. Third-party component licences are unaffected and listed in NOTICE.
- **[Performance]** Embeddings run on the GPU (Metal). Measured on Apple Silicon: 19.8 → 60.2 texts/s idle, and 16.9 → 40.0 texts/s while a transcription is decoding at the same time.
- **[Fix]** Calibration telemetry no longer appears in normal session logs.

## v0.5.6 — August 21, 2026

- **[Fix]** Embedding failed on every Mac without Homebrew — the bundled embedding binaries were linked against Homebrew's OpenSSL, so semantic search never worked on a clean machine. They now link only OS libraries, and the release build fails if any bundled executable references a Homebrew library.

## v0.5.5 — August 21, 2026

- **[Feature]** Update notifications. Ugle checks for a newer version on launch and from “Check for updates” in the sidebar, and offers a browser download. Nothing is installed in-app.
- **[Feature]** Word-tightened clip bounds. Clips created from a search result now trim leading and trailing dead air using per-word timestamps, with a 200 ms breath-room pad. Media cuts and NLE/CSV exports share the same bounds.
- **[Feature]** Cross-script search. Keyword queries match across nine Indic scripts, so a query typed in Latin finds Devanagari transcript text and vice versa.
- **[Improvement]** Licence terms (NOTICE and EULA) ship inside the app bundle.
- **[Fix]** Activation errors are described accurately. A machine already registered to a different licence is pointed at support instead of an unwinnable “try again” loop.
- **[Removed]** AI transcript summaries and “Enhance Search Results” (introduced in 0.4.0 / 0.5.2) have been removed. Search runs on transcripts directly.
- **[Removed]** The in-app auto-updater from 0.4.0 has been replaced by the notify-only update check above.

## v0.5.4 — June 4, 2026

- **[Improvement]** Brand refresh: green accent, Manrope typeface for UI text, monospaced timecodes and file paths, and copy aligned to brand voice — verified in light and dark themes.
- **[Fix]** Search filter dropdowns (Media / Scene / Activity / People / More) never opened; filtering is usable again.
- **[Fix]** Keyboard focus is visible on the filter search and speaker rename inputs.
- **[Improvement]** Speaker rename controls are labelled for screen readers.

## v0.5.3 — June 3, 2026

- **[Fix]** Summary panels no longer come up blank when the model deviates from the instructed heading format (common on news-style transcripts).
- **[Fix]** A bare “Rules” at the start of a line no longer truncates legitimate summary topics.

## v0.5.2 — June 1, 2026

- **[Feature]** Enhance Search Results: bulk AI summarisation across the whole library (TL;DR, key points, topics), embedded into the search index alongside transcript text. The summary model (~806 MB) downloads on first use.
- **[Feature]** Re-summarise a single file from the Media Library after editing its transcript.
- **[Fix]** Summary text no longer leaks into result excerpts or skews result ranking.
- **[Fix]** Speaker identification timeout now scales with file duration; long files are no longer silently cut off.
- **[Fix]** Search with active filters and zero results keeps the filter bar and “Clear filters” visible instead of going blank.
- **[Improvement]** Filter bar redesign: lighter chip styling, grouped filters, active-filter count on Clear, and location/resolution filters hidden when the library has nothing to filter on.

## v0.4.0 — May 21, 2026

- **[Feature]** Speaker identification per file, with rename UI above the segment list and an optional speaker-count hint for better accuracy.
- **[Feature]** Transcript export to SRT, VTT, TXT and Markdown, with speaker labels embedded in SRT/VTT.
- **[Feature]** Clip export: cut a single audio or video clip to MP3/MP4, or export several clips as a zip.
- **[Feature]** Search filters: date range, folder, duration, detected language, and speaker presence.
- **[Feature]** Per-transcript AI summary with streaming display (model downloaded on demand).
- **[Fix]** Keyword matches with weak relevance no longer rank above strong semantic matches.

## v0.3.0 — May 17, 2026

- **[Feature]** Hybrid search: full-text keyword matching fused with semantic vector search, so exact phrases surface alongside meaning-based results.
- **[Performance]** Persistent embedding server on machines with 8 GB+ RAM. Re-indexing an already-indexed library drops from ~13 s to ~4–5 s.
- **[Improvement]** Chunks carry a short prefix from the previous chunk, preserving context at split boundaries.
- **[Improvement]** Search scores use rank-based star ratings with a per-query quality floor — no more 5/5 inflation.
- **[Performance]** macOS installer ~1.2 GB smaller (Metal-only Whisper build).
- **[Fix]** Licence keys pasted with trailing whitespace now activate.

## v0.2.1 — May 6, 2026

- **[Improvement]** Whisper Large v3 Turbo and BGE-M3 models are bundled in the app — no separate download at first launch.

## v0.2.0 — May 5, 2026 · Initial release

- **[Feature]** On-device transcription in 99+ languages.
- **[Feature]** Natural-language semantic search over your media library.
- **[Feature]** Audio and video import, moment preview, and clip list.
