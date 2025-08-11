# Render Root Directory Fix

## The Error
Render is looking for package.json in `/src/` folder but your package.json is in the root directory.

## Fix in Render Dashboard:

1. **Go to Settings Tab**
2. **Find "Root Directory" field**
3. **Change it to:** Leave it blank or use `.` (just a period)
   - Currently it's probably set to: `src`
   - Change to: ` ` (empty) or `.`

4. **Update Build & Start Commands:**
   - Build Command: `npm install`
   - Start Command: `npx tsx server/index.ts`

5. **Save Changes**
6. **Manual Deploy** → Deploy latest commit

## Why This Happened
Someone set the root directory to "src" in Render settings, but your project structure has package.json in the root, not in a src folder.

## After Fixing
The build should succeed and you'll see:
- "Running build command 'npm install'"
- Dependencies installing
- "Build successful"
- Server starting on the assigned port

This is the #1 issue - fix the root directory setting first!