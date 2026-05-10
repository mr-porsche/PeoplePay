interface Props {
  page:         number;
  totalPages:   number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-4 justify-center py-4">
      <button
        aria-label="previous"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-4 py-2 text-sm rounded border border-(--border) hover:border-(--accent) hover:text-(--accent) transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <span className="text-sm text-(--text)">
        Page {page} of {totalPages}
      </span>

      <button
        aria-label="next"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-4 py-2 text-sm rounded border border-(--border) hover:border-(--accent) hover:text-(--accent) transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}