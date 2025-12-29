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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGameState } from "@/hooks/use-game-state";
import { 
  ArrowLeft, Sword, Trophy, Activity, Timer, Brain, Users,
  CheckCircle, XCircle, Shield, Zap, Target, BookOpen, GraduationCap, Lock,
  Backpack, Gem, ShieldCheck
} from "lucide-react";
import type { ArchetypeId, RivalId, CultureRegion } from "@shared/schema";

interface Trainer {
  id: string;
  name: string;
  title: string;
  specialty: ArchetypeId;
  description: string;
  unlockRequirement: { type: "mastery"; archetype: ArchetypeId; threshold: number } | { type: "tier"; role: string; minTier: number };
  bonus: string;
  bonusEffect: { extraTime: number } | { reducedDamage: number };
}

interface Gear {
  id: string;
  name: string;
  slot: "weapon" | "armor" | "trinket";
  description: string;
  bonus: string;
  bonusEffect: { extraTime?: number; reducedDamage?: number; masteryBoost?: number };
}

const GEAR_OPTIONS: Gear[] = [
  {
    id: "training_blade",
    name: "Training Blade",
    slot: "weapon",
    description: "Dulled practice sword. Safe but effective for learning.",
    bonus: "+2s timer",
    bonusEffect: { extraTime: 2 },
  },
  {
    id: "swift_blade",
    name: "Swift Blade",
    slot: "weapon",
    description: "Light, fast weapon for quick strikes.",
    bonus: "+5% mastery gain",
    bonusEffect: { masteryBoost: 5 },
  },
  {
    id: "heavy_blade",
    name: "Heavy Blade",
    slot: "weapon",
    description: "Weighty but powerful. Rewards precision.",
    bonus: "+10% mastery, -2s timer",
    bonusEffect: { masteryBoost: 10, extraTime: -2 },
  },
  {
    id: "padded_vest",
    name: "Padded Vest",
    slot: "armor",
    description: "Basic protection. Cushions blows.",
    bonus: "-5 damage on wrong",
    bonusEffect: { reducedDamage: 5 },
  },
  {
    id: "chainmail",
    name: "Chainmail",
    slot: "armor",
    description: "Reliable protection. Standard issue.",
    bonus: "-10 damage on wrong",
    bonusEffect: { reducedDamage: 10 },
  },
  {
    id: "luck_charm",
    name: "Luck Charm",
    slot: "trinket",
    description: "A small token from the old country.",
    bonus: "+3s timer",
    bonusEffect: { extraTime: 3 },
  },
  {
    id: "focus_ring",
    name: "Focus Ring",
    slot: "trinket",
    description: "Helps maintain concentration under pressure.",
    bonus: "+5% mastery gain",
    bonusEffect: { masteryBoost: 5 },
  },
];

const TRAINERS: Trainer[] = [
  {
    id: "grundak",
    name: "Grundak the Brawler",
    title: "Pit Champion",
    specialty: "BRUISER",
    description: "Retired arena champion. Knows how to trade blows.",
    unlockRequirement: { type: "mastery", archetype: "BRUISER", threshold: 20 },
    bonus: "+3s timer",
    bonusEffect: { extraTime: 3 },
  },
  {
    id: "silka",
    name: "Silka Quickfoot",
    title: "Scout Instructor",
    specialty: "SKIRMISHER",
    description: "Former military scout. Teaches flanking tactics.",
    unlockRequirement: { type: "mastery", archetype: "SKIRMISHER", threshold: 20 },
    bonus: "+3s timer",
    bonusEffect: { extraTime: 3 },
  },
  {
    id: "morath",
    name: "Morath Ashspeaker",
    title: "Rite Keeper",
    specialty: "HEXER",
    description: "Wandering hedge witch. Knows rite counters.",
    unlockRequirement: { type: "mastery", archetype: "HEXER", threshold: 20 },
    bonus: "-10 damage on wrong",
    bonusEffect: { reducedDamage: 10 },
  },
  {
    id: "aldric",
    name: "Aldric Ironsides",
    title: "Guard Captain",
    specialty: "SHIELDBEARER",
    description: "Veteran defender. Teaches patience in combat.",
    unlockRequirement: { type: "tier", role: "COMMANDER", minTier: 2 },
    bonus: "-10 damage on wrong",
    bonusEffect: { reducedDamage: 10 },
  },
  {
    id: "vessa",
    name: "Vessa Webweaver",
    title: "Trapmaster",
    specialty: "SNARER",
    description: "Former bandit. Knows every trick in the book.",
    unlockRequirement: { type: "mastery", archetype: "SNARER", threshold: 25 },
    bonus: "+3s timer",
    bonusEffect: { extraTime: 3 },
  },
  {
    id: "karras",
    name: "Karras Duelbane",
    title: "Swordmaster",
    specialty: "DUELIST",
    description: "Disgraced noble. Still the best blade in the region.",
    unlockRequirement: { type: "tier", role: "ARBITOR", minTier: 2 },
    bonus: "+3s timer",
    bonusEffect: { extraTime: 3 },
  },
  {
    id: "thenna",
    name: "Thenna Crowbane",
    title: "Warband Leader",
    specialty: "SWARM",
    description: "Commands from experience. Knows mob tactics.",
    unlockRequirement: { type: "tier", role: "COMMANDER", minTier: 3 },
    bonus: "-10 damage on wrong",
    bonusEffect: { reducedDamage: 10 },
  },
];

const ARCHETYPES: { id: ArchetypeId; name: string; description: string }[] = [
  { id: "BRUISER", name: "Bruiser", description: "Heavy hitters. Predictable but punishing." },
  { id: "SKIRMISHER", name: "Skirmisher", description: "Mobile fighters. Test positioning knowledge." },
  { id: "HEXER", name: "Hexer", description: "Magical threats. Require rite awareness." },
  { id: "SHIELDBEARER", name: "Shieldbearer", description: "Defensive. Need patience and tactics." },
  { id: "SNARER", name: "Snarer", description: "Control specialists. Test escape routes." },
  { id: "DUELIST", name: "Duelist", description: "Precise fighters. Punish mistakes." },
  { id: "SWARM", name: "Swarm", description: "Multiple foes. Area control matters." },
];

const ENEMY_SCENES: Record<ArchetypeId, { intro: string[]; taunt: string[]; hit: string[]; miss: string[]; wounded: string[] }> = {
  BRUISER: {
    intro: ["A massive figure blocks your path, cracking scarred knuckles.", "The brute grins, muscles tensing beneath battle-worn leather."],
    taunt: ["'Thinking won't save you, little one.'", "'I've crushed smarter foes than you.'"],
    hit: ["The blow connects and staggers the brute backward.", "Your strike finds its mark. The bruiser grunts in surprise."],
    miss: ["A massive fist crashes into your guard.", "The brute's haymaker sends you stumbling."],
    wounded: ["Blood drips from a split lip. The bruiser's grin fades.", "Breathing heavy now, the brute circles more cautiously."],
  },
  SKIRMISHER: {
    intro: ["A blur of motion resolves into a lean fighter, blade already drawn.", "The skirmisher dances just out of reach, eyes calculating."],
    taunt: ["'Too slow. Always too slow.'", "'Can you even see me when I move?'"],
    hit: ["You anticipate the dodge and land a clean strike.", "The skirmisher's surprise shows as your blow connects."],
    miss: ["A sharp sting as a blade finds a gap in your defense.", "The skirmisher was never where you thought."],
    wounded: ["The dancer stumbles, losing their rhythm.", "For the first time, fear flickers in those quick eyes."],
  },
  HEXER: {
    intro: ["Strange symbols glow in the air. A robed figure weaves dark patterns.", "The temperature drops. The hexer's whispers fill your mind."],
    taunt: ["'Your thoughts betray you.'", "'The rites know your weakness.'"],
    hit: ["Your counterspell disrupts the weaving. The hexer recoils.", "The magic shatters as you break their concentration."],
    miss: ["Pain lances through your skull as the hex takes hold.", "Reality warps. You can't tell what's real."],
    wounded: ["The hexer clutches their focus, light dimming.", "Desperate now, the rites become wilder, less controlled."],
  },
  SHIELDBEARER: {
    intro: ["A wall of steel advances. Patient. Unrelenting.", "The shieldbearer sets their stance, an immovable fortress."],
    taunt: ["'You'll tire before I fall.'", "'I've held this ground for decades.'"],
    hit: ["You find the gap. The shield drops for just a moment.", "A clever feint draws the shield aside. You strike true."],
    miss: ["The shield absorbs everything. Your arm goes numb.", "Patience was never your strong suit."],
    wounded: ["The shield arm droops slightly. An opening forms.", "Even fortresses have cracks. You've found this one's."],
  },
  SNARER: {
    intro: ["Nets and chains jingle in the darkness. Something lurks.", "You feel the trap before you see it. The snarer waits."],
    taunt: ["'Already caught. Just don't know it yet.'", "'Every step brings you closer to my web.'"],
    hit: ["You cut through the bindings, advancing on your tormentor.", "The snarer's eyes widen as you slip free and press forward."],
    miss: ["Ropes tighten around your ankles. Panic rises.", "Another binding. Another trap. The snarer laughs."],
    wounded: ["The trapmaster runs low on tricks.", "Desperation leads to sloppy traps. You're gaining ground."],
  },
  DUELIST: {
    intro: ["The blade salute is perfect. Too perfect. This one knows the art.", "A single blade catches the light. The duelist waits in first position."],
    taunt: ["'Your form is... adequate.'", "'I've studied every style. Show me something new.'"],
    hit: ["Blade meets blade, and yours finds flesh.", "A classic counter. The duelist inclines their head in respect."],
    miss: ["A red line appears. You didn't even see the cut.", "The riposte comes faster than thought."],
    wounded: ["The perfect stance falters. Blood mars the pristine uniform.", "For the first time, desperation creeps into those measured attacks."],
  },
  SWARM: {
    intro: ["They come from everywhere. Shadows with too many eyes.", "The pack circles. Hungry. Patient. Endless."],
    taunt: ["'One falls, two rise.'", "'You can't fight us all.'"],
    hit: ["The pack recoils as you cut through their numbers.", "Leadership matters. Strike the alpha, scatter the rest."],
    miss: ["Too many angles. Too many teeth.", "They drag you down by sheer numbers."],
    wounded: ["The swarm hesitates. Their numbers thin.", "Fear spreads through the pack like wildfire."],
  },
};

const getSceneText = (archetype: ArchetypeId, situation: keyof typeof ENEMY_SCENES.BRUISER): string => {
  const scenes = ENEMY_SCENES[archetype];
  const options = scenes[situation];
  return options[Math.floor(Math.random() * options.length)];
};

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
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  const [selectedGear, setSelectedGear] = useState<Record<string, Gear | null>>({
    weapon: null,
    armor: null,
    trinket: null,
  });
  const [showGearPanel, setShowGearPanel] = useState(false);
  const [sceneText, setSceneText] = useState<string | null>(null);

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

  const isTrainerUnlocked = (trainer: Trainer): boolean => {
    if (trainer.unlockRequirement.type === "mastery") {
      const archMastery = mastery.archetypes[trainer.unlockRequirement.archetype] || 0;
      return archMastery >= trainer.unlockRequirement.threshold;
    } else {
      const roleData = state.roles[trainer.unlockRequirement.role as keyof typeof state.roles];
      return roleData?.tier >= trainer.unlockRequirement.minTier;
    }
  };

  const getUnlockProgress = (trainer: Trainer): { current: number; required: number; label: string } => {
    if (trainer.unlockRequirement.type === "mastery") {
      const archMastery = mastery.archetypes[trainer.unlockRequirement.archetype] || 0;
      return {
        current: archMastery,
        required: trainer.unlockRequirement.threshold,
        label: `${trainer.unlockRequirement.archetype} Mastery`,
      };
    } else {
      const roleData = state.roles[trainer.unlockRequirement.role as keyof typeof state.roles];
      return {
        current: roleData?.tier || 1,
        required: trainer.unlockRequirement.minTier,
        label: `${trainer.unlockRequirement.role} Tier`,
      };
    }
  };

  const handleStartTrial = useCallback(() => {
    if (!selectedArchetype) return;
    
    actions.startTrial(selectedArchetype, {
      rivalId: selectedRival || undefined,
      culture: selectedCulture || undefined,
      isPitFight: isTrainingMode ? false : isPitFight,
      isRivalFight: !!selectedRival,
    });
    
    const baseTimer = trial?.timer || 15;
    const trainerBonus = selectedTrainer && "extraTime" in selectedTrainer.bonusEffect 
      ? selectedTrainer.bonusEffect.extraTime 
      : 0;
    const gearBonuses = getGearBonuses();
    
    setTimeRemaining(baseTimer + trainerBonus + gearBonuses.extraTime);
    setLastResult(null);
    setSceneText(getSceneText(selectedArchetype, "intro"));
  }, [selectedArchetype, selectedRival, selectedCulture, isPitFight, isTrainingMode, selectedTrainer, selectedGear, actions, trial?.timer]);

  const handleAnswer = useCallback((answerIndex: number) => {
    const result = actions.answerTrialQuestion(answerIndex);
    const archetype = trial?.archetype || "BRUISER";
    const trialState = actions.getTrialState();
    
    let narrativeText: string;
    if (result.correct) {
      if (trialState && trialState.damage >= 50) {
        narrativeText = getSceneText(archetype, "wounded");
      } else {
        narrativeText = getSceneText(archetype, "hit");
      }
    } else {
      narrativeText = getSceneText(archetype, "miss");
    }
    setSceneText(narrativeText);
    
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
      setSelectedTrainer(null);
      setIsTrainingMode(false);
      setSceneText(null);
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
    setSelectedTrainer(null);
    setIsTrainingMode(false);
    setLastResult(null);
    setSceneText(null);
  }, [actions]);

  const handleSelectTrainer = (trainer: Trainer) => {
    if (!isTrainerUnlocked(trainer)) return;
    setSelectedTrainer(trainer);
    setSelectedArchetype(trainer.specialty);
    setIsTrainingMode(true);
  };

  const handleSelectGear = (gear: Gear) => {
    setSelectedGear(prev => ({
      ...prev,
      [gear.slot]: prev[gear.slot]?.id === gear.id ? null : gear,
    }));
  };

  const getGearBonuses = (): { extraTime: number; reducedDamage: number; masteryBoost: number } => {
    let extraTime = 0;
    let reducedDamage = 0;
    let masteryBoost = 0;
    
    Object.values(selectedGear).forEach(gear => {
      if (gear) {
        extraTime += gear.bonusEffect.extraTime || 0;
        reducedDamage += gear.bonusEffect.reducedDamage || 0;
        masteryBoost += gear.bonusEffect.masteryBoost || 0;
      }
    });
    
    return { extraTime, reducedDamage, masteryBoost };
  };

  const equippedCount = Object.values(selectedGear).filter(g => g !== null).length;

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
          <Tabs defaultValue="arena" className="mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="arena" data-testid="tab-arena">
                <Sword className="h-4 w-4 mr-1" />
                Arena
              </TabsTrigger>
              <TabsTrigger value="training" data-testid="tab-training">
                <GraduationCap className="h-4 w-4 mr-1" />
                Training
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="arena" className="mt-4">
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
                            onClick={() => {
                              setSelectedArchetype(arch.id);
                              setIsTrainingMode(false);
                              setSelectedTrainer(null);
                            }}
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

                  <div className="flex items-center gap-2 flex-wrap">
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
                    <Button
                      size="sm"
                      variant={showGearPanel ? "default" : "outline"}
                      onClick={() => setShowGearPanel(!showGearPanel)}
                      data-testid="toggle-gear"
                    >
                      <Backpack className="h-4 w-4 mr-1" />
                      Gear {equippedCount > 0 && `(${equippedCount})`}
                    </Button>
                  </div>

                  {showGearPanel && (
                    <div className="border rounded-lg p-3 bg-muted/20">
                      <span className="text-xs font-semibold text-muted-foreground mb-3 block">Equipment Loadout</span>
                      {(["weapon", "armor", "trinket"] as const).map(slot => {
                        const SlotIcon = slot === "weapon" ? Sword : slot === "armor" ? ShieldCheck : Gem;
                        const slotGear = GEAR_OPTIONS.filter(g => g.slot === slot);
                        return (
                          <div key={slot} className="mb-3 last:mb-0">
                            <div className="flex items-center gap-1 mb-2">
                              <SlotIcon className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs uppercase text-muted-foreground">{slot}</span>
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                              {slotGear.map(gear => {
                                const isSelected = selectedGear[slot]?.id === gear.id;
                                return (
                                  <button
                                    key={gear.id}
                                    onClick={() => handleSelectGear(gear)}
                                    className={`p-2 rounded text-left text-xs transition-all ${
                                      isSelected 
                                        ? "bg-primary/10 border border-primary" 
                                        : "bg-background border border-border hover-elevate"
                                    }`}
                                    data-testid={`gear-${gear.id}`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium">{gear.name}</span>
                                      <span className={`text-xs ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                                        {gear.bonus}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      {equippedCount > 0 && (
                        <div className="mt-3 pt-2 border-t border-border">
                          <span className="text-xs font-semibold block mb-1">Active Bonuses:</span>
                          <div className="flex flex-wrap gap-1">
                            {getGearBonuses().extraTime !== 0 && (
                              <Badge variant="outline" className="text-xs">
                                {getGearBonuses().extraTime > 0 ? "+" : ""}{getGearBonuses().extraTime}s timer
                              </Badge>
                            )}
                            {getGearBonuses().reducedDamage > 0 && (
                              <Badge variant="outline" className="text-xs">
                                -{getGearBonuses().reducedDamage} damage
                              </Badge>
                            )}
                            {getGearBonuses().masteryBoost > 0 && (
                              <Badge variant="outline" className="text-xs">
                                +{getGearBonuses().masteryBoost}% mastery
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

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
            </TabsContent>

            <TabsContent value="training" className="mt-4">
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Training Grounds
                  </CardTitle>
                  <CardDescription>
                    Train with veteran instructors. Unlock trainers by gaining mastery or advancing your roles.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {TRAINERS.map(trainer => {
                    const unlocked = isTrainerUnlocked(trainer);
                    const progress = getUnlockProgress(trainer);
                    const isSelected = selectedTrainer?.id === trainer.id;
                    
                    return (
                      <div
                        key={trainer.id}
                        className={`p-3 rounded-lg border transition-all ${
                          unlocked 
                            ? isSelected 
                              ? "border-primary bg-primary/5" 
                              : "border-border hover-elevate cursor-pointer"
                            : "border-muted bg-muted/20 opacity-60"
                        }`}
                        onClick={() => unlocked && handleSelectTrainer(trainer)}
                        data-testid={`trainer-${trainer.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {unlocked ? (
                                <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                              ) : (
                                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                              )}
                              <span className="font-semibold text-sm truncate">{trainer.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{trainer.title}</p>
                            <p className="text-xs">{trainer.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge variant={unlocked ? "default" : "secondary"} className="text-xs mb-1">
                              {ARCHETYPES.find(a => a.id === trainer.specialty)?.name}
                            </Badge>
                            {unlocked && (
                              <p className="text-xs text-green-600">{trainer.bonus}</p>
                            )}
                          </div>
                        </div>
                        {!unlocked && (
                          <div className="mt-2 pt-2 border-t border-muted">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">{progress.label}</span>
                              <span>{progress.current}/{progress.required}</span>
                            </div>
                            <Progress 
                              value={(progress.current / progress.required) * 100} 
                              className="h-1.5" 
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {selectedTrainer && (
                <Card className="mb-4 border-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Training with {selectedTrainer.name}</CardTitle>
                    <CardDescription>
                      Practicing against {ARCHETYPES.find(a => a.id === selectedTrainer.specialty)?.name} archetype
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded text-sm">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span>Bonus: {selectedTrainer.bonus}</span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleStartTrial}
                      data-testid="button-start-training"
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Begin Training
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

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

              {sceneText && (
                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 mb-3">
                  <p className="text-sm italic text-slate-300" data-testid="scene-text">{sceneText}</p>
                </div>
              )}

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
