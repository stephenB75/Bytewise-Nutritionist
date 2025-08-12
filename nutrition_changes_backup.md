# Nutrition Page & Calorie Calculator Code Changes Only

## ONLY THESE TWO FILES:

### 1. CalorieCalculator.tsx - Unique ID Generation Fix
**Location:** Line 227
**Change:**
```javascript
// FROM:
id: `calc-${Date.now()}`,

// TO:
id: `calc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
```

### 2. ModernFoodLayout.tsx - Delete Button Fix
**Location:** Lines 1119-1137 (inside daily view delete onClick)
**Replace the filter logic with:**
```javascript
// CRITICAL FIX: Handle meals that might not have IDs (legacy data)
const updated = stored.filter((m: any, storedIndex: number) => {
  // If target meal has no ID, use array index comparison
  if (!meal.id) {
    const keepByIndex = storedIndex !== index;
    console.log(`Target meal has no ID, using index comparison: ${storedIndex} !== ${index} = ${keepByIndex}`);
    return keepByIndex;
  }
  
  // If stored meal has no ID, keep it (don't delete meals without IDs)
  if (!m.id) {
    console.log(`Stored meal "${m.name}" has no ID, keeping it`);
    return true;
  }
  
  // Both have IDs, compare them
  const match = String(m.id) !== String(meal.id);
  console.log(`Both have IDs - comparing "${m.name}" (${m.id}) with target "${meal.name}" (${meal.id}) - Keep: ${match}`);
  return match;
});
```

## THESE ARE THE ONLY CHANGES TO REAPPLY
- Fix CalorieCalculator ID generation 
- Fix ModernFoodLayout delete button logic
- Nothing else