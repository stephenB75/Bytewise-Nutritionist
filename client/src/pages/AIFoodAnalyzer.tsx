/**
 * AI Food Analyzer Page
 * 
 * Allows users to upload food photos for AI-powered nutrition analysis
 * Uses GPT-4 Vision to identify foods and cross-references with USDA database
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ObjectUploader } from '@/components/ObjectUploader';
import { Camera, Loader2, Sparkles, Plus, Eye, Utensils, AlertTriangle, Trash2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useCalorieTracking } from '@/hooks/useCalorieTracking';
import { useAuth } from '@/hooks/useAuth';

// Photo Display Component with proper error handling and proxy fallback
interface PhotoDisplayProps {
  imageUrl: string;
  alt: string;
  className?: string;
}

function PhotoDisplay({ imageUrl, alt, className }: PhotoDisplayProps) {
  const [imageSrc, setImageSrc] = useState<string>(imageUrl);
  const [imageError, setImageError] = useState<boolean>(false);
  const [hasTriedProxy, setHasTriedProxy] = useState<boolean>(false);

  // Reset error state when imageUrl changes
  useEffect(() => {
    setImageSrc(imageUrl);
    setImageError(false);
    setHasTriedProxy(false);
  }, [imageUrl]);

  const handleImageError = useCallback(() => {
    // Don't try proxy if we've already tried it or if it's not a Google Storage URL
    if (hasTriedProxy || !imageUrl.includes('storage.googleapis.com')) {
      setImageError(true);
      return;
    }

    // Try to construct proxy URL
    try {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part.includes('objstore-'));
      
      if (bucketIndex !== -1) {
        const objectPath = pathParts.slice(bucketIndex + 1).join('/');
        const proxyUrl = `/api/proxy-image/${objectPath}`;
        
        // Test the proxy URL and provide feedback
        fetch(proxyUrl)
          .then(response => {
            if (response.ok) {
              setImageSrc(proxyUrl);
            } else {
              setImageError(true);
            }
          })
          .catch(error => {
            setImageError(true);
          });
          
        setHasTriedProxy(true);
        return;
      }
    } catch (error) {
      // URL parsing failed
    }
    
    setImageError(true);
  }, [imageUrl, hasTriedProxy]);

  if (imageError) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 text-gray-600 text-sm border-2 border-dashed border-amber-300 rounded-lg`}>
        <div className="text-3xl mb-2">📸</div>
        <div className="text-center px-2 font-medium">
          Photo no longer available
        </div>
        <div className="text-xs text-gray-500 mt-1 text-center px-2">
          Upload a new photo to see it here
        </div>
      </div>
    );
  }

  return (
    <img 
      src={imageSrc}
      alt={alt}
      className={className}
      crossOrigin="anonymous"
      onError={handleImageError}
      loading="lazy"
    />
  );
}

interface IdentifiedFood {
  name: string;
  confidence: number;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  adjustedPortion?: number;
  // Add micronutrient properties
  iron?: number;
  calcium?: number;
  zinc?: number;
  magnesium?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminB12?: number;
  folate?: number;
}

interface AnalysisResult {
  imageUrl: string;
  identifiedFoods: IdentifiedFood[];
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  analysisTime: string;
}

export default function AIFoodAnalyzer() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [currentUploadUrl, setCurrentUploadUrl] = useState<string | null>(null);
  const [weeklyAnalyzedFoods, setWeeklyAnalyzedFoods] = useState<AnalysisResult[]>([]);
  const { toast } = useToast();
  const { addCalculatedCalories } = useCalorieTracking();
  const { user } = useAuth();


  // Load weekly analyzed foods from localStorage on component mount
  useEffect(() => {
    const loadWeeklyAnalyzedFoods = () => {
      try {
        const stored = localStorage.getItem('weeklyAnalyzedFoods');
        if (stored) {
          const allAnalyzed: AnalysisResult[] = JSON.parse(stored);
          // Filter to current week only
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          
          const currentWeekAnalyzed = allAnalyzed.filter(analysis => 
            new Date(analysis.analysisTime) >= oneWeekAgo
          );
          
          
          setWeeklyAnalyzedFoods(currentWeekAnalyzed);
          
          // Update localStorage with filtered data
          if (currentWeekAnalyzed.length !== allAnalyzed.length) {
            localStorage.setItem('weeklyAnalyzedFoods', JSON.stringify(currentWeekAnalyzed));
          }
        }
      } catch (error) {
        console.error('Error loading weekly analyzed foods:', error);
      }
    };

    loadWeeklyAnalyzedFoods();
  }, []);

  // Save analyzed food to weekly history
  const saveAnalyzedFood = (analysis: AnalysisResult) => {
    try {
      const updatedHistory = [analysis, ...weeklyAnalyzedFoods];
      setWeeklyAnalyzedFoods(updatedHistory);
      localStorage.setItem('weeklyAnalyzedFoods', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving analyzed food:', error);
    }
  };

  // Delete analyzed food from weekly history
  const deleteAnalyzedFood = (indexToDelete: number) => {
    try {
      const updatedHistory = weeklyAnalyzedFoods.filter((_, index) => index !== indexToDelete);
      setWeeklyAnalyzedFoods(updatedHistory);
      localStorage.setItem('weeklyAnalyzedFoods', JSON.stringify(updatedHistory));
      
      toast({
        title: "Analysis Deleted",
        description: "The food analysis has been removed from your history",
      });
    } catch (error) {
      console.error('Error deleting analyzed food:', error);
      toast({
        title: "Delete Failed",
        description: "Could not delete the analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get upload URL mutation (works without authentication)
  const getUploadUrlMutation = useMutation({
    mutationFn: async (contentType: string) => {
      const response = await apiRequest('POST', '/api/objects/upload', { contentType });
      if (!response.ok) {
        throw new Error(`Upload preparation failed: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data as { uploadURL: string };
    },
    onError: (error: any) => {
      toast({
        title: "Upload Error",
        description: "Unable to prepare image upload. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  });

  // Analyze food image mutation
  const analyzeFoodMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      const response = await apiRequest('POST', '/api/ai/analyze-food', {
        imageUrl
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }
      
      const result = await response.json();
      return result as AnalysisResult;
    },
    onSuccess: async (result) => {

      // Calculate total nutrition from identified foods including micronutrients
      const totalNutrition = result.identifiedFoods.reduce(
        (total, food: any) => ({
          calories: total.calories + (food.calories || 0),
          protein: total.protein + (food.protein || 0),
          carbs: total.carbs + (food.carbs || 0),
          fat: total.fat + (food.fat || 0),
          fiber: total.fiber + (food.fiber || 0),
          sugar: total.sugar + (food.sugar || 0),
          sodium: total.sodium + (food.sodium || 0),
          // Add micronutrient aggregation
          iron: total.iron + (food.iron || 0),
          calcium: total.calcium + (food.calcium || 0),
          zinc: total.zinc + (food.zinc || 0),
          magnesium: total.magnesium + (food.magnesium || 0),
          vitaminC: total.vitaminC + (food.vitaminC || 0),
          vitaminD: total.vitaminD + (food.vitaminD || 0),
          vitaminB12: total.vitaminB12 + (food.vitaminB12 || 0),
          folate: total.folate + (food.folate || 0),
        }),
        { 
          calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0,
          iron: 0, calcium: 0, zinc: 0, magnesium: 0, vitaminC: 0, vitaminD: 0, vitaminB12: 0, folate: 0
        }
      );

      const analysisResultWithTotals = {
        ...result,
        imageUrl: uploadedImageUrl, // Ensure uploaded image URL is preserved
        totalNutrition
      };

      setAnalysisResult(analysisResultWithTotals);
      // Save to weekly history
      saveAnalyzedFood(analysisResultWithTotals);
      
      // Automatically log to daily tracker
      const mealName = result.identifiedFoods.length === 1 
        ? result.identifiedFoods[0].name
        : `Mixed Meal (${result.identifiedFoods.length} items)`;

      await addCalculatedCalories({
        name: mealName,
        calories: totalNutrition.calories,
        protein: totalNutrition.protein,
        carbs: totalNutrition.carbs,
        fat: totalNutrition.fat,
        fiber: totalNutrition.fiber,
        sugar: totalNutrition.sugar,
        sodium: totalNutrition.sodium,
        ingredients: result.identifiedFoods.map(f => f.name)
      });

      // Save meal to database for authenticated users only
      if (user) {
        try {
          const mealData = {
            name: mealName,
            totalCalories: totalNutrition.calories,
            totalProtein: totalNutrition.protein,
            totalCarbs: totalNutrition.carbs,
            totalFat: totalNutrition.fat,
            // Include micronutrients from aggregated totalNutrition
            iron: totalNutrition.iron || 0,
            calcium: totalNutrition.calcium || 0,
            zinc: totalNutrition.zinc || 0,
            magnesium: totalNutrition.magnesium || 0,
            vitaminC: totalNutrition.vitaminC || 0,
            vitaminD: totalNutrition.vitaminD || 0,
            vitaminB12: totalNutrition.vitaminB12 || 0,
            folate: totalNutrition.folate || 0,
            date: new Date().toISOString(),
            mealType: 'meal'
          };
          
          const response = await apiRequest('POST', '/api/meals/logged', mealData);
          
          if (response.ok) {
            // Dispatch refresh event for meal timeline and other components
            window.dispatchEvent(new CustomEvent('refresh-meals'));
            window.dispatchEvent(new CustomEvent('reload-meal-data'));
          } else {
            throw new Error(`Database save failed: ${response.status}`);
          }
        } catch (error) {
          // Don't show error to user as the meal is still saved in localStorage
        }
      }
      
      toast({
        title: "Analysis Complete & Logged!",
        description: `Found ${result.identifiedFoods.length} food items (${Math.round(totalNutrition.calories)} cal) and added to your daily log`,
      });
    },
    onError: (error: any) => {
      let title = "Analysis Failed";
      let description = error.message || "Failed to analyze the food image";
      
      // Handle quota exceeded error specifically
      if (error.message && error.message.includes('QUOTA_EXCEEDED')) {
        title = "Imagga API Quota Exceeded";
        description = "The AI analysis feature is temporarily unavailable due to API quota limits. You can still manually add foods using the food database search.";
      } else if (error.message && error.message.includes('INVALID_API_KEY')) {
        title = "API Configuration Error";
        description = "The Imagga API key is invalid. Please check the API configuration.";
      } else if (error.message && error.message.includes('MISSING_CREDENTIALS')) {
        title = "API Not Configured";
        description = "Imagga API credentials are not configured. Please contact support.";
      } else if (error.message && error.message.includes('IMAGE_ERROR')) {
        title = "Image Processing Error";
        description = "Unable to analyze the image. Please try uploading a clearer photo with better lighting or a different format (JPG, PNG).";
      } else if (error.message && error.message.includes('NETWORK_ERROR')) {
        title = "Connection Error";
        description = "Unable to connect to the analysis service. Please check your internet connection and try again.";
      } else {
        // For any other errors, show a more helpful message
        title = "Analysis Failed";
        description = "Unable to analyze the image. Please try uploading a clearer photo with better lighting.";
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    }
  });

  // Handle photo upload (works without authentication)
  const handleGetUploadParameters = async (file: File) => {
    try {
      const result = await getUploadUrlMutation.mutateAsync(file.type);
      
      if (!result?.uploadURL) {
        throw new Error('No upload URL received from server');
      }
      
      // Store the upload URL for later use in constructing the final URL
      setCurrentUploadUrl(result.uploadURL);
      
      return {
        method: 'PUT' as const,
        url: result.uploadURL,
      };
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to get upload URL. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = async (result: { successful: boolean; file?: File }) => {
    if (result.successful && result.file) {
      // For direct uploads, we need to construct the final image URL from the stored upload URL
      try {
        if (!currentUploadUrl) {
          throw new Error('No upload URL available');
        }
        
        // Clean the URL - remove query parameters and convert from upload URL to final storage URL
        const url = new URL(currentUploadUrl);
        let pathname = url.pathname;
        
        // Convert from upload URL format to final storage URL format
        // From: /storage/v1/object/upload/sign/bytewise-storage/uploads/filename
        // To:   /storage/v1/object/sign/bytewise-storage/uploads/filename
        pathname = pathname.replace('/upload/sign/', '/sign/');
        
        // Extract storage path from the upload URL for tracking
        // From: /storage/v1/object/upload/sign/bucket-name/path/to/file
        const pathParts = pathname.split('/');
        let storagePath = '';
        
        // Find the storage path after the bucket name
        const storageIndex = pathParts.findIndex(part => part === 'storage');
        if (storageIndex !== -1 && pathParts.length > storageIndex + 4) {
          // Skip ["", "storage", "v1", "object", "sign", "bucket-name"] and get the rest
          storagePath = pathParts.slice(storageIndex + 5).join('/');
        } else {
          // Fallback: use filename
          storagePath = `uploads/${result.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        }
        
        const finalImageUrl = `${url.protocol}//${url.host}${pathname}`;
        
        // Track the photo upload in database (only for authenticated users)
        try {
          await apiRequest('POST', '/api/objects/track-upload', {
            fileName: result.file.name,
            storagePath: storagePath,
            storageUrl: finalImageUrl,
            mimeType: result.file.type,
            fileSize: result.file.size,
            analysisId: null // Will be set later if analysis is performed
          });
          console.log('✅ Photo upload tracked in database for deletion compliance');
        } catch (trackingError) {
          console.warn('⚠️ Photo tracking failed (user may not be logged in):', trackingError);
          // Don't block upload flow if tracking fails - user might not be authenticated
        }
        
        setUploadedImageUrl(finalImageUrl);
        
        // Wait for upload to fully complete before starting analysis
        setTimeout(() => {
          analyzeFoodMutation.mutate(finalImageUrl);
        }, 3000); // Increased timeout to ensure upload is fully processed
        
      } catch (error) {
        console.error('Failed to construct image URL:', error);
        toast({
          title: "Upload Error",
          description: "Upload completed but failed to process the image URL. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      console.error('❌ Upload failed:', result);
      toast({
        title: "Upload Failed", 
        description: "File upload failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle portion adjustment
  const handlePortionAdjustment = (foodIndex: number, newPortion: number) => {
    if (!analysisResult) return;

    const updatedFoods = analysisResult.identifiedFoods.map((food, index) => {
      if (index === foodIndex) {
        const multiplier = newPortion / 100; // Assume 100g is base portion
        return {
          ...food,
          adjustedPortion: newPortion,
          calories: Math.round(food.calories * multiplier),
          protein: Math.round(food.protein * multiplier * 10) / 10,
          carbs: Math.round(food.carbs * multiplier * 10) / 10,
          fat: Math.round(food.fat * multiplier * 10) / 10,
          fiber: Math.round(food.fiber * multiplier * 10) / 10,
          sugar: Math.round(food.sugar * multiplier * 10) / 10,
          sodium: Math.round(food.sodium * multiplier * 10) / 10,
          // Include micronutrients in portion adjustment
          iron: Math.round((food.iron || 0) * multiplier * 10) / 10,
          calcium: Math.round((food.calcium || 0) * multiplier * 10) / 10,
          zinc: Math.round((food.zinc || 0) * multiplier * 10) / 10,
          magnesium: Math.round((food.magnesium || 0) * multiplier * 10) / 10,
          vitaminC: Math.round((food.vitaminC || 0) * multiplier * 10) / 10,
          vitaminD: Math.round((food.vitaminD || 0) * multiplier * 10) / 10,
          vitaminB12: Math.round((food.vitaminB12 || 0) * multiplier * 10) / 10,
          folate: Math.round((food.folate || 0) * multiplier * 10) / 10,
        };
      }
      return food;
    });

    // Recalculate total nutrition including micronutrients
    const totalNutrition = updatedFoods.reduce(
      (total, food: any) => ({
        calories: total.calories + food.calories,
        protein: total.protein + food.protein,
        carbs: total.carbs + food.carbs,
        fat: total.fat + food.fat,
        fiber: total.fiber + food.fiber,
        sugar: total.sugar + food.sugar,
        sodium: total.sodium + food.sodium,
        // Include micronutrients in recalculation
        iron: total.iron + (food.iron || 0),
        calcium: total.calcium + (food.calcium || 0),
        zinc: total.zinc + (food.zinc || 0),
        magnesium: total.magnesium + (food.magnesium || 0),
        vitaminC: total.vitaminC + (food.vitaminC || 0),
        vitaminD: total.vitaminD + (food.vitaminD || 0),
        vitaminB12: total.vitaminB12 + (food.vitaminB12 || 0),
        folate: total.folate + (food.folate || 0),
      }),
      { 
        calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0,
        iron: 0, calcium: 0, zinc: 0, magnesium: 0, vitaminC: 0, vitaminD: 0, vitaminB12: 0, folate: 0
      }
    );

    setAnalysisResult({
      ...analysisResult,
      identifiedFoods: updatedFoods,
      totalNutrition
    });
  };

  // Note: Automatic logging is now handled in analyzeFoodMutation.onSuccess

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6 p-6" data-testid="page-ai-food-analyzer">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800">AI Food Analyzer</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Take a photo of your food and let AI identify ingredients and calculate nutrition information using the USDA database
        </p>

      </div>

      {/* Upload Section */}
      {!uploadedImageUrl && (
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Camera className="h-5 w-5 text-gray-900" />
              Upload Food Photo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6">
              {/* Mobile-Optimized Upload Button */}
              <div className="w-full max-w-sm">
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={10485760} // 10MB
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={handleUploadComplete}
                  buttonClassName="w-full h-16 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-2 border-amber-400 shadow-lg rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Camera className="h-6 w-6" />
                    <span className="font-semibold">Take or Choose Photo</span>
                  </div>
                </ObjectUploader>
              </div>
              
              {/* Mobile-Friendly Instructions */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-dashed border-amber-300 rounded-lg p-4 w-full max-w-sm">
                <div className="flex flex-col items-center space-y-3 text-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center">
                      <span className="text-lg">📸</span>
                    </div>
                    <span className="text-sm font-medium">Select from Photo Library</span>
                  </div>
                  <p className="text-center text-sm text-gray-600">
                    Best results with good lighting and clear food visibility
                  </p>
                </div>
              </div>
              
              <Alert className="bg-amber-100/50 border-amber-300 text-gray-900">
                <Eye className="h-4 w-4 text-gray-900" />
                <AlertDescription className="text-gray-900">
                  For best results, ensure good lighting and that all food items are clearly visible in the photo.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Loading */}
      {uploadedImageUrl && analyzeFoodMutation.isPending && (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <h3 className="text-lg font-medium">Analyzing Your Food...</h3>
              <p className="text-gray-700 text-center">
                AI is identifying ingredients and calculating nutrition information
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Error */}
      {uploadedImageUrl && analyzeFoodMutation.isError && (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-red-500">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-red-600">Analysis Failed</h3>
              <p className="text-gray-700 text-center max-w-md">
                {analyzeFoodMutation.error?.message.includes('quota') 
                  ? 'OpenAI quota exceeded. Please try again later or contact support for a new API key.'
                  : 'Unable to analyze the image. Please try uploading a clearer photo with better lighting.'
                }
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setUploadedImageUrl('');
                    analyzeFoodMutation.reset();
                  }}
                  variant="outline"
                >
                  Try Another Photo
                </Button>
                {analyzeFoodMutation.error?.message.includes('quota') && (
                  <Button
                    onClick={() => analyzeFoodMutation.mutate(uploadedImageUrl)}
                    variant="default"
                  >
                    Retry Analysis
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Total Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Meal Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 mb-6">
                <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <div className="text-2xl font-bold text-orange-700">
                    {Math.round(analysisResult.totalNutrition.calories || 0)}
                  </div>
                  <div className="text-sm font-medium text-gray-800">Calories</div>
                </div>
                <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">
                    {Math.round((analysisResult.totalNutrition.protein || 0) * 10) / 10}g
                  </div>
                  <div className="text-sm font-medium text-gray-800">Protein</div>
                </div>
                <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="text-2xl font-bold text-green-700">
                    {Math.round((analysisResult.totalNutrition.carbs || 0) * 10) / 10}g
                  </div>
                  <div className="text-sm font-medium text-gray-800">Carbs</div>
                </div>
                <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700">
                    {Math.round((analysisResult.totalNutrition.fat || 0) * 10) / 10}g
                  </div>
                  <div className="text-sm font-medium text-gray-800">Fat</div>
                </div>
              </div>
              
              {/* Auto-logged notification */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200/60 rounded-xl p-4 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <span className="font-semibold text-green-800">Automatically Added to Daily Log</span>
                </div>
                <p className="text-sm text-green-700 font-medium">
                  This meal has been logged and will appear in your weekly summary
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Individual Food Items */}
          <Card className="bg-gradient-to-br from-white to-amber-50/30 border-amber-200/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Utensils className="h-5 w-5 text-amber-600" />
                Identified Foods ({analysisResult.identifiedFoods.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResult.identifiedFoods.map((food, index) => (
                  <div key={index} className="bg-white border border-amber-200 rounded-xl p-4 space-y-4 shadow-sm" data-testid={`food-item-${index}`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-semibold text-lg text-gray-900">{food.name}</h4>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 font-medium" data-testid={`confidence-${index}`}>
                        {Math.round((food.confidence || 0) * 100)}% confidence
                      </Badge>
                    </div>
                    
                    {/* Portion Adjustment */}
                    <div className="flex items-center gap-3 bg-amber-50/50 rounded-lg p-3">
                      <Label htmlFor={`portion-${index}`} className="text-sm font-medium text-gray-800 whitespace-nowrap">
                        Portion Size (grams):
                      </Label>
                      <Input
                        id={`portion-${index}`}
                        type="number"
                        min="1"
                        max="1000"
                        defaultValue={food.adjustedPortion || 100}
                        onChange={(e) => handlePortionAdjustment(index, parseInt(e.target.value) || 100)}
                        className="w-20 border-amber-200 focus:border-amber-400 focus:ring-amber-200"
                        data-testid={`input-portion-${index}`}
                      />
                    </div>

                    <Separator className="bg-amber-200/60" />
                    
                    {/* Nutrition Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                        <div className="font-bold text-orange-700">{Math.round(food.calories || 0)}</div>
                        <div className="text-xs text-gray-700 font-medium">calories</div>
                      </div>
                      <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                        <div className="font-bold text-blue-700">{Math.round((food.protein || 0) * 10) / 10}g</div>
                        <div className="text-xs text-gray-700 font-medium">protein</div>
                      </div>
                      <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                        <div className="font-bold text-green-700">{Math.round((food.carbs || 0) * 10) / 10}g</div>
                        <div className="text-xs text-gray-700 font-medium">carbs</div>
                      </div>
                      <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                        <div className="font-bold text-purple-700">{Math.round((food.fat || 0) * 10) / 10}g</div>
                        <div className="text-xs text-gray-700 font-medium">fat</div>
                      </div>
                      <div className="text-center bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200">
                        <div className="font-bold text-amber-700">{Math.round((food.fiber || 0) * 10) / 10}g</div>
                        <div className="text-xs text-gray-700 font-medium">fiber</div>
                      </div>
                      <div className="text-center bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
                        <div className="font-bold text-red-700">{Math.round(food.sodium || 0)}mg</div>
                        <div className="text-xs text-gray-700 font-medium">sodium</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* New Analysis Button */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/40">
            <CardContent className="p-4">
              <Button 
                variant="outline" 
                className="w-full border-amber-300 text-gray-900 hover:bg-amber-100 hover:border-amber-400" 
                onClick={() => {
                  setAnalysisResult(null);
                  setUploadedImageUrl('');
                }}
                data-testid="button-analyze-another"
              >
                <Camera className="h-4 w-4 mr-2" />
                Analyze Another Food Photo
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Weekly Analyzed Photos Section */}
      {weeklyAnalyzedFoods.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Eye className="h-5 w-5 text-blue-500" />
              Recent Analyzed Photos ({weeklyAnalyzedFoods.length} this week)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weeklyAnalyzedFoods.map((analysis, index) => {                
                return (
                  <div 
                    key={`${analysis.analysisTime}-${index}`} 
                    className="bg-amber-50/80 border border-amber-200 rounded-lg p-4 space-y-3"
                    data-testid={`analyzed-photo-${index}`}
                  >
                    {/* Photo */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                      {analysis.imageUrl ? (
                        <PhotoDisplay 
                          imageUrl={analysis.imageUrl}
                          alt="Analyzed food photo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
                          📸 Photo no longer available
                        </div>
                      )}
                      
                      {/* Delete Button */}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 bg-red-500/80 hover:bg-red-600/90 shadow-lg"
                        onClick={() => deleteAnalyzedFood(index)}
                        data-testid={`button-delete-analysis-${index}`}
                        title="Delete this analysis"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Analysis Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {analysis.identifiedFoods.length} item{analysis.identifiedFoods.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-gray-600">
                          {new Date(analysis.analysisTime).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Food Names */}
                      <div className="text-sm text-gray-800">
                        {analysis.identifiedFoods.slice(0, 2).map(food => food.name).join(', ')}
                        {analysis.identifiedFoods.length > 2 && ` +${analysis.identifiedFoods.length - 2} more`}
                      </div>
                      
                      {/* Total Nutrition */}
                      <div className="flex justify-between text-xs bg-amber-100/50 rounded px-2 py-1">
                        <span className="font-medium text-orange-600">
                          {Math.round(analysis.totalNutrition.calories)} cal
                        </span>
                        <span className="text-gray-700">
                          P: {Math.round(analysis.totalNutrition.protein)}g
                        </span>
                        <span className="text-gray-700">
                          C: {Math.round(analysis.totalNutrition.carbs)}g
                        </span>
                        <span className="text-gray-700">
                          F: {Math.round(analysis.totalNutrition.fat)}g
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}