import { GameState } from "@shared/schema";
import { Shield, Crown, Briefcase, Zap, Diamond } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ResourceBarProps {
  resources: GameState["resources"];
}

export function ResourceBar({ resources }: ResourceBarProps) {
  const items = [
    { 
      label: "Renown", 
      value: resources.renown, 
      icon: Crown, 
      color: "text-amber-400",
      desc: "Prestige & Fame. Used for Arbitor/Politics."
    },
    { 
      label: "Leverage", 
      value: resources.leverage, 
      icon: Briefcase, 
      color: "text-purple-400",
      desc: "Blackmail & Intel. Used for Spymaster."
    },
    { 
      label: "Capacity", 
      value: resources.capacity, 
      icon: Zap, 
      color: "text-blue-400",
      desc: "Manpower & Logistics. Used for Commander/Steward."
    },
    { 
      label: "Legitimacy", 
      value: resources.legitimacy, 
      icon: Shield, 
      color: resources.legitimacy < 30 ? "text-red-500" : "text-emerald-400",
      desc: "Public Trust. A critical gate for all progress."
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {items.map((item) => (
        <Tooltip key={item.label}>
          <TooltipTrigger asChild>
            <div className="bg-slate-900/80 border border-white/5 p-3 rounded-xl flex items-center justify-between shadow-lg backdrop-blur-md transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-2">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  {item.label}
                </span>
              </div>
              <span className={`text-lg font-bold font-mono ${item.color}`}>
                {item.value}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-950 border-slate-800 text-slate-200">
            <p>{item.desc}</p>
          </TooltipContent>
        </Tooltip>
      ))}
      
      {/* Role Tokens Badge - Floating or part of grid? Let's put it in a separate prominent place usually, but here is fine for mobile grid */}
       <div className="col-span-2 md:col-span-4 mt-2">
         <div className="bg-gradient-to-r from-amber-900/20 to-slate-900 border border-amber-500/20 p-2 rounded-lg flex items-center justify-center gap-3">
            <Diamond className="w-4 h-4 text-amber-200 animate-pulse" />
            <span className="text-sm text-amber-100 font-medium">
              Role Tokens Available: <span className="font-bold text-amber-400 text-lg ml-1">{resources.roleTokens}</span>
            </span>
         </div>
       </div>
    </div>
  );
}
