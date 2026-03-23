# Metaballic Adapt

## Current State
The app has a full results screen (ResultsScreen.tsx) with meal plan, AI coach, food scanner, ingredient scanner, meal logger, feedback/save sections, and a bottom bar with quick actions. Meal plans are recipe-based with ingredients arrays per dish.

## Requested Changes (Diff)

### Add
- `SmartCart.tsx` component: extracts ingredients from the current recipePlan and displays them as shoppable items
- Smart Cart section: card-based layout with each ingredient as a product, showing Instamart (Best Option), Amazon Fresh, and Walmart buy buttons with dynamic URLs
- Bulk action buttons: "Buy All on Amazon" and "Best Mixed Cart"
- Shopping List section below: simplified list view with one primary buy button per item
- "Copy List" button
- "Save for Later" using localStorage
- Smart Cart auto-appears after plan generation in ResultsScreen, and accessible via a cart icon in the bottom bar
- Help improve banner logic: existing behavior preserved

### Modify
- `ResultsScreen.tsx`: import and render SmartCart component after meal plan section; add cart icon to bottom bar

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/components/SmartCart.tsx` with full Smart Cart + Shopping List UI
2. Extract ingredients from recipePlan meals, deduplicate, and map to cart items with recommended reason
3. Instamart = Best Option (Indian default), Amazon Fresh = Reliable Choice, Walmart = Available Internationally
4. Dynamic buy URLs: Amazon.in, Swiggy Instamart, Walmart
5. Bulk actions open all tabs for respective platforms
6. Save for Later persists to localStorage key `metaballic_saved_cart`
7. Copy List copies all product names to clipboard
8. Wire SmartCart into ResultsScreen after meal plan, and add cart icon (🛒) to bottom bar
