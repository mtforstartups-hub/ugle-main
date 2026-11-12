import { getAnswersPage } from "@/lib/payload/queries";
import { SITE_URL, absoluteUrl } from "@/app/lib/seo";

export const revalidate = 3600;

export async function GET() {
  const answersResult = await getAnswersPage({ limit: 20, page: 1 });
  const answers = answersResult.docs;

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Ugle Answers</title>
    <link>${SITE_URL}/answers</link>
    <description>Direct answers about Ugle — privacy, search, transcription, pricing and platforms.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/answers/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/ugle-icon.png</url>
      <title>Ugle</title>
      <link>${SITE_URL}/answers</link>
    </image>
    ${answers
      .map((answer) => {
        const answerUrl = `${SITE_URL}/answers/${answer.slug}`;
        const pubDate = new Date(answer.publishedAt).toUTCString();
        const description = answer.shortAnswer.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
        return `
    <item>
      <title><![CDATA[${answer.question}]]></title>
      <link>${answerUrl}</link>
      <guid isPermaLink="true">${answerUrl}</guid>
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