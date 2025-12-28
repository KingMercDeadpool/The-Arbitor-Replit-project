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
  Shield
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
                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-blue-400">
                        <Brain className="w-5 h-5" />
                        <h3 className="font-bold">Tactical Trials</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Combat is a test of mental acuity. Instead of physical moves, you must answer questions about Lore, Doctrine, and Patterns to overcome foes.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-red-400">
                        <Timer className="w-5 h-5" />
                        <h3 className="font-bold">The Graduated Timer</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Time is your most precious resource. As your Mastery grows, you gain more composure (longer timers), but you must still act decisively.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Target className="w-5 h-5" />
                        <h3 className="font-bold">Mastery & Progress</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Defeating specific archetypes or rivals increases your Mastery over them. This represents your growing network of informants and tactical databases.
                      </p>
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-amber-400">
                        <Shield className="w-5 h-5" />
                        <h3 className="font-bold">The Injury System</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Failure isn't final, but it is costly. Accumulated mistakes lead to injuries. Fleeing preserves your life at the cost of pride and minor wounds.
                      </p>
                    </section>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
