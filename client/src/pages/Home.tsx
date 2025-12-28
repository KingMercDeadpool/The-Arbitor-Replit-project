import { useGameState } from "@/hooks/use-game-state";
import { ResourceBar } from "@/components/game/ResourceBar";
import { ContractSimulator } from "@/components/game/ContractSimulator";
import { RoleCard } from "@/components/game/RoleCard";
import { LogViewer } from "@/components/game/LogViewer";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Terminal, RotateCcw, Globe, Building2, Users, Shield, ChevronRight, Sword, FileText, Beer, UserCog, Flame, Activity } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  const { state, actions } = useGameState();

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
             <h1 className="text-xl text-slate-100 font-serif font-bold tracking-tight">The Arbitor of the Mainland</h1>
             <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">v0.7 • Kami "The Kitsune" Reiss</p>
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
               data-testid="button-reset"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </ShinyButton>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Navigation Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/world">
            <Card className="bg-slate-900 border-slate-800 hover-elevate cursor-pointer group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="font-medium text-slate-200">World Bible</p>
                    <p className="text-xs text-slate-500">5 biomes, 20 settlements</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/districts">
            <Card className="bg-slate-900 border-slate-800 hover-elevate cursor-pointer group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="font-medium text-slate-200">Districts</p>
                    <p className="text-xs text-slate-500">Communities & markets</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/npcs">
            <Card className="bg-slate-900 border-slate-800 hover-elevate cursor-pointer group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="font-medium text-slate-200">NPCs & Rivals</p>
                    <p className="text-xs text-slate-500">{state.world.recruitedNpcs.length} recruited</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* Part 5-7 Navigation Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/combat">
            <Card className="bg-slate-900 border-slate-800 hover-elevate cursor-pointer group">
              <CardContent className="p-4">
                <Sword className="w-5 h-5 text-red-400 mb-2" />
                <p className="font-medium text-slate-200 text-sm">Combat</p>
                <p className="text-xs text-slate-500">Arena & Pits</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/contracts">
            <Card className="bg-slate-900 border-slate-800 hover-elevate cursor-pointer group">
              <CardContent className="p-4">
                <FileText className="w-5 h-5 text-amber-400 mb-2" />
                <p className="font-medium text-slate-200 text-sm">Contracts</p>
                <p className="text-xs text-slate-500">{(state.activeContracts?.length || 0)}/5 active</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/tavern">
            <Card className="bg-slate-900 border-slate-800 hover-elevate cursor-pointer group">
              <CardContent className="p-4">
                <Beer className="w-5 h-5 text-orange-400 mb-2" />
                <p className="font-medium text-slate-200 text-sm">Tavern</p>
                <p className="text-xs text-slate-500">Social hub</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/roster">
            <Card className="bg-slate-900 border-slate-800 hover-elevate cursor-pointer group">
              <CardContent className="p-4">
                <UserCog className="w-5 h-5 text-blue-400 mb-2" />
                <p className="font-medium text-slate-200 text-sm">Roster</p>
                <p className="text-xs text-slate-500">{(state.roster?.length || 0)} staff</p>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* Heat & Injury Quick View */}
        <section className="grid grid-cols-2 gap-3">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-slate-300">Heat</span>
                <span className="text-xs text-slate-500 ml-auto">{state.meters?.heat || 0}%</span>
              </div>
              <Progress value={state.meters?.heat || 0} className="h-1.5" />
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-slate-300">Injury</span>
                <span className="text-xs text-slate-500 ml-auto">{state.injury?.level || 0}/5</span>
              </div>
              <Progress value={((5 - (state.injury?.level || 0)) / 5) * 100} className="h-1.5" />
            </CardContent>
          </Card>
        </section>

        {/* Resources */}
        <section className="animate-in" style={{ animationDelay: "0ms" }}>
          <ResourceBar resources={state.resources} />
        </section>

        {/* Three Marks Quick View */}
        <section className="animate-in" style={{ animationDelay: "50ms" }}>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-slate-300">Three Marks (Orc Legitimacy)</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Strength</span>
                    <span className="text-red-400">{state.world.threeMarks.strength}</span>
                  </div>
                  <Progress value={state.world.threeMarks.strength} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Mind</span>
                    <span className="text-blue-400">{state.world.threeMarks.mind}</span>
                  </div>
                  <Progress value={state.world.threeMarks.mind} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Stewardship</span>
                    <span className="text-emerald-400">{state.world.threeMarks.stewardship}</span>
                  </div>
                  <Progress value={state.world.threeMarks.stewardship} className="h-1.5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Special Counters */}
        <section className="grid grid-cols-2 gap-3 animate-in" style={{ animationDelay: "75ms" }}>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-purple-400">{state.counters.proofChains}</p>
              <p className="text-xs text-slate-500">Proof Chains</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{state.counters.settlementSupport}</p>
              <p className="text-xs text-slate-500">Settlement Support</p>
            </CardContent>
          </Card>
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
              The Arbitor of the Mainland v0.7 • Local Storage Persistence Active
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
        <ShinyButton variant="secondary" className="h-8 px-3 text-xs flex items-center gap-1" data-testid="button-debug">
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
        
        <ScrollArea className="h-[400px] pr-4">
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

            <h4 className="text-xs font-bold text-slate-500 uppercase mt-6">Quick Add Resources</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => actions.addResources({ renown: 10 })}
              >
                +10 Renown
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => actions.addResources({ leverage: 10 })}
              >
                +10 Leverage
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => actions.addResources({ capacity: 10 })}
              >
                +10 Capacity
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => actions.addResources({ roleTokens: 5 })}
              >
                +5 Tokens
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => actions.addResources({ legitimacy: 10 })}
              >
                +10 Legitimacy
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => actions.modifyThreeMarks({ strength: 10, mind: 10, stewardship: 10 })}
              >
                +10 All Marks
              </Button>
            </div>
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
