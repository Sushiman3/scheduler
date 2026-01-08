import { useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile, CalendarState } from '../types';
import { googleSheetsApi, createDebouncedFunction } from './useGoogleSheets';
import { GOOGLE_SHEETS_API_URL, WRITE_DEBOUNCE_MS } from '../config';

// Predefined colors for profiles
const PROFILE_COLORS = [
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#ef4444', // Red
    '#84cc16', // Lime
];

const getNextColor = (existingProfiles: UserProfile[]): string => {
    const usedColors = new Set(existingProfiles.map(p => p.color));
    return PROFILE_COLORS.find(c => !usedColors.has(c)) || PROFILE_COLORS[0];
};

const generateId = (): string => {
    return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

type SyncStatus = 'idle' | 'syncing' | 'error';

export const useProfiles = () => {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
    const [schedules, setSchedules] = useState<{ [profileId: string]: CalendarState }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    const isConfigured = !!GOOGLE_SHEETS_API_URL;

    // Create debounced schedule update function
    const debouncedUpdateRef = useRef<((profileId: string, newSchedule: CalendarState) => void) & { cancel: () => void } | null>(null);

    // Load data from Google Sheets on mount
    useEffect(() => {
        if (!isConfigured) {
            setIsLoading(false);
            setError('Google Sheets API URL not configured. Please add your Apps Script URL to config.ts');
            return;
        }

        const loadData = async () => {
            setIsLoading(true);
            setSyncStatus('syncing');

            const [profilesRes, schedulesRes] = await Promise.all([
                googleSheetsApi.getProfiles(),
                googleSheetsApi.getSchedules(),
            ]);

            if (profilesRes.error) {
                setError(profilesRes.error);
                setSyncStatus('error');
                console.log('[useProfiles] Error loading profiles:', profilesRes.error);
            } else if (profilesRes.data) {
                setProfiles(profilesRes.data.profiles);
                console.log('[useProfiles] Loaded profiles:', profilesRes.data.profiles.length);
            }

            if (schedulesRes.error) {
                setError(schedulesRes.error);
                setSyncStatus('error');
                console.log('[useProfiles] Error loading schedules:', schedulesRes.error);
            } else if (schedulesRes.data) {
                setSchedules(schedulesRes.data.schedules);
                console.log('[useProfiles] Loaded schedules:', Object.keys(schedulesRes.data.schedules));
            }

            if (!profilesRes.error && !schedulesRes.error) {
                setSyncStatus('idle');
            }

            setIsLoading(false);
        };

        loadData();
    }, [isConfigured]);

    const currentProfile = profiles.find(p => p.id === currentProfileId) || null;

    const addProfile = useCallback(async (name: string): Promise<UserProfile> => {
        const newProfile: UserProfile = {
            id: generateId(),
            name: name.trim(),
            color: getNextColor(profiles),
        };

        // Optimistic update
        setProfiles(prev => [...prev, newProfile]);
        setSchedules(prev => ({ ...prev, [newProfile.id]: {} }));

        // Sync to Google Sheets
        setSyncStatus('syncing');
        const result = await googleSheetsApi.addProfile(newProfile);

        if (result.error) {
            setError(result.error);
            setSyncStatus('error');
            // Rollback on error
            setProfiles(prev => prev.filter(p => p.id !== newProfile.id));
        } else {
            setSyncStatus('idle');
        }

        return newProfile;
    }, [profiles]);

    const removeProfile = useCallback(async (profileId: string) => {
        // Optimistic update
        const prevProfiles = profiles;
        const prevSchedules = schedules;

        setProfiles(prev => prev.filter(p => p.id !== profileId));
        setSchedules(prev => {
            const next = { ...prev };
            delete next[profileId];
            return next;
        });

        if (currentProfileId === profileId) {
            setCurrentProfileId(null);
        }

        // Sync to Google Sheets
        setSyncStatus('syncing');
        const result = await googleSheetsApi.deleteProfile(profileId);

        if (result.error) {
            setError(result.error);
            setSyncStatus('error');
            // Rollback
            setProfiles(prevProfiles);
            setSchedules(prevSchedules);
        } else {
            setSyncStatus('idle');
        }
    }, [profiles, schedules, currentProfileId]);

    const selectProfile = useCallback((profileId: string) => {
        console.log('[useProfiles] Profile selected:', profileId);
        setCurrentProfileId(profileId);
    }, []);

    const deselectProfile = useCallback(() => {
        setCurrentProfileId(null);
    }, []);

    const getSchedule = useCallback((profileId: string): CalendarState => {
        return schedules[profileId] || {};
    }, [schedules]);

    // Create the debounced update function once
    useEffect(() => {
        debouncedUpdateRef.current = createDebouncedFunction(
            async (profileId: string, newSchedule: CalendarState) => {
                console.log('[useProfiles] Saving schedule for:', profileId, 'entries:', Object.keys(newSchedule).length);
                setSyncStatus('syncing');
                const result = await googleSheetsApi.updateSchedule(profileId, newSchedule);

                if (result.error) {
                    setError(result.error);
                    setSyncStatus('error');
                    console.log('[useProfiles] Save error:', result.error);
                } else {
                    setSyncStatus('idle');
                    console.log('[useProfiles] Schedule saved successfully');
                }
            },
            WRITE_DEBOUNCE_MS
        );

        return () => {
            debouncedUpdateRef.current?.cancel();
        };
    }, []);

    const updateSchedule = useCallback((profileId: string, newSchedule: CalendarState) => {
        // Immediate local update
        setSchedules(prev => ({ ...prev, [profileId]: newSchedule }));

        // Debounced sync to Google Sheets
        if (debouncedUpdateRef.current) {
            setSyncStatus('syncing');
            debouncedUpdateRef.current(profileId, newSchedule);
        }
    }, []);

    return {
        profiles,
        currentProfile,
        currentProfileId,
        schedules,
        isLoading,
        syncStatus,
        error,
        isConfigured,
        addProfile,
        removeProfile,
        selectProfile,
        deselectProfile,
        getSchedule,
        updateSchedule,
    };
};
