import { UserProfile } from '../../types';
import { LogOut } from 'lucide-react';

interface ProfileIndicatorProps {
    profile: UserProfile;
    onSwitch: () => void;
}

export const ProfileIndicator = ({ profile, onSwitch }: ProfileIndicatorProps) => {
    return (
        <div className="flex items-center gap-3 bg-white rounded-full pl-1 pr-4 py-1 shadow-md border border-gray-100">
            <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: profile.color }}
            >
                {profile.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-gray-700">{profile.name}</span>
            <button
                onClick={onSwitch}
                className="ml-2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title="Switch Profile"
            >
                <LogOut size={16} />
            </button>
        </div>
    );
};
