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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  SETTLEMENTS, 
  DISTRICTS,
  getDistrictsBySettlement,
  getNPCsByDistrict
} from "@/lib/world-data";
import type { DistrictType } from "@shared/schema";
import { 
  Building2, 
  ShieldAlert, 
  ShoppingBag, 
  Factory, 
  Church,
  Anchor,
  Hammer,
  Users,
  Leaf,
  Home,
  Skull,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { Link } from "wouter";

const DISTRICT_ICONS: Record<DistrictType, typeof Building2> = {
  ELVEN_ENCLAVE: Leaf,
  HALFLING_QUARTER: Home,
  ORCISH_WARD: ShieldAlert,
  DWARVEN_WORKS: Hammer,
  HUMAN_COMMONS: Users,
  MIXED_MARKET: ShoppingBag,
  DOCKS: Anchor,
  CRAFTSMAN: Factory,
  TEMPLE: Church,
  GARRISON: ShieldAlert,
};

const DISTRICT_COLORS: Record<DistrictType, string> = {
  ELVEN_ENCLAVE: "text-green-400 border-green-800",
  HALFLING_QUARTER: "text-yellow-400 border-yellow-800",
  ORCISH_WARD: "text-red-400 border-red-800",
  DWARVEN_WORKS: "text-orange-400 border-orange-800",
  HUMAN_COMMONS: "text-slate-300 border-slate-700",
  MIXED_MARKET: "text-purple-400 border-purple-800",
  DOCKS: "text-blue-400 border-blue-800",
  CRAFTSMAN: "text-amber-400 border-amber-800",
  TEMPLE: "text-cyan-400 border-cyan-800",
  GARRISON: "text-rose-400 border-rose-800",
};

export default function Districts() {
  const { state, actions } = useGameState();
  const currentSettlement = SETTLEMENTS.find(s => s.id === state.world.currentSettlementId);
  const currentDistricts = currentSettlement ? getDistrictsBySettlement(currentSettlement.id) : [];

  // Get all settlements that have districts
  const settlementsWithDistricts = SETTLEMENTS.filter(s => 
    getDistrictsBySettlement(s.id).length > 0
  );

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl text-slate-100 font-serif font-bold" data-testid="text-page-title">Districts & Peoples</h1>
              <p className="text-xs text-slate-500">Hybrid community structure</p>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="button-back-home">Back</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Black Market Rules */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200 font-serif flex items-center gap-2">
              <Skull className="w-5 h-5 text-slate-500" />
              Black Market Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-300">Black markets exist in most districts</p>
                <p className="text-xs text-slate-500 mt-1">
                  Underground trade, smuggling, and illicit services can be found throughout the mainland.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-emerald-950/30 rounded-lg border border-emerald-800/50">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-emerald-300">Clean Hubs: Elven & Halfling Districts</p>
                <p className="text-xs text-slate-500 mt-1">
                  These communities maintain strict order. No black market operates here - it's cultural law.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* District Type Legend */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-300 font-serif text-lg">District Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(Object.keys(DISTRICT_ICONS) as DistrictType[]).map((type) => {
                const Icon = DISTRICT_ICONS[type];
                const colorClass = DISTRICT_COLORS[type].split(" ")[0];
                const isCleanHub = type === "ELVEN_ENCLAVE" || type === "HALFLING_QUARTER";
                
                return (
                  <div 
                    key={type} 
                    className={`bg-slate-950 rounded-lg p-2 text-center border ${isCleanHub ? 'border-emerald-800' : 'border-slate-800'}`}
                  >
                    <Icon className={`w-4 h-4 mx-auto ${colorClass}`} />
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                      {type.replace(/_/g, " ")}
                    </p>
                    {isCleanHub && (
                      <Badge className="bg-emerald-900/50 text-emerald-300 text-[8px] mt-1">Clean</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Current Location */}
        {currentSettlement && (
          <Alert className="bg-slate-900 border-amber-800">
            <Building2 className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-slate-300">
              Currently in: <span className="font-medium text-amber-400">{currentSettlement.name}</span>
              {state.world.currentDistrictId && (
                <span className="text-slate-500">
                  {" / "}
                  {DISTRICTS.find(d => d.id === state.world.currentDistrictId)?.name}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Settlements with Districts */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-200 font-serif flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Major Settlements
          </h2>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {settlementsWithDistricts.map((settlement) => {
              const districts = getDistrictsBySettlement(settlement.id);
              const isCurrentLocation = state.world.currentSettlementId === settlement.id;
              const cleanHubCount = districts.filter(d => !d.hasBlackMarket).length;
              const blackMarketCount = districts.filter(d => d.hasBlackMarket).length;

              return (
                <AccordionItem 
                  key={settlement.id} 
                  value={settlement.id}
                  className={`bg-slate-900 border rounded-lg overflow-hidden ${
                    isCurrentLocation ? 'border-amber-700' : 'border-slate-800'
                  }`}
                >
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <Building2 className="w-5 h-5 text-slate-400" />
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-slate-200">{settlement.name}</p>
                          {isCurrentLocation && (
                            <Badge className="bg-amber-900 text-amber-300 text-[10px]">You are here</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {districts.length} districts • 
                          <span className="text-emerald-400"> {cleanHubCount} clean</span> • 
                          <span className="text-red-400"> {blackMarketCount} black market</span>
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      {districts.map((district) => {
                        const Icon = DISTRICT_ICONS[district.type];
                        const colorClass = DISTRICT_COLORS[district.type];
                        const npcsInDistrict = getNPCsByDistrict(district.id);
                        const isCurrentDistrict = state.world.currentDistrictId === district.id;

                        return (
                          <Card 
                            key={district.id} 
                            className={`bg-slate-950 border ${colorClass.split(" ")[1]} ${
                              isCurrentDistrict ? 'ring-1 ring-amber-500' : ''
                            }`}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Icon className={`w-4 h-4 ${colorClass.split(" ")[0]}`} />
                                    <span className="font-medium text-slate-200">{district.name}</span>
                                    
                                    {!district.hasBlackMarket ? (
                                      <Badge className="bg-emerald-900/50 text-emerald-300 text-[10px]">
                                        Clean Hub
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[10px] text-red-400 border-red-800">
                                        Black Market
                                      </Badge>
                                    )}
                                    
                                    {district.dominantAncestry && (
                                      <Badge variant="secondary" className="text-[10px]">
                                        {district.dominantAncestry}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <p className="text-xs text-slate-500 mt-1">{district.description}</p>
                                  
                                  <p className="text-xs text-slate-600 mt-2">
                                    {npcsInDistrict.length} fixture NPCs
                                  </p>
                                </div>
                                
                                <Button 
                                  size="sm" 
                                  variant={isCurrentDistrict ? "secondary" : "outline"}
                                  onClick={() => {
                                    actions.visitSettlement(settlement.id);
                                    actions.visitDistrict(district.id);
                                  }}
                                  data-testid={`button-enter-${district.id}`}
                                >
                                  {isCurrentDistrict ? "Here" : "Enter"}
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

        {/* Summary Stats */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-200">{DISTRICTS.length}</p>
                <p className="text-xs text-slate-500">Total Districts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">
                  {DISTRICTS.filter(d => !d.hasBlackMarket).length}
                </p>
                <p className="text-xs text-slate-500">Clean Hubs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">
                  {DISTRICTS.filter(d => d.hasBlackMarket).length}
                </p>
                <p className="text-xs text-slate-500">With Black Market</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
