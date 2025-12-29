import { useState, useRef } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Download, Upload, RotateCcw, Save, FileJson, AlertTriangle } from "lucide-react";

export default function Settings() {
  const { actions } = useGameState();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleDownloadSave = () => {
    actions.downloadSave();
    toast({
      title: "Save Downloaded",
      description: "Your game save has been downloaded as a JSON file.",
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const success = actions.importSave(text);
      
      if (success) {
        toast({
          title: "Save Loaded",
          description: "Your game has been restored from the save file.",
        });
        setLocation("/");
      } else {
        toast({
          title: "Load Failed",
          description: "The save file appears to be corrupted or invalid.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Load Failed",
        description: "Could not read the save file.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRestart = () => {
    actions.resetGame();
    toast({
      title: "Game Restarted",
      description: "All progress has been reset. A new adventure begins.",
    });
    setLocation("/");
  };

  return (
    <div className="min-h-full bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-100">
            Settings
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Manage your game data and preferences.
          </p>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Save className="w-5 h-5 text-blue-400" />
              Save Management
            </CardTitle>
            <CardDescription className="text-slate-400">
              Export your progress to a file or restore from a previous save.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleDownloadSave}
                className="flex-1"
                data-testid="button-download-save"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Save
              </Button>

              <Button
                onClick={handleUploadClick}
                variant="outline"
                className="flex-1"
                disabled={isImporting}
                data-testid="button-load-save"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isImporting ? "Loading..." : "Load Save"}
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
                data-testid="input-file-save"
              />
            </div>

            <div className="flex items-start gap-2 p-3 rounded-md bg-slate-800/50 border border-slate-700">
              <FileJson className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-400">
                Saves are stored locally in your browser. Download a backup to preserve your progress across devices or browser resets.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-red-400" />
              Restart Game
            </CardTitle>
            <CardDescription className="text-slate-400">
              Begin a fresh adventure. This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full sm:w-auto"
                  data-testid="button-restart-game"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Restart Game
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-900 border-slate-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-slate-100">
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    This will permanently delete all your progress, including your roles, resources, contracts, and relationships. Consider downloading a save first.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel 
                    className="bg-slate-800 border-slate-700 text-slate-100"
                    data-testid="button-cancel-restart"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRestart}
                    className="bg-red-600 hover:bg-red-700"
                    data-testid="button-confirm-restart"
                  >
                    Yes, restart
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100 text-sm">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              The Arbitor of the Mainland v0.8
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
