import { useGameState } from "@/hooks/use-game-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { 
  BIOMES, 
  SETTLEMENTS, 
  SUBREGION_CATEGORIES, 
  THREE_MARKS,
  CULTURAL_TABOOS,
  getSettlementsByBiome 
} from "@/lib/world-data";
import { SLATE_MAPPING, type BiomeType } from "@shared/schema";
import { MapPin, Mountain, Trees, Waves, Sun, Wheat, Shield, BookOpen, Factory, Church, Users } from "lucide-react";
import { Link } from "wouter";

const BIOME_ICONS: Record<BiomeType, typeof MapPin> = {
  COASTAL_LOWLANDS: Waves,
  RIVER_BASIN: Wheat,
  HIGHLAND_PLATEAU: Mountain,
  FOREST_INTERIOR: Trees,
  ARID_FRONTIER: Sun,
};

const BIOME_COLORS: Record<BiomeType, string> = {
  COASTAL_LOWLANDS: "text-blue-400",
  RIVER_BASIN: "text-emerald-400",
  HIGHLAND_PLATEAU: "text-stone-400",
  FOREST_INTERIOR: "text-green-400",
  ARID_FRONTIER: "text-amber-400",
};

export default function WorldBible() {
  const { state, actions } = useGameState();

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl text-slate-100 font-serif font-bold" data-testid="text-page-title">World Bible</h1>
              <p className="text-xs text-slate-500">The Mainland</p>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="button-back-home">Back</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* S.L.A.T.E. Acronym */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-amber-400 font-serif">S.L.A.T.E. System</CardTitle>
            <CardDescription>The pillars of power in the Mainland</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {Object.entries(SLATE_MAPPING).map(([letter, data]) => (
                <div key={letter} className="bg-slate-950 rounded-lg p-3 text-center border border-slate-800">
                  <span className="text-2xl font-bold text-amber-500">{letter}</span>
                  <p className="text-xs text-slate-400 mt-1">{data.letter}</p>
                  <Badge variant="outline" className="mt-2 text-[10px]">{data.primaryRole}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Three Marks (Orc Legitimacy) */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-red-400 font-serif flex items-center gap-2">
              <Shield className="w-5 h-5" />
              The Three Marks
            </CardTitle>
            <CardDescription>Orc legitimacy core - proof of worthiness to lead</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(THREE_MARKS).map(([key, mark]) => {
              const value = state.world.threeMarks[key.toLowerCase() as keyof typeof state.world.threeMarks];
              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-200">{mark.name}</span>
                    <span className="text-xs text-slate-400">{value}/100</span>
                  </div>
                  <Progress value={value} className="h-2" />
                  <p className="text-xs text-slate-500">{mark.description}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Cultural Taboos */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-purple-400 font-serif flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Cultural Traditions
            </CardTitle>
            <CardDescription>Laws and taboos across the peoples</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(CULTURAL_TABOOS).map(([culture, taboos]) => (
                <AccordionItem key={culture} value={culture} className="border-slate-800">
                  <AccordionTrigger className="text-slate-200 hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {culture} Traditions
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {taboos.map((taboo, idx) => (
                        <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                          <span className="text-amber-500">•</span>
                          {taboo}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Biomes & Settlements */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-200 font-serif flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Biomes & Settlements
          </h2>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {(Object.keys(BIOMES) as BiomeType[]).map((biomeKey) => {
              const biome = BIOMES[biomeKey];
              const BiomeIcon = BIOME_ICONS[biomeKey];
              const settlements = getSettlementsByBiome(biomeKey);

              return (
                <AccordionItem 
                  key={biomeKey} 
                  value={biomeKey}
                  className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <BiomeIcon className={`w-5 h-5 ${BIOME_COLORS[biomeKey]}`} />
                      <div className="text-left">
                        <p className={`font-medium ${BIOME_COLORS[biomeKey]}`}>{biome.name}</p>
                        <p className="text-xs text-slate-500">{settlements.length} settlements</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="text-sm text-slate-400 mb-4">{biome.description}</p>
                    
                    <div className="space-y-3">
                      {settlements.map((settlement) => {
                        const visited = state.world.visitedSettlements.includes(settlement.id);
                        return (
                          <Card 
                            key={settlement.id} 
                            className={`bg-slate-950 border-slate-800 ${visited ? 'border-l-2 border-l-emerald-500' : ''}`}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-slate-200">{settlement.name}</span>
                                    <Badge variant="outline" className="text-[10px]">
                                      {settlement.population}
                                    </Badge>
                                    <Badge variant="secondary" className="text-[10px]">
                                      {SUBREGION_CATEGORIES[settlement.subregionCategory].name}
                                    </Badge>
                                    {visited && (
                                      <Badge className="bg-emerald-900 text-emerald-300 text-[10px]">Visited</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1">{settlement.description}</p>
                                  
                                  {settlement.culturalTaboo && (
                                    <p className="text-xs text-amber-500/70 mt-2">
                                      Taboo: {settlement.culturalTaboo}
                                    </p>
                                  )}
                                  {settlement.witnessTradition && (
                                    <p className="text-xs text-purple-400/70 mt-1">
                                      Witness: {settlement.witnessTradition}
                                    </p>
                                  )}
                                </div>
                                
                                <Button 
                                  size="sm" 
                                  variant={visited ? "secondary" : "default"}
                                  onClick={() => actions.visitSettlement(settlement.id)}
                                  data-testid={`button-visit-${settlement.id}`}
                                >
                                  {visited ? "Revisit" : "Visit"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Subregion Categories Reference */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-300 font-serif text-lg">Subregion Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Object.entries(SUBREGION_CATEGORIES).map(([key, cat]) => (
                <div key={key} className="bg-slate-950 rounded-lg p-2 text-center border border-slate-800">
                  <p className="text-xs font-medium text-slate-300">{cat.name}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{cat.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Future Systems Note */}
        <Card className="bg-slate-950 border-dashed border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 text-center">
              Future: Injury/Escape failure model (no permadeath). Combat & quest systems coming in Step 2+.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
