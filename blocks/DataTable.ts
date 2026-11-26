import type { Block } from "payload";

export const DataTable: Block = {
  slug: "dataTable",
  interfaceName: "DataTableBlock",
  labels: { singular: "Data table", plural: "Data tables" },
  fields: [
    { name: "caption", type: "text", required: false },
    {
      name: "columns",
      type: "array",
      required: true,
      minRows: 1,
      fields: [{ name: "header", type: "text", required: true }],
    },
    {
      name: "rows",
      type: "array",
      required: true,
      minRows: 1,
      fields: [{ name: "cells", type: "array", fields: [{ name: "value", type: "text", required: true }] }],
    },
  ],
};
