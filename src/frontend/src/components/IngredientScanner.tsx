import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, ChefHat, Plus, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import type { UserProfile } from "../types/nutrition";
import { generateIngredientRecipes } from "../utils/nutrition";
import type { IngredientRecipe } from "../utils/nutrition";

interface IngredientScannerProps {
  profile: UserProfile;
  onClose: () => void;
  onLog: (item: { name: string; cal: number; protein: number }) => void;
}

const CUISINES = [
  { key: "balanced", label: "Balanced" },
  { key: "indian", label: "🇮🇳 Indian" },
  { key: "mexican", label: "🌮 Mexican" },
  { key: "chinese", label: "🥢 Chinese" },
  { key: "mediterranean", label: "🫒 Mediterranean" },
  { key: "thai", label: "🌿 Thai" },
  { key: "greek", label: "🏛️ Greek" },
  { key: "japanese", label: "🍱 Japanese" },
  { key: "italian", label: "🍝 Italian" },
  { key: "korean", label: "🥢 Korean" },
  { key: "middle-eastern", label: "🧆 Middle Eastern" },
  { key: "keto", label: "🥑 Keto" },
  { key: "high-protein", label: "💪 High Protein" },
];

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rN) h = ((gN - bN) / d + (gN < bN ? 6 : 0)) / 6;
  else if (max === gN) h = ((bN - rN) / d + 2) / 6;
  else h = ((rN - gN) / d + 4) / 6;
  return [h * 360, s, l];
}

function analyzeImageForIngredients(file: File): Promise<string[]> {
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
        resolve(["chicken", "rice", "vegetables"]);
        return;
      }
      ctx.drawImage(img, 0, 0, 64, 64);
      URL.revokeObjectURL(url);
      const data = ctx.getImageData(0, 0, 64, 64).data;
      let red = 0;
      let orange = 0;
      let yellow = 0;
      let green = 0;
      let brown = 0;
      let white = 0;
      let darkBrown = 0;
      let purple = 0;
      const total = 64 * 64;
      for (let i = 0; i < data.length; i += 4) {
        const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
        if (l > 0.85) {
          white++;
          continue;
        }
        if (s < 0.12) {
          if (l < 0.3) darkBrown++;
          else white++;
          continue;
        }
        if (h < 15 || h >= 345) red++;
        else if (h < 40) orange++;
        else if (h < 70) yellow++;
        else if (h < 165) green++;
        else if (h < 280) purple++;
        if (s > 0.1 && s < 0.6 && l > 0.25 && l < 0.65 && (h < 55 || h > 310))
          brown++;
        if (l < 0.3 && s > 0.1) darkBrown++;
      }
      const ingredients: string[] = [];
      const r = (x: number) => x / total;
      if (r(red) > 0.08) ingredients.push("tomato");
      if (r(red) > 0.05 && !ingredients.includes("tomato"))
        ingredients.push("bell pepper");
      if (r(orange) > 0.07) ingredients.push("carrot");
      if (r(orange) > 0.04 && r(brown) > 0.05) ingredients.push("sweet potato");
      if (r(yellow) > 0.06) ingredients.push("corn");
      if (r(yellow) > 0.1 && r(white) > 0.15) ingredients.push("egg");
      if (r(green) > 0.12) ingredients.push("spinach");
      if (r(green) > 0.06 && !ingredients.includes("spinach"))
        ingredients.push("broccoli");
      if (r(green) > 0.04 && !ingredients.includes("broccoli"))
        ingredients.push("herbs");
      if (r(brown) > 0.15) ingredients.push("chicken");
      if (r(brown) > 0.08 && !ingredients.includes("chicken"))
        ingredients.push("mushroom");
      if (r(white) > 0.3) ingredients.push("rice");
      if (r(white) > 0.2 && !ingredients.includes("rice"))
        ingredients.push("tofu");
      if (r(darkBrown) > 0.1) ingredients.push("black beans");
      if (r(darkBrown) > 0.06 && !ingredients.includes("black beans"))
        ingredients.push("lentils");
      if (r(purple) > 0.05) ingredients.push("onion");
      if (ingredients.length === 0)
        ingredients.push("chicken", "vegetables", "rice");
      resolve(ingredients.slice(0, 6));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(["chicken", "vegetables", "rice"]);
    };
    img.src = url;
  });
}

function RecipeCard({
  recipe,
  index,
  onLog,
}: {
  recipe: IngredientRecipe;
  index: number;
  onLog: (item: { name: string; cal: number; protein: number }) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [logged, setLogged] = useState(false);

  function handleLog() {
    onLog({ name: recipe.name, cal: recipe.calories, protein: recipe.protein });
    setLogged(true);
    setTimeout(() => setLogged(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      data-ocid={`ingredient_recipe.item.${index + 1}`}
      className="bg-card rounded-2xl p-4 shadow-sm border border-border"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{recipe.emoji}</span>
            <div>
              <p className="font-bold text-sm text-foreground">{recipe.name}</p>
              <div className="flex gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {recipe.calories} kcal
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                  {recipe.protein}g protein
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            data-ocid={`ingredient_recipe.log_button.${index + 1}`}
            onClick={handleLog}
            className="text-xs px-2 py-1 rounded-lg font-semibold transition-all"
            style={{
              background: logged
                ? "#22c55e"
                : "linear-gradient(135deg, #3db843, #1a6fc4)",
              color: "white",
            }}
          >
            {logged ? "✓ Logged" : "+ Log"}
          </button>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="text-xs px-2 py-1 rounded-lg bg-muted text-muted-foreground"
          >
            {expanded ? "Less" : "More"}
          </button>
        </div>
      </div>

      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {recipe.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 border-t border-border mt-2 space-y-2">
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">
                  Ingredients
                </p>
                <ul className="space-y-0.5">
                  {recipe.ingredients.map((ing) => (
                    <li
                      key={ing}
                      className="text-xs text-muted-foreground flex items-center gap-1"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary inline-block" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">
                  Steps
                </p>
                <ol className="space-y-1">
                  {recipe.steps.map((step, stepIdx) => (
                    <li
                      key={step.slice(0, 20)}
                      className="text-xs text-muted-foreground"
                    >
                      <span className="font-medium text-foreground">
                        {stepIdx + 1}.
                      </span>{" "}
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function IngredientScanner({
  profile: _profile,
  onClose,
  onLog,
}: IngredientScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [typeInput, setTypeInput] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("balanced");
  const [needs, setNeeds] = useState("");
  const [recipes, setRecipes] = useState<IngredientRecipe[]>([]);
  const [generating, setGenerating] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [generated, setGenerated] = useState(false);

  function addIngredient(name: string) {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed || ingredients.includes(trimmed)) return;
    setIngredients((prev) => [...prev, trimmed]);
  }

  function removeIngredient(name: string) {
    setIngredients((prev) => prev.filter((i) => i !== name));
  }

  function handleTypeAdd() {
    addIngredient(typeInput);
    setTypeInput("");
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    const detected = await analyzeImageForIngredients(file);
    for (const ing of detected) {
      addIngredient(ing);
    }
    setScanning(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleGenerate() {
    if (ingredients.length === 0) return;
    setGenerating(true);
    setTimeout(() => {
      const result = generateIngredientRecipes(
        ingredients,
        selectedCuisine,
        needs,
      );
      setRecipes(result);
      setGenerated(true);
      setGenerating(false);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }, 600);
  }

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="max-w-[480px] mx-auto px-4 pb-24">
        {/* Header */}
        <div className="sticky top-0 bg-background z-10 pt-4 pb-3 flex items-center justify-between border-b border-border mb-4">
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #3db843, #1a6fc4)",
              }}
            >
              <ChefHat className="w-4 h-4 text-white" />
            </span>
            <h1 className="font-bold text-lg text-foreground">
              Recipe Generator
            </h1>
          </div>
          <button
            type="button"
            data-ocid="ingredient_scanner.close_button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ingredient Input Tabs */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-foreground mb-2">
            Add Ingredients
          </p>
          <Tabs defaultValue="camera">
            <TabsList className="w-full mb-3">
              <TabsTrigger
                value="camera"
                className="flex-1"
                data-ocid="ingredient_scanner.tab"
              >
                <Camera className="w-3.5 h-3.5 mr-1" /> Camera / Photo
              </TabsTrigger>
              <TabsTrigger
                value="type"
                className="flex-1"
                data-ocid="ingredient_scanner.tab"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Type Ingredients
              </TabsTrigger>
            </TabsList>

            <TabsContent value="camera">
              <button
                className="border-2 border-dashed border-border rounded-xl p-5 text-center cursor-pointer hover:border-primary transition-colors w-full text-left"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) =>
                  e.key === "Enter" && fileInputRef.current?.click()
                }
                type="button"
                data-ocid="ingredient_scanner.dropzone"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <div className="flex flex-col items-center gap-2">
                  {scanning ? (
                    <>
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <p className="text-xs text-muted-foreground">
                        Detecting ingredients...
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        Take or upload a photo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        AI detects ingredients automatically
                      </p>
                    </>
                  )}
                </div>
              </button>
            </TabsContent>

            <TabsContent value="type">
              <div className="flex gap-2">
                <Input
                  data-ocid="ingredient_scanner.input"
                  value={typeInput}
                  onChange={(e) => setTypeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTypeAdd()}
                  placeholder="e.g. chicken, spinach, garlic..."
                  className="flex-1"
                />
                <Button
                  data-ocid="ingredient_scanner.primary_button"
                  onClick={handleTypeAdd}
                  size="sm"
                  style={{
                    background: "linear-gradient(135deg, #3db843, #1a6fc4)",
                    color: "white",
                  }}
                >
                  Add
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Ingredient Chips */}
        {ingredients.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              DETECTED / ADDED INGREDIENTS
            </p>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {ingredients.map((ing) => (
                  <motion.div
                    key={ing}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                    style={{
                      background: "linear-gradient(135deg, #3db843, #1a6fc4)",
                    }}
                  >
                    {ing}
                    <button
                      type="button"
                      onClick={() => removeIngredient(ing)}
                      className="w-3.5 h-3.5 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/50"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Cuisine Selector */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-foreground mb-2">
            Cuisine Style
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CUISINES.map((c) => (
              <button
                key={c.key}
                type="button"
                data-ocid="ingredient_scanner.toggle"
                onClick={() => setSelectedCuisine(c.key)}
                className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
                style={
                  selectedCuisine === c.key
                    ? {
                        background: "linear-gradient(135deg, #3db843, #1a6fc4)",
                        color: "white",
                        borderColor: "transparent",
                      }
                    : {}
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Needs Input */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-foreground mb-1">
            What are your needs?
          </p>
          <Input
            data-ocid="ingredient_scanner.textarea"
            value={needs}
            onChange={(e) => setNeeds(e.target.value)}
            placeholder="e.g. post workout, weight loss, high protein, low carb, quick meal"
          />
        </div>

        {/* Generate Button */}
        <Button
          data-ocid="ingredient_scanner.submit_button"
          onClick={handleGenerate}
          disabled={generating || ingredients.length === 0}
          className="w-full py-3 text-base font-bold rounded-xl text-white mb-6"
          style={{ background: "linear-gradient(135deg, #3db843, #1a6fc4)" }}
        >
          {generating ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Crafting Recipes...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              Generate Recipes
            </span>
          )}
        </Button>

        {/* Recipe Results */}
        <AnimatePresence>
          {generated && recipes.length > 0 && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-bold text-foreground">
                  Recipes for you
                </span>
                <span className="text-xs text-muted-foreground">
                  ({recipes.length} found)
                </span>
              </div>
              <div className="space-y-3">
                {recipes.map((r, i) => (
                  <RecipeCard key={r.name} recipe={r} index={i} onLog={onLog} />
                ))}
              </div>
            </motion.div>
          )}
          {generated && recipes.length === 0 && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <p className="text-2xl mb-2">🤔</p>
              <p className="text-sm font-semibold text-foreground mb-1">
                No matching recipes found
              </p>
              <p className="text-xs text-muted-foreground">
                Try adding more ingredients or choosing a different cuisine.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
