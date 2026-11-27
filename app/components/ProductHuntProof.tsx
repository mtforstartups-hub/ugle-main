import Image from "next/image";
import { Star } from "lucide-react";

export const PRODUCT_HUNT_REVIEWS = [
  {
    name: "Ranbijay Singh Deo",
    avatar:
      "https://ph-avatars.imgix.net/10416004/original.jpeg?w=80&h=80&fit=crop&auto=format",
    href: "https://www.producthunt.com/products/ugle/reviews?review=664619&utm_source=badge-testimonial-wall&utm_medium=badge",
    paragraphs: [
      "Really like the idea behind Ugle! Going through long audio and video recordings to find a particular conversation can be a pain, and this makes the whole process so much easier. Being able to search using natural language and jump straight to the relevant moment is a really nice touch. I also love that everything stays local, which is a big plus for privacy.",
      "Looks like a genuinely useful tool, and I'm excited to see how it evolves. Great work by the team!",
    ],
  },
  {
    name: "Surbhi Burman",
    avatar:
      "https://ph-avatars.imgix.net/10415742/89f9e698-4b0e-4485-a044-7f3d9608c73f.png?w=80&h=80&fit=crop&auto=format",
    href: "https://www.producthunt.com/products/ugle/reviews?review=664589&utm_source=badge-testimonial-wall&utm_medium=badge",
    paragraphs: [
      "I like how easily Ugle lets me search through long audio and video recordings without manually going through the entire file. The semantic search, timestamp-based results and quick clip export are genuinely useful. Local processing is another big plus, especially for privacy.",
    ],
  },
  {
    name: "Sumit Kumar",
    avatar:
      "https://ph-avatars.imgix.net/10415829/original.jpeg?w=80&h=80&fit=crop&auto=format",
    href: "https://www.producthunt.com/products/ugle/reviews?review=664598&utm_source=badge-testimonial-wall&utm_medium=badge",
    paragraphs: [
      "Ugle makes it easier to manage and find useful moments in audio and video recordings. I like the transcription and search features because they can save a lot of time when working with long recordings. The local-first approach is also a nice plus for privacy.",
    ],
  },
];

export function ProductHuntRatingBadge({
  className = "",
}: {
  className?: string;
}) {
  return (
    <a
      href="https://www.producthunt.com/products/ugle/reviews?utm_source=badge-product_rating&utm_medium=badge&utm_source=badge-ugle"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block transition-opacity hover:opacity-90 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://api.producthunt.com/widgets/embed-image/v1/product_rating.svg?product_id=1343217&theme=light"
        alt="Ugle - Search across local audio/video archives by meaning, locally | Product Hunt"
        width={242}
        height={108}
        decoding="async"
        className="w-[242px] h-[108px]"
      />
    </a>
  );
}

export default function ProductHuntProof() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-16 md:pb-24">
      <div className="flex flex-col items-center justify-center gap-4 mb-10">
        <ProductHuntRatingBadge />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRODUCT_HUNT_REVIEWS.map((review) => (
          <a
            key={review.name}
            href={review.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col justify-between bg-white border border-ugle-light/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-ugle-green/50 transition-all"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={review.avatar}
                  alt={review.name}
                  width={40}
                  height={40}
                  sizes="40px"
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="font-semibold text-base text-ugle-slate">
                  {review.name}
                </div>
              </div>

              <div
                className="flex items-center gap-0.5 mb-3 text-amber-400"
                aria-label="5 out of 5 stars"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <div className="space-y-2 text-sm md:text-[15px] text-ugle-gray leading-relaxed">
                {review.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-ugle-light/40 text-xs font-medium text-[#FF6154]">
              Verified review on Product Hunt &rarr;
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
