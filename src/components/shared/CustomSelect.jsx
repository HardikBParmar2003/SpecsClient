import { useState, useRef, useEffect } from 'react';
import { HiChevronDown } from 'react-icons/hi';

const CustomSelect = ({ 
  options, 
  value, 
  onChange, 
  name, 
  placeholder = "Select an option", 
  className = "",
  direction = "down"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-3 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold transition-all duration-300 cursor-pointer"
      >
        <span className={selectedOption ? 'text-[var(--input-text)]' : 'text-[var(--input-placeholder)]'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <HiChevronDown 
          className={`w-5 h-5 text-[var(--text-muted)] transition-transform duration-300 ${isOpen ? 'rotate-180 text-luxury-gold' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full ${direction === 'up' ? 'bottom-full mb-2' : 'mt-2'} bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-[var(--shadow-card)] overflow-hidden animate-fade-in-up`}>
          <ul className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    if (onChange) {
                      // Mock a standard event object to keep compatibility with existing handlers
                      onChange({ target: { name, value: option.value } });
                    }
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 cursor-pointer ${
                    value === option.value 
                      ? 'bg-luxury-gold text-black font-medium' 
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
