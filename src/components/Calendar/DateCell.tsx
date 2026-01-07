import { format } from 'date-fns';
import { DateStatus } from '../../types';
import clsx from 'clsx';

interface DateCellProps {
    date: Date;
    status: DateStatus;
    isSelected: boolean;
    isCurrentMonth: boolean;
    onMouseDown: (date: Date) => void;
    onMouseEnter: (date: Date) => void;
    onContextMenu: (e: React.MouseEvent, date: Date) => void;
}

export const DateCell = ({
    date,
    status,
    isSelected,
    isCurrentMonth,
    onMouseDown,
    onMouseEnter,
    onContextMenu,
}: DateCellProps) => {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    // Status Colors
    const statusColors = {
        unset: 'bg-white hover:bg-gray-50',
        ok: 'bg-emerald-100 text-emerald-900',
        ng: 'bg-rose-100 text-rose-900',
    };

    // Selection Overlay
    const selectionStyle = isSelected
        ? 'ring-2 ring-indigo-500 ring-inset z-10'
        : '';

    if (!isCurrentMonth) {
        return <div className="h-24 bg-gray-50/50 border border-gray-100" />
    }

    return (
        <div
            className={clsx(
                'h-24 border border-gray-200 p-2 relative select-none transition-colors cursor-pointer',
                statusColors[status],
                selectionStyle
            )}
            onMouseDown={() => onMouseDown(date)}
            onMouseEnter={() => onMouseEnter(date)}
            onContextMenu={(e) => onContextMenu(e, date)}
        >
            <span className={clsx(
                "text-sm font-medium",
                isWeekend ? "text-gray-500" : "text-gray-700"
            )}>
                {format(date, 'd')}
            </span>

            {status !== 'unset' && (
                <span className="absolute bottom-2 right-2 text-xs font-bold uppercase opacity-50">
                    {status}
                </span>
            )}
        </div>
    );
};
