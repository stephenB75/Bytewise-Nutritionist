import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  data?: any;
}

export default function MealFlowTest() {
  const { user } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runMealFlowTest = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Check authentication
    addResult({
      test: 'Authentication Check',
      status: user ? 'success' : 'error',
      message: user ? `Logged in as: ${user.email}` : 'Not authenticated',
      data: user
    });

    if (!user) {
      addResult({
        test: 'Test Aborted',
        status: 'error',
        message: 'Cannot proceed without authentication'
      });
      setIsRunning(false);
      return;
    }

    // Test 2: Fetch existing meals
    try {
      const mealsResponse = await apiRequest('GET', '/api/meals/logged?limit=5');
      const meals = await mealsResponse.json();
      
      addResult({
        test: 'Fetch Existing Meals',
        status: 'success',
        message: `Found ${meals.length} recent meals`,
        data: meals
      });
    } catch (error: any) {
      addResult({
        test: 'Fetch Existing Meals',
        status: 'error',
        message: `Failed: ${error?.message || 'Unknown error'}`,
        data: error
      });
    }

    // Test 3: Create a test meal
    const testMeal = {
      name: `Test Meal - ${new Date().toLocaleTimeString()}`,
      date: new Date().toISOString(),
      mealType: 'lunch',
      totalCalories: 500,
      totalProtein: 30,
      totalCarbs: 50,
      totalFat: 20
    };

    try {
      const createResponse = await apiRequest('POST', '/api/meals/logged', testMeal);
      const createdMeal = await createResponse.json();
      
      addResult({
        test: 'Create Test Meal',
        status: 'success',
        message: `Meal created with ID: ${createdMeal.meal?.id}`,
        data: createdMeal
      });

      // Test 4: Verify meal was saved
      const verifyResponse = await apiRequest('GET', '/api/meals/logged?limit=1');
      const latestMeals = await verifyResponse.json();
      
      const wasCreated = latestMeals[0]?.name === testMeal.name;
      addResult({
        test: 'Verify Meal Saved',
        status: wasCreated ? 'success' : 'warning',
        message: wasCreated ? 'Meal verified in database' : 'Could not verify meal',
        data: latestMeals[0]
      });
    } catch (error: any) {
      addResult({
        test: 'Create Test Meal',
        status: 'error',
        message: `Failed: ${error?.message || 'Unknown error'}`,
        data: error
      });
    }

    // Test 5: Check localStorage
    const weeklyMeals = localStorage.getItem('weeklyMeals');
    addResult({
      test: 'LocalStorage Check',
      status: weeklyMeals ? 'success' : 'warning',
      message: weeklyMeals ? `Found ${JSON.parse(weeklyMeals).length} meals in cache` : 'No cached meals',
      data: weeklyMeals ? JSON.parse(weeklyMeals) : null
    });

    // Test 6: Check events
    let eventReceived = false;
    const eventHandler = () => { eventReceived = true; };
    window.addEventListener('refresh-weekly-data', eventHandler);
    
    // Dispatch test event
    window.dispatchEvent(new CustomEvent('refresh-weekly-data'));
    
    setTimeout(() => {
      addResult({
        test: 'Event System',
        status: eventReceived ? 'success' : 'warning',
        message: eventReceived ? 'Events working' : 'Events may not be propagating',
        data: { eventReceived }
      });
      window.removeEventListener('refresh-weekly-data', eventHandler);
    }, 100);

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'pending': return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Meal Entry Flow Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={runMealFlowTest} 
              disabled={isRunning}
              className="bg-yellow-400 text-black hover:bg-yellow-500"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run Meal Flow Test'
              )}
            </Button>
            {user && (
              <span className="text-sm text-gray-600">
                Testing as: {user.email}
              </span>
            )}
          </div>

          {results.length > 0 && (
            <div className="space-y-2 border rounded-lg p-4">
              {results.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="font-medium">{result.test}</div>
                    <div className="text-sm text-gray-600">{result.message}</div>
                    {result.data && (
                      <details className="mt-1">
                        <summary className="text-xs text-blue-600 cursor-pointer">View data</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Test Coverage:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Authentication state verification</li>
              <li>✓ API endpoint connectivity</li>
              <li>✓ Meal creation and persistence</li>
              <li>✓ Database verification</li>
              <li>✓ LocalStorage caching</li>
              <li>✓ Event system propagation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}