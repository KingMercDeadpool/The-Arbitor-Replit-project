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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={100}>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
