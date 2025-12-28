import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import WorldBible from "@/pages/WorldBible";
import Districts from "@/pages/Districts";
import NPCEngine from "@/pages/NPCEngine";
import Combat from "@/pages/Combat";
import Contracts from "@/pages/Contracts";
import Tavern from "@/pages/Tavern";
import Roster from "@/pages/Roster";
import NotFound from "@/pages/not-found";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useGameState } from "@/hooks/use-game-state";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/world" component={WorldBible} />
      <Route path="/districts" component={Districts} />
      <Route path="/npcs" component={NPCEngine} />
      <Route path="/combat" component={Combat} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/tavern" component={Tavern} />
      <Route path="/roster" component={Roster} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={100}>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex min-h-screen w-full bg-slate-950">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <header className="h-14 border-b border-slate-800 flex items-center px-4 gap-4 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50 lg:hidden">
                <SidebarTrigger />
                <span className="text-sm font-serif font-bold text-slate-200">Arbitor</span>
              </header>
              <main className="flex-1 overflow-auto">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
