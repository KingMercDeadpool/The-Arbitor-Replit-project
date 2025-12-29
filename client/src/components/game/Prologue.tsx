import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, X, Sword, Eye, Crown, Scale } from "lucide-react";

interface PrologueScene {
  id: string;
  title: string;
  content: string;
  highlight?: string;
  icon?: JSX.Element;
}

const PROLOGUE_SCENES: PrologueScene[] = [
  {
    id: "intro",
    title: "The Mainland Awaits",
    content: "You are Kami Reiss, known as 'The Kitsune' - a rising power broker in a world of shifting alliances. The Mainland is a tapestry of cultures, factions, and ambitions. Your path to influence begins now.",
    highlight: "Welcome, Arbitor.",
  },
  {
    id: "roles",
    title: "Four Paths to Power",
    content: "Your influence grows through four parallel tracks. As Spymaster, you gather secrets and build networks. As Commander, you marshal forces and project strength. As Steward, you manage resources and territory. As Arbitor, you judge disputes and shape law.",
  },
  {
    id: "spymaster",
    title: "The Spymaster's Shadow",
    content: "Intelligence is your greatest weapon. Build networks of informants, uncover hidden truths, and manipulate events from the shadows. The Shadow lane in contracts relies on your covert skills.",
    icon: <Eye className="w-8 h-8 text-purple-400" />,
  },
  {
    id: "commander",
    title: "The Commander's Might",
    content: "When diplomacy fails, steel speaks. Train your forces, coordinate tactics, and project power where needed. The Steel lane in contracts demands martial solutions.",
    icon: <Sword className="w-8 h-8 text-red-400" />,
  },
  {
    id: "steward",
    title: "The Steward's Ledger",
    content: "Resources win wars before they begin. Manage supplies, secure trade routes, and ensure your operations remain funded. Smart resource management amplifies all your efforts.",
    icon: <Crown className="w-8 h-8 text-amber-400" />,
  },
  {
    id: "arbitor",
    title: "The Arbitor's Scales",
    content: "Law is a weapon as sharp as any blade. Arbitrate disputes, build legal frameworks, and establish your legitimacy. The Seal lane in contracts uses diplomatic authority.",
    icon: <Scale className="w-8 h-8 text-blue-400" />,
  },
  {
    id: "marks",
    title: "The Three Marks",
    content: "The Orcish clans recognize three virtues: Strength, Mind, and Stewardship. Your standing in each Mark determines your influence among the mainland's most powerful faction. Balance all three to earn their respect.",
  },
  {
    id: "trials",
    title: "Tactical Trials",
    content: "Combat in this world tests your wit, not just your reflexes. Tactical Trials present challenges of Lore, Doctrine, and Pattern recognition. Your knowledge grows with each encounter, granting you mastery over enemy archetypes.",
  },
  {
    id: "begin",
    title: "Your Journey Begins",
    content: "The Dashboard awaits. Contracts will test your judgment. The Tavern offers connections. The World holds secrets. Shape your destiny, Kitsune.",
    highlight: "Fortune favors the prepared.",
  },
];

interface PrologueProps {
  onComplete: () => void;
}

export function Prologue({ onComplete }: PrologueProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const scene = PROLOGUE_SCENES[currentScene];
  const isLastScene = currentScene === PROLOGUE_SCENES.length - 1;
  const isFirstScene = currentScene === 0;

  const handleNext = () => {
    if (isLastScene) {
      onComplete();
    } else {
      setCurrentScene(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstScene) {
      setCurrentScene(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950" />
      
      <div className="relative z-10 w-full max-w-2xl mx-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="absolute top-0 right-0 text-slate-500"
          data-testid="button-skip-prologue"
        >
          <X className="w-4 h-4 mr-1" />
          Skip
        </Button>

        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-6 p-8"
          >
            {scene.icon && (
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-slate-800/50 border border-slate-700">
                  {scene.icon}
                </div>
              </div>
            )}

            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-100">
              {scene.title}
            </h2>

            {scene.highlight && (
              <p className="text-amber-400 font-medium italic">
                {scene.highlight}
              </p>
            )}

            <p className="text-slate-300 leading-relaxed max-w-lg mx-auto">
              {scene.content}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-2 mt-4 mb-8">
          {PROLOGUE_SCENES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentScene(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentScene ? "bg-amber-400" : "bg-slate-700"
              }`}
              data-testid={`button-scene-${idx}`}
            />
          ))}
        </div>

        <div className="flex justify-center gap-4">
          {!isFirstScene && (
            <Button
              variant="outline"
              onClick={handlePrev}
              data-testid="button-prev-scene"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}

          <Button
            onClick={handleNext}
            className="min-w-[120px]"
            data-testid="button-next-scene"
          >
            {isLastScene ? "Begin" : "Continue"}
            {!isLastScene && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
