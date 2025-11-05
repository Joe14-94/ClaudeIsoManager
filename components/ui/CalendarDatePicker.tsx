import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarDatePickerProps {
  id: string;
  name: string;
  value: string; // YYYY-MM-DD or empty string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}

const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({ id, name, value, onChange, readOnly }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(() => {
    try {
      if (value) {
        const date = new Date(value + 'T00:00:00');
        if (!isNaN(date.getTime())) return date;
      }
    } catch(e) {}
    return new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     try {
      if (value) {
        const date = new Date(value + 'T00:00:00');
        if (!isNaN(date.getTime())) {
          setDisplayDate(date);
        }
      } else {
        setDisplayDate(new Date());
      }
    } catch(e) {}
  }, [value]);
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (date: Date) => {
    const formattedDate = formatDate(date);
    const event = {
      target: { name, value: formattedDate, id }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    setDisplayDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1); // avoid issues with month lengths
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const daysInMonth = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };
  
  const firstDayOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1).getDay();
  // Sunday is 0, we shift to have Monday as 0
  const startOffset = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1);
  const monthDays = daysInMonth();
  
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative mt-1">
        <input
          type="text"
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm pr-10"
          placeholder="AAAA-MM-JJ"
        />
        <button
          type="button"
          onClick={() => !readOnly && setIsOpen(!isOpen)}
          className="absolute right-0 top-0 bottom-0 px-3 flex items-center text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed"
          disabled={readOnly}
          aria-label="Ouvrir le calendrier"
        >
          <CalendarIcon size={20} />
        </button>
      </div>

      {isOpen && !readOnly && (
        <div className="absolute z-10 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-slate-100" aria-label="Mois précédent"><ChevronLeft size={20} /></button>
            <div className="font-semibold text-sm capitalize">
              {displayDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
            </div>
            <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-slate-100" aria-label="Mois suivant"><ChevronRight size={20} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2 font-medium">
            <div>Lu</div><div>Ma</div><div>Me</div><div>Je</div><div>Ve</div><div>Sa</div><div>Di</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`}></div>)}
            {monthDays.map(day => {
              const isSelected = selectedDate && !isNaN(selectedDate.getTime()) && day.toDateString() === selectedDate.toDateString();
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <button
                  type="button"
                  key={day.toISOString()}
                  onClick={() => handleDateSelect(day)}
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors 
                    ${isSelected ? 'bg-blue-600 text-white font-bold' : ''}
                    ${!isSelected && isToday ? 'bg-slate-200 text-slate-800' : ''}
                    ${!isSelected && !isToday ? 'hover:bg-slate-100' : ''}
                  `}
                  aria-label={`Sélectionner le ${day.getDate()}`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarDatePicker;
