import type { DataTableBlock } from "@/payload-types";

export function DataTable({ block }: { block: DataTableBlock }) {
  return (
    <div className="not-prose my-14 overflow-hidden rounded-[14px] border border-ugle-light/60 shadow-sm">
      <table className="w-full border-collapse bg-white text-left text-[15px]">
        <thead>
          <tr className="bg-[#3A3A3A] text-white">
            {block.columns.map((column, index) => (
              <th
                key={column.id ?? index}
                className="px-5 py-3 font-sans font-semibold"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ugle-light/40">
          {block.rows.map((row, rowIndex) => (
            <tr
              key={row.id ?? rowIndex}
              className={
                rowIndex % 2 === 1
                  ? "bg-[#F7F7F5]"
                  : "transition-colors hover:bg-[#F7F7F5]"
              }
            >
              {(row.cells ?? []).map((cell, cellIndex) => (
                <td
                  key={cell.id ?? cellIndex}
                  className="px-5 py-3.5 text-ugle-slate"
                >
                  {cell.value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {block.caption ? (
        <p className="m-0 border-t border-ugle-light/40 bg-white px-5 py-3 text-[13px] text-ugle-gray">
          {block.caption}
        </p>
      ) : null}
    </div>
  );
}
