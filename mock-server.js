const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist/public
app.use(express.static(path.join(__dirname, 'dist/public')));

// Mock API endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'development',
    version: 'BETA 4.2'
  });
});

app.get('/api/achievements', (req, res) => {
  res.json({
    achievements: [
      {
        id: 1,
        title: 'Welcome to Bytewise!',
        description: 'Successfully started your nutrition journey',
        iconName: 'star',
        colorClass: 'bg-yellow-500/20 border-yellow-500/30',
        earnedAt: new Date().toISOString()
      }
    ]
  });
});

app.post('/api/auth/signin', (req, res) => {
  res.json({
    user: {
      id: 'demo-user-123',
      email: req.body.email || 'demo@bytewise.com',
      firstName: 'Demo',
      lastName: 'User'
    },
    session: {
      access_token: 'demo-token',
      refresh_token: 'demo-refresh-token'
    }
  });
});

app.post('/api/auth/signup', (req, res) => {
  res.json({
    user: null,
    session: null,
    message: "Account created! Please check your email for a verification link.",
    requiresVerification: true,
    email: req.body.email
  });
});

app.get('/api/user/restore-data', (req, res) => {
  res.json({
    success: true,
    data: {
      userProfile: {
        id: 'demo-user-123',
        email: 'demo@bytewise.com',
        firstName: 'Demo',
        lastName: 'User',
        dailyCalorieGoal: 2200,
        dailyProteinGoal: 120,
        dailyCarbGoal: 300,
        dailyFatGoal: 70,
        dailyWaterGoal: 8
      },
      meals: [],
      recipes: [],
      waterIntake: [],
      achievements: [],
      calorieGoal: 2200,
      proteinGoal: 120,
      carbGoal: 300,
      fatGoal: 70,
      waterGoal: 8
    },
    timestamp: new Date().toISOString()
  });
});

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Mock server running on http://localhost:${PORT}`);
  console.log(`📱 App accessible at: http://localhost:${PORT}`);
  console.log(`🔗 API health check: http://localhost:${PORT}/api/health`);
});
