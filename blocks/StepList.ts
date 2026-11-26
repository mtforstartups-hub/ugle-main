import type { Block } from "payload";

export const StepList: Block = {
  slug: "stepList",
  interfaceName: "StepListBlock",
  labels: { singular: "Step list", plural: "Step lists" },
  fields: [
    {
      name: "steps",
      type: "array",
      required: true,
      minRows: 1,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea", required: false },
      ],
    },
  ],
};
