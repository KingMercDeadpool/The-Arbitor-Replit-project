import { ScrollArea } from "@/components/ui/scroll-area";
import { useGameState } from "@/hooks/use-game-state";
import { Activity } from "lucide-react";

export function LogViewer() {
  const { state } = useGameState();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[300px]">
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center gap-2">
        <Activity className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">System Log</h3>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {state.historyLog.map((entry) => (
            <div key={entry.id} className="text-sm border-l-2 border-slate-800 pl-3 py-1">
              <div className="flex justify-between items-baseline mb-0.5">
                <span className={`font-bold text-xs uppercase tracking-wide
                  ${entry.type === 'TIER_UP' ? 'text-amber-500' : 
                    entry.type === 'CRISIS' ? 'text-red-500' : 
                    entry.type === 'CONTRACT' ? 'text-blue-400' : 'text-slate-400'
                  }`}>
                  {entry.action}
                </span>
                <span className="text-[10px] text-slate-600 font-mono">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-slate-300 leading-snug">{entry.details}</p>
            </div>
          ))}
          {state.historyLog.length === 0 && (
             <div className="text-center text-slate-600 text-xs py-8 italic">
               No activity recorded. Begin operations to generate data.
             </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
