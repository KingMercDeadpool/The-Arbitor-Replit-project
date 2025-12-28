import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGameState } from "@/hooks/use-game-state";
import { 
  ArrowLeft, Sword, Shield, Footprints, Link2, Sparkles, Eye, Flag,
  Heart, Flame, Users, Trophy, AlertTriangle, Activity
} from "lucide-react";
import { COMBAT_MOVES, STANCES, RITE_CATEGORIES } from "@shared/schema";
import { RITES, SPONSORS, POSITION_NAMES } from "@/lib/combat-data";
import type { CombatMove, Stance, RiteType } from "@shared/schema";

const MOVE_ICONS: Record<CombatMove, typeof Sword> = {
  STRIKE: Sword,
  GUARD: Shield,
  STEP: Footprints,
  BIND: Link2,
  INVOKE: Sparkles,
  FEINT: Eye,
  RALLY: Flag,
};

export default function Combat() {
  const { state, actions } = useGameState();
  const [selectedMove, setSelectedMove] = useState<CombatMove | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [dirtyTactic, setDirtyTactic] = useState(false);
  const [selectedRite, setSelectedRite] = useState<RiteType | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const combat = state.combat;
  const injury = state.injury || { level: 0, woundTag: null };
  const stanceMastery = state.stanceMastery || {};

  const handleStartCombat = (isPit: boolean) => {
    actions.startCombat(isPit, 3, !isPit);
  };

  const handleExecuteMove = () => {
    if (!selectedMove) return;
    const result = actions.executeCombatMove(selectedMove, selectedTarget || undefined, dirtyTactic);
    if (result) {
      setLastResult(result.narrative);
    }
    setSelectedMove(null);
    setSelectedTarget(null);
    setDirtyTactic(false);
  };

  const handleHeal = (method: "REST" | "CLINIC" | "RITE") => {
    actions.heal(method);
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Combat Arena</h1>
      </div>

      {/* Injury Status */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Injury Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-sm text-muted-foreground">Level: {injury.level}/5</span>
            {injury.woundTag && (
              <Badge variant="destructive" className="text-xs">
                {injury.woundTag}
              </Badge>
            )}
          </div>
          <Progress value={(5 - injury.level) / 5 * 100} className="h-2" />
          {injury.level > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => handleHeal("REST")} data-testid="button-heal-rest">
                Rest (-1)
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleHeal("CLINIC")} data-testid="button-heal-clinic">
                Clinic (-2, 5 Lev)
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleHeal("RITE")} data-testid="button-heal-rite">
                Rite Heal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {!combat?.active ? (
        <>
          {/* Start Combat Options */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Enter Combat</CardTitle>
              <CardDescription>Choose your arena</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button onClick={() => handleStartCombat(false)} data-testid="button-start-combat">
                <Sword className="h-4 w-4 mr-2" />
                Field Encounter (Public)
              </Button>
              <Button variant="secondary" onClick={() => handleStartCombat(true)} data-testid="button-start-pit">
                <Trophy className="h-4 w-4 mr-2" />
                Pit Fight (Crowd Favor)
              </Button>
            </CardContent>
          </Card>

          {/* Stance Mastery */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm">Stance Mastery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(STANCES) as Stance[]).map(stance => (
                  <div key={stance} className="flex items-center gap-2">
                    <Badge variant={stanceMastery[stance] ? "default" : "outline"} className="text-xs">
                      {STANCES[stance].name}
                    </Badge>
                    {stanceMastery[stance] && <span className="text-xs text-green-600">Mastered</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rites Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Rites Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(Object.keys(RITE_CATEGORIES) as RiteType[]).map(cat => (
                  <div key={cat}>
                    <span className="text-xs font-semibold text-muted-foreground">{RITE_CATEGORIES[cat].name}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {RITES.filter(r => r.category === cat).map(rite => (
                        <Badge key={rite.id} variant="outline" className="text-xs">
                          {rite.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Active Combat */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">Turn {combat.turn}</CardTitle>
                {combat.isPitFight && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Crowd: {combat.crowdFavor}%</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {lastResult && (
                <div className="bg-muted p-2 rounded mb-3 text-sm">{lastResult}</div>
              )}

              {/* Allies */}
              <div className="mb-4">
                <span className="text-xs font-semibold text-muted-foreground">Your Team</span>
                <div className="space-y-2 mt-1">
                  {combat.allies.map(ally => (
                    <div key={ally.id} className="flex items-center justify-between bg-green-500/10 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{ally.name}</span>
                        <Badge variant="outline" className="text-xs">{POSITION_NAMES[ally.position]}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{ally.hp}/{ally.maxHp}</span>
                        <Badge variant="secondary" className="text-xs">{ally.stance}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enemies */}
              <div className="mb-4">
                <span className="text-xs font-semibold text-muted-foreground">Enemies</span>
                <div className="space-y-2 mt-1">
                  {combat.enemies.map(enemy => (
                    <div 
                      key={enemy.id} 
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                        selectedTarget === enemy.id ? "bg-red-500/30" : "bg-red-500/10"
                      }`}
                      onClick={() => setSelectedTarget(enemy.id)}
                      data-testid={`enemy-${enemy.id}`}
                    >
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">{enemy.name}</span>
                        <Badge variant="outline" className="text-xs">{enemy.archetype}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{enemy.hp}/{enemy.maxHp}</span>
                        <Badge variant="destructive" className="text-xs">{POSITION_NAMES[enemy.position]}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stance Selection */}
              <div className="mb-4">
                <span className="text-xs font-semibold text-muted-foreground">Stance</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(Object.keys(STANCES) as Stance[]).map(stance => {
                    const player = combat.allies.find(a => a.id === "player_kami");
                    return (
                      <Button
                        key={stance}
                        size="sm"
                        variant={player?.stance === stance ? "default" : "outline"}
                        onClick={() => actions.changeStance(stance)}
                        data-testid={`stance-${stance}`}
                      >
                        {STANCES[stance].name}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Move Selection */}
              <div className="mb-4">
                <span className="text-xs font-semibold text-muted-foreground">Moves</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {(Object.keys(COMBAT_MOVES) as CombatMove[]).map(move => {
                    const Icon = MOVE_ICONS[move];
                    return (
                      <Button
                        key={move}
                        size="sm"
                        variant={selectedMove === move ? "default" : "outline"}
                        onClick={() => setSelectedMove(move)}
                        className="justify-start"
                        data-testid={`move-${move}`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {COMBAT_MOVES[move].name}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Dirty Tactic Toggle */}
              {(selectedMove === "FEINT" || selectedMove === "BIND" || selectedMove === "INVOKE") && (
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    size="sm"
                    variant={dirtyTactic ? "destructive" : "outline"}
                    onClick={() => setDirtyTactic(!dirtyTactic)}
                    data-testid="toggle-dirty"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {dirtyTactic ? "Dirty Tactic ON" : "Dirty Tactic OFF"}
                  </Button>
                  {dirtyTactic && combat.publicEncounter && (
                    <span className="text-xs text-red-500">-5 Legitimacy, +5 Heat</span>
                  )}
                </div>
              )}

              {/* Execute Button */}
              <Button 
                className="w-full" 
                disabled={!selectedMove}
                onClick={handleExecuteMove}
                data-testid="button-execute"
              >
                Execute {selectedMove ? COMBAT_MOVES[selectedMove].name : "Move"}
              </Button>

              <Button 
                variant="ghost" 
                className="w-full mt-2"
                onClick={() => actions.endCombat(false)}
                data-testid="button-flee"
              >
                Flee (Escape with Injury)
              </Button>
            </CardContent>
          </Card>

          {/* Pit Fight Sponsors */}
          {combat.isPitFight && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pit Sponsors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {SPONSORS.map(sponsor => {
                    const favor = state.pitSponsorFavor?.[sponsor.id] || 0;
                    return (
                      <div key={sponsor.id} className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">{sponsor.name}</span>
                          {sponsor.prefersGrayPlay && (
                            <Badge variant="outline" className="ml-2 text-xs">Gray</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Favor: {favor}%</span>
                          {sponsor.offersStaffHire && (
                            <Badge className="text-xs">Offers Staff</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
