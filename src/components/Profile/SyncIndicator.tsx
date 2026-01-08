import { Cloud, CloudOff, Loader2 } from 'lucide-react';

type SyncStatus = 'idle' | 'syncing' | 'error';

interface SyncIndicatorProps {
    status: SyncStatus;
    error?: string | null;
}

export const SyncIndicator = ({ status, error }: SyncIndicatorProps) => {
    return (
        <div className="flex items-center gap-2 text-sm">
            {status === 'syncing' && (
                <>
                    <Loader2 size={14} className="animate-spin text-blue-500" />
                    <span className="text-blue-600">Syncing...</span>
                </>
            )}
            {status === 'idle' && (
                <>
                    <Cloud size={14} className="text-emerald-500" />
                    <span className="text-emerald-600">Synced</span>
                </>
            )}
            {status === 'error' && (
                <div className="flex items-center gap-2">
                    <CloudOff size={14} className="text-rose-500" />
                    <span className="text-rose-600" title={error || 'Sync error'}>
                        Error
                    </span>
                </div>
            )}
        </div>
    );
};
