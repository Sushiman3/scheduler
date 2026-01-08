import { useProfiles } from './hooks/useProfiles';
import { Calendar } from './components/Calendar/Calendar';
import { ControlPanel } from './components/Controls/ControlPanel';
import { ProfilePicker } from './components/Profile/ProfilePicker';
import { ProfileIndicator } from './components/Profile/ProfileIndicator';
import { SyncIndicator } from './components/Profile/SyncIndicator';
import { useCalendar } from './hooks/useCalendar';
import { useCallback, useMemo, useEffect } from 'react';
import { CalendarState } from './types';

function App() {
    const {
        profiles,
        currentProfile,
        currentProfileId,
        schedules,
        isLoading,
        syncStatus,
        error,
        isConfigured,
        addProfile,
        selectProfile,
        deselectProfile,
        updateSchedule,
    } = useProfiles();


    // Get schedule data for current profile (empty object for new profiles)
    const profileSchedule = currentProfileId ? (schedules[currentProfileId] || {}) : {};

    // Debug: Log when schedules change
    useEffect(() => {
        console.log('Schedules updated:', schedules);
        console.log('Current profile ID:', currentProfileId);
        console.log('Profile schedule:', profileSchedule);
    }, [schedules, currentProfileId, profileSchedule]);

    const initialStatuses = useMemo((): CalendarState => {
        console.log('Initial statuses computed:', profileSchedule);
        return profileSchedule;
    }, [profileSchedule]);

    const handleStatusChange = useCallback((newStatuses: CalendarState) => {
        if (currentProfileId) {
            console.log('Status change:', newStatuses);
            updateSchedule(currentProfileId, newStatuses);
        }
    }, [currentProfileId, updateSchedule]);

    // Key for calendar based on profile and data
    const calendarKey = useMemo(() => {
        const key = `${currentProfileId || 'none'}-${JSON.stringify(initialStatuses)}`;
        console.log('Calendar key:', key.substring(0, 100));
        return key;
    }, [currentProfileId, initialStatuses]);

    const calendarProps = useCalendar({
        initialStatuses,
        onStatusChange: handleStatusChange,
    });

    // Not configured state
    if (!isConfigured) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md text-center border border-white/20">
                    <h1 className="text-2xl font-bold text-white mb-4">Setup Required</h1>
                    <p className="text-purple-200 mb-4">
                        Google Sheets API URL is not configured.
                    </p>
                    <p className="text-purple-300 text-sm">
                        Please add your Apps Script Web App URL to <code className="bg-white/20 px-2 py-1 rounded">src/config.ts</code>
                    </p>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
                <div className="text-white text-xl font-medium animate-pulse">Loading from Google Sheets...</div>
            </div>
        );
    }

    // Profile selection
    if (!currentProfile) {
        return (
            <ProfilePicker
                profiles={profiles}
                onSelectProfile={selectProfile}
                onAddProfile={addProfile}
            />
        );
    }


    // Main calendar view
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex flex-col items-center">
            <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-start justify-center">

                <div className="flex-1 w-full flex flex-col gap-6">
                    <header className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-4">
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                    Drag Select Scheduler
                                </h1>
                                <SyncIndicator status={syncStatus} error={error} />
                            </div>
                            <p className="text-gray-500 mt-1">Select dates and assign availability.</p>
                        </div>
                        <ProfileIndicator profile={currentProfile} onSwitch={deselectProfile} />
                    </header>

                    <Calendar key={calendarKey} {...calendarProps} />
                </div>

                <div className="flex-none md:w-72 mt-16">
                    <ControlPanel
                        applyStatusToSelection={calendarProps.applyStatusToSelection}
                        updateUnsetAll={calendarProps.updateUnsetAll}
                        clearSelection={calendarProps.clearSelection}
                        selection={calendarProps.selection}
                    />
                </div>

            </div>
        </div>
    )
}

export default App
