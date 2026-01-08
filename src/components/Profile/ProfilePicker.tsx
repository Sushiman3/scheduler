import { useState } from 'react';
import { UserProfile } from '../../types';
import { Plus, User } from 'lucide-react';

interface ProfilePickerProps {
    profiles: UserProfile[];
    onSelectProfile: (profileId: string) => void;
    onAddProfile: (name: string) => Promise<UserProfile> | UserProfile;
}

export const ProfilePicker = ({
    profiles,
    onSelectProfile,
    onAddProfile,
}: ProfilePickerProps) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');

    const handleAdd = async () => {
        if (newName.trim()) {
            const profile = await onAddProfile(newName.trim());
            setNewName('');
            setIsAdding(false);
            onSelectProfile(profile.id);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        } else if (e.key === 'Escape') {
            setIsAdding(false);
            setNewName('');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
                        Drag Select Scheduler
                    </h1>
                    <p className="text-purple-200 text-lg">
                        Choose your profile to continue
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {profiles.map((profile) => (
                        <button
                            key={profile.id}
                            onClick={() => onSelectProfile(profile.id)}
                            className="group relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-200 border border-white/20 hover:border-white/40 hover:scale-105 active:scale-95"
                        >
                            <div
                                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                                style={{ backgroundColor: profile.color }}
                            >
                                {profile.name.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-white font-semibold text-center truncate">
                                {profile.name}
                            </p>
                        </button>
                    ))}

                    {/* Add Profile Button / Form */}
                    {isAdding ? (
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-gray-500/50 text-white">
                                <User size={32} />
                            </div>
                            <input
                                type="text"
                                placeholder="Name..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 text-center focus:outline-none focus:ring-2 focus:ring-white/50"
                            />
                            <div className="flex gap-2 mt-3 w-full">
                                <button
                                    onClick={() => {
                                        setIsAdding(false);
                                        setNewName('');
                                    }}
                                    className="flex-1 text-white/70 hover:text-white text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    disabled={!newName.trim()}
                                    className="flex-1 bg-white/20 hover:bg-white/30 text-white rounded-lg py-1 text-sm disabled:opacity-50"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 transition-all duration-200 border border-dashed border-white/30 hover:border-white/50 flex flex-col items-center justify-center"
                        >
                            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-white/10 text-white/70 group-hover:text-white group-hover:bg-white/20 transition-colors">
                                <Plus size={32} />
                            </div>
                            <p className="text-white/70 group-hover:text-white font-semibold text-center">
                                Add Profile
                            </p>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
