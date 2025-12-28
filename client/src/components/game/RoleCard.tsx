import { Lock, Unlock, ArrowUpCircle, AlertCircle } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";
import { useGameState } from "@/hooks/use-game-state";
import { RoleKey } from "@/lib/game-engine";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface RoleCardProps {
  roleKey: RoleKey;
  label: string;
  description: string;
  colorClass: string;
}

export function RoleCard({ roleKey, label, description, colorClass }: RoleCardProps) {
  const { state, actions } = useGameState();
  const currentTier = state.roles[roleKey];
  const title = actions.getTitle(roleKey, currentTier);
  const nextTitle = actions.getTitle(roleKey, currentTier + 1);
  const upgradeCheck = actions.checkUpgrade(roleKey);
  const cost = actions.getCost(roleKey, currentTier);

  // Special gate display for Arbitor
  const isGated = !upgradeCheck.allowed;

  return (
    <div className={cn(
      "relative group rounded-2xl p-6 border transition-all duration-300",
      "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950",
      currentTier >= 10 ? "border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]" : "border-slate-800 hover:border-slate-700"
    )}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={cn("text-2xl font-serif font-bold mb-1", colorClass)}>{label}</h3>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">{description}</p>
        </div>
        <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center bg-slate-950 shadow-inner font-mono text-xl font-bold text-slate-200">
                {currentTier}
            </div>
            <span className="text-[10px] text-slate-600 mt-1 font-bold">TIER</span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
          <p className="text-sm text-slate-300 font-medium">
            <span className="text-slate-500 mr-2">Current:</span> 
            {title}
          </p>
        </div>
        {currentTier < 10 && (
           <div className="flex items-center gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
             <p className="text-sm text-slate-400">
               <span className="text-slate-600 mr-2">Next:</span> 
               {nextTitle}
             </p>
           </div>
        )}
      </div>

      {/* Upgrade Action */}
      <div className="mt-auto">
        {currentTier >= 10 ? (
          <div className="w-full py-3 text-center text-amber-500 font-bold border border-amber-500/20 rounded-lg bg-amber-950/10">
            MAX TIER REACHED
          </div>
        ) : (
          <div className="space-y-3">
             {/* Requirements List */}
             <div className="text-xs space-y-1 p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <div className="flex justify-between">
                    <span className={state.resources.roleTokens >= cost.token ? "text-emerald-500" : "text-red-500"}>
                        • Role Token: 1
                    </span>
                    <span className={state.resources[cost.resourceType] >= cost.primaryResource ? "text-emerald-500" : "text-red-500"}>
                        • {cost.resourceType}: {cost.primaryResource}
                    </span>
                </div>
                <div className={state.resources.legitimacy >= cost.legitimacyReq ? "text-emerald-500" : "text-red-500"}>
                    • Legitimacy: {cost.legitimacyReq}+
                </div>
                
                {/* Special Gate Warnings */}
                {isGated && (roleKey === 'arbitorTier' && currentTier >= 8) && (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-red-400 italic">
                        Requires: {upgradeCheck.reason}
                    </div>
                )}
             </div>

             <ShinyButton 
               onClick={() => actions.upgradeRole(roleKey)}
               disabled={isGated}
               variant={isGated ? "secondary" : "gold"}
               className="w-full flex items-center justify-center gap-2"
             >
                {isGated ? <Lock className="w-4 h-4" /> : <ArrowUpCircle className="w-4 h-4" />}
                {isGated ? "Locked" : "Promote"}
             </ShinyButton>
          </div>
        )}
      </div>
    </div>
  );
}
