const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Simple in-memory session storage
const sessions = new Map();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000', '*'],
  credentials: true
}));
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Serve static files from dist/public
app.use(express.static(path.join(__dirname, 'dist/public')));

// Mock database data
const mockUser = {
  id: 'demo-user-123',
  email: 'demo@bytewise.com',
  firstName: 'Demo',
  lastName: 'User',
  dailyCalorieGoal: 2200,
  dailyProteinGoal: 120,
  dailyCarbGoal: 300,
  dailyFatGoal: 70,
  dailyWaterGoal: 8,
  profileIcon: 1,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockAchievements = [
  {
    id: 1,
    userId: 'demo-user-123',
    achievementType: 'first_day_complete',
    title: 'Welcome to Bytewise!',
    description: 'Successfully started your nutrition journey',
    iconName: 'star',
    colorClass: 'bg-yellow-500/20 border-yellow-500/30',
    earnedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    userId: 'demo-user-123',
    achievementType: 'calorie_goal_met',
    title: 'Daily Goal Achieved',
    description: 'Met your daily calorie goal',
    iconName: 'target',
    colorClass: 'bg-green-500/20 border-green-500/30',
    earnedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

const mockMeals = [
  {
    id: 1,
    userId: 'demo-user-123',
    date: new Date().toISOString(),
    mealType: 'breakfast',
    name: 'Oatmeal with Berries',
    totalCalories: '350',
    totalProtein: '12',
    totalCarbs: '45',
    totalFat: '8',
    createdAt: new Date().toISOString()
  }
];

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'development',
    version: 'BETA 4.2',
    database: 'mock'
  });
});

app.get('/api/ready', (req, res) => {
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString()
  });
});

// Auth endpoints
app.get('/api/auth/user', (req, res) => {
  console.log('GET /api/auth/user - Headers:', req.headers);
  
  // Check for authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No valid auth header found');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  const session = sessions.get(token);
  
  if (!session) {
    console.log('No session found for token');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  console.log('Returning user data for token:', token);
  res.json(mockUser);
});

app.post('/api/auth/signin', (req, res) => {
  const { email, password } = req.body;
  
  console.log('POST /api/auth/signin - Email:', email);
  
  if (!email || !password) {
    return res.status(400).json({ 
      message: "Email and password are required",
      code: "MISSING_CREDENTIALS"
    });
  }
  
  // Create a session token
  const token = 'demo-access-token-' + Date.now();
  sessions.set(token, {
    userId: mockUser.id,
    email: email,
    createdAt: new Date()
  });
  
  console.log('Created session for token:', token);
  
  // Return the format that matches what the frontend expects
  res.json({
    user: {
      id: mockUser.id,
      email: mockUser.email,
      emailVerified: mockUser.emailVerified,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      profileImageUrl: null,
      profileIcon: mockUser.profileIcon,
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt,
      dailyCalorieGoal: mockUser.dailyCalorieGoal,
      dailyProteinGoal: mockUser.dailyProteinGoal,
      dailyCarbGoal: mockUser.dailyCarbGoal,
      dailyFatGoal: mockUser.dailyFatGoal,
      dailyWaterGoal: mockUser.dailyWaterGoal,
      personalInfo: null,
      privacySettings: null,
      notificationSettings: null,
      displaySettings: null
    },
    session: {
      access_token: token,
      refresh_token: 'demo-refresh-token-' + Date.now(),
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour in seconds
      token_type: 'bearer',
      user: {
        id: mockUser.id,
        email: mockUser.email,
        email_confirmed_at: mockUser.createdAt,
        user_metadata: {
          firstName: mockUser.firstName,
          lastName: mockUser.lastName
        }
      }
    }
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      message: "Email and password are required",
      code: "MISSING_CREDENTIALS"
    });
  }
  
  res.json({
    user: null,
    session: null,
    message: "Account created! Please check your email for a verification link.",
    requiresVerification: true,
    email: email
  });
});

app.post('/api/auth/signout', (req, res) => {
  res.json({ message: "Signed out successfully" });
});

// Data restoration
app.get('/api/user/restore-data', (req, res) => {
  res.json({
    success: true,
    data: {
      userProfile: mockUser,
      meals: mockMeals,
      recipes: [],
      waterIntake: [
        { date: new Date().toISOString().split('T')[0], glasses: 4 }
      ],
      achievements: mockAchievements,
      calorieGoal: mockUser.dailyCalorieGoal,
      proteinGoal: mockUser.dailyProteinGoal,
      carbGoal: mockUser.dailyCarbGoal,
      fatGoal: mockUser.dailyFatGoal,
      waterGoal: mockUser.dailyWaterGoal
    },
    timestamp: new Date().toISOString()
  });
});

// Achievements
app.get('/api/achievements', (req, res) => {
  res.json({ achievements: mockAchievements });
});

app.post('/api/achievements/check', (req, res) => {
  res.json({ 
    newAchievements: [],
    message: 'No new achievements'
  });
});

// Meals
app.get('/api/meals/logged', (req, res) => {
  res.json(mockMeals);
});

app.post('/api/meals/logged', (req, res) => {
  const newMeal = {
    id: mockMeals.length + 1,
    userId: 'demo-user-123',
    date: req.body.date || new Date().toISOString(),
    mealType: req.body.mealType || 'meal',
    name: req.body.name || 'Unnamed meal',
    totalCalories: req.body.totalCalories || '0',
    totalProtein: req.body.totalProtein || '0',
    totalCarbs: req.body.totalCarbs || '0',
    totalFat: req.body.totalFat || '0',
    createdAt: new Date().toISOString()
  };
  
  mockMeals.push(newMeal);
  
  res.json({ 
    success: true, 
    meal: newMeal,
    newAchievements: []
  });
});

// User statistics
app.get('/api/user/statistics', (req, res) => {
  res.json({
    totalPoints: mockAchievements.length * 10,
    achievementsUnlocked: mockAchievements.length,
    currentStreak: 3,
    longestStreak: 7,
    totalMealsLogged: mockMeals.length,
    level: Math.floor((mockAchievements.length * 10) / 100) + 1
  });
});

// Daily stats
app.get('/api/users/:userId/daily-stats', (req, res) => {
  res.json({
    totalCalories: 1850,
    totalProtein: 95,
    totalCarbs: 180,
    totalFat: 65,
    waterGlasses: 6,
    fastingStatus: undefined
  });
});

app.post('/api/daily-stats', (req, res) => {
  const { waterGlasses } = req.body;
  
  res.json({
    success: true,
    waterGlasses: waterGlasses || 0,
    message: 'Water consumption updated successfully'
  });
});

// Profile updates
app.put('/api/user/profile', (req, res) => {
  const { firstName, lastName, personalInfo, profileIcon } = req.body;
  
  if (firstName) mockUser.firstName = firstName;
  if (lastName) mockUser.lastName = lastName;
  if (personalInfo) mockUser.personalInfo = personalInfo;
  if (profileIcon) mockUser.profileIcon = profileIcon;
  
  res.json({ 
    success: true, 
    user: mockUser,
    message: "Profile updated successfully"
  });
});

app.put('/api/user/goals', (req, res) => {
  const goals = req.body;
  
  if (goals.dailyCalorieGoal) mockUser.dailyCalorieGoal = goals.dailyCalorieGoal;
  if (goals.dailyProteinGoal) mockUser.dailyProteinGoal = goals.dailyProteinGoal;
  if (goals.dailyCarbGoal) mockUser.dailyCarbGoal = goals.dailyCarbGoal;
  if (goals.dailyFatGoal) mockUser.dailyFatGoal = goals.dailyFatGoal;
  if (goals.dailyWaterGoal) mockUser.dailyWaterGoal = goals.dailyWaterGoal;
  
  res.json({ 
    success: true, 
    user: mockUser,
    message: "Goals updated successfully"
  });
});

// AI Food Analysis (mock)
app.post('/api/ai/analyze-food', (req, res) => {
  const { imageUrl } = req.body;
  
  if (!imageUrl) {
    return res.status(400).json({ 
      error: 'MISSING_IMAGE_URL',
      message: 'Image URL is required. Please upload an image first.'
    });
  }
  
  // Mock AI analysis result
  res.json({
    imageUrl,
    identifiedFoods: [
      {
        name: 'Apple',
        confidence: 0.95,
        portion: '1 medium',
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fat: 0.3,
        iron: 0.2,
        calcium: 6,
        zinc: 0.1,
        magnesium: 5,
        vitaminC: 8.4,
        vitaminD: 0,
        vitaminB12: 0,
        folate: 4
      }
    ],
    totalNutrition: {
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3,
      iron: 0.2,
      calcium: 6,
      zinc: 0.1,
      magnesium: 5,
      vitaminC: 8.4,
      vitaminD: 0,
      vitaminB12: 0,
      folate: 4
    },
    analysisTime: 1.2
  });
});

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Development server running on http://localhost:${PORT}`);
  console.log(`📱 App accessible at: http://localhost:${PORT}`);
  console.log(`🔗 API health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Mock database with demo user and achievements`);
  console.log(`🤖 AI food analysis available (mock responses)`);
});
