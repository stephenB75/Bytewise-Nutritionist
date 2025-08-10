# Component Stability Policy for ByteWise Nutritionist

## Core Principle
**No component should be modified unless explicitly requested by the user or directly related to the current task.**

## Protected Components (DO NOT MODIFY)
These components are working correctly and should remain unchanged:

### Critical Components
- ✅ `CalorieCalculator.tsx` - Meal logging and nutrition calculation
- ✅ `WeeklyCaloriesCard.tsx` - Weekly progress tracking
- ✅ `SignOnModule.tsx` - Authentication system
- ✅ `UserSettingsManager.tsx` - User profile management
- ✅ `FastingTracker.tsx` - Fasting timer functionality
- ✅ `MealTimeline.tsx` - Meal history display
- ✅ `DomainRedirect.tsx` - Custom domain redirection
- ✅ `ModernFoodLayout.tsx` - Main app layout and navigation

### Data Flow Components
- ✅ `server/routes.ts` - API endpoints (unless adding new routes)
- ✅ `shared/schema.ts` - Database schema (unless adding new fields)
- ✅ `server/storage.ts` - Storage interface (unless adding new methods)

## Change Guidelines

### Before Making Changes:
1. **Identify scope**: Is this change requested by the user?
2. **Check dependencies**: Will this affect other components?
3. **Preserve functionality**: Ensure existing features remain intact
4. **Test isolation**: Verify changes don't cascade to unrelated components

### Safe Change Practices:
- **ADD** new components/features without modifying existing ones
- **EXTEND** functionality through new props/methods rather than changing existing ones
- **CREATE** new API endpoints instead of modifying working ones
- **USE** feature flags or conditional rendering for new features

### When Changes Are Necessary:
- Document what was changed and why
- Preserve original functionality
- Test that unrelated components still work
- Update this policy file with any new protected components

## Current Working State
All components are functioning correctly as of August 10, 2025:
- Meal logging saves to database ✅
- Authentication works ✅
- Weekly tracking displays data ✅
- Fasting timer operates correctly ✅
- Custom domain redirect active ✅

## Testing Checklist
Before any deployment, verify:
- [ ] Can users log in/sign up?
- [ ] Can users log meals?
- [ ] Do meal entries save to database?
- [ ] Does weekly progress update?
- [ ] Does fasting timer work?
- [ ] Do achievements trigger?
- [ ] Does navigation work between tabs?

## Component Version Control
If a component must be modified:
1. Create a backup comment block with original code
2. Document the change reason
3. Add a timestamp
4. Test thoroughly before removing backup

## Isolation Strategies
To prevent cascading changes:
- Use separate test files for new features
- Create duplicate components for testing (e.g., `ComponentV2.tsx`)
- Use environment variables for feature toggles
- Implement changes in stages with verification between each

---
**Remember**: The app is currently working. Preserve this stability while adding new features.