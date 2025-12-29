import { useState, useMemo } from "react";
import { ShieldAlert, ShieldCheck, Users, EyeOff, AlertTriangle, Eye, Scale, Sword, Scroll } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGameState } from "@/hooks/use-game-state";
import { motion, AnimatePresence } from "framer-motion";

const SCENE_DESCRIPTIONS = [
  "A cloaked messenger arrives with a sealed letter. The wax bears no sigil you recognize.",
  "Whispers in the market speak of a merchant who needs... discrete assistance.",
  "The local magistrate has a problem that cannot appear in official records.",
  "A noble's servant approaches you in the shadow of the temple steps.",
  "An old contact resurfaces with urgent news and a dangerous proposition.",
  "The dockmaster owes debts to parties who don't accept excuses.",
  "A rival faction's supply wagon has been spotted taking an unusual route.",
  "The garrison commander needs something retrieved before dawn.",
];

const LANE_PROMPTS = {
  SHADOW: [
    "Slip past the guards under cover of night",
    "Plant evidence that points elsewhere",
    "Intercept the message before it reaches its destination",
    "Bribe the servant to look the other way",
  ],
  SEAL: [
    "Invoke ancient treaty rights to demand cooperation",
    "Present forged credentials that grant authority",
    "Negotiate a compromise that satisfies all parties",
    "Appeal to shared interests and mutual benefit",
  ],
  STEEL: [
    "Make an example that others will remember",
    "Storm the compound before they can react",
    "Challenge their champion to single combat",
    "Deploy your forces to secure the perimeter",
  ],
};

export function ContractSimulator() {
  const { actions, state } = useGameState();
  const [hardLine, setHardLine] = useState(true);
  const [selectedLane, setSelectedLane] = useState<"SHADOW" | "SEAL" | "STEEL" | null>(null);

  const currentScene = useMemo(() => {
    const idx = state.resources.contractStepsCompleted % SCENE_DESCRIPTIONS.length;
    return SCENE_DESCRIPTIONS[idx];
  }, [state.resources.contractStepsCompleted]);

  const lanePrompt = useMemo(() => {
    if (!selectedLane) return null;
    const prompts = LANE_PROMPTS[selectedLane];
    const idx = state.resources.contractStepsCompleted % prompts.length;
    return prompts[idx];
  }, [selectedLane, state.resources.contractStepsCompleted]);

  const handleContract = (type: any) => {
    actions.completeContract(type, hardLine);
    setSelectedLane(null);
  };

  const getContractTypeForLane = (lane: "SHADOW" | "SEAL" | "STEEL") => {
    switch (lane) {
      case "SHADOW": return "COVERT";
      case "SEAL": return "CLEAN";
      case "STEEL": return "GRAY";
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/10 rounded-full blur-3xl -z-10" />

      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-serif tracking-wide">Contract Simulator</h2>
          <p className="text-slate-500 text-sm mt-1">Choose your approach to complete the step.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
           <div className="text-xs font-mono text-slate-500">
             STEP {(state.resources.contractStepsCompleted % 3) + 1}/3
           </div>
           <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${((state.resources.contractStepsCompleted % 3) + 1) * 33.33}%` }} 
              />
           </div>
        </div>
      </div>

      <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 mb-6">
        <div className="flex items-start gap-3">
          <Scroll className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300 italic leading-relaxed">{currentScene}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <LaneButton 
          lane="SHADOW"
          icon={Eye}
          label="Shadow"
          desc="Covert"
          isSelected={selectedLane === "SHADOW"}
          onClick={() => setSelectedLane(selectedLane === "SHADOW" ? null : "SHADOW")}
        />
        <LaneButton 
          lane="SEAL"
          icon={Scale}
          label="Seal"
          desc="Diplomatic"
          isSelected={selectedLane === "SEAL"}
          onClick={() => setSelectedLane(selectedLane === "SEAL" ? null : "SEAL")}
        />
        <LaneButton 
          lane="STEEL"
          icon={Sword}
          label="Steel"
          desc="Force"
          isSelected={selectedLane === "STEEL"}
          onClick={() => setSelectedLane(selectedLane === "STEEL" ? null : "STEEL")}
        />
      </div>

      <AnimatePresence mode="wait">
        {selectedLane && lanePrompt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-4">
              <p className="text-sm text-slate-200 mb-3">
                <span className="text-slate-400">Your approach:</span> {lanePrompt}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleContract(getContractTypeForLane(selectedLane))}
                className="w-full py-2 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold text-sm transition-colors"
                data-testid={`button-execute-${selectedLane.toLowerCase()}`}
              >
                Execute Step
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-xs text-slate-500 mb-4 text-center">
        Or use quick contracts:
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <ContractButton 
          title="Public" 
          desc="++Renown" 
          icon={Users}
          color="amber"
          onClick={() => handleContract("PUBLIC")}
        />
        <ContractButton 
          title="Gray" 
          desc="++Capacity, Risk" 
          icon={ShieldAlert}
          color="slate"
          onClick={() => handleContract("GRAY")}
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

function LaneButton({ lane, icon: Icon, label, desc, isSelected, onClick }: {
  lane: string;
  icon: any;
  label: string;
  desc: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const colors: Record<string, { base: string; selected: string }> = {
    SHADOW: { 
      base: "border-purple-900/50 text-purple-400", 
      selected: "bg-purple-900/50 border-purple-700" 
    },
    SEAL: { 
      base: "border-blue-900/50 text-blue-400", 
      selected: "bg-blue-900/50 border-blue-700" 
    },
    STEEL: { 
      base: "border-red-900/50 text-red-400", 
      selected: "bg-red-900/50 border-red-700" 
    },
  };

  const style = colors[lane];

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        p-3 rounded-lg border text-center transition-all
        ${isSelected ? style.selected : `bg-slate-900/50 ${style.base}`}
      `}
      data-testid={`button-lane-${lane.toLowerCase()}`}
    >
      <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? "text-white" : ""}`} />
      <div className={`text-sm font-bold ${isSelected ? "text-white" : ""}`}>{label}</div>
      <div className="text-xs text-slate-500">{desc}</div>
    </motion.button>
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
        relative p-3 rounded-lg border text-left transition-all
        flex items-center gap-2 group
        ${colors[color]}
      `}
      data-testid={`button-contract-${title.toLowerCase()}`}
    >
      <Icon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
      <div>
        <span className="font-serif font-bold text-sm">{title}</span>
        <span className="text-xs opacity-70 font-mono ml-2">{desc}</span>
      </div>
    </motion.button>
  );
}
