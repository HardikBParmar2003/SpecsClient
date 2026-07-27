import { useState, useRef, useEffect } from 'react';
import { HiOutlineCalendar, HiChevronLeft, HiChevronRight, HiX } from 'react-icons/hi';

const CustomDatePicker = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      if (typeof value === 'string' && value.includes('-')) {
        const [y, m, d] = value.split('-');
        setCurrentMonth(new Date(y, m - 1, d));
      } else if (value instanceof Date) {
        setCurrentMonth(value);
      } else {
        // try to parse
        const d = new Date(value);
        if (!isNaN(d.getTime())) setCurrentMonth(d);
      }
    }
  }, [value]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));

  const handleSelect = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Display value formatting
  let displayValue = "Select Date";
  if (value) {
    if (typeof value === 'string' && value.includes('-')) {
      const [y, m, d] = value.split('-');
      displayValue = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
    } else {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        displayValue = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      }
    }
  }

  return (
    <div className="relative w-full" ref={popoverRef}>
      {/* Trigger Button / Pill */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-4 py-2 rounded cursor-pointer transition-all duration-300 border backdrop-blur-sm
          ${value 
            ? 'bg-luxury-gold/10 border-luxury-gold/40 text-[var(--text-primary)] shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:bg-luxury-gold/20' 
            : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-luxury-gold/50 hover:text-[var(--text-primary)]'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <HiOutlineCalendar className={`w-4 h-4 transition-colors ${value ? 'text-luxury-gold' : 'text-[var(--text-muted)]'}`} />
          <span className="text-xs font-medium tracking-widest uppercase flex items-center">
            {label && <span className="opacity-60 mr-1.5 font-light">{label}</span>}
            <span className={value ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
              {displayValue}
            </span>
          </span>
        </div>
        {value && (
          <div 
            onClick={handleClear} 
            className="ml-2 p-0.5 rounded-full hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition-colors shrink-0"
            title="Clear date"
          >
            <HiX className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 z-50 w-72 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden origin-top-right transition-all duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className="p-1.5 rounded-full hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-luxury-gold transition-colors cursor-pointer"
            >
              <HiChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold tracking-widest uppercase text-[var(--text-primary)]">
              {monthNames[currentMonth.getMonth()]} <span className="text-luxury-gold">{currentMonth.getFullYear()}</span>
            </span>
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              className="p-1.5 rounded-full hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-luxury-gold transition-colors cursor-pointer"
            >
              <HiChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Body */}
          <div className="p-4 bg-[var(--bg-card)]">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(d => (
                <div key={d} className="text-center text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, i) => {
                if (!date) return <div key={`empty-${i}`} />;
                
                const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                
                let valueDateString = '';
                if (value) {
                  if (typeof value === 'string' && value.includes('-')) valueDateString = value;
                  else {
                    const d = new Date(value);
                    if (!isNaN(d.getTime())) valueDateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  }
                }
                const isSelected = valueDateString === dateString;
                
                const today = new Date();
                const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                const isToday = dateString === todayString;

                return (
                  <button
                    key={i}
                    onClick={(e) => { e.preventDefault(); handleSelect(date); }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-200 cursor-pointer mx-auto
                      ${isSelected 
                        ? 'bg-gradient-to-br from-luxury-gold to-luxury-gold-dark text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-110' 
                        : isToday 
                          ? 'border border-luxury-gold/50 text-luxury-gold font-bold hover:bg-luxury-gold/10'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                      }
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex justify-between">
            <button 
              onClick={() => {
                const today = new Date();
                onChange(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`);
                setIsOpen(false);
              }}
              className="text-xs font-semibold uppercase tracking-widest text-luxury-gold hover:text-luxury-gold-dark transition-colors cursor-pointer px-2 py-1 rounded hover:bg-luxury-gold/10"
            >
              Select Today
            </button>
            <button 
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-red-400 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-red-500/10"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
