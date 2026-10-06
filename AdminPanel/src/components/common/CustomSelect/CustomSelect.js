import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './CustomSelect.css';

export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select option...',
  label,
  icon: Icon,
  className = '',
  style = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format options normalized to { value, label }
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      return opt;
    }
    return { value: opt, label: String(opt) };
  });

  const selectedOption = normalizedOptions.find(opt => opt.value === value) || normalizedOptions[0];

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`custom-select-container ${className}`} style={style} ref={containerRef}>
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="custom-select-trigger-content">
          {Icon && <Icon size={16} className="custom-select-icon" />}
          {label && <span className="custom-select-label-prefix">{label}</span>}
          <span className="custom-select-current-text">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={16} className={`custom-select-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="custom-select-dropdown" role="listbox">
          <div className="custom-select-options-list">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              const hasBadge = opt.badge !== undefined && opt.badge !== null;
              return (
                <div
                  key={String(opt.value)}
                  className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="custom-select-option-content">
                    {opt.icon && <opt.icon size={15} className="option-icon" />}
                    <span className="option-label">{opt.label}</span>
                  </div>
                  <div className="option-right-meta">
                    {hasBadge && <span className="option-badge">{opt.badge}</span>}
                    <span className="option-check-holder">
                      {isSelected && <Check size={14} className="option-check-icon" />}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
