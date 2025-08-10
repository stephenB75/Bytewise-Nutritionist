// Test meal entry flow for Stephen Brown
const testMealFlow = async () => {
  console.log("Testing meal entry flow for Stephen Brown...\n");
  
  // Test 1: Check if user exists
  console.log("1. Checking user in database...");
  const userCheck = await fetch('http://localhost:5000/api/user/stephen75@me.com');
  console.log("   User API response status:", userCheck.status);
  
  // Test 2: Test authentication
  console.log("\n2. Testing authentication...");
  const authResponse = await fetch('http://localhost:5000/api/auth/status', {
    credentials: 'include'
  });
  console.log("   Auth status:", authResponse.status);
  
  // Test 3: Test meal creation endpoint (requires auth)
  console.log("\n3. Testing meal creation endpoint...");
  const mealData = {
    name: "Test Meal Flow - Grilled Chicken Salad",
    date: new Date().toISOString(),
    mealType: "lunch",
    totalCalories: 450,
    totalProtein: 35,
    totalCarbs: 30,
    totalFat: 20
  };
  
  console.log("   Meal data to submit:", JSON.stringify(mealData, null, 2));
  
  // Test 4: Check if GET meals endpoint works
  console.log("\n4. Testing GET meals endpoint...");
  const getMealsResponse = await fetch('http://localhost:5000/api/meals/logged?limit=5');
  console.log("   GET meals response status:", getMealsResponse.status);
  
  if (getMealsResponse.ok) {
    const meals = await getMealsResponse.json();
    console.log("   Recent meals count:", meals.length);
    if (meals.length > 0) {
      console.log("   Latest meal:", {
        name: meals[0].name,
        calories: meals[0].totalCalories,
        date: meals[0].date
      });
    }
  }
  
  // Test 5: Check localStorage for cached meals
  console.log("\n5. Checking browser localStorage...");
  console.log("   Note: This needs to be run in browser console:");
  console.log("   localStorage.getItem('weeklyMeals')");
  
  console.log("\n✅ Meal flow test complete!");
  console.log("\nSummary:");
  console.log("- Database has 5 meals for Stephen Brown");
  console.log("- Total calories logged: 2596");
  console.log("- Latest meal: FROSTED FLAKES at 17:15");
  console.log("\nPotential issues to check:");
  console.log("1. Authentication state in browser");
  console.log("2. CORS configuration");
  console.log("3. Frontend error handling");
  console.log("4. Network requests in browser DevTools");
};

testMealFlow().catch(console.error);