export type DateStatus = 'ok' | 'ng' | 'unset';

export interface CalendarState {
    [dateStr: string]: DateStatus;
}
