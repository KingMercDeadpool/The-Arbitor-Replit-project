import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGameState } from "@/hooks/use-game-state";
import { 
  ArrowLeft, FileText, CheckCircle2, XCircle, Clock, 
  Eye, Scale, Sword, Flame, Shield, AlertTriangle
} from "lucide-react";
import { APPROACH_LANES, SLATE_MAPPING } from "@shared/schema";
import { SETTLEMENTS } from "@/lib/world-data";
import { VARIETY_MATH } from "@/lib/contract-data";
import type { Contract, ApproachLane } from "@shared/schema";

const LANE_ICONS = {
  SHADOW: Eye,
  SEAL: Scale,
  STEEL: Sword,
};

const LANE_COLORS = {
  SHADOW: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  SEAL: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  STEEL: "bg-red-500/20 text-red-700 dark:text-red-300",
};

export default function Contracts() {
  const { state, actions } = useGameState();
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [showVariety, setShowVariety] = useState(false);

  const activeContracts = state.activeContracts || [];
  const completedCount = state.completedContracts?.length || 0;
  const failedCount = state.failedContracts?.length || 0;
  const meters = state.meters || { heat: 0, unrestBySettlement: {} };
  const currentSettlement = state.world.currentSettlementId;

  const handleGenerateContract = (source: "BROKER" | "GUILD" | "CLAN" | "SYNDICATE", axis: "S" | "L" | "A" | "T" | "E") => {
    if (!currentSettlement) return;
    actions.generateNewContract(currentSettlement, source, axis);
  };

  const handleResolveLane = (contractId: string, lane: ApproachLane) => {
    actions.resolveContractStep(contractId, lane);
  };

  const contract = selectedContract ? activeContracts.find(c => c.id === selectedContract) : null;

  return (
    <div className="min-h-screen bg-background p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Contracts</h1>
        <Badge variant="outline" className="ml-auto">
          {activeContracts.length}/5 Active
        </Badge>
      </div>

      {/* Meters */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Heat</span>
                <span className="text-xs text-muted-foreground ml-auto">{meters.heat}%</span>
              </div>
              <Progress value={meters.heat} className="h-2" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Legitimacy</span>
                <span className="text-xs text-muted-foreground ml-auto">{state.resources.legitimacy}%</span>
              </div>
              <Progress value={state.resources.legitimacy} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedContract ? (
        <>
          {/* Active Contracts List */}
          <div className="space-y-3 mb-4">
            {activeContracts.length === 0 ? (
              <Card>
                <CardContent className="pt-4 text-center text-muted-foreground">
                  No active contracts. Visit a tavern or broker to find work.
                </CardContent>
              </Card>
            ) : (
              activeContracts.map(c => (
                <Card 
                  key={c.id} 
                  className="cursor-pointer hover-elevate"
                  onClick={() => setSelectedContract(c.id)}
                  data-testid={`contract-${c.id}`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium">{c.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{c.source}</Badge>
                          <Badge variant="secondary" className="text-xs">{SLATE_MAPPING[c.slateAxis].letter}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">
                          Step {c.currentStep + 1}/{c.steps.length}
                        </span>
                        <Progress value={(c.currentStep / c.steps.length) * 100} className="h-1 w-16 mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Generate New Contract */}
          {currentSettlement && activeContracts.length < 5 && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-sm">Find New Contract</CardTitle>
                <CardDescription>
                  At: {SETTLEMENTS.find(s => s.id === currentSettlement)?.name || "Unknown"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleGenerateContract("BROKER", "S")} data-testid="btn-broker-s">
                    Broker (Spy)
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleGenerateContract("GUILD", "L")} data-testid="btn-guild-l">
                    Guild (Law)
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleGenerateContract("CLAN", "A")} data-testid="btn-clan-a">
                    Clan (Army)
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleGenerateContract("SYNDICATE", "E")} data-testid="btn-syndicate-e">
                    Syndicate (Enterprise)
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card className="mb-4">
            <CardContent className="pt-4">
              <div className="flex justify-around">
                <div className="text-center">
                  <CheckCircle2 className="h-5 w-5 mx-auto text-green-500" />
                  <span className="text-sm font-medium">{completedCount}</span>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center">
                  <XCircle className="h-5 w-5 mx-auto text-red-500" />
                  <span className="text-sm font-medium">{failedCount}</span>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
                <div className="text-center">
                  <Clock className="h-5 w-5 mx-auto text-blue-500" />
                  <span className="text-sm font-medium">{state.resources.contractStepsCompleted}</span>
                  <p className="text-xs text-muted-foreground">Steps Done</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variety Engine */}
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={() => setShowVariety(!showVariety)}
            data-testid="button-variety"
          >
            {showVariety ? "Hide" : "Show"} Variety Engine Math
          </Button>
          {showVariety && (
            <Card className="mt-2">
              <CardContent className="pt-4 text-xs space-y-2">
                <div>
                  <strong>Scene Engine:</strong> {VARIETY_MATH.sceneEngine.settlements} settlements x {VARIETY_MATH.sceneEngine.districtTypes} district types x {VARIETY_MATH.sceneEngine.districtFunctions} functions x {VARIETY_MATH.sceneEngine.timeOfDay} times x {VARIETY_MATH.sceneEngine.socialModes} modes x {VARIETY_MATH.sceneEngine.intents} intents = <Badge>{VARIETY_MATH.sceneEngine.total.toLocaleString()}</Badge>
                </div>
                <div>
                  <strong>Encounter Engine:</strong> {VARIETY_MATH.encounterEngine.encounterTypes} types x {VARIETY_MATH.encounterEngine.archetypeMixes} mixes x {VARIETY_MATH.encounterEngine.environmentHazards} hazards x {VARIETY_MATH.encounterEngine.witnessClimates} climates x {VARIETY_MATH.encounterEngine.rivalInterference} interference = <Badge>{VARIETY_MATH.encounterEngine.total.toLocaleString()}</Badge>
                </div>
                <div>
                  <strong>Name Engine:</strong> {VARIETY_MATH.nameEngine.prefixes} x {VARIETY_MATH.nameEngine.roots} x {VARIETY_MATH.nameEngine.suffixes} = <Badge>{VARIETY_MATH.nameEngine.total.toLocaleString()}</Badge>
                </div>
                <div className="pt-2 border-t">
                  <strong>Grand Total:</strong> <Badge variant="default">{VARIETY_MATH.grandTotal.toLocaleString()} combinations</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : contract ? (
        <>
          {/* Contract Detail View */}
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => setSelectedContract(null)}
            data-testid="button-back-list"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
          </Button>

          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>{contract.title}</CardTitle>
                  <CardDescription>
                    {contract.source} Contract - {SLATE_MAPPING[contract.slateAxis].letter}
                  </CardDescription>
                </div>
                {contract.moralLockSafe && (
                  <Badge variant="secondary">Moral Lock Safe</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Risks */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="flex items-center gap-1">
                  <Flame className="h-3 w-3" /> Heat Risk: +{contract.risks.heatDelta}
                </div>
                <div className="flex items-center gap-1">
                  <Scale className="h-3 w-3" /> Leg. Risk: {contract.risks.legitimacyDelta}
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Injury: {contract.risks.injuryRisk}%
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> Witness: {contract.witnessStrictness}
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {contract.steps.map((step, idx) => (
                  <div 
                    key={step.id}
                    className={`p-3 rounded border ${
                      step.completed ? "bg-green-500/10 border-green-500" :
                      step.failed ? "bg-red-500/10 border-red-500" :
                      idx === contract.currentStep ? "bg-blue-500/10 border-blue-500" :
                      "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold">Step {idx + 1}</span>
                      {step.completed && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {step.failed && <XCircle className="h-4 w-4 text-red-500" />}
                      {step.chosenLane && (
                        <Badge variant="outline" className="text-xs">{step.chosenLane}</Badge>
                      )}
                    </div>
                    <p className="text-sm">{step.description}</p>

                    {/* Lane Selection for Current Step */}
                    {idx === contract.currentStep && !step.completed && !step.failed && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-muted-foreground">Choose your approach:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {(["SHADOW", "SEAL", "STEEL"] as ApproachLane[]).map(lane => {
                            const Icon = LANE_ICONS[lane];
                            return (
                              <Button
                                key={lane}
                                size="sm"
                                variant="outline"
                                className={LANE_COLORS[lane]}
                                onClick={() => handleResolveLane(contract.id, lane)}
                                data-testid={`lane-${lane}`}
                              >
                                <Icon className="h-4 w-4 mr-1" />
                                {APPROACH_LANES[lane].name.split(" ")[0]}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Rewards Preview */}
              <div className="mt-4 pt-4 border-t">
                <span className="text-xs font-semibold text-muted-foreground">Rewards on Completion:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">+{contract.rewards.renown} Renown</Badge>
                  <Badge variant="outline">+{contract.rewards.leverage} Leverage</Badge>
                  <Badge variant="outline">+{contract.rewards.capacity} Capacity</Badge>
                  {contract.rewards.roleTokens > 0 && (
                    <Badge>+{contract.rewards.roleTokens} Tokens</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
