export type DateStatus = 'ok' | 'ng' | 'unset';

export interface CalendarState {
    [dateStr: string]: DateStatus;
}

export interface UserProfile {
    id: string;
    name: string;
    color: string;
}

export interface ProfileData {
    [profileId: string]: CalendarState;
}
