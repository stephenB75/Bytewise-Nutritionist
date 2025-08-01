# 🚀 Quick Supabase Database Setup

Your Bytewise app is almost ready! Just need to set up the database schema.

## One-Time Database Setup (2 minutes)

### Step 1: Copy the Database Schema
1. Open `supabase/migrations/001_initial_schema.sql` in this Repl
2. Copy all the SQL code (Ctrl+A, Ctrl+C)

### Step 2: Apply to Your Supabase Project
1. Go to your [Supabase project dashboard](https://supabase.com/dashboard/projects)
2. Click on your project
3. Go to **SQL Editor** (in the left sidebar)
4. Paste the copied SQL code
5. Click **"Run"** button

### Step 3: Verify Setup
Once the SQL runs successfully, your app will automatically:
- ✅ Enable user authentication (email/password + OAuth)
- ✅ Create all nutrition tracking tables
- ✅ Set up security policies
- ✅ Ready for USDA food data integration

## That's it! 🎉

Your Bytewise nutrition tracker will now have:
- User profiles and authentication
- Food database with USDA integration
- Recipe creation and management
- Meal logging and tracking
- Water intake monitoring
- Achievement system
- Calorie calculations

The app will automatically detect when the database is ready and switch from setup mode to full functionality.

---

## Troubleshooting

**If you get an error:**
- Make sure you're logged into the correct Supabase project
- Check that all SQL code was copied completely
- Try running the SQL in smaller sections if needed

**Need help?** 
Just ask - I can help troubleshoot any setup issues!