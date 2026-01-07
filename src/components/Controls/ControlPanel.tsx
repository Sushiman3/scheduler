import { useEffect } from 'react';
import { useCalendar } from '../../hooks/useCalendar';
import { Check, X } from 'lucide-react';

type ControlPanelProps = Pick<ReturnType<typeof useCalendar>,
    'applyStatusToSelection' | 'updateUnsetAll' | 'clearSelection' | 'selection'
>;

export const ControlPanel = ({
    applyStatusToSelection,
    updateUnsetAll,
    clearSelection,
    selection
}: ControlPanelProps) => {

    // Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if input focused (though we have none)
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === 'g' || e.key === 'G') {
                applyStatusToSelection('ok');
            } else if (e.key === 'r' || e.key === 'R') {
                applyStatusToSelection('ng');
            } else if (e.key === 'Escape') {
                clearSelection();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [applyStatusToSelection, clearSelection]);

    const hasSelection = !!selection;

    return (
        <div className="flex flex-col gap-4 p-6 bg-white rounded-xl shadow-lg border border-gray-100 h-fit sticky top-6 w-72">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Controls</h3>

            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Selection</label>

                <button
                    onClick={() => applyStatusToSelection('ok')}
                    disabled={!hasSelection}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-200 active:scale-95"
                    title="Shortcut: G"
                >
                    <Check size={18} />
                    Set Possible
                </button>

                <button
                    onClick={() => applyStatusToSelection('ng')}
                    disabled={!hasSelection}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-rose-200 active:scale-95"
                    title="Shortcut: R"
                >
                    <X size={18} />
                    Set Impossible
                </button>
            </div>

            <div className="h-px bg-gray-100 my-2" />

            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Batch (Unset)</label>

                <button
                    onClick={() => updateUnsetAll('ok')}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-emerald-200 text-emerald-700 font-medium hover:bg-emerald-50 transition-colors active:scale-95"
                >
                    Fill All Possible
                </button>

                <button
                    onClick={() => updateUnsetAll('ng')}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-rose-200 text-rose-700 font-medium hover:bg-rose-50 transition-colors active:scale-95"
                >
                    Fill All Impossible
                </button>
            </div>

            <div className="mt-4 text-xs text-gray-400">
                <p>Shortcuts:</p>
                <div className="grid grid-cols-2 gap-1 mt-1 font-mono">
                    <span>G</span> <span>Set OK</span>
                    <span>R</span> <span>Set NG</span>
                    <span>Esc</span> <span>Clear Select</span>
                </div>
            </div>
        </div>
    );
};
