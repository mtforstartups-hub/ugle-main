# Ugle CMS — editor guide

The Ugle website is managed through the Ugle CMS at `/admin` (for example
`https://ugle.ai/admin`). It is the same application as the public site, so
publishing a change updates the live pages without a deploy.

## Signing in

1. Go to `/admin`.
2. Enter your email and password.
3. Forgotten passwords are reset from **Forgot password?** on the login screen.

There are two roles:

| Role | Can do |
|------|--------|
| **Editor** | Create, edit, preview, publish and unpublish posts and answers; upload media; move documents to the trash. Cannot manage users or permanently delete. |
| **Admin** | Everything an editor can do, plus user management and permanent deletion. |

If you need a new account, ask an admin. There is no public sign-up form.

## The dashboard

After signing in you land on **Content overview**. It shows:

- Status tabs for **All**, **Published**, **Drafts** and **Scheduled**.
- A search box and category filter for posts.
- Recent posts and answers with their title/question, category and author.

Drafts are included, so unfinished work is always visible here even though it
is not on the public site.

## Writing a post

Go to **Content → Posts → Create New**.

| Field | Notes |
|-------|-------|
| **Title** | The page heading and card title. |
| **Slug** | Generated from the title. Edit it only if you need a specific URL; changing a published slug changes the live URL. |
| **Excerpt** | 1–3 sentences. Used on cards and as the fallback meta description (max 300 characters). |
| **Hero image** | Required. 1600×900 works best. |
| **Content** | The article body. See the block list below. |
| **Category** | One category. |
| **Author** | Defaults to the Ugle Team author. |
| **Published at** | Defaults to the current time on first save. |
| **Reading time** | Calculated automatically from the content. |
| **Featured** | Marks the post for featured placement. |
| **Related posts / Related answers** | Optional. Only the items you pick appear in the related sections; if you pick none, the section is hidden. |

### Content blocks

The editor supports:

- Headings, paragraphs, lists, quotes and links.
- Images and media blocks with alt text.
- Callouts and notes.
- Comparison tables and data tables.
- Step lists and chip grids.
- Stat cards, query boxes, embeds and related links.
- CTA cards.

Keep headings in order (H2, then H3) so the page outline and SEO stay clean.
Always add alt text to images.

### SEO fields

Open the **Meta** section on a post or answer to override the search/social
title, description and image. Leave them empty to fall back to the title,
excerpt/short answer and hero image.

## Drafts, autosave and preview

- New documents start as **drafts**. They are not visible on the public site.
- The editor autosaves while you work. Use **Save Draft** if you want an
  explicit checkpoint.
- Click **Preview** to open the draft in a new tab. Preview uses a short-lived
  secure link and enables draft mode in that browser tab only.
- Draft and preview pages are marked `noindex` so search engines never index
  them.
- To publish, click **Publish**. The public page and listings update
  immediately.
- To take a published document down, open it and choose **Unpublish** (or set
  the status back to Draft). Its public URL then returns 404.
- **Schedule publish** is available from the publish menu if you want a post to
  go live at a future time.

## Writing an answer

Go to **Content → Answers → Create New**. Answers are short, direct responses
to product questions and power `/answers` plus the FAQ structured data.

| Field | Notes |
|-------|-------|
| **Question** | The page H1, phrased as a real question. |
| **Slug** | Generated from the question. |
| **Short answer** | 1–2 sentences used on cards, in meta descriptions and in AI answer surfaces. |
| **Answer** | The full explanation, using the same content blocks as posts. |
| **Category** | Required. |
| **Product area** | Optional: Search, Transcription, Privacy, Pricing, Platforms or Integrations. |
| **Keywords** | Optional terms that help search and discovery. |
| **Featured** | Shows the answer in the featured section on `/answers`. |
| **Order** | Manual ordering within the featured/category group. |
| **Related answers / posts** | Optional, max 3 each. |

Answers follow the same draft, preview and publish flow as posts.

## Media

Go to **Media → Create New** to upload an image.

- Images only. The maximum file size is **10 MB**.
- Add **alt text** describing the image. It is required for accessibility and
  is used by `next/image`.
- **Caption** and **credit** are optional.
- Use the focal point tool to control how an image is cropped in cards and
  heroes.
- The CMS generates thumbnail, card, hero and OG sizes automatically.
- In production, files are stored in Vercel Blob; in local development they are
  written to the `media/` folder.

## Categories and authors

**Taxonomy → Categories** controls the blog and answer filters. Each category
has a name, slug, optional description and a `usedFor` setting that decides
whether it appears for posts, answers or both.

**Taxonomy → Authors** holds bylines: name, slug, role, optional avatar, bio
and links. The seeded **Ugle Team** author is the default.

## Settings

**Settings → Blog settings** and **Settings → Answers settings** control the
hero copy on `/blog` and `/answers`, posts per page, the shared CTA and the
optional featured post / helpful widget.

Changes here are published immediately.

## Trash and recovery

Deleting a post or answer from the list view moves it to the **trash**; it is
not removed from the database. Editors can trash documents, but only admins
can delete permanently.

To restore:

1. Open the collection (Posts or Answers).
2. Use the trash view/filter (`/admin/collections/posts/trash`).
3. Open the document and choose **Restore**.

Trashed documents do not appear on the public site. If something was deleted
by mistake, restore it from the trash before asking an admin for a database
restore.

## Publishing checklist

Before publishing:

- [ ] Title/question reads naturally and matches the slug.
- [ ] Excerpt or short answer is filled in.
- [ ] Hero image has alt text.
- [ ] Headings are in order and links work.
- [ ] Category and author are set.
- [ ] Meta title/description are set if the defaults are not ideal.
- [ ] Related content is picked (or intentionally left empty).
- [ ] Preview looks right on desktop and mobile.
- [ ] After publishing, open the public URL and confirm it loads.
