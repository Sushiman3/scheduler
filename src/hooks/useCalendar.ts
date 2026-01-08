import { useState, useEffect, useCallback } from 'react';
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    format,
    isSameMonth,
    startOfWeek,
    endOfWeek,
    min,
    max,
    addMonths,
    subMonths
} from 'date-fns';
import { CalendarState, DateStatus } from '../types';

interface UseCalendarOptions {
    key?: string;
    initialStatuses?: CalendarState;
    onStatusChange?: (statuses: CalendarState) => void;
}

export const useCalendar = (options: UseCalendarOptions = {}) => {
    const { initialStatuses = {}, onStatusChange } = options;

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [statuses, setStatuses] = useState<CalendarState>(initialStatuses);
    const [selection, setSelection] = useState<{ start: Date; end: Date } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Sync statuses when initialStatuses changes (profile switch)
    useEffect(() => {
        setStatuses(initialStatuses);
    }, [initialStatuses]);

    // Notify parent when statuses change
    const updateStatuses = useCallback((updater: (prev: CalendarState) => CalendarState) => {
        setStatuses(prev => {
            const next = updater(prev);
            onStatusChange?.(next);
            return next;
        });
    }, [onStatusChange]);

    // Helper to formatted date string key
    const getDateKey = (date: Date) => format(date, 'yyyy-MM-dd');

    // Computed days for the current month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Grid days (including padding)
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const calendarGrid = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Methods
    const handleMouseDown = (date: Date) => {
        if (!isSameMonth(date, currentMonth)) return;
        setIsDragging(true);
        setSelection({ start: date, end: date });
    };

    const handleMouseEnter = (date: Date) => {
        if (!isDragging || !selection) return;
        if (!isSameMonth(date, currentMonth)) return;
        setSelection((prev) => prev ? { ...prev, end: date } : null);
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
        }
    };

    // Global mouse up to catch drags ending outside cells
    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, [isDragging]);

    const applyStatusToSelection = (status: DateStatus) => {
        if (!selection) return;

        const start = min([selection.start, selection.end]);
        const end = max([selection.start, selection.end]);
        const daysToUpdate = eachDayOfInterval({ start, end });

        updateStatuses((prev) => {
            const next = { ...prev };
            daysToUpdate.forEach((day) => {
                if (isSameMonth(day, currentMonth)) {
                    next[getDateKey(day)] = status;
                }
            });
            return next;
        });
    };

    const updateUnsetAll = (status: DateStatus) => {
        updateStatuses((prev) => {
            const next = { ...prev };
            monthDays.forEach((day) => {
                const key = getDateKey(day);
                if (!next[key] || next[key] === 'unset') {
                    next[key] = status;
                }
            });
            return next;
        });
    };

    const clearDate = (date: Date) => {
        updateStatuses((prev) => {
            const next = { ...prev };
            next[getDateKey(date)] = 'unset';
            return next;
        });
    };

    const clearSelection = () => {
        setSelection(null);
        setIsDragging(false);
    };

    const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
    const prevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));

    return {
        currentMonth,
        calendarGrid,
        statuses,
        selection,
        isDragging,
        handleMouseDown,
        handleMouseEnter,
        applyStatusToSelection,
        updateUnsetAll,
        clearDate,
        clearSelection,
        getDateKey,
        nextMonth,
        prevMonth,
    };
};
