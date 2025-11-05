import React from 'react';

interface CustomMultiSelectProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (name: string, newSelected: string[]) => void;
  disabled?: boolean;
  heightClass?: string;
}

const CustomMultiSelect: React.FC<CustomMultiSelectProps> = ({ label, name, options, selectedValues, onChange, disabled = false, heightClass = 'h-32' }) => {
  const toggleOption = (value: string) => {
    if (disabled) return;
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(name, newSelected);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className={`mt-1 block w-full ${heightClass} border border-slate-300 rounded-md shadow-sm overflow-y-auto ${disabled ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}>
        <ul className="divide-y divide-slate-100">
          {options.map(option => (
            <li
              key={option.value}
              onClick={() => toggleOption(option.value)}
              className={`p-2 flex items-center text-sm ${disabled ? 'cursor-not-allowed text-slate-500' : 'cursor-pointer'} ${selectedValues.includes(option.value) ? 'bg-blue-100' : (disabled ? '' : 'hover:bg-slate-50')}`}
              role="option"
              aria-selected={selectedValues.includes(option.value)}
              aria-disabled={disabled}
            >
              <div
                className={`w-4 h-4 mr-3 flex-shrink-0 flex items-center justify-center border rounded transition-colors
                  ${selectedValues.includes(option.value)
                      ? 'bg-blue-600 border-blue-600'
                      : (disabled ? 'bg-slate-200 border-slate-300' : 'bg-white border-slate-400')
                  }`}
              >
                  {selectedValues.includes(option.value) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                  )}
              </div>
              <span className={disabled ? 'text-slate-500' : 'text-slate-800'}>{option.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CustomMultiSelect;
