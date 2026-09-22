"use client";

import { motion } from "motion/react";
import { changelogData, ChangelogItem } from "@/app/data/changelog";

const tagColorMap: Record<string, string> = {
  feature: "text-blue-600",
  improvement: "text-[#75C043]",
  performance: "text-ugle-gray",
  fix: "text-red-500",
  licence: "text-amber-600",
  license: "text-amber-600",
  removed: "text-orange-500",
};

function getTagClass(tag: string, customColor?: string) {
  if (customColor) return customColor;
  const key = tag.replace(/[[\]]/g, "").trim().toLowerCase();
  return tagColorMap[key] || "text-ugle-gray";
}

function formatTag(tag: string) {
  return tag.startsWith("[") ? tag : `[${tag}]`;
}

export default function ChangelogMain() {
  return (
    <div className="space-y-0 pl-4 border-l border-ugle-light/60">
      {changelogData.map((log, index) => (
        <motion.div
          key={log.v}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
          className="relative pb-16 pl-8"
        >
          <div className="absolute w-3 h-3 bg-white rounded-full -left-1.5 top-2 border-2 border-ugle-slate"></div>
          <div className="flex items-baseline gap-4 mb-4">
            <h2 className="text-2xl font-bold font-mono text-ugle-slate">
              {log.v}
            </h2>
            <span className="text-ugle-gray text-sm">{log.date}</span>
          </div>
          <ul className="space-y-4">
            {log.items.map((item: ChangelogItem, i: number) => (
              <li
                key={i}
                className="text-lg text-ugle-slate block sm:flex items-start gap-4"
              >
                <span
                  className={`font-mono text-xs w-28 uppercase tracking-wider font-bold shrink-0 pt-1.5 ${getTagClass(
                    item.t,
                    item.c
                  )}`}
                >
                  {formatTag(item.t)}
                </span>
                <span className="mt-1 sm:mt-0 leading-relaxed">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}
