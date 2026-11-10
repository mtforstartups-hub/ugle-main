import { getPayload } from "payload";
import { JSDOM } from "jsdom";
import {
  convertHTMLToLexical,
  editorConfigFactory,
  type SanitizedServerEditorConfig,
} from "@payloadcms/richtext-lexical";
import config from "@payload-config";

async function seed() {
  const payload = await getPayload({ config: await config });

  // 1. Categories (six existing tags)
  const categories = [
    { name: "Product philosophy", slug: "product-philosophy", description: "Product thinking and local-first philosophy." },
    { name: "Workflow", slug: "workflow", description: "Editorial and podcast workflows." },
    { name: "Journalism", slug: "journalism", description: "Journalistic workflows and tools." },
    { name: "Newsrooms", slug: "newsrooms", description: "Newsroom collaboration and search." },
    { name: "Comparison", slug: "comparison", description: "Local-first vs cloud comparisons." },
    { name: "Privacy", slug: "privacy", description: "Privacy, security and source protection." },
    { name: "Privacy & Security", slug: "privacy-security", description: "Privacy and security deep-dives." },
    { name: "Product", slug: "product", description: "Product updates and features." },
    { name: "Pricing", slug: "pricing", description: "Pricing and licensing." },
    { name: "Technical", slug: "technical", description: "Technical deep-dives." },
  ];

  for (const cat of categories) {
    const existing = await payload.find({
      collection: "categories",
      where: { slug: { equals: cat.slug } },
      limit: 1,
      overrideAccess: true,
    });
    if (existing.totalDocs === 0) {
      await payload.create({
        collection: "categories",
        data: { name: cat.name, slug: cat.slug, description: cat.description },
        overrideAccess: true,
      });
    }
  }

  // 2. Author — Ugle Team
  const author = await payload.find({
    collection: "authors",
    where: { slug: { equals: "ugle-team" } },
    limit: 1,
    overrideAccess: true,
  });
  if (author.totalDocs === 0) {
    await payload.create({
      collection: "authors",
      data: {
        name: "Ugle Team",
        slug: "ugle-team",
        role: "Product team",
        bio: "The team building Ugle — local-first media search.",
        links: [{ label: "Website", url: "https://ugle.ai" }],
      },
      overrideAccess: true,
    });
  }

  // 2b. Starter answers
  const answersCollection = payload.config.collections.find(
    (collection) => collection.slug === "answers",
  );
  const answerField = answersCollection?.fields.find(
    (field) => "name" in field && field.name === "answer",
  );
  if (!answerField) throw new Error("answers.answer field not found");

  const editorConfig = editorConfigFactory.fromField({
    field: answerField as never,
  }) as SanitizedServerEditorConfig;

  const starterAnswers: {
    question: string;
    slug: string;
    shortAnswer: string;
    categorySlug: string;
    productArea: "search" | "transcription" | "privacy" | "pricing" | "platforms" | "integrations";
    featured: boolean;
    order: number;
    keywords: string[];
    answerHtml: string;
  }[] = [
    {
      question: "Does Ugle upload my recordings?",
      slug: "does-ugle-upload-my-recordings",
      shortAnswer:
        "No. Ugle indexes and searches your media on your own machine. Your recordings stay local unless you explicitly choose to share them.",
      categorySlug: "privacy-security",
      productArea: "privacy",
      featured: true,
      order: 1,
      keywords: ["privacy", "local-first", "uploads", "security"],
      answerHtml: `
        <p>Ugle is built local-first. When you add a recording, transcription and indexing happen on your device. The audio and video files are never uploaded to a Ugle server as part of normal use.</p>
        <h2>What stays on your machine</h2>
        <ul>
          <li>The original media files.</li>
          <li>Generated transcripts and search indexes.</li>
          <li>Your search history and saved Moments.</li>
        </ul>
        <p>Because everything stays local, you can work with sensitive interviews, source recordings and unreleased footage without sending them to a third party.</p>
      `,
    },
    {
      question: "What languages does Ugle support?",
      slug: "what-languages-does-ugle-support",
      shortAnswer:
        "Ugle recognises more than 90 languages on-device, including English, Spanish, French, German, Hindi, Arabic, Mandarin and many more.",
      categorySlug: "product",
      productArea: "transcription",
      featured: true,
      order: 2,
      keywords: ["languages", "transcription", "multilingual"],
      answerHtml: `
        <p>Ugle's local transcription engine supports over 90 languages. You can search across recordings in multiple languages from the same library.</p>
        <h2>How language support works</h2>
        <p>Language detection happens automatically when a file is indexed. For recordings with mixed languages, Ugle transcribes each spoken segment and keeps the original timestamps so you can jump back to the source.</p>
        <p>Accuracy varies by language, accent and audio quality. If a recording is noisy or uses specialised terminology, adding a short glossary can improve results.</p>
      `,
    },
    {
      question: "How accurate is Ugle transcription?",
      slug: "how-accurate-is-ugle-transcription",
      shortAnswer:
        "Ugle targets roughly 95% word accuracy on clear recordings, with results varying by audio quality, accent, language and overlapping speakers.",
      categorySlug: "technical",
      productArea: "transcription",
      featured: false,
      order: 3,
      keywords: ["accuracy", "word error rate", "transcription quality"],
      answerHtml: `
        <p>Transcription accuracy is usually measured as word error rate (WER) against a manually checked transcript. Ugle is tuned to reach about 95% accuracy on clear, single-speaker recordings.</p>
        <h2>What affects accuracy</h2>
        <ul>
          <li>Background noise and room echo.</li>
          <li>Strong accents and fast speech.</li>
          <li>Multiple people talking at once.</li>
          <li>Unusual names, brands and technical terms.</li>
        </ul>
        <p>Even when a word is transcribed imperfectly, semantic search can still surface the right Moment because Ugle matches meaning as well as exact wording.</p>
      `,
    },
    {
      question: "Can I search across multiple recordings at once?",
      slug: "search-across-multiple-recordings",
      shortAnswer:
        "Yes. Ugle builds one searchable index across your whole library, so a single query can find matches in every recording you have added.",
      categorySlug: "workflow",
      productArea: "search",
      featured: false,
      order: 4,
      keywords: ["search", "library", "archive"],
      answerHtml: `
        <p>Instead of opening files one by one, add them to Ugle and search once. Results are grouped by recording and ranked by relevance, with the matching passage highlighted.</p>
        <h2>Working with a large archive</h2>
        <p>Filters let you narrow results by date, duration, speaker or folder. From a result you can play the source Moment immediately and confirm the quote in context before using it.</p>
      `,
    },
    {
      question: "Is there a free trial?",
      slug: "is-there-a-free-trial",
      shortAnswer:
        "Yes. Ugle includes a 15-day trial so you can index your own recordings and test search, transcription and clip workflows before choosing a plan.",
      categorySlug: "pricing",
      productArea: "pricing",
      featured: false,
      order: 5,
      keywords: ["trial", "pricing", "plans"],
      answerHtml: `
        <p>You can try Ugle for 15 days. The trial covers the core local-first workflow: adding media, transcribing it and searching across your library.</p>
        <p>When the trial ends you can pick the plan that fits your workflow. Because processing happens on your device, there are no per-minute transcription fees.</p>
      `,
    },
  ];

  for (const answer of starterAnswers) {
    const existing = await payload.find({
      collection: "answers",
      where: { slug: { equals: answer.slug } },
      limit: 1,
      overrideAccess: true,
    });
    if (existing.totalDocs > 0) continue;

    const category = await payload.find({
      collection: "categories",
      where: { slug: { equals: answer.categorySlug } },
      limit: 1,
      overrideAccess: true,
    });
    const categoryId = category.docs[0]?.id;
    if (!categoryId) throw new Error(`Missing category: ${answer.categorySlug}`);

    const answerState = convertHTMLToLexical({
      editorConfig,
      html: answer.answerHtml,
      JSDOM: JSDOM as never,
    });

    await payload.create({
      collection: "answers",
      data: {
        question: answer.question,
        slug: answer.slug,
        shortAnswer: answer.shortAnswer,
        answer: answerState as never,
        category: categoryId,
        productArea: answer.productArea,
        featured: answer.featured,
        order: answer.order,
        keywords: answer.keywords.map((term) => ({ term })),
        publishedAt: new Date().toISOString(),
        _status: "published",
      },
      overrideAccess: true,
    });
  }

  // 3. Globals — blog-settings + answers-settings
  await payload.updateGlobal({
    slug: "blog-settings",
    data: {
      heroEyebrow: "Blog",
      heroTitle: "Thoughts & Workflow.",
      heroDescription: "Product thinking. Workflow observations. Opinions on how media professionals work.",
      postsPerPage: 5,
    },
    overrideAccess: true,
  });

  await payload.updateGlobal({
    slug: "answers-settings",
    data: {
      heroEyebrow: "Answers",
      heroTitle: "Product questions, answered.",
      heroDescription: "Direct answers about Ugle — privacy, search, transcription, pricing and platforms.",
    },
    overrideAccess: true,
  });

  // 4. First admin user (idempotent by email)
  const email = process.env.SEED_ADMIN_EMAIL || "admin@ugle.ai";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.SEED_ADMIN_NAME || "Ugle Admin";

  const existingUser = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  });

  if (existingUser.totalDocs === 0) {
    await payload.create({
      collection: "users",
      data: { name, email, role: "admin", password },
      overrideAccess: true,
    });
    console.log(`Created admin user: ${email}`);
  } else {
    console.log(`Admin user already exists: ${email}`);
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
