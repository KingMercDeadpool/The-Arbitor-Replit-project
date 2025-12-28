import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGameState } from "@/hooks/use-game-state";
import { 
  ArrowLeft, Users, MessageCircle, Heart, Swords, 
  HelpCircle, FileText, UserPlus, AlertTriangle
} from "lucide-react";
import { SETTLEMENTS, DISTRICTS, ALL_NPCS } from "@/lib/world-data";
import { generateTavernTables, resolveSocialInteraction, type SocialMode, type SocialIntent, type SocialOutcome } from "@/lib/contract-data";
import type { TavernTable } from "@shared/schema";

export default function Tavern() {
  const { state, actions } = useGameState();
  const [tables, setTables] = useState<TavernTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<TavernTable | null>(null);
  const [selectedMode, setSelectedMode] = useState<SocialMode | null>(null);
  const [outcome, setOutcome] = useState<SocialOutcome | null>(null);

  const currentSettlement = state.world.currentSettlementId;
  const currentDistrict = state.world.currentDistrictId;
  const settlement = SETTLEMENTS.find(s => s.id === currentSettlement);
  const district = currentDistrict ? DISTRICTS.find(d => d.id === currentDistrict) : null;
  const heat = state.meters?.heat || 0;

  useEffect(() => {
    if (currentSettlement) {
      const newTables = generateTavernTables(currentSettlement, currentDistrict);
      setTables(newTables);
    }
  }, [currentSettlement, currentDistrict]);

  const handleSelectTable = (table: TavernTable) => {
    setSelectedTable(table);
    setSelectedMode(null);
    setOutcome(null);
  };

  const handleSelectMode = (mode: SocialMode) => {
    setSelectedMode(mode);
    setOutcome(null);
  };

  const handleResolveIntent = (intent: SocialIntent) => {
    if (!selectedTable || !selectedMode) return;
    
    const result = resolveSocialInteraction(selectedMode, intent, selectedTable, heat);
    setOutcome(result);

    // Apply effects based on outcome type
    if (result.npcId) {
      switch (result.type) {
        case "ENCOUNTER":
          actions.startCombat(false, 2, true);
          break;
        case "RECRUITMENT":
          actions.modifyRelationship(result.npcId, { trust: 5, standing: 3 });
          break;
        case "CONTRACT_LEAD":
          // Could auto-generate a contract here
          break;
        case "RIVAL_COMPLICATION":
          actions.modifyHeat(10);
          break;
        case "INFO":
          actions.modifyRelationship(result.npcId, { trust: 2, standing: 1 });
          break;
      }
    }
  };

  const getTableNpcs = (table: TavernTable) => {
    return table.npcIds.map(id => ALL_NPCS.find(n => n.id === id)).filter(Boolean);
  };

  const getMoodColor = (mood: TavernTable["mood"]) => {
    switch (mood) {
      case "FRIENDLY": return "bg-green-500/10 border-green-500";
      case "HOSTILE": return "bg-red-500/10 border-red-500";
      case "SECRETIVE": return "bg-purple-500/10 border-purple-500";
      default: return "bg-muted";
    }
  };

  if (!currentSettlement) {
    return (
      <div className="min-h-screen bg-background p-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Tavern</h1>
        </div>
        <Card>
          <CardContent className="pt-4 text-center text-muted-foreground">
            Visit a settlement first to enter a tavern.
            <Link href="/world">
              <Button variant="ghost" className="mt-2">Go to World</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Tavern</h1>
          <p className="text-xs text-muted-foreground">
            {settlement?.name} {district ? `- ${district.name}` : ""}
          </p>
        </div>
      </div>

      {!selectedTable ? (
        <>
          {/* Tables Overview */}
          <p className="text-sm text-muted-foreground mb-4">
            The tavern is busy tonight. {tables.length} tables are occupied.
          </p>

          <div className="space-y-3">
            {tables.map((table, idx) => {
              const npcs = getTableNpcs(table);
              return (
                <Card 
                  key={table.id}
                  className={`cursor-pointer hover-elevate border ${getMoodColor(table.mood)}`}
                  onClick={() => handleSelectTable(table)}
                  data-testid={`table-${idx}`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">Table {idx + 1}</span>
                          <Badge variant="outline" className="text-xs">{table.mood}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {npcs.map(n => n?.name).join(", ")}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {table.hasContractLead && <FileText className="h-4 w-4 text-amber-500" />}
                        {table.hasRecruitmentOpp && <UserPlus className="h-4 w-4 text-green-500" />}
                        {table.hasRivalComplication && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => setTables(generateTavernTables(currentSettlement, currentDistrict))}
            data-testid="button-refresh-tables"
          >
            Wait for New Patrons
          </Button>
        </>
      ) : (
        <>
          {/* Table Interaction */}
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => { setSelectedTable(null); setOutcome(null); }}
            data-testid="button-back-tables"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tables
          </Button>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                At the Table
              </CardTitle>
              <CardDescription>
                {getTableNpcs(selectedTable).map(n => (
                  <span key={n?.id} className="mr-2">
                    {n?.name} ({n?.role})
                  </span>
                ))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mode Selection */}
              {!selectedMode && !outcome && (
                <div className="space-y-2">
                  <p className="text-sm mb-3">How do you approach?</p>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => handleSelectMode("TALK")}
                    data-testid="mode-talk"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Talk
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => handleSelectMode("FLIRT")}
                    data-testid="mode-flirt"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Flirt
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => handleSelectMode("FIGHT")}
                    data-testid="mode-fight"
                  >
                    <Swords className="h-4 w-4 mr-2" />
                    Fight
                  </Button>
                </div>
              )}

              {/* Intent Selection */}
              {selectedMode && selectedMode !== "FIGHT" && !outcome && (
                <div className="space-y-2">
                  <p className="text-sm mb-3">With what intent?</p>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => handleResolveIntent("FLIRTATIOUS")}
                    data-testid="intent-flirtatious"
                  >
                    Flirtatious
                  </Button>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => handleResolveIntent("CASUAL")}
                    data-testid="intent-casual"
                  >
                    Casual
                  </Button>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => handleResolveIntent("CURIOUS")}
                    data-testid="intent-curious"
                  >
                    Curious
                  </Button>
                </div>
              )}

              {/* Fight Mode (direct resolution) */}
              {selectedMode === "FIGHT" && !outcome && (
                <div className="space-y-2">
                  <p className="text-sm mb-3">Starting a fight...</p>
                  <Button 
                    className="w-full"
                    variant="destructive"
                    onClick={() => handleResolveIntent("CASUAL")}
                    data-testid="confirm-fight"
                  >
                    <Swords className="h-4 w-4 mr-2" />
                    Throw the First Punch
                  </Button>
                </div>
              )}

              {/* Outcome Display */}
              {outcome && (
                <div className="space-y-3">
                  <div className={`p-4 rounded ${
                    outcome.type === "ENCOUNTER" ? "bg-red-500/10" :
                    outcome.type === "CONTRACT_LEAD" ? "bg-amber-500/10" :
                    outcome.type === "RECRUITMENT" ? "bg-green-500/10" :
                    outcome.type === "RIVAL_COMPLICATION" ? "bg-purple-500/10" :
                    "bg-muted"
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {outcome.type === "ENCOUNTER" && <Swords className="h-5 w-5 text-red-500" />}
                      {outcome.type === "CONTRACT_LEAD" && <FileText className="h-5 w-5 text-amber-500" />}
                      {outcome.type === "RECRUITMENT" && <UserPlus className="h-5 w-5 text-green-500" />}
                      {outcome.type === "RIVAL_COMPLICATION" && <AlertTriangle className="h-5 w-5 text-purple-500" />}
                      {outcome.type === "INFO" && <HelpCircle className="h-5 w-5" />}
                      <Badge variant="outline">{outcome.type.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-sm">{outcome.description}</p>
                  </div>

                  {outcome.type === "CONTRACT_LEAD" && currentSettlement && (
                    <Button 
                      className="w-full"
                      onClick={() => actions.generateNewContract(currentSettlement, "BROKER", "S")}
                      data-testid="accept-contract-lead"
                    >
                      Accept the Job
                    </Button>
                  )}

                  {outcome.type === "RECRUITMENT" && outcome.npcId && (
                    <Button 
                      className="w-full"
                      onClick={() => { 
                        if (outcome.npcId) actions.recruitNpc(outcome.npcId, "OPS");
                      }}
                      data-testid="recruit-npc"
                    >
                      Recruit Them
                    </Button>
                  )}

                  {outcome.type === "ENCOUNTER" && state.combat?.active && (
                    <Link href="/combat">
                      <Button className="w-full" data-testid="go-combat">
                        Go to Combat
                      </Button>
                    </Link>
                  )}

                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => { setSelectedMode(null); setOutcome(null); }}
                    data-testid="continue-interaction"
                  >
                    Continue Interaction
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
