import type { ReactNode } from "react";

type AdminTableProps = {
  columns: string[];
  children: ReactNode;
  emptyState?: ReactNode;
  hasRows: boolean;
};

export function AdminTable({ columns, children, emptyState, hasRows }: AdminTableProps) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-[#e6ebf2] bg-white shadow-[0_14px_36px_rgba(34,51,84,0.06)]">
      <div className="grid grid-cols-5 gap-4 border-b border-[#eef2f7] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7d8ca1]">
        {columns.map((column) => (
          <div key={column}>{column}</div>
        ))}
      </div>
      {hasRows ? <div className="divide-y divide-[#eef2f7]">{children}</div> : emptyState}
    </div>
  );
}
