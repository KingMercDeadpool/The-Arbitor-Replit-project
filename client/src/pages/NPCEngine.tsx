import { useState } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ALL_NPCS,
  TRAVELERS,
  RIVALS,
  DISTRICTS,
  getNPCsByDistrict
} from "@/lib/world-data";
import type { NPC, Rival, Relationship } from "@shared/schema";
import { 
  Users, 
  UserPlus, 
  Swords,
  MessageCircle,
  Coins,
  AlertTriangle,
  Heart,
  Shield,
  Scale,
  Eye,
  Star,
  Footprints,
  CheckCircle,
  XCircle,
  TrendingUp
} from "lucide-react";
import { Link } from "wouter";

function RelationshipBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percentage = Math.abs(value) / max * 100;
  const isNegative = value < 0;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className={`font-mono ${isNegative ? 'text-red-400' : color}`}>
          {isNegative ? value : `+${value}`}
        </span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${isNegative ? 'bg-red-500' : color.replace('text-', 'bg-')}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  );
}

function NPCCard({ npc, onInteract }: { npc: NPC; onInteract: (npcId: string) => void }) {
  const { state, actions } = useGameState();
  const relationship = actions.getRelationship(npc.id);
  const recruitCheck = actions.canRecruitNpc(npc.id);
  const isRecruited = state.world.recruitedNpcs.includes(npc.id);

  const roleColors: Record<string, string> = {
    MERCHANT: "text-amber-400",
    INFORMANT: "text-purple-400",
    GUARD: "text-red-400",
    ARTISAN: "text-orange-400",
    SCHOLAR: "text-blue-400",
    PRIEST: "text-cyan-400",
    CRIMINAL: "text-slate-400",
    NOBLE: "text-yellow-400",
    TRAVELER: "text-green-400",
  };

  return (
    <Card className={`bg-slate-950 border-slate-800 ${isRecruited ? 'border-l-2 border-l-emerald-500' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-200 truncate">{npc.name}</span>
              <Badge variant="outline" className={`text-[10px] ${roleColors[npc.role] || 'text-slate-400'}`}>
                {npc.role}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {npc.ancestry}
              </Badge>
              {npc.isTraveler && (
                <Badge className="bg-green-900/50 text-green-300 text-[10px]">
                  <Footprints className="w-3 h-3 mr-1" />
                  Traveler
                </Badge>
              )}
              {isRecruited && (
                <Badge className="bg-emerald-900 text-emerald-300 text-[10px]">
                  <UserPlus className="w-3 h-3 mr-1" />
                  Recruited
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{npc.description}</p>
            
            {/* Relationship Summary */}
            <div className="grid grid-cols-5 gap-1 mt-2">
              <div className="text-center">
                <Heart className={`w-3 h-3 mx-auto ${relationship.trust > 0 ? 'text-pink-400' : 'text-slate-600'}`} />
                <span className="text-[10px] text-slate-500">{relationship.trust}</span>
              </div>
              <div className="text-center">
                <AlertTriangle className={`w-3 h-3 mx-auto ${relationship.fear > 0 ? 'text-amber-400' : 'text-slate-600'}`} />
                <span className="text-[10px] text-slate-500">{relationship.fear}</span>
              </div>
              <div className="text-center">
                <Coins className={`w-3 h-3 mx-auto ${relationship.debt !== 0 ? 'text-yellow-400' : 'text-slate-600'}`} />
                <span className="text-[10px] text-slate-500">{relationship.debt}</span>
              </div>
              <div className="text-center">
                <Eye className={`w-3 h-3 mx-auto ${relationship.leverage > 0 ? 'text-purple-400' : 'text-slate-600'}`} />
                <span className="text-[10px] text-slate-500">{relationship.leverage}</span>
              </div>
              <div className="text-center">
                <Star className={`w-3 h-3 mx-auto ${relationship.standing > 0 ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span className="text-[10px] text-slate-500">{relationship.standing}</span>
              </div>
            </div>
          </div>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onInteract(npc.id)}
            data-testid={`button-interact-${npc.id}`}
          >
            Interact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NPCInteractionDialog({ npcId, open, onClose }: { npcId: string | null; open: boolean; onClose: () => void }) {
  const { state, actions } = useGameState();
  const npc = ALL_NPCS.find(n => n.id === npcId);
  
  if (!npc) return null;
  
  const relationship = actions.getRelationship(npc.id);
  const recruitCheck = actions.canRecruitNpc(npc.id);
  const isRecruited = state.world.recruitedNpcs.includes(npc.id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-400">{npc.name}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {npc.ancestry} {npc.role}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-slate-300">{npc.description}</p>
          
          {/* Relationship Details */}
          <div className="space-y-2 bg-slate-950 p-3 rounded-lg">
            <h4 className="text-xs font-bold text-slate-500 uppercase">Relationship</h4>
            <RelationshipBar label="Trust" value={relationship.trust} max={100} color="text-pink-400" />
            <RelationshipBar label="Fear" value={relationship.fear} max={100} color="text-amber-400" />
            <RelationshipBar label="Debt" value={relationship.debt} max={100} color="text-yellow-400" />
            <RelationshipBar label="Leverage" value={relationship.leverage} max={100} color="text-purple-400" />
            <RelationshipBar label="Standing" value={relationship.standing} max={100} color="text-emerald-400" />
          </div>
          
          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => actions.interactWithNpc(npc.id, "talk")}
              data-testid="button-talk"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Talk
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => actions.interactWithNpc(npc.id, "help")}
              disabled={state.resources.capacity < 3}
              data-testid="button-help"
            >
              <Heart className="w-4 h-4 mr-1" />
              Help (-3 Cap)
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => actions.interactWithNpc(npc.id, "bribe")}
              disabled={state.resources.leverage < 5}
              data-testid="button-bribe"
            >
              <Coins className="w-4 h-4 mr-1" />
              Bribe (-5 Lev)
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="text-red-400 border-red-800"
              onClick={() => actions.interactWithNpc(npc.id, "threaten")}
              data-testid="button-threaten"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Threaten
            </Button>
          </div>
          
          {/* Recruitment */}
          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Recruitment</h4>
            
            {isRecruited ? (
              <Alert className="bg-emerald-950/30 border-emerald-800">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <AlertDescription className="text-emerald-300">
                  This NPC is part of your network.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-2 text-xs">
                    {relationship.trust >= npc.recruitmentRequirements.minTrust ? (
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-500" />
                    )}
                    <span className="text-slate-400">
                      Trust {npc.recruitmentRequirements.minTrust}+ (have {relationship.trust})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {relationship.standing >= npc.recruitmentRequirements.minStanding ? (
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-500" />
                    )}
                    <span className="text-slate-400">
                      Standing {npc.recruitmentRequirements.minStanding}+ (have {relationship.standing})
                    </span>
                  </div>
                  {npc.recruitmentRequirements.requiredRoleTier && (() => {
                    const reqRole = npc.recruitmentRequirements.requiredRoleTier!.role as keyof typeof state.roles;
                    const reqTier = npc.recruitmentRequirements.requiredRoleTier!.tier;
                    const currentTier = state.roles[reqRole] || 0;
                    const isMet = currentTier >= reqTier;
                    const roleName = reqRole.replace('Tier', '');
                    return (
                      <div className="flex items-center gap-2 text-xs">
                        {isMet ? (
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500" />
                        )}
                        <span className="text-slate-400">
                          {roleName} Tier {reqTier}+ (have {currentTier})
                        </span>
                      </div>
                    );
                  })()}
                  {npc.recruitmentRequirements.forbiddenFlag && (() => {
                    const flagKey = npc.recruitmentRequirements.forbiddenFlag as keyof typeof state.flags;
                    const flagValue = state.flags[flagKey];
                    const isClear = !flagValue;
                    return (
                      <div className="flex items-center gap-2 text-xs">
                        {isClear ? (
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500" />
                        )}
                        <span className={isClear ? "text-slate-400" : "text-red-400"}>
                          Must NOT have: {npc.recruitmentRequirements.forbiddenFlag} {flagValue ? "(violated!)" : "(clear)"}
                        </span>
                      </div>
                    );
                  })()}
                </div>
                
                <Button 
                  className="w-full"
                  disabled={!recruitCheck.allowed}
                  onClick={() => {
                    actions.recruitNpc(npc.id);
                    onClose();
                  }}
                  data-testid="button-recruit"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  {recruitCheck.allowed ? "Recruit" : "Cannot Recruit"}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RivalCard({ rival }: { rival: Rival }) {
  const { actions } = useGameState();
  const stage = actions.getRivalStage(rival.id);
  
  const stageColors = [
    "text-slate-400",
    "text-yellow-400", 
    "text-orange-400",
    "text-red-400",
    "text-rose-400",
    "text-purple-400"
  ];
  
  const stageLabels = [
    "Dormant",
    "Aware",
    "Active",
    "Hostile",
    "Dangerous",
    "Nemesis"
  ];

  return (
    <Card className="bg-slate-950 border-red-900/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Swords className="w-4 h-4 text-red-500" />
              <span className="font-medium text-slate-200">{rival.name}</span>
              <Badge variant="secondary" className="text-[10px]">{rival.ancestry}</Badge>
            </div>
            <p className="text-xs text-amber-400 mt-1">"{rival.title}"</p>
            <p className="text-xs text-slate-500 mt-1">{rival.description}</p>
          </div>
          
          <div className="text-right">
            <div className={`text-lg font-bold ${stageColors[stage]}`}>
              Stage {stage}
            </div>
            <p className="text-[10px] text-slate-500">{stageLabels[stage]}</p>
          </div>
        </div>
        
        {/* Escalation Progress */}
        <div className="mt-3">
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s}
                className={`h-2 flex-1 rounded ${
                  s <= stage ? 'bg-red-500' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Current Threat */}
        <div className="mt-3 p-2 bg-red-950/30 rounded border border-red-900/50">
          <p className="text-xs text-red-300">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            {rival.currentThreat}
          </p>
        </div>
        
        {/* Escalation Triggers */}
        <div className="mt-3">
          <p className="text-[10px] text-slate-500 mb-1">Escalation Triggers:</p>
          <div className="flex flex-wrap gap-1">
            {rival.escalationTriggers.slice(0, 2).map((trigger, idx) => (
              <Badge key={idx} variant="outline" className="text-[9px] text-slate-400">
                {trigger}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NPCEngine() {
  const { state } = useGameState();
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
  
  const currentDistrictNpcs = state.world.currentDistrictId 
    ? getNPCsByDistrict(state.world.currentDistrictId)
    : [];

  const recruitedCount = state.world.recruitedNpcs.length;

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl text-slate-100 font-serif font-bold" data-testid="text-page-title">NPC & Rival Engine</h1>
              <p className="text-xs text-slate-500">{recruitedCount} recruited</p>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="button-back-home">Back</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Relationship Legend */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-300 font-serif text-lg">Relationship Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 text-center">
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <Heart className="w-4 h-4 mx-auto text-pink-400" />
                <p className="text-[10px] text-slate-400 mt-1">Trust</p>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <AlertTriangle className="w-4 h-4 mx-auto text-amber-400" />
                <p className="text-[10px] text-slate-400 mt-1">Fear</p>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <Coins className="w-4 h-4 mx-auto text-yellow-400" />
                <p className="text-[10px] text-slate-400 mt-1">Debt</p>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <Eye className="w-4 h-4 mx-auto text-purple-400" />
                <p className="text-[10px] text-slate-400 mt-1">Leverage</p>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <Star className="w-4 h-4 mx-auto text-emerald-400" />
                <p className="text-[10px] text-slate-400 mt-1">Standing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-900">
            <TabsTrigger value="current" data-testid="tab-current">Current</TabsTrigger>
            <TabsTrigger value="travelers" data-testid="tab-travelers">Travelers</TabsTrigger>
            <TabsTrigger value="recruited" data-testid="tab-recruited">Recruited</TabsTrigger>
            <TabsTrigger value="rivals" data-testid="tab-rivals">Rivals</TabsTrigger>
          </TabsList>
          
          {/* Current District NPCs */}
          <TabsContent value="current" className="mt-4 space-y-3">
            {currentDistrictNpcs.length > 0 ? (
              <>
                <Alert className="bg-slate-900 border-slate-700">
                  <Users className="h-4 w-4" />
                  <AlertDescription className="text-slate-300">
                    {currentDistrictNpcs.length} NPCs in current district. 
                    {DISTRICTS.find(d => d.id === state.world.currentDistrictId)?.name}
                  </AlertDescription>
                </Alert>
                {currentDistrictNpcs.map(npc => (
                  <NPCCard key={npc.id} npc={npc} onInteract={setSelectedNpcId} />
                ))}
              </>
            ) : (
              <Alert className="bg-slate-900 border-slate-700">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-slate-400">
                  Visit a district to see local NPCs. Go to Districts page first.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          {/* Travelers */}
          <TabsContent value="travelers" className="mt-4 space-y-3">
            <Alert className="bg-slate-900 border-green-900/50">
              <Footprints className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-slate-300">
                Travelers roam between settlements. {TRAVELERS.length} active.
              </AlertDescription>
            </Alert>
            {TRAVELERS.map(npc => (
              <NPCCard key={npc.id} npc={npc} onInteract={setSelectedNpcId} />
            ))}
          </TabsContent>
          
          {/* Recruited */}
          <TabsContent value="recruited" className="mt-4 space-y-3">
            {state.world.recruitedNpcs.length > 0 ? (
              state.world.recruitedNpcs.map(id => {
                const npc = ALL_NPCS.find(n => n.id === id);
                if (!npc) return null;
                return <NPCCard key={npc.id} npc={npc} onInteract={setSelectedNpcId} />;
              })
            ) : (
              <Alert className="bg-slate-900 border-slate-700">
                <UserPlus className="h-4 w-4 text-slate-500" />
                <AlertDescription className="text-slate-400">
                  No NPCs recruited yet. Build relationships to unlock recruitment.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          {/* Rivals */}
          <TabsContent value="rivals" className="mt-4 space-y-4">
            <Alert className="bg-red-950/30 border-red-900/50">
              <Swords className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-slate-300">
                {RIVALS.length} major rivals tracking your progress. Stage increases as you gain power.
              </AlertDescription>
            </Alert>
            {RIVALS.map(rival => (
              <RivalCard key={rival.id} rival={rival} />
            ))}
          </TabsContent>
        </Tabs>
        
        {/* Stats */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-200">{ALL_NPCS.length}</p>
                <p className="text-xs text-slate-500">Total NPCs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{TRAVELERS.length}</p>
                <p className="text-xs text-slate-500">Travelers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">{recruitedCount}</p>
                <p className="text-xs text-slate-500">Recruited</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{RIVALS.length}</p>
                <p className="text-xs text-slate-500">Rivals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <NPCInteractionDialog 
        npcId={selectedNpcId} 
        open={!!selectedNpcId} 
        onClose={() => setSelectedNpcId(null)} 
      />
    </div>
  );
}
