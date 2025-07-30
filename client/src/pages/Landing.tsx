import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, ChefHat, TrendingUp, Smartphone, Shield, Zap, ArrowRight, Star, Users } from 'lucide-react';
import { LogoBrand } from '@/components/LogoBrand';
import varietyFoodImage from '@assets/variety-5044809_1920.jpg';

interface LandingProps {
  onNavigateToForgotPassword?: () => void;
}

export default function Landing({ onNavigateToForgotPassword }: LandingProps) {
  const features = [
    {
      icon: Target,
      title: 'Smart Nutrition Tracking',
      description: 'Track calories, macros, and nutrients with precision. Set personalized goals and monitor your progress.',
      color: 'text-chart-2'
    },
    {
      icon: ChefHat,
      title: 'Recipe Builder',
      description: 'Create custom recipes with automatic nutrition calculations. Build your personal recipe collection.',
      color: 'text-chart-1'
    },
    {
      icon: Calendar,
      title: 'Progress Calendar',
      description: 'Visualize your nutrition journey over time. Identify patterns and celebrate milestones.',
      color: 'text-chart-3'
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Insights',
      description: 'Get detailed analytics on your eating habits. Make data-driven decisions for better health.',
      color: 'text-primary'
    }
  ];

  const benefits = [
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Optimized for mobile devices with touch-friendly interfaces and offline capabilities.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and secure. We respect your privacy and never sell your information.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built with modern technology for instant loading and smooth interactions.'
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Food Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${varietyFoodImage})`,
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      {/* Hero Section */}
      <div className="relative z-10 overflow-hidden">
        <div className="relative z-10 px-4 py-16 text-center">
          {/* Brand Logo */}
          <div className="mb-8 flex justify-center animate-fade-in">
            <LogoBrand size="lg" className="drop-shadow-lg" />
          </div>
          
          {/* Welcome Message */}
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "2rem", fontWeight: 700 }}>
            Welcome to ByteWise
          </h1>
          
          {/* Tagline */}
          <p className="text-xl text-white/90 mb-6 max-w-md mx-auto" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1.125rem", fontWeight: 400 }}>
            Your personal nutrition companion for smarter eating habits
          </p>
          
          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-4 mb-6 text-sm text-white/80">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>Join thousands of users</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>Loved by nutritionists</span>
            </div>
          </div>
          
          {/* Beta Badge */}
          <Badge variant="outline" className="mb-8 bg-white/20 border-white/30 text-white">
            🚀 Now Available
          </Badge>

          {/* Sign-in Window */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 max-w-sm mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h3>
              <p className="text-gray-600">Sign in to continue your nutrition journey</p>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full h-14 text-lg font-semibold touch-target btn-animate group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-black shadow-lg hover:shadow-xl"
              size="lg"
              style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}
            >
              Sign In with Replit
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <p className="text-gray-500 text-xs text-center mt-4">
              Secure authentication powered by Replit
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <section className="px-4 py-8 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.25rem", fontWeight: 600 }}>
            Ready to Transform Your Nutrition Journey?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="flex-1 h-12 font-semibold touch-target btn-animate bg-primary hover:bg-primary/90 text-white"
              style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1rem", fontWeight: 500 }}
            >
              Login Now
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/api/login'}
              className="flex-1 h-12 font-semibold touch-target hover:bg-primary/10"
              style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1rem", fontWeight: 500 }}
            >
              Sign Up Free
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.75rem", fontWeight: 400 }}>
            Both options use your secure Replit account
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.875rem", fontWeight: 700, lineHeight: 1.2 }}>
              Everything You Need for Nutrition Success
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}>
              Track your meals, build custom recipes, and achieve your health goals with our comprehensive nutrition platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-muted/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}>
                    <div className={`p-2 rounded-lg ${feature.color} bg-opacity-10`}>
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <span>{feature.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-12 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Why Choose Bytewise?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            See It In Action
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Bytewise makes nutrition tracking simple and intuitive. Track meals, build recipes, 
            and monitor your progress with our comprehensive dashboard.
          </p>
          
          {/* Mock Phone Preview */}
          <div className="relative max-w-sm mx-auto">
            <div className="bg-gradient-to-br from-muted to-muted/50 rounded-3xl p-8 shadow-2xl">
              <div className="bg-background rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Today's Progress</h3>
                  <Badge variant="outline">85% Complete</Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Calories</span>
                    <span>1,680 / 2,000</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '84%' }}></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-chart-2 h-1.5 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                      <span className="text-chart-2">Protein</span>
                    </div>
                    <div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-chart-3 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-chart-3">Carbs</span>
                    </div>
                    <div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-chart-1 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                      <span className="text-chart-1">Fat</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-12 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Nutrition?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of users who are already achieving their health goals with Bytewise.
          </p>
          
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="h-12 px-8 text-lg font-semibold touch-target btn-animate"
            size="lg"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>© 2024 Bytewise Nutrition Tracker. Built with 💚 for healthier living.</p>
      </footer>
    </div>
  );
}