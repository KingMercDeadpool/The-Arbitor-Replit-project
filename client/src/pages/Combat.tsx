import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGameState } from "@/hooks/use-game-state";
import { 
  ArrowLeft, Sword, Trophy, Activity, Timer, Brain,
  CheckCircle, XCircle, Shield, Zap, Target, BookOpen
} from "lucide-react";
import type { ArchetypeId, RivalId, CultureRegion } from "@shared/schema";

const ARCHETYPES: { id: ArchetypeId; name: string; description: string }[] = [
  { id: "BRUISER", name: "Bruiser", description: "Heavy hitters. Predictable but punishing." },
  { id: "SKIRMISHER", name: "Skirmisher", description: "Mobile fighters. Test positioning knowledge." },
  { id: "HEXER", name: "Hexer", description: "Magical threats. Require rite awareness." },
  { id: "SHIELDBEARER", name: "Shieldbearer", description: "Defensive. Need patience and tactics." },
  { id: "SNARER", name: "Snarer", description: "Control specialists. Test escape routes." },
  { id: "DUELIST", name: "Duelist", description: "Precise fighters. Punish mistakes." },
  { id: "SWARM", name: "Swarm", description: "Multiple foes. Area control matters." },
];

const RIVALS: { id: RivalId; name: string; description: string }[] = [
  { id: "VAREN", name: "Varen the Collector", description: "Information broker. Knows your secrets." },
  { id: "SABLE", name: "Sable Thornwick", description: "Guild enforcer. Questions honor and law." },
  { id: "KORRATH", name: "Korrath Ironhand", description: "Mercenary captain. Tests tactical doctrine." },
  { id: "MISTVEIL", name: "The Mistveil", description: "Mysterious operative. Probes cultural knowledge." },
];

const CULTURES: { id: CultureRegion; name: string }[] = [
  { id: "COASTAL", name: "Coastal Lowlands" },
  { id: "RIVER_BASIN", name: "River Basin" },
  { id: "HIGHLAND", name: "Highland Plateau" },
  { id: "FOREST", name: "Forest Interior" },
  { id: "ARID", name: "Arid Frontier" },
];

export default function Combat() {
  const { state, actions } = useGameState();
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeId | null>(null);
  const [selectedRival, setSelectedRival] = useState<RivalId | null>(null);
  const [selectedCulture, setSelectedCulture] = useState<CultureRegion | null>(null);
  const [isPitFight, setIsPitFight] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [lastResult, setLastResult] = useState<{ correct: boolean; message: string } | null>(null);

  const trial = state.trial;
  const injury = state.injury || { level: 0, woundTag: null };
  const mastery = state.mastery || {
    archetypes: { BRUISER: 0, SKIRMISHER: 0, HEXER: 0, SHIELDBEARER: 0, SNARER: 0, DUELIST: 0, SWARM: 0 },
    rivals: { VAREN: 0, SABLE: 0, KORRATH: 0, MISTVEIL: 0 },
    questionsAnswered: {},
    totalExchanges: 0,
    totalCorrect: 0
  };

  const currentQuestion = trial?.active ? actions.getCurrentTrialQuestion() : null;

  const handleStartTrial = useCallback(() => {
    if (!selectedArchetype) return;
    
    actions.startTrial(selectedArchetype, {
      rivalId: selectedRival || undefined,
      culture: selectedCulture || undefined,
      isPitFight,
      isRivalFight: !!selectedRival,
    });
    
    setTimeRemaining(trial?.timer || 15);
    setLastResult(null);
  }, [selectedArchetype, selectedRival, selectedCulture, isPitFight, actions, trial?.timer]);

  const handleAnswer = useCallback((answerIndex: number) => {
    const result = actions.answerTrialQuestion(answerIndex);
    
    setLastResult({
      correct: result.correct,
      message: result.correct ? "Correct!" : "Wrong! Damage taken."
    });

    if (result.exchangeComplete && !result.trialComplete) {
      // Logic for showing exchange completion if needed
    }

    if (result.trialComplete) {
      setSelectedArchetype(null);
      setSelectedRival(null);
      setSelectedCulture(null);
    } else {
      const newTrial = actions.getTrialState();
      setTimeRemaining(newTrial?.timer || 15);
    }
  }, [actions]);

  const handleAbandon = useCallback(() => {
    actions.abandonTrial();
    setSelectedArchetype(null);
    setSelectedRival(null);
    setSelectedCulture(null);
    setLastResult(null);
  }, [actions]);

  const handleHeal = (method: "REST" | "CLINIC" | "RITE") => {
    actions.heal(method);
  };

  useEffect(() => {
    if (!trial?.active || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          const trialStillActive = actions.isTrialActive();
          if (trialStillActive) {
            handleAnswer(-1);
          }
          return trial.timer;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [trial?.active, currentQuestion, handleAnswer, trial?.timer, actions]);

  useEffect(() => {
    if (trial?.active) {
      setTimeRemaining(trial.timer);
    }
  }, [trial?.active, trial?.timer, trial?.currentQuestionIndex]);

  return (
    <div className="min-h-screen bg-background p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Tactical Trials</h1>
      </div>

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

      {!trial?.active ? (
        <>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Begin Trial</CardTitle>
              <CardDescription>
                Test your knowledge against enemy archetypes. Answer questions to overcome foes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground">Enemy Archetype</span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {ARCHETYPES.map(arch => {
                    const archMastery = mastery.archetypes[arch.id] || 0;
                    return (
                      <Button
                        key={arch.id}
                        size="sm"
                        variant={selectedArchetype === arch.id ? "default" : "outline"}
                        onClick={() => setSelectedArchetype(arch.id)}
                        className="flex-col h-auto py-2 items-start"
                        data-testid={`archetype-${arch.id}`}
                      >
                        <div className="flex items-center gap-1 w-full justify-between">
                          <span className="font-medium">{arch.name}</span>
                          <Badge variant="secondary" className="text-xs">{archMastery}%</Badge>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground">Rival Challenge (Optional)</span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {RIVALS.map(rival => {
                    const rivalMastery = mastery.rivals[rival.id] || 0;
                    return (
                      <Button
                        key={rival.id}
                        size="sm"
                        variant={selectedRival === rival.id ? "default" : "outline"}
                        onClick={() => setSelectedRival(selectedRival === rival.id ? null : rival.id)}
                        className="flex-col h-auto py-2 items-start"
                        data-testid={`rival-${rival.id}`}
                      >
                        <div className="flex items-center gap-1 w-full justify-between">
                          <span className="font-medium text-xs">{rival.name}</span>
                          <Badge variant="secondary" className="text-xs">{rivalMastery}%</Badge>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground">Cultural Context (Optional)</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CULTURES.map(culture => (
                    <Button
                      key={culture.id}
                      size="sm"
                      variant={selectedCulture === culture.id ? "default" : "outline"}
                      onClick={() => setSelectedCulture(selectedCulture === culture.id ? null : culture.id)}
                      data-testid={`culture-${culture.id}`}
                    >
                      {culture.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={isPitFight ? "default" : "outline"}
                  onClick={() => setIsPitFight(!isPitFight)}
                  data-testid="toggle-pit-fight"
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  Pit Fight
                </Button>
                {isPitFight && (
                  <span className="text-xs text-muted-foreground">+Leverage on victory</span>
                )}
              </div>

              <Button
                className="w-full"
                disabled={!selectedArchetype}
                onClick={handleStartTrial}
                data-testid="button-start-trial"
              >
                <Sword className="h-4 w-4 mr-2" />
                Begin Trial
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Mastery Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">Total Stats</span>
                  <div className="flex gap-4 mt-1">
                    <div className="text-center">
                      <div className="text-lg font-bold">{mastery.totalExchanges}</div>
                      <div className="text-xs text-muted-foreground">Exchanges</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{mastery.totalCorrect}</div>
                      <div className="text-xs text-muted-foreground">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {mastery.totalExchanges > 0 
                          ? Math.round((mastery.totalCorrect / (mastery.totalExchanges * 4)) * 100)
                          : 0}%
                      </div>
                      <div className="text-xs text-muted-foreground">Accuracy</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Exchange {trial.currentExchange}/{trial.totalExchanges}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  <span className={`text-sm font-mono ${timeRemaining <= 5 ? "text-red-500" : ""}`}>
                    {timeRemaining}s
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">Damage Taken</span>
                  <span className="text-xs font-medium">{trial.damage}/100</span>
                </div>
                <Progress 
                  value={trial.damage} 
                  className="h-2" 
                />
                {trial.damage >= 75 && (
                  <span className="text-xs text-red-500">Critical damage! One more mistake and you escape.</span>
                )}
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  Question {trial.currentQuestionIndex + 1}/{trial.questionsInExchange}
                </span>
                <span className="text-xs text-muted-foreground">
                  {trial.correctInExchange} correct
                </span>
              </div>

              {lastResult && (
                <div className={`flex items-center gap-2 p-2 rounded mb-3 ${
                  lastResult.correct ? "bg-green-500/10" : "bg-red-500/10"
                }`}>
                  {lastResult.correct ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">{lastResult.message}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {currentQuestion && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <Badge variant="outline" className="text-xs">{currentQuestion.category}</Badge>
                  {currentQuestion.archetype && (
                    <Badge variant="secondary" className="text-xs">{currentQuestion.archetype}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4" data-testid="question-text">{currentQuestion.text}</p>
                
                <div className="space-y-2">
                  {currentQuestion.options.map((answer: string, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4"
                      onClick={() => handleAnswer(index)}
                      data-testid={`answer-${index}`}
                    >
                      <span className="font-mono mr-2 text-muted-foreground">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {answer}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button 
            variant="ghost" 
            className="w-full"
            onClick={handleAbandon}
            data-testid="button-flee"
          >
            <Shield className="h-4 w-4 mr-2" />
            Flee (Escape with Minor Injury)
          </Button>
        </>
      )}
    </div>
  );
}
