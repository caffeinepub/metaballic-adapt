import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  BookmarkCheck,
  ClipboardCopy,
  ExternalLink,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CartItem {
  name: string;
  reason: string;
  saved?: boolean;
}

const SAVED_KEY = "metaballic_saved_cart";

function getUrl(
  platform: "amazon" | "instamart" | "walmart",
  product: string,
): string {
  const q = encodeURIComponent(product);
  if (platform === "amazon") return `https://www.amazon.in/s?k=${q}`;
  if (platform === "instamart")
    return `https://www.swiggy.com/instamart/search?query=${q}`;
  return `https://www.walmart.com/search?q=${q}`;
}

function extractItems(
  meals: Record<string, { dish: string; ingredients: string[] }>,
): CartItem[] {
  const seen = new Set<string>();
  const items: CartItem[] = [];
  for (const meal of Object.values(meals)) {
    for (const ing of meal.ingredients) {
      // Clean up ingredient — remove quantities/units (e.g. "100g chicken breast" → "chicken breast")
      const cleaned = ing
        .replace(
          /^[\d.]+\s*(g|ml|kg|cup|tbsp|tsp|oz|lb|piece|pieces|slice|slices|handful|pinch|scoop|scoops)?\s*/i,
          "",
        )
        .replace(/[,;()]/g, "")
        .trim()
        .toLowerCase();
      if (!cleaned || cleaned.length < 3) continue;
      // Normalize casing
      const display = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      if (!seen.has(display)) {
        seen.add(display);
        items.push({ name: display, reason: `Used in ${meal.dish}` });
      }
    }
  }
  return items;
}

function loadSaved(): Set<string> {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {}
  return new Set();
}

function persistSaved(s: Set<string>) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(Array.from(s)));
}

interface SmartCartProps {
  meals: Record<string, { dish: string; ingredients: string[] }>;
}

export function SmartCart({ meals }: SmartCartProps) {
  const rawItems = extractItems(meals);
  const [savedItems, setSavedItems] = useState<Set<string>>(loadSaved);

  function toggleSave(name: string) {
    setSavedItems((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
        toast.success(`${name} removed from saved list`);
      } else {
        next.add(name);
        toast.success(`${name} saved for later 🔖`);
      }
      persistSaved(next);
      return next;
    });
  }

  function handleBuyAllAmazon() {
    for (const item of rawItems) {
      window.open(getUrl("amazon", item.name), "_blank");
    }
  }

  function handleBestMixedCart() {
    for (const item of rawItems) {
      window.open(getUrl("instamart", item.name), "_blank");
    }
  }

  function handleCopyList() {
    const text = rawItems.map((i) => `• ${i.name}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Shopping list copied! 📋");
    });
  }

  if (rawItems.length === 0) return null;

  return (
    <div className="space-y-4" data-ocid="smart_cart.section">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShoppingCart className="w-5 h-5" style={{ color: "#3db843" }} />
          <h2 className="font-bold text-base text-foreground">
            Your Smart Cart
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          We found the best places for you to buy everything
        </p>
      </div>

      {/* Bulk actions */}
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          className="text-xs rounded-full gap-1.5 flex-1"
          style={{ background: "#ff9900", color: "#fff" }}
          onClick={handleBuyAllAmazon}
          data-ocid="smart_cart.buy_all_amazon"
        >
          <ExternalLink className="w-3 h-3" />
          Buy All on Amazon
        </Button>
        <Button
          size="sm"
          className="text-xs rounded-full gap-1.5 flex-1"
          style={{ background: "#fc8019", color: "#fff" }}
          onClick={handleBestMixedCart}
          data-ocid="smart_cart.best_mixed_cart"
        >
          <Zap className="w-3 h-3" />
          Best Mixed Cart
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs rounded-full gap-1.5"
          onClick={handleCopyList}
          data-ocid="smart_cart.copy_list"
        >
          <ClipboardCopy className="w-3 h-3" />
          Copy List
        </Button>
      </div>

      {/* Item Cards */}
      <div className="space-y-3">
        {rawItems.map((item) => (
          <div
            key={`cart-item-${item.name}`}
            className="bg-card rounded-2xl p-4 shadow-sm border border-border"
            data-ocid={`smart_cart.item.${item.name}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.reason}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleSave(item.name)}
                className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={
                  savedItems.has(item.name)
                    ? "Remove from saved"
                    : "Save for later"
                }
              >
                {savedItems.has(item.name) ? (
                  <BookmarkCheck
                    className="w-4 h-4"
                    style={{ color: "#3db843" }}
                  />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Best Option: Instamart */}
            <div
              className="rounded-xl p-3 mb-2 border-2"
              style={{
                borderColor: "#fc8019",
                background: "rgba(252,128,25,0.06)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-foreground">
                    Instamart
                  </span>
                  <Badge
                    className="text-[10px] px-1.5 py-0"
                    style={{ background: "#fc8019", color: "#fff" }}
                  >
                    Best Option
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  ⚡ Fastest Delivery
                </span>
              </div>
              <a
                href={getUrl("instamart", item.name)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="sm"
                  className="w-full text-xs rounded-lg"
                  style={{ background: "#fc8019", color: "#fff" }}
                >
                  Get on Instamart
                </Button>
              </a>
            </div>

            {/* Amazon Fresh */}
            <div className="rounded-xl p-3 mb-2 bg-muted/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">
                  Amazon Fresh
                </span>
                <span className="text-[10px] text-muted-foreground">
                  ⭐ Reliable Choice
                </span>
              </div>
              <a
                href={getUrl("amazon", item.name)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs rounded-lg"
                  style={{ borderColor: "#ff9900", color: "#ff9900" }}
                >
                  Buy on Amazon
                </Button>
              </a>
            </div>

            {/* Walmart */}
            <div className="rounded-xl p-3 bg-muted/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">
                  Walmart
                </span>
                <span className="text-[10px] text-muted-foreground">
                  🌍 Available Internationally
                </span>
              </div>
              <a
                href={getUrl("walmart", item.name)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs rounded-lg"
                  style={{ borderColor: "#0071ce", color: "#0071ce" }}
                >
                  Buy on Walmart
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Shopping List simplified */}
      <div
        className="bg-card rounded-2xl p-4 shadow-sm"
        data-ocid="smart_cart.shopping_list"
      >
        <h3 className="font-bold text-sm text-foreground mb-0.5">
          Your Shopping List
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Everything you need at a glance
        </p>
        <div className="space-y-2">
          {rawItems.map((item) => (
            <div
              key={`list-item-${item.name}`}
              className="flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {item.reason}
                </p>
              </div>
              <a
                href={getUrl("instamart", item.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <Button
                  size="sm"
                  className="text-[10px] px-3 py-1 rounded-full h-7"
                  style={{ background: "#fc8019", color: "#fff" }}
                >
                  Buy
                </Button>
              </a>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 text-center opacity-60">
          Coming soon: price comparison across platforms
        </p>
      </div>
    </div>
  );
}
