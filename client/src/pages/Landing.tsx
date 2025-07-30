import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, ChefHat, TrendingUp, Smartphone, Shield, Zap } from 'lucide-react';
import { LogoBrand } from '@/components/LogoBrand';

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10 px-4 py-16 text-center">
          {/* Brand Logo */}
          <div className="mb-8 flex justify-center">
            <LogoBrand size="lg" />
          </div>
          
          {/* Tagline */}
          <p className="text-xl text-muted-foreground mb-2 max-w-md mx-auto" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1.25rem", fontWeight: 400 }}>
            Smart Nutrition Tracking for a Healthier You
          </p>
          
          {/* Beta Badge */}
          <Badge variant="outline" className="mb-8 bg-primary/10 border-primary/20">
            🚀 Now Available
          </Badge>

          {/* CTA Buttons */}
          <div className="space-y-4 max-w-sm mx-auto">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full h-12 text-lg font-semibold touch-target btn-animate"
              size="lg"
              style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1rem", fontWeight: 500 }}
            >
              Start Tracking Now
            </Button>
            
            <div className="flex flex-col space-y-2">
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                Sign in with your Replit account to get started
              </p>
              
              {onNavigateToForgotPassword && (
                <button
                  onClick={onNavigateToForgotPassword}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                  style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
                >
                  Need help with your account?
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.875rem", fontWeight: 700, lineHeight: 1.2 }}>
            Everything You Need for Nutrition Success
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    <span>{feature.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
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