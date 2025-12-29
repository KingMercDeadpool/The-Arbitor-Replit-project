import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Sword, 
  FileText, 
  Beer, 
  UserCog, 
  Globe, 
  Building2, 
  Users, 
  Settings,
  BookOpen,
  Brain,
  Timer,
  Target,
  Shield,
  Eye,
  Crown,
  Scale,
  Handshake,
  Flame,
  Lightbulb,
  Zap
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Combat", url: "/combat", icon: Sword },
  { title: "Contracts", url: "/contracts", icon: FileText },
  { title: "Tavern", url: "/tavern", icon: Beer },
  { title: "Roster", url: "/roster", icon: UserCog },
];

const worldItems = [
  { title: "World Bible", url: "/world", icon: Globe },
  { title: "Districts", url: "/districts", icon: Building2 },
  { title: "NPCs & Rivals", url: "/npcs", icon: Users },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>World Intel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {worldItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Sheet>
              <SheetTrigger asChild>
                <SidebarMenuButton tooltip="Field Manual">
                  <BookOpen />
                  <span>Field Manual</span>
                </SidebarMenuButton>
              </SheetTrigger>
              <SheetContent side="right" className="bg-slate-950 border-slate-800 text-slate-100 w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle className="text-amber-400 font-serif">Field Manual</SheetTitle>
                  <SheetDescription className="text-slate-400">
                    Essential reading for the Arbitor's mission.
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
                  <div className="space-y-8 pb-8">
                    <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold border-b border-slate-800 pb-2 mb-4">Core Systems</div>
                    
                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-blue-400">
                        <Brain className="w-5 h-5" />
                        <h3 className="font-bold">Tactical Trials</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Combat tests mental acuity, not reflexes. Answer questions about Lore, Doctrine, and Patterns to overcome foes. Each archetype has unique question pools.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-red-400">
                        <Timer className="w-5 h-5" />
                        <h3 className="font-bold">The Graduated Timer</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Time shrinks as Mastery grows: 15s at 0%, down to 8s at high Mastery. Composure comes from familiarity.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Target className="w-5 h-5" />
                        <h3 className="font-bold">Mastery & Progress</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Defeating archetypes or rivals increases your Mastery, unlocking easier timers and more tactical options against them.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-amber-400">
                        <Shield className="w-5 h-5" />
                        <h3 className="font-bold">The Injury System</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Wrong answers deal damage. At injury thresholds (25%, 50%, 75%), you gain wounds. Fleeing preserves life at the cost of pride.
                      </p>
                    </section>

                    <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold border-b border-slate-800 pb-2 mb-4 mt-8">The Four Roles</div>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-purple-400">
                        <Eye className="w-5 h-5" />
                        <h3 className="font-bold">Spymaster</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Build intelligence networks. Unlocks Shadow lane bonuses in contracts. High-tier Spymasters reveal hidden information and manipulate events unseen.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-red-400">
                        <Sword className="w-5 h-5" />
                        <h3 className="font-bold">Commander</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Project martial strength. Unlocks Steel lane bonuses and field team slots. High-tier Commanders lead armies and intimidate through reputation.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-amber-400">
                        <Crown className="w-5 h-5" />
                        <h3 className="font-bold">Steward</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Manage resources and territory. Increases Capacity gains and unlocks economic options. High-tier Stewards control supply lines and trade.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-blue-400">
                        <Scale className="w-5 h-5" />
                        <h3 className="font-bold">Arbitor</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Judge disputes and shape law. Unlocks Seal lane bonuses and legitimacy preservation. High-tier Arbitors rewrite the rules themselves.
                      </p>
                    </section>

                    <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold border-b border-slate-800 pb-2 mb-4 mt-8">Contract Lanes</div>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-purple-400">
                        <Eye className="w-5 h-5" />
                        <h3 className="font-bold">Shadow Lane</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Covert approaches. Lower Heat gain, higher Leverage yield. Requires Spymaster investment. Best when you need discretion.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-blue-400">
                        <Scale className="w-5 h-5" />
                        <h3 className="font-bold">Seal Lane</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Diplomatic approaches. Preserves Legitimacy, builds Renown. Requires Arbitor investment. Best when reputation matters.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-red-400">
                        <Sword className="w-5 h-5" />
                        <h3 className="font-bold">Steel Lane</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Forceful approaches. Fast resolution, high Heat gain. Requires Commander investment. Best when speed trumps subtlety.
                      </p>
                    </section>

                    <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold border-b border-slate-800 pb-2 mb-4 mt-8">Relationships & NPCs</div>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Handshake className="w-5 h-5" />
                        <h3 className="font-bold">The Five Metrics</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Trust, Fear, Debt, Leverage, Standing. Each NPC tracks all five. Recruitment requires thresholds in Trust or Standing. Fear controls, Leverage bargains.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-orange-400">
                        <Flame className="w-5 h-5" />
                        <h3 className="font-bold">Heat & Unrest</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Heat (0-100) measures how much attention you draw. High Heat triggers crackdowns. Unrest rises in settlements from aggressive actions.
                      </p>
                    </section>

                    <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold border-b border-slate-800 pb-2 mb-4 mt-8">Tips & Synergies</div>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-yellow-400">
                        <Lightbulb className="w-5 h-5" />
                        <h3 className="font-bold">Role Synergies</h3>
                      </div>
                      <ul className="text-sm text-slate-300 leading-relaxed space-y-2 list-disc list-inside">
                        <li><span className="text-purple-300">Spymaster + Arbitor:</span> Intelligence informs verdicts</li>
                        <li><span className="text-red-300">Commander + Steward:</span> Armies need supplies</li>
                        <li><span className="text-blue-300">Arbitor + Steward:</span> Law protects wealth</li>
                      </ul>
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-cyan-400">
                        <Zap className="w-5 h-5" />
                        <h3 className="font-bold">Quick Tips</h3>
                      </div>
                      <ul className="text-sm text-slate-300 leading-relaxed space-y-2 list-disc list-inside">
                        <li>Balance your roles - specialization limits options</li>
                        <li>Staff with bonuses amplify specific lanes</li>
                        <li>Three Marks unlock Orcish support - invest in all three</li>
                        <li>Rivals escalate over time - prepare before confronting</li>
                        <li>The Tavern offers unique recruitment opportunities</li>
                      </ul>
                    </section>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location === "/settings"} tooltip="Settings">
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
