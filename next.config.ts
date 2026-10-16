import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
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
