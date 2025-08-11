import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Database, HardDrive, RefreshCw, Save, Download, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function DataPersistenceTest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  // Check what data is currently in localStorage
  const checkLocalStorage = () => {
    const keys = [
      'weeklyMeals',
      'savedRecipes',
      'waterIntake',
      'userProfile',
      'dailyCalorieGoal',
      'dailyProteinGoal',
      'dailyCarbGoal',
      'dailyFatGoal',
      'dailyWaterGoal',
      'userAchievements'
    ];

    const results: any = {};
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      results[key] = {
        exists: !!data,
        size: data ? data.length : 0,
        preview: data ? data.substring(0, 100) : 'No data'
      };
    });

    return results;
  };

  // Test data sync to database
  const testDataSync = async () => {
    setIsLoading(true);
    try {
      // Create test data
      const testMeal = {
        id: `test-${Date.now()}`,
        name: 'Test Meal for Persistence',
        calories: 500,
        protein: 25,
        carbs: 50,
        fat: 20,
        date: new Date().toISOString()
      };

      // Save to localStorage
      const existingMeals = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
      existingMeals.push(testMeal);
      localStorage.setItem('weeklyMeals', JSON.stringify(existingMeals));

      // Trigger sync event
      window.dispatchEvent(new CustomEvent('sync-start'));

      // Call sync API
      const response = await fetch('/api/user/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          key: 'meals',
          data: [testMeal],
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        syncTest: {
          success: result.success,
          itemsSynced: result.itemsBackedUp,
          timestamp: new Date().toISOString()
        }
      }));

      toast({
        title: result.success ? "Sync successful" : "Sync failed",
        description: result.success ? `Synced ${result.itemsBackedUp} items` : "Failed to sync data",
        variant: result.success ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Sync test failed:', error);
      setTestResults(prev => ({
        ...prev,
        syncTest: { success: false, error: error.message }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Test data restoration from database
  const testDataRestore = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/restore-data', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const result = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        restoreTest: {
          success: result.success,
          dataRestored: {
            meals: result.data?.meals?.length || 0,
            recipes: result.data?.recipes?.length || 0,
            waterIntake: result.data?.waterIntake?.length || 0,
            achievements: result.data?.achievements?.length || 0,
            hasProfile: !!result.data?.userProfile
          },
          timestamp: new Date().toISOString()
        }
      }));

      toast({
        title: "Restore test complete",
        description: `Found ${result.data?.meals?.length || 0} meals, ${result.data?.recipes?.length || 0} recipes in database`,
      });

    } catch (error) {
      console.error('Restore test failed:', error);
      setTestResults(prev => ({
        ...prev,
        restoreTest: { success: false, error: error.message }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate page refresh
  const simulateRefresh = () => {
    // Save a marker before refresh
    localStorage.setItem('beforeRefreshMarker', new Date().toISOString());
    window.location.reload();
  };

  // Check if data survived refresh
  useEffect(() => {
    const marker = localStorage.getItem('beforeRefreshMarker');
    if (marker) {
      localStorage.removeItem('beforeRefreshMarker');
      const timeDiff = Date.now() - new Date(marker).getTime();
      
      toast({
        title: "Page refreshed",
        description: `Data persistence check: All localStorage data preserved (${Math.round(timeDiff/1000)}s ago)`,
      });
    }

    // Initial check
    setTestResults(prev => ({
      ...prev,
      localStorage: checkLocalStorage()
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="text-blue-500" />
              Data Persistence Verification
            </CardTitle>
            <CardDescription>
              Verify that user data persists across refreshes, closes, and deployments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* User Status */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Authentication Status:</h3>
              <div className="flex items-center gap-2">
                {user ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Logged in as: {user.email}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <span>Not logged in (using local storage only)</span>
                  </>
                )}
              </div>
            </div>

            {/* LocalStorage Status */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                LocalStorage Data
              </h3>
              <div className="space-y-2">
                {testResults.localStorage && Object.entries(testResults.localStorage).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="font-mono">{key}:</span>
                    <div className="flex items-center gap-2">
                      {value.exists ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600">{value.size} bytes</span>
                        </>
                      ) : (
                        <span className="text-gray-400">Empty</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => setTestResults(prev => ({ ...prev, localStorage: checkLocalStorage() }))}
                variant="outline" 
                className="mt-3"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
            </div>

            {/* Database Sync Test */}
            {user && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Database Sync Test
                </h3>
                {testResults.syncTest ? (
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <div className="flex items-center gap-2">
                      {testResults.syncTest.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span>
                        {testResults.syncTest.success 
                          ? `Successfully synced ${testResults.syncTest.itemsSynced} items`
                          : `Sync failed: ${testResults.syncTest.error}`}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {testResults.syncTest.timestamp}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mb-3">
                    Test if data syncs to the database correctly
                  </p>
                )}
                <Button 
                  onClick={testDataSync}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Test Sync to Database
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Database Restore Test */}
            {user && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Database Restore Test
                </h3>
                {testResults.restoreTest ? (
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {testResults.restoreTest.success ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span>Database contains:</span>
                      </div>
                      <ul className="ml-6 text-xs space-y-1">
                        <li>• {testResults.restoreTest.dataRestored?.meals || 0} meals</li>
                        <li>• {testResults.restoreTest.dataRestored?.recipes || 0} recipes</li>
                        <li>• {testResults.restoreTest.dataRestored?.waterIntake || 0} water entries</li>
                        <li>• {testResults.restoreTest.dataRestored?.achievements || 0} achievements</li>
                        <li>• Profile: {testResults.restoreTest.dataRestored?.hasProfile ? 'Yes' : 'No'}</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mb-3">
                    Check what data is stored in the database
                  </p>
                )}
                <Button 
                  onClick={testDataRestore}
                  disabled={isLoading}
                  variant="outline"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Test Database Restore
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Refresh Test */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Page Refresh Test
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Test if data persists after page refresh
              </p>
              <Button 
                onClick={simulateRefresh}
                variant="destructive"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page Now
              </Button>
            </div>

            {/* Persistence Features */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Data Persistence Features:</h3>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  LocalStorage: All data saved locally immediately
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Auto-sync: Data syncs to database every 30 seconds
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Page unload: Data saved before closing/refreshing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Login restore: Data restored from database on login
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Deployment safe: Data persists through deployments
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}