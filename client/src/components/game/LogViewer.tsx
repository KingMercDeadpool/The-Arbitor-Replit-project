import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGameState } from "@/hooks/use-game-state";
import { Activity, ChevronDown, ChevronRight, Sword, FileText, AlertTriangle, Zap, Users, Globe, Heart, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { LogEntry } from "@shared/schema";

const TYPE_ICONS: Record<string, any> = {
  COMBAT: Sword,
  CONTRACT: FileText,
  CRISIS: AlertTriangle,
  TIER_UP: Zap,
  SOCIAL: Users,
  WORLD: Globe,
  NPC: Heart,
  RECRUITMENT: UserPlus,
  SYSTEM: Activity,
};

const TYPE_COLORS: Record<string, string> = {
  TIER_UP: "text-amber-500 border-amber-500/50 bg-amber-500/10",
  CRISIS: "text-red-500 border-red-500/50 bg-red-500/10",
  CONTRACT: "text-blue-400 border-blue-400/50 bg-blue-400/10",
  COMBAT: "text-red-400 border-red-400/50 bg-red-400/10",
  SOCIAL: "text-pink-400 border-pink-400/50 bg-pink-400/10",
  WORLD: "text-emerald-400 border-emerald-400/50 bg-emerald-400/10",
  NPC: "text-purple-400 border-purple-400/50 bg-purple-400/10",
  RECRUITMENT: "text-cyan-400 border-cyan-400/50 bg-cyan-400/10",
  SYSTEM: "text-slate-400 border-slate-700 bg-slate-800/50",
};

function LogEntryCard({ entry, isExpanded, onToggle }: { 
  entry: LogEntry; 
  isExpanded: boolean; 
  onToggle: () => void;
}) {
  const Icon = TYPE_ICONS[entry.type] || Activity;
  const colorClass = TYPE_COLORS[entry.type] || TYPE_COLORS.SYSTEM;
  
  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <motion.button
      onClick={onToggle}
      className={`w-full text-left p-3 rounded-lg border transition-all min-h-[52px] ${colorClass}`}
      whileTap={{ scale: 0.98 }}
      data-testid={`log-entry-${entry.id}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-sm truncate">{entry.action}</span>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] opacity-60 font-mono">{timeAgo(entry.timestamp)}</span>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 opacity-50" />
              ) : (
                <ChevronRight className="w-4 h-4 opacity-50" />
              )}
            </div>
          </div>
          <AnimatePresence>
            {isExpanded ? (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm opacity-80 leading-relaxed"
              >
                {entry.details}
              </motion.p>
            ) : (
              <p className="text-sm opacity-60 truncate">{entry.details}</p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.button>
  );
}

export function LogViewer() {
  const { state } = useGameState();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  const filteredLogs = filter 
    ? state.historyLog.filter(e => e.type === filter)
    : state.historyLog;

  const logTypes = Array.from(new Set(state.historyLog.map(e => e.type)));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[350px]">
      <div className="p-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Activity Log</h3>
          </div>
          <span className="text-xs text-slate-600">{filteredLogs.length} entries</span>
        </div>
        {logTypes.length > 1 && (
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setFilter(null)}
              className={`px-2 py-1 text-xs rounded-full shrink-0 transition-colors ${
                filter === null 
                  ? "bg-slate-700 text-slate-200" 
                  : "bg-slate-800 text-slate-500"
              }`}
              data-testid="filter-all"
            >
              All
            </button>
            {logTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilter(filter === type ? null : type)}
                className={`px-2 py-1 text-xs rounded-full shrink-0 capitalize transition-colors ${
                  filter === type 
                    ? "bg-slate-700 text-slate-200" 
                    : "bg-slate-800 text-slate-500"
                }`}
                data-testid={`filter-${type.toLowerCase()}`}
              >
                {type.toLowerCase()}
              </button>
            ))}
          </div>
        )}
      </div>
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          {filteredLogs.map((entry) => (
            <LogEntryCard
              key={entry.id}
              entry={entry}
              isExpanded={expandedId === entry.id}
              onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
            />
          ))}
          {filteredLogs.length === 0 && (
             <div className="text-center text-slate-600 text-sm py-8 italic">
               {filter 
                 ? `No ${filter.toLowerCase()} entries found.` 
                 : "No activity recorded. Begin operations to generate data."}
             </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
