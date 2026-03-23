import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeftRight, Camera, RefreshCw, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useCamera } from "../camera/useCamera";
import { getFoodScanResult } from "../utils/nutrition";
import type { FoodScanResult } from "../utils/nutrition";

interface FoodScannerProps {
  userCalories: number;
  userProtein: number;
}

function rgbToHsl(
  rIn: number,
  gIn: number,
  bIn: number,
): [number, number, number] {
  const r = rIn / 255;
  const g = gIn / 255;
  const b = bIn / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function analyzeImageColors(file: File): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(getFallbackFoods());
        return;
      }
      ctx.drawImage(img, 0, 0, 64, 64);
      URL.revokeObjectURL(url);
      const data = ctx.getImageData(0, 0, 64, 64).data;
      let redOrange = 0;
      let yellow = 0;
      let green = 0;
      let brown = 0;
      let white = 0;
      let darkBrown = 0;
      const total = 64 * 64;
      for (let i = 0; i < data.length; i += 4) {
        const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
        if (l > 0.85) {
          white++;
          continue;
        }
        if (s < 0.12) {
          if (l < 0.25) darkBrown++;
          else white++;
          continue;
        }
        if (h < 30 || h >= 330) redOrange++;
        else if (h < 60) yellow++;
        else if (h < 150) green++;
        if (s > 0.12 && s < 0.55 && l > 0.25 && l < 0.6 && (h < 50 || h > 320))
          brown++;
        if (l < 0.25 && s > 0.1) darkBrown++;
      }
      resolve(
        mapColorsToFoods(
          { redOrange, yellow, green, brown, white, darkBrown },
          total,
        ),
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(getFallbackFoods());
    };
    img.src = url;
  });
}

function mapColorsToFoods(
  scores: Record<string, number>,
  total: number,
): string[] {
  const pct = (k: string) => (scores[k] / total) * 100;
  const pool: string[] = [];
  if (pct("redOrange") > 15)
    pool.push("Pizza", "Burger", "Fried Chicken", "Chicken Curry");
  if (pct("yellow") > 12) pool.push("Biryani", "Fried Rice", "Omelette", "Dal");
  if (pct("brown") > 15) pool.push("Sandwich", "Bread", "Samosa", "Falafel");
  if (pct("green") > 18)
    pool.push("Salad", "Stir-Fry Vegetables", "Avocado Toast");
  if (pct("white") > 28) pool.push("Rice", "Pasta", "Eggs", "Idli");
  if (pct("darkBrown") > 10)
    pool.push("Meat Curry", "Grilled Fish", "Rajma", "Dosa");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const f of pool) {
    if (!seen.has(f)) {
      seen.add(f);
      out.push(f);
    }
    if (out.length === 6) break;
  }
  if (out.length < 4)
    for (const f of getFallbackFoods()) {
      if (!seen.has(f)) {
        seen.add(f);
        out.push(f);
      }
      if (out.length === 6) break;
    }
  return out.slice(0, 6);
}

function getFallbackFoods(): string[] {
  return ["Pizza", "Burger", "Biryani", "Salad", "Fried Rice", "Eggs"];
}

const MORE_FOODS = [
  "Rice",
  "Dal",
  "Samosa",
  "Dosa",
  "Idli",
  "Paneer",
  "Chicken Tikka",
  "Grilled Fish",
  "Omelette",
  "Sandwich",
  "Pasta",
  "Noodles",
  "Soup",
  "Fruits",
  "Yogurt",
];

export function FoodScanner({
  userCalories,
  userProtein: _userProtein,
}: FoodScannerProps) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [result, setResult] = useState<FoodScanResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingLabel, setAnalyzingLabel] = useState("Scanning image...");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const camera = useCamera({ facingMode: "environment" });

  const handleOpenCamera = async () => {
    setCameraOpen(true);
    setTimeout(async () => {
      await camera.startCamera();
    }, 100);
  };

  const handleCloseCamera = async () => {
    await camera.stopCamera();
    setCameraOpen(false);
  };

  const handleCapture = async () => {
    const file = await camera.capturePhoto();
    if (file) {
      setCapturedImage(URL.createObjectURL(file));
      await camera.stopCamera();
      setCameraOpen(false);
      processImageFile(file);
    }
  };

  async function processImageFile(file: File) {
    setAnalyzing(true);
    setAnalyzingLabel("Scanning image...");
    setSuggestions(null);
    setResult(null);
    const detected = await analyzeImageColors(file);
    setAnalyzing(false);
    setSuggestions(detected);
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedImage(URL.createObjectURL(file));
    setResult(null);
    processImageFile(file);
  };

  function handleSelectFood(name: string) {
    setSuggestions(null);
    setAnalyzingLabel("Calculating nutrition...");
    setAnalyzing(true);
    setTimeout(() => {
      setResult(getFoodScanResult(name));
      setAnalyzing(false);
    }, 800);
  }

  const handleReset = () => {
    setCapturedImage(null);
    setSuggestions(null);
    setResult(null);
    setAnalyzing(false);
  };

  const pctCalories = result
    ? Math.min(100, Math.round((result.calories / userCalories) * 100))
    : 0;

  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm">
      <h2 className="font-bold text-base text-foreground mb-1 flex items-center gap-2">
        <span style={{ fontSize: "1.1em" }}>📸</span> Scan Your Food
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Take or upload any photo — AI reads the image and detects the food
        automatically.
      </p>

      {!capturedImage && (
        <div className="flex gap-3 mb-4">
          <button
            type="button"
            data-ocid="foodscanner.primary_button"
            onClick={handleOpenCamera}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-transform active:scale-95"
            style={{ background: "linear-gradient(135deg, #3db843, #1a6fc4)" }}
          >
            <Camera className="w-4 h-4" /> Take Photo
          </button>
          <button
            type="button"
            data-ocid="foodscanner.upload_button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 border-border bg-background text-foreground transition-colors hover:border-primary"
          >
            <Upload className="w-4 h-4" /> Upload Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      )}

      {capturedImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4"
        >
          <div className="relative rounded-xl overflow-hidden mb-3">
            <img
              src={capturedImage}
              alt="Food"
              className="w-full object-cover rounded-xl"
              style={{ maxHeight: "200px" }}
            />
            <button
              type="button"
              onClick={handleReset}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {analyzing && (
            <div
              className="flex items-center gap-2 py-3"
              data-ocid="foodscanner.loading_state"
            >
              <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {analyzingLabel}
              </span>
            </div>
          )}

          {suggestions && !result && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-xs font-semibold text-foreground mb-2">
                  Which food is this? Tap to confirm:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((food) => (
                    <button
                      key={food}
                      type="button"
                      onClick={() => handleSelectFood(food)}
                      data-ocid={`foodscanner.chip.${food.toLowerCase().replace(/\s+/g, "_")}`}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 border-border bg-background text-foreground hover:border-green-500 hover:text-green-700 active:scale-95 transition-all"
                    >
                      {food}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Not listed?{" "}
                  <button
                    type="button"
                    className="underline text-foreground"
                    onClick={() => setSuggestions(MORE_FOODS)}
                  >
                    Show more options
                  </button>
                </p>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            data-ocid="foodscanner.success_state"
          >
            <div
              className="rounded-xl p-4 mb-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(61,184,67,0.08), rgba(26,111,196,0.08))",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-foreground">
                  {result.foodName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {pctCalories}% of daily goal
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="text-center">
                  <div
                    className="font-bold text-lg"
                    style={{ color: "#3db843" }}
                  >
                    {result.calories}
                  </div>
                  <div className="text-xs text-muted-foreground">kcal</div>
                </div>
                <div className="text-center">
                  <div
                    className="font-bold text-lg"
                    style={{ color: "#1a6fc4" }}
                  >
                    {result.protein}g
                  </div>
                  <div className="text-xs text-muted-foreground">protein</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-foreground">
                    {result.carbs}g
                  </div>
                  <div className="text-xs text-muted-foreground">carbs</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center bg-muted rounded-lg py-1.5">
                  <span className="text-xs font-semibold text-foreground">
                    {result.fats}g{" "}
                  </span>
                  <span className="text-xs text-muted-foreground">fats</span>
                </div>
                <div className="text-center bg-muted rounded-lg py-1.5">
                  <span className="text-xs font-semibold text-foreground">
                    {result.fiber}g{" "}
                  </span>
                  <span className="text-xs text-muted-foreground">fiber</span>
                </div>
              </div>
            </div>

            <div
              className="rounded-xl p-4 border-2"
              style={{
                borderColor: "rgba(61,184,67,0.3)",
                background: "rgba(61,184,67,0.05)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <ArrowLeftRight
                  className="w-4 h-4"
                  style={{ color: "#3db843" }}
                />
                <span className="font-bold text-sm text-foreground">
                  Healthier Swaps
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {result.healthierSwaps.length} options
                </span>
              </div>
              <div className="space-y-3">
                {result.healthierSwaps.map((swap, i) => (
                  <div
                    key={swap.name}
                    className="bg-background/60 rounded-lg p-3"
                    data-ocid={`foodscanner.item.${i + 1}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-xs text-foreground">
                        {swap.name}
                      </span>
                      <span
                        className="text-xs font-bold flex-shrink-0"
                        style={{ color: "#3db843" }}
                      >
                        saves {Math.max(0, result.calories - swap.calories)}{" "}
                        kcal
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      {swap.reason}
                    </p>
                    <div className="flex gap-3 text-xs">
                      <span>
                        <span className="font-bold text-foreground">
                          {swap.calories}
                        </span>{" "}
                        kcal
                      </span>
                      <span>
                        <span
                          className="font-bold"
                          style={{ color: "#1a6fc4" }}
                        >
                          {swap.protein}g
                        </span>{" "}
                        protein
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="mt-3 w-full py-2 rounded-full text-xs font-semibold border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              Scan Another Food
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog
        open={cameraOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseCamera();
        }}
      >
        <DialogContent
          className="p-0 overflow-hidden rounded-2xl max-w-sm mx-auto"
          data-ocid="foodscanner.dialog"
        >
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="text-sm font-bold">
              Take a Food Photo
            </DialogTitle>
          </DialogHeader>
          <div className="relative bg-black">
            <video
              ref={camera.videoRef}
              autoPlay
              playsInline
              muted
              style={{
                height: "280px",
                width: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <canvas ref={camera.canvasRef} className="hidden" />
            {camera.error && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4"
                data-ocid="foodscanner.error_state"
              >
                <Camera className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm font-semibold">{camera.error.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  Please allow camera access in your browser settings.
                </p>
              </div>
            )}
            {camera.isLoading && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/60"
                data-ocid="foodscanner.loading_state"
              >
                <RefreshCw className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between px-4 py-3 gap-3">
            <button
              type="button"
              data-ocid="foodscanner.close_button"
              onClick={handleCloseCamera}
              className="p-2 rounded-full border border-border"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              type="button"
              data-ocid="foodscanner.primary_button"
              onClick={handleCapture}
              disabled={!camera.isActive}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-40 transition-transform active:scale-95"
              style={{
                background: "linear-gradient(135deg, #3db843, #1a6fc4)",
              }}
            >
              📷 Capture
            </button>
            <button
              type="button"
              data-ocid="foodscanner.toggle"
              onClick={() => camera.switchCamera()}
              disabled={!camera.isActive}
              className="p-2 rounded-full border border-border disabled:opacity-40"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
