'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8 px-2">
      {/* Info Section */}
      {showInfo && (
        <div className="text-sm font-medium text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg border border-blue-200">
          <span className="text-gray-900 font-semibold">
            Page {currentPage}
          </span>
          <span className="text-gray-500 mx-2">of</span>
          <span className="text-gray-900 font-semibold">{totalPages}</span>
        </div>
      )}

      {/* Pagination Buttons */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95'
          }`}
          title="Halaman Sebelumnya"
        >
          ← Prev
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
          {visiblePages.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`
                px-3 py-2 rounded-md font-medium transition-all duration-200 text-sm
                ${
                  page === currentPage
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg font-bold'
                    : page === '...'
                    ? 'text-gray-500 cursor-default'
                    : 'bg-white text-gray-700 hover:bg-blue-100 hover:text-blue-700 border border-gray-300 hover:border-blue-400 cursor-pointer'
                }
              `}
              title={typeof page === 'number' ? `Ke halaman ${page}` : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-95'
          }`}
          title="Halaman Berikutnya"
        >
          Next →
        </button>
      </div>
    </div>
  );
}