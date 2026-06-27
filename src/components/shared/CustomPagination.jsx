import React from 'react';
import { HiChevronDoubleLeft, HiChevronLeft, HiChevronRight, HiChevronDoubleRight } from 'react-icons/hi';
import CustomSelect from './CustomSelect';

const CustomPagination = ({ page, totalPages, setPage, limit, setLimit }) => {
  const renderPageNumbers = () => {
    const pages = [];
    
    let startPage = page - 1;
    let endPage = page + 1;

    // Adjust boundaries to always show up to 3 pages if available
    if (startPage < 1) {
      startPage = 1;
      endPage = Math.min(3, totalPages);
    }
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, totalPages - 2);
    }

    for (let i = startPage; i <= endPage; i++) {
      const isActive = page === i;
      pages.push(
        <button 
          key={i} 
          onClick={() => setPage(i)} 
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-all duration-300 cursor-pointer ${
            isActive 
              ? 'bg-gradient-to-br from-luxury-gold to-[#b38e28] text-[var(--bg-primary)] font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-110 border border-luxury-gold/50 z-10' 
              : 'text-[var(--text-secondary)] bg-[var(--input-bg)] hover:bg-luxury-gold/10 hover:text-luxury-gold border border-[var(--border-color)] hover:border-luxury-gold/30 font-medium'
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-[var(--border-color)] bg-[var(--bg-card)] gap-4">
      {/* Limit Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Show</span>
        <div className="w-20">
          <CustomSelect 
            name="limit"
            value={limit?.toString() || '10'} 
            onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
            options={[
              { value: '10', label: '10' },
              { value: '25', label: '25' },
              { value: '50', label: '50' },
              { value: '100', label: '100' }
            ]}
          />
        </div>
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">entries</span>
      </div>

      {/* Center Pagination */}
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => setPage(1)}
          className="p-1.5 rounded text-[var(--text-secondary)] hover:text-luxury-gold hover:bg-[var(--input-bg)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="First Page"
        >
          <HiChevronDoubleLeft className="w-5 h-5" />
        </button>
        <button
          disabled={page <= 1}
          onClick={() => setPage(p => p - 1)}
          className="p-1.5 rounded text-[var(--text-secondary)] hover:text-luxury-gold hover:bg-[var(--input-bg)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Previous Page"
        >
          <HiChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-1 mx-2">
          {totalPages > 0 ? renderPageNumbers() : <span className="text-sm text-[var(--text-muted)]">No pages</span>}
        </div>

        <button
          disabled={page >= totalPages || totalPages === 0}
          onClick={() => setPage(p => p + 1)}
          className="p-1.5 rounded text-[var(--text-secondary)] hover:text-luxury-gold hover:bg-[var(--input-bg)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Next Page"
        >
          <HiChevronRight className="w-5 h-5" />
        </button>
        <button
          disabled={page >= totalPages || totalPages === 0}
          onClick={() => setPage(totalPages)}
          className="p-1.5 rounded text-[var(--text-secondary)] hover:text-luxury-gold hover:bg-[var(--input-bg)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Last Page"
        >
          <HiChevronDoubleRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Spacer for flex balance on larger screens */}
      <div className="hidden sm:block w-[150px]"></div>
    </div>
  );
};

export default CustomPagination;
