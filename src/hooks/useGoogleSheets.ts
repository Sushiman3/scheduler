import { UserProfile, CalendarState } from '../types';
import { GOOGLE_SHEETS_API_URL } from '../config';

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

const fetchApi = async <T>(
    action: string,
    method: 'GET' | 'POST' = 'GET',
    body?: unknown
): Promise<ApiResponse<T>> => {
    if (!GOOGLE_SHEETS_API_URL) {
        return { error: 'Google Sheets API URL not configured' };
    }

    try {
        const url = new URL(GOOGLE_SHEETS_API_URL);
        url.searchParams.set('action', action);

        const options: RequestInit = {
            method,
            mode: 'cors',
        };

        if (method === 'POST' && body) {
            options.body = JSON.stringify(body);
            options.headers = {
                'Content-Type': 'text/plain', // Apps Script requires this for CORS
            };
        }

        const response = await fetch(url.toString(), options);
        const data = await response.json();

        if (data.error) {
            return { error: data.error };
        }

        return { data };
    } catch (err) {
        return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
};

export const googleSheetsApi = {
    async getProfiles(): Promise<ApiResponse<{ profiles: UserProfile[] }>> {
        return fetchApi('getProfiles');
    },

    async getSchedules(): Promise<ApiResponse<{ schedules: Record<string, CalendarState> }>> {
        return fetchApi('getSchedules');
    },

    async addProfile(profile: UserProfile): Promise<ApiResponse<{ success: boolean; profile: UserProfile }>> {
        return fetchApi('addProfile', 'POST', profile);
    },

    async updateSchedule(
        profileId: string,
        scheduleData: CalendarState
    ): Promise<ApiResponse<{ success: boolean }>> {
        return fetchApi('updateSchedule', 'POST', { profileId, scheduleData });
    },

    async deleteProfile(profileId: string): Promise<ApiResponse<{ success: boolean }>> {
        const url = new URL(GOOGLE_SHEETS_API_URL);
        url.searchParams.set('action', 'deleteProfile');
        url.searchParams.set('profileId', profileId);

        try {
            const response = await fetch(url.toString());
            const data = await response.json();
            return { data };
        } catch (err) {
            return { error: err instanceof Error ? err.message : 'Unknown error' };
        }
    },
};

// Debounce utility
export const createDebouncedFunction = <T extends (...args: Parameters<T>) => void>(
    fn: T,
    delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const debouncedFn = (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, delay);
    };

    debouncedFn.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    return debouncedFn;
};
