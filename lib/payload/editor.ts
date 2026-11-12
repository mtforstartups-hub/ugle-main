import { BlocksFeature, lexicalEditor } from "@payloadcms/richtext-lexical";
import { contentBlocks } from "../../blocks";

/**
 * Single source of truth for the rich-text editor used by Posts and Answers.
 * Keeps the Payload default feature set and adds the design-parity blocks.
 */
export const contentEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [...defaultFeatures, BlocksFeature({ blocks: contentBlocks })],
});
