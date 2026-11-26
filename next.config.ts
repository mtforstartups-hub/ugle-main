import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Local Payload media proxy (development only)
      ...(process.env.NODE_ENV !== "production"
        ? [
            {
              protocol: "http" as const,
              hostname: "localhost",
              port: "3000",
              pathname: "/api/media/**",
            },
            {
              protocol: "http" as const,
              hostname: "127.0.0.1",
              port: "3000",
              pathname: "/api/media/**",
            },
          ]
        : []),
    ],
    // Allow the image optimizer to fetch local Payload media in development.
    // Never enable this in production.
    ...(process.env.NODE_ENV !== "production"
      ? { dangerouslyAllowLocalIP: true }
      : {}),
  },
  experimental: {
    globalNotFound: true,
  },
  async redirects() {
    return [
      {
        source: "/get-early-access",
        destination: "/request-trial",
        permanent: true,
      },
      {
        source: "/get-early-access/:path*",
        destination: "/request-trial",
        permanent: true,
      },
      {
        source: "/non-commercial",
        destination: "/pricing",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.ugle.ai" }],
        destination: "https://ugle.ai/:path*",
        permanent: true,
      },
    ];
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
