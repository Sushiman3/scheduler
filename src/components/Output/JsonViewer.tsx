import { CalendarState } from '../../types';

interface JsonViewerProps {
    data: CalendarState;
}

export const JsonViewer = ({ data }: JsonViewerProps) => {
    return (
        <div className="mt-8 p-6 bg-slate-900 rounded-xl shadow-2xl overflow-hidden text-gray-300 font-mono text-sm w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                <h3 className="font-semibold text-gray-100">JSON Output</h3>
                <span className="text-xs text-gray-500">{Object.keys(data).length} entries</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
                <pre>{JSON.stringify(
                    Object.fromEntries(
                        Object.entries(data).filter(([_, status]) => status !== 'unset')
                    ),
                    null,
                    2
                )}</pre>
            </div>
        </div>
    );
};
