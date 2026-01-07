import { useCalendar } from './hooks/useCalendar';
import { Calendar } from './components/Calendar/Calendar';
import { ControlPanel } from './components/Controls/ControlPanel';
import { JsonViewer } from './components/Output/JsonViewer';

function App() {
    const calendarProps = useCalendar();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex flex-col items-center">
            <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-start justify-center">

                <div className="flex-1 w-full flex flex-col gap-6">
                    <header>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Drag Select Scheduler
                        </h1>
                        <p className="text-gray-500 mt-1">Select dates and assign availability.</p>
                    </header>

                    <Calendar {...calendarProps} />

                    <JsonViewer data={calendarProps.statuses} />
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
