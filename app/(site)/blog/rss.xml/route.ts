import { getPostsPage } from "@/lib/payload/queries";
import { SITE_URL, absoluteUrl } from "@/app/lib/seo";

export const revalidate = 3600;

export async function GET() {
  const postsResult = await getPostsPage({ limit: 20, page: 1 });
  const posts = postsResult.docs;

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Ugle Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Insights, philosophy, and technical deep-dives into local-first audio search, on-device AI transcription, and privacy-first media workflows.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/ugle-icon.png</url>
      <title>Ugle</title>
      <link>${SITE_URL}/blog</link>
    </image>
    ${posts
      .map((post) => {
        const postUrl = `${SITE_URL}/blog/${post.slug}`;
        const pubDate = new Date(post.publishedAt).toUTCString();
        const description = post.excerpt.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
        const contentHtml = post.content ? JSON.stringify(post.content) : "";
        return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <content:encoded><![CDATA[${description}]]></content:encoded>
    </item>`;
      })
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}