# Quick Fix - 1 Minute

## In Render Dashboard Settings Tab:

### Change These 3 Things:

1. **Root Directory:** Delete "src" → Leave empty
2. **Build Command:** `npm install`  
3. **Start Command:** `npx tsx server/index.ts`

### Then:
- Click **Save Changes**
- Click **Manual Deploy** → **Deploy latest commit**

## That's it! 

The deployment will work once you remove "src" from Root Directory.