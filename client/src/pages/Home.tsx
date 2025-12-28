import { useGameState } from "@/hooks/use-game-state";
import { ResourceBar } from "@/components/game/ResourceBar";
import { ContractSimulator } from "@/components/game/ContractSimulator";
import { RoleCard } from "@/components/game/RoleCard";
import { LogViewer } from "@/components/game/LogViewer";
import { ShinyButton } from "@/components/ui/shiny-button";
import { AlertTriangle, Info, Terminal, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function Home() {
  const { state, actions } = useGameState();

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
             <h1 className="text-2xl text-slate-100 font-serif font-bold tracking-tight">S.L.A.T.E.</h1>
             <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Kami "The Kitsune" Reiss</p>
          </div>
          
          <div className="flex gap-2">
            <DebugMenu state={state} actions={actions} />
            <ShinyButton 
               variant="ghost" 
               className="h-8 px-2 text-xs border-slate-800 hover:bg-red-950/30 hover:text-red-400"
               onClick={() => {
                 if(confirm("Reset entire progress? This cannot be undone.")) {
                   actions.resetGame();
                 }
               }}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </ShinyButton>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Resources */}
        <section className="animate-in" style={{ animationDelay: "0ms" }}>
          <ResourceBar resources={state.resources} />
        </section>

        {/* Action Loop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 animate-in" style={{ animationDelay: "100ms" }}>
             <ContractSimulator />
          </section>
          
          <section className="animate-in" style={{ animationDelay: "200ms" }}>
             <LogViewer />
          </section>
        </div>

        {/* Progression */}
        <section className="animate-in" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-bold text-slate-200 font-serif">Role Progression</h2>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RoleCard 
              roleKey="spymasterTier" 
              label="Spymaster" 
              description="Network & Intel"
              colorClass="text-purple-400"
            />
            <RoleCard 
              roleKey="commanderTier" 
              label="Commander" 
              description="War & Authority"
              colorClass="text-red-400"
            />
            <RoleCard 
              roleKey="stewardTier" 
              label="Steward" 
              description="Economy & Growth"
              colorClass="text-emerald-400"
            />
            <RoleCard 
              roleKey="arbitorTier" 
              label="Arbitor" 
              description="Law & Judgment"
              colorClass="text-amber-400"
            />
          </div>
        </section>

        {/* Footer Info */}
        <footer className="pt-12 pb-6 text-center">
            <p className="text-xs text-slate-600 font-mono">
              S.L.A.T.E. Sandbox Prototype v0.1 • Local Storage Persistence Active
            </p>
        </footer>
      </main>
    </div>
  );
}

function DebugMenu({ state, actions }: any) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <ShinyButton variant="secondary" className="h-8 px-3 text-xs flex items-center gap-1">
          <Terminal className="w-3 h-3" />
          Debug
        </ShinyButton>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-500 font-mono">Developer Override Console</DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Toggle hidden flags to test Arbitor Gates.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4 py-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase">Progression Flags</h4>
            
            <DebugToggle 
              label="Credibility Crisis Survived" 
              checked={state.flags.credibilityCrisisSurvived}
              onChange={() => actions.toggleFlag("credibilityCrisisSurvived")}
              desc="Unlocks Arbitor Tier 9 (requires Tier 8 reached)"
            />
            
            <DebugToggle 
              label="Continent Ruling Succeeded" 
              checked={state.flags.continentRulingSucceeded}
              onChange={() => actions.toggleFlag("continentRulingSucceeded")}
              desc="Unlocks Arbitor Tier 10"
            />
            
            <DebugToggle 
              label="Watchdog Framework" 
              checked={state.flags.watchdogFrameworkEstablished}
              onChange={() => actions.toggleFlag("watchdogFrameworkEstablished")}
              desc="Unlocks Arbitor Tier 10"
            />
            
            <DebugToggle 
              label="Gray Scenario Resolved" 
              checked={state.flags.grayScenarioResolvedCleanly}
              onChange={() => actions.toggleFlag("grayScenarioResolvedCleanly")}
              desc="Unlocks Arbitor Tier 10"
            />

            <h4 className="text-xs font-bold text-slate-500 uppercase mt-6">Penalty Flags</h4>
            
            <DebugToggle 
              label="Hard Line Violated" 
              checked={state.flags.hardLineViolated}
              onChange={() => actions.toggleFlag("hardLineViolated")}
              desc="Permanently blocks Arbitor Tier 9"
              destructive
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function DebugToggle({ label, checked, onChange, desc, destructive }: any) {
  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg border border-slate-800 bg-slate-950/50">
      <Checkbox 
        id={label} 
        checked={checked} 
        onCheckedChange={onChange}
        className={destructive ? "data-[state=checked]:bg-red-500 border-red-900" : "data-[state=checked]:bg-amber-500 border-amber-900"}
      />
      <div className="grid gap-1.5 leading-none">
        <Label 
          htmlFor={label}
          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${destructive ? "text-red-400" : "text-slate-200"}`}
        >
          {label}
        </Label>
        <p className="text-xs text-slate-500">
          {desc}
        </p>
      </div>
    </div>
  );
}
