# Git Commands to Run on Your Mac

Open Terminal on your Mac and run these commands:

## Step 1: Navigate to your project
```bash
cd /Users/stephenbrown/Desktop/Bytewise-Nutritionist
```

## Step 2: Check git status
```bash
git status
```

## Step 3: Add the new files
```bash
git add nixpacks.toml src/
```

## Step 4: Commit the changes
```bash
git commit -m "Add Railway configuration files"
```

## Step 5: Push to GitHub
```bash
git push origin main
```

If you get an error about "origin" or "main", try:
```bash
git push
```

## If Git Commands Still Don't Work:

1. **Check if you're in the right directory:**
   ```bash
   pwd
   ls -la
   ```

2. **Check if git is installed:**
   ```bash
   which git
   git --version
   ```

3. **If permission denied:**
   ```bash
   sudo git push
   ```

4. **If authentication issues:**
   - You may need to use a GitHub personal access token
   - Or use GitHub Desktop app instead

## Alternative: Use GitHub Desktop
If terminal commands aren't working:
1. Open GitHub Desktop
2. Select your Bytewise-Nutritionist repository
3. You should see the new files (nixpacks.toml, src folder)
4. Commit with message "Add Railway configuration"
5. Push to origin

Once pushed, Railway will automatically redeploy with the correct Node.js configuration.