import { isSameMonth, isWithinInterval, min, max, format } from 'date-fns';
import { DateCell } from './DateCell';
import { useCalendar } from '../../hooks/useCalendar';

import { ChevronLeft, ChevronRight } from 'lucide-react';

type CalendarProps = ReturnType<typeof useCalendar>;

export const Calendar = ({
    calendarGrid,
    currentMonth,
    selection,
    statuses,
    handleMouseDown,
    handleMouseEnter,
    clearDate,
    getDateKey,
    nextMonth,
    prevMonth
}: CalendarProps) => {

    const isSelected = (date: Date) => {
        if (!selection) return false;
        const start = min([selection.start, selection.end]);
        const end = max([selection.start, selection.end]);
        // isWithinInterval requires start <= end
        return isWithinInterval(date, { start, end });
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="select-none w-full max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6 px-4">
                <button
                    onClick={prevMonth}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center text-gray-800 font-bold text-2xl tracking-tight">
                    {format(currentMonth, 'yyyy MMMM')}
                </div>
                <button
                    onClick={nextMonth}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            <div className="grid grid-cols-7 mb-2">
                {weekDays.map(d => (
                    <div key={d} className="text-center text-sm font-semibold text-gray-500 py-1">
                        {d}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 bg-white shadow-xl ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
                {calendarGrid.map((date) => {
                    const isCurrentMonth = isSameMonth(date, currentMonth);
                    const key = getDateKey(date);
                    const status = statuses[key] || 'unset';

                    return (
                        <DateCell
                            key={date.toISOString()}
                            date={date}
                            isCurrentMonth={isCurrentMonth}
                            status={status}
                            isSelected={isCurrentMonth && isSelected(date)}
                            onMouseDown={handleMouseDown}
                            onMouseEnter={handleMouseEnter}
                            onContextMenu={(e, d) => {
                                e.preventDefault();
                                clearDate(d);
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};
