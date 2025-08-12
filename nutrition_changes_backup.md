# Nutrition Page and Calorie Calculator Changes Backup

## Key Changes Made:

### 1. ModernFoodLayout.tsx - Delete Button Fixes (Lines 1095-1170)
- Enhanced delete functionality for daily meals 
- Added robust ID comparison with null/undefined handling
- Fixed issue where deleting one meal was removing all meals
- Added comprehensive console logging for debugging
- Implemented fallback logic for meals without IDs (legacy data)

### 2. ModernFoodLayout.tsx - Weekly View Delete Functionality (Lines 1210-1350) 
- Added complete weekly meal log with individual delete buttons
- Displays all week's meals grouped by date
- Color-coded meal type badges (breakfast: orange, lunch: blue, dinner: purple, snack: gray)
- Delete confirmation dialogs with proper state updates
- Updates both daily and weekly totals when deleting

### 3. CalorieCalculator.tsx - Unique ID Generation (Line 230)
- Fixed meal ID generation from `calc-${Date.now()}` to `calc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
- This prevents duplicate IDs when meals are logged quickly
- Ensures each meal gets a truly unique identifier

## Critical Delete Button Logic:
```javascript
// Handle meals that might not have IDs (legacy data)
const updated = stored.filter((m: any, storedIndex: number) => {
  // If target meal has no ID, use array index comparison
  if (!meal.id) {
    const keepByIndex = storedIndex !== index;
    return keepByIndex;
  }
  
  // If stored meal has no ID, keep it
  if (!m.id) {
    return true;
  }
  
  // Both have IDs, compare them
  const match = String(m.id) !== String(meal.id);
  return match;
});
```

## Files to Restore After Rollback:
1. client/src/pages/ModernFoodLayout.tsx (delete button fixes and weekly view)
2. client/src/components/CalorieCalculator.tsx (unique ID generation)

## Import Requirements:
- Trash2 icon from lucide-react
- Enhanced state management for delete operations
- Proper event dispatching for component refresh