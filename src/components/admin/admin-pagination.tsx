import Link from "next/link";

type AdminPaginationProps = {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
};

export function AdminPagination({
  currentPage,
  totalPages,
  buildHref
}: AdminPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-[24px] border border-[#e6ebf2] bg-white px-5 py-4">
      <p className="text-sm text-[#66768c]">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Link
          aria-disabled={currentPage <= 1}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            currentPage <= 1
              ? "pointer-events-none bg-[#f3f6fb] text-[#97a4b5]"
              : "bg-[#111b2d] text-white"
          }`}
          href={buildHref(Math.max(1, currentPage - 1))}
        >
          Previous
        </Link>
        <Link
          aria-disabled={currentPage >= totalPages}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            currentPage >= totalPages
              ? "pointer-events-none bg-[#f3f6fb] text-[#97a4b5]"
              : "bg-[#111b2d] text-white"
          }`}
          href={buildHref(Math.min(totalPages, currentPage + 1))}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
