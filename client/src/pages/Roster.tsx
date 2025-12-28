import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGameState } from "@/hooks/use-game-state";
import { 
  ArrowLeft, Users, Shield, Briefcase, Building2, User,
  Swords, AlertTriangle, Heart, DollarSign, Eye, FileText, Scale, Wrench
} from "lucide-react";
import { ALL_NPCS } from "@/lib/world-data";
import { STAFF_ROLES } from "@shared/schema";
import type { StaffRole, RosterSlot, Recruit, BetrayalRisk } from "@shared/schema";

const SLOT_ICONS = {
  OPS: Swords,
  STAFF: Briefcase,
  CADRE: Shield,
  DISTRICT_ASSET: Building2,
};

const STAFF_ROLE_ICONS: Record<StaffRole, typeof Eye> = {
  SCOUT: Eye,
  BROKER: DollarSign,
  DELEGATE: Scale,
  QUARTERMASTER: Wrench,
  INSTRUCTOR: Swords,
  SCRIBE: FileText,
  HANDLER: User,
  RECRUITER: Users,
};

const BETRAYAL_COLORS: Record<BetrayalRisk, string> = {
  LOW: "text-green-500",
  MEDIUM: "text-amber-500",
  HIGH: "text-red-500",
};

export default function Roster() {
  const { state, actions } = useGameState();
  const [selectedRecruit, setSelectedRecruit] = useState<string | null>(null);
  const [assigningStaffRole, setAssigningStaffRole] = useState(false);

  const roster = state.roster || [];
  const fieldTeamIds = state.fieldTeamIds || [];
  const fieldTeamMax = state.fieldTeamMaxSize || 4;
  const army = state.army || { garrison: 0, readiness: 50, supply: 50, discipline: 50 };
  const staffBonuses = actions.getStaffBonuses();

  const getRecruitsBySlot = (slot: RosterSlot) => roster.filter(r => r.slot === slot);
  const getNpc = (npcId: string) => ALL_NPCS.find(n => n.id === npcId);

  const handleAssignSlot = (npcId: string, slot: RosterSlot) => {
    actions.assignToRoster(npcId, slot);
    setSelectedRecruit(null);
    setAssigningStaffRole(false);
  };

  const handleAssignStaffRole = (npcId: string, role: StaffRole) => {
    actions.assignToRoster(npcId, "STAFF", role);
    setAssigningStaffRole(false);
  };

  const handleToggleFieldTeam = (npcId: string) => {
    if (fieldTeamIds.includes(npcId)) {
      actions.removeFromFieldTeam(npcId);
    } else {
      actions.addToFieldTeam(npcId);
    }
  };

  const handleBetrayalPrevention = (npcId: string, method: "PAY" | "OATH" | "TRANSPARENCY" | "ROTATE") => {
    actions.applyBetrayalPrevention(npcId, method);
  };

  const selectedNpc = selectedRecruit ? getNpc(selectedRecruit) : null;
  const selectedRecruitData = selectedRecruit ? roster.find(r => r.npcId === selectedRecruit) : null;

  return (
    <div className="min-h-screen bg-background p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Roster & Army</h1>
      </div>

      {/* Staff Bonuses Overview */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <Eye className="h-5 w-5 mx-auto text-purple-500" />
              <span className="text-sm font-medium">Shadow +{staffBonuses.shadow}%</span>
            </div>
            <div>
              <Scale className="h-5 w-5 mx-auto text-amber-500" />
              <span className="text-sm font-medium">Seal +{staffBonuses.seal}%</span>
            </div>
            <div>
              <Swords className="h-5 w-5 mx-auto text-red-500" />
              <span className="text-sm font-medium">Steel +{staffBonuses.steel}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="field" className="mb-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="field">Field</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="roster">All</TabsTrigger>
          <TabsTrigger value="army">Army</TabsTrigger>
        </TabsList>

        {/* Field Team Tab */}
        <TabsContent value="field">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Swords className="h-5 w-5" />
                Field Team ({fieldTeamIds.length + 1}/{fieldTeamMax})
              </CardTitle>
              <CardDescription>Active combat team. Kami always leads.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Kami (always present) */}
              <div className="p-3 rounded bg-muted mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="font-medium">Kami "The Kitsune" Reiss</span>
                  <Badge className="ml-auto">Leader</Badge>
                </div>
              </div>

              {/* Team Members */}
              {fieldTeamIds.map(npcId => {
                const npc = getNpc(npcId);
                if (!npc) return null;
                return (
                  <div key={npcId} className="p-3 rounded bg-muted mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{npc.name}</span>
                      <Badge variant="outline" className="text-xs">{npc.role}</Badge>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleToggleFieldTeam(npcId)}
                      data-testid={`remove-field-${npcId}`}
                    >
                      Remove
                    </Button>
                  </div>
                );
              })}

              {/* Upgrade Button */}
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => actions.upgradeFieldTeamSize()}
                data-testid="upgrade-field-size"
              >
                Upgrade Team Size (Requires Tier Milestones)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Staff Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getRecruitsBySlot("STAFF").map(recruit => {
                  const npc = getNpc(recruit.npcId);
                  if (!npc) return null;
                  const Icon = recruit.staffRole ? STAFF_ROLE_ICONS[recruit.staffRole] : Briefcase;
                  return (
                    <div 
                      key={recruit.npcId} 
                      className="p-3 rounded bg-muted flex items-center justify-between"
                      onClick={() => setSelectedRecruit(recruit.npcId)}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{npc.name}</span>
                        {recruit.staffRole && (
                          <Badge className="text-xs">{recruit.staffRole}</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {recruit.staffRole ? STAFF_ROLES[recruit.staffRole].bonus.split(",")[0] : "Unassigned"}
                      </span>
                    </div>
                  );
                })}

                {getRecruitsBySlot("STAFF").length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No staff assigned. Promote recruits from the roster.
                  </p>
                )}
              </div>

              {/* Staff Roles Reference */}
              <div className="mt-4 pt-4 border-t">
                <span className="text-xs font-semibold text-muted-foreground">Available Roles:</span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(Object.keys(STAFF_ROLES) as StaffRole[]).map(role => {
                    const Icon = STAFF_ROLE_ICONS[role];
                    return (
                      <div key={role} className="flex items-center gap-1 text-xs">
                        <Icon className="h-3 w-3" />
                        <span>{role}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Roster Tab */}
        <TabsContent value="roster">
          <Card>
            <CardHeader>
              <CardTitle>All Recruits ({roster.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {roster.map(recruit => {
                  const npc = getNpc(recruit.npcId);
                  if (!npc) return null;
                  const SlotIcon = SLOT_ICONS[recruit.slot];
                  const betrayalRisk = actions.getBetrayalRisk(recruit.npcId);
                  const inField = fieldTeamIds.includes(recruit.npcId);
                  
                  return (
                    <div 
                      key={recruit.npcId} 
                      className="p-3 rounded bg-muted cursor-pointer hover-elevate"
                      onClick={() => setSelectedRecruit(recruit.npcId)}
                      data-testid={`recruit-${recruit.npcId}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SlotIcon className="h-4 w-4" />
                          <span className="font-medium">{npc.name}</span>
                          <Badge variant="outline" className="text-xs">{recruit.slot}</Badge>
                          {inField && <Badge className="text-xs">Field</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          {betrayalRisk !== "LOW" && (
                            <AlertTriangle className={`h-4 w-4 ${BETRAYAL_COLORS[betrayalRisk]}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {roster.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No one recruited yet. Visit NPCs to recruit them.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Army Tab */}
        <TabsContent value="army">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Army Forces
              </CardTitle>
              <CardDescription>Garrison: {army.garrison}/900 (v0.7 cap)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Readiness</span>
                    <span className="text-sm text-muted-foreground">{army.readiness}%</span>
                  </div>
                  <Progress value={army.readiness} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Supply</span>
                    <span className="text-sm text-muted-foreground">{army.supply}%</span>
                  </div>
                  <Progress value={army.supply} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Discipline</span>
                    <span className="text-sm text-muted-foreground">{army.discipline}%</span>
                  </div>
                  <Progress value={army.discipline} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button 
                    size="sm"
                    onClick={() => actions.recruitGarrison(10)}
                    disabled={state.resources.capacity < 20}
                    data-testid="recruit-garrison-10"
                  >
                    Recruit 10 (20 Cap)
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => actions.recruitGarrison(50)}
                    disabled={state.resources.capacity < 100}
                    data-testid="recruit-garrison-50"
                  >
                    Recruit 50 (100 Cap)
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => actions.modifyArmy({ supply: 10 })}
                    data-testid="resupply"
                  >
                    Resupply
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => actions.modifyArmy({ discipline: 10 })}
                    data-testid="drill"
                  >
                    Drill Troops
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Recruit Detail Modal */}
      {selectedNpc && selectedRecruitData && (
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedNpc.name}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => { setSelectedRecruit(null); setAssigningStaffRole(false); }}
              >
                Close
              </Button>
            </div>
            <CardDescription>{selectedNpc.role} - {selectedNpc.ancestry}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Current Assignment */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-muted-foreground">Current Assignment</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge>{selectedRecruitData.slot}</Badge>
                {selectedRecruitData.staffRole && (
                  <Badge variant="secondary">{selectedRecruitData.staffRole}</Badge>
                )}
              </div>
            </div>

            {/* Betrayal Risk */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-muted-foreground">Betrayal Risk</span>
              <div className="flex items-center gap-2 mt-1">
                <AlertTriangle className={`h-4 w-4 ${BETRAYAL_COLORS[actions.getBetrayalRisk(selectedNpc.id)]}`} />
                <span className={BETRAYAL_COLORS[actions.getBetrayalRisk(selectedNpc.id)]}>
                  {actions.getBetrayalRisk(selectedNpc.id)}
                </span>
              </div>
              {actions.getBetrayalRisk(selectedNpc.id) !== "LOW" && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => handleBetrayalPrevention(selectedNpc.id, "PAY")}>
                    Pay/Support
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBetrayalPrevention(selectedNpc.id, "OATH")}>
                    Oath-Sigil
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBetrayalPrevention(selectedNpc.id, "TRANSPARENCY")}>
                    Transparency
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBetrayalPrevention(selectedNpc.id, "ROTATE")}>
                    Rotate Duty
                  </Button>
                </div>
              )}
            </div>

            {/* Reassign */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-muted-foreground">Reassign To</span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => handleAssignSlot(selectedNpc.id, "OPS")}>
                  Ops
                </Button>
                <Button size="sm" variant="outline" onClick={() => setAssigningStaffRole(true)}>
                  Staff
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAssignSlot(selectedNpc.id, "CADRE")}>
                  Cadre
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAssignSlot(selectedNpc.id, "DISTRICT_ASSET")}>
                  District
                </Button>
              </div>
            </div>

            {/* Staff Role Assignment */}
            {assigningStaffRole && (
              <div className="mb-4">
                <span className="text-xs font-semibold text-muted-foreground">Choose Staff Role</span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(Object.keys(STAFF_ROLES) as StaffRole[]).map(role => (
                    <Button 
                      key={role}
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAssignStaffRole(selectedNpc.id, role)}
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Field Team Toggle */}
            <Button 
              className="w-full"
              variant={fieldTeamIds.includes(selectedNpc.id) ? "destructive" : "default"}
              onClick={() => handleToggleFieldTeam(selectedNpc.id)}
              disabled={!fieldTeamIds.includes(selectedNpc.id) && fieldTeamIds.length >= fieldTeamMax - 1}
            >
              {fieldTeamIds.includes(selectedNpc.id) ? "Remove from Field Team" : "Add to Field Team"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
