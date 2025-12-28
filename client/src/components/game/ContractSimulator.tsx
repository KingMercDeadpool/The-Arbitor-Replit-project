import { useState } from "react";
import { ShieldAlert, ShieldCheck, Users, EyeOff, AlertTriangle } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGameState } from "@/hooks/use-game-state";
import { motion } from "framer-motion";

export function ContractSimulator() {
  const { actions, state } = useGameState();
  const [hardLine, setHardLine] = useState(true);

  const handleContract = (type: any) => {
    actions.completeContract(type, hardLine);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/10 rounded-full blur-3xl -z-10" />

      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-serif tracking-wide">Contract Simulator</h2>
          <p className="text-slate-500 text-sm mt-1">Execute steps to earn resources & tokens.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
           <div className="text-xs font-mono text-slate-500">
             STEPS: {state.resources.contractStepsCompleted % 3}/3
           </div>
           <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${(state.resources.contractStepsCompleted % 3) * 33.33}%` }} 
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <ContractButton 
          title="Clean" 
          desc="+Legitimacy, +Leverage" 
          icon={ShieldCheck}
          color="emerald"
          onClick={() => handleContract("CLEAN")}
        />
        <ContractButton 
          title="Gray" 
          desc="++Leverage, ++Capacity, Risk Legitimacy" 
          icon={ShieldAlert}
          color="slate"
          onClick={() => handleContract("GRAY")}
        />
        <ContractButton 
          title="Public" 
          desc="++Renown, RNG Legitimacy" 
          icon={Users}
          color="amber"
          onClick={() => handleContract("PUBLIC")}
        />
        <ContractButton 
          title="Covert" 
          desc="+++Leverage, --Legitimacy Risk" 
          icon={EyeOff}
          color="purple"
          onClick={() => handleContract("COVERT")}
        />
      </div>

      <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <Switch 
            id="hard-line" 
            checked={hardLine} 
            onCheckedChange={setHardLine}
            disabled={state.flags.hardLineViolated}
            className="data-[state=unchecked]:bg-red-900"
          />
          <div>
            <Label htmlFor="hard-line" className="text-slate-200 font-medium cursor-pointer">
              Hard Line Compliant
            </Label>
            <p className="text-xs text-slate-500">
              {state.flags.hardLineViolated 
                ? "VIOLATED. Moral code broken." 
                : "Prevents severe legitimacy penalties."}
            </p>
          </div>
        </div>
        {!hardLine && !state.flags.hardLineViolated && (
          <div className="flex items-center gap-1 text-red-400 text-xs font-bold animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            WARNING
          </div>
        )}
      </div>
    </div>
  );
}

function ContractButton({ title, desc, icon: Icon, color, onClick }: any) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-950/30 border-emerald-900/50 hover:bg-emerald-900/50 text-emerald-100",
    slate: "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 text-slate-200",
    amber: "bg-amber-950/30 border-amber-900/50 hover:bg-amber-900/50 text-amber-100",
    purple: "bg-purple-950/30 border-purple-900/50 hover:bg-purple-900/50 text-purple-100",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border text-left transition-all
        flex flex-col gap-2 group
        ${colors[color]}
      `}
    >
      <div className="flex items-center justify-between w-full">
        <span className="font-serif font-bold tracking-wide">{title}</span>
        <Icon className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>
      <span className="text-xs opacity-70 font-mono leading-tight">{desc}</span>
    </motion.button>
  );
}
