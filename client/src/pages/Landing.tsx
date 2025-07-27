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
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        {/* Brand Logo */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">B</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">bytewise</h1>
            <p className="text-sm text-on-background/70 font-medium">Nutritionist</p>
            <p className="text-xs text-on-background/50 mt-2">Track. Plan. Thrive.</p>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="card-shadow-lg">
          <CardContent className="p-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <div className="space-y-4">
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
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-outline" />
                      <span className="text-muted-foreground">Remember me</span>
                    </label>
                    <button className="text-primary font-medium">Forgot password?</button>
                  </div>
                  <Button 
                    onClick={handleLogin}
                    className="w-full touch-target"
                  >
                    Sign In
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-4">
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
                    className="w-full touch-target"
                  >
                    Create Account
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Social Login */}
            <div className="mt-6 text-center">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs text-muted-foreground">or continue with</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline"
                  onClick={handleLogin}
                  className="touch-target"
                >
                  <Apple className="w-4 h-4 mr-2" />
                  Apple
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleLogin}
                  className="touch-target"
                >
                  <Chrome className="w-4 h-4 mr-2" />
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
