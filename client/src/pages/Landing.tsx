import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Apple, Chrome } from 'lucide-react';

export default function Landing() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Use the proper Replit domain for authentication
    const replitDomain = import.meta.env.VITE_REPLIT_DOMAIN || window.location.host;
    window.location.href = `/api/login`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center brand-padding-lg bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="w-full max-w-sm compact-layout animate-fade-in">
        {/* Brand Logo */}
        <div className="text-center brand-spacing-lg">
          <div className="w-20 h-20 mx-auto bg-primary rounded-2xl flex items-center justify-center card-shadow-lg btn-animate">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">B</span>
            </div>
          </div>
          <div className="brand-spacing-sm">
            <h1 className="text-3xl font-bold text-primary">bytewise</h1>
            <p className="text-sm text-muted-foreground font-medium">Nutritionist</p>
            <p className="text-xs text-muted-foreground/80 brand-margin-sm">Track. Plan. Thrive.</p>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="card-shadow-lg brand-card">
          <CardContent className="brand-padding-lg">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 brand-margin-lg">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="compact-layout">
                <div className="compact-layout">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="touch-target"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="touch-target"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center brand-spacing-xs">
                      <input type="checkbox" className="rounded border-border" />
                      <span className="text-muted-foreground">Remember me</span>
                    </label>
                    <button className="text-primary font-medium btn-animate">Forgot password?</button>
                  </div>
                  <Button 
                    onClick={handleLogin}
                    className="w-full touch-target btn-animate"
                  >
                    Sign In
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="compact-layout">
                <div className="compact-layout">
                  <Input
                    type="text"
                    placeholder="Full name"
                    className="touch-target"
                  />
                  <Input
                    type="email"
                    placeholder="Email address"
                    className="touch-target"
                  />
                  <Input
                    type="password"
                    placeholder="Create password"
                    className="touch-target"
                  />
                  <Button 
                    onClick={handleLogin}
                    className="w-full touch-target btn-animate"
                  >
                    Create Account
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Social Login */}
            <div className="brand-margin-lg text-center">
              <div className="flex items-center brand-spacing-lg brand-margin-md">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs text-muted-foreground">or continue with</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>
              <div className="grid grid-cols-2 brand-spacing-sm">
                <Button 
                  variant="outline"
                  onClick={handleLogin}
                  className="touch-target btn-animate"
                >
                  <Apple className="w-4 h-4 brand-margin-xs" />
                  Apple
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleLogin}
                  className="touch-target btn-animate"
                >
                  <Chrome className="w-4 h-4 brand-margin-xs" />
                  Google
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
