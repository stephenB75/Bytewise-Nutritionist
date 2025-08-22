/**
 * AI Food Analyzer Page
 * 
 * Allows users to upload food photos for AI-powered nutrition analysis
 * Uses GPT-4 Vision to identify foods and cross-references with USDA database
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ObjectUploader } from '@/components/ObjectUploader';
import { Camera, Loader2, Sparkles, Plus, Eye, Utensils, AlertTriangle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useCalorieTracking } from '@/hooks/useCalorieTracking';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UploadResult } from '@uppy/core';

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
  const { toast } = useToast();
  const { addCalculatedCalories } = useCalorieTracking();

  // Get upload URL mutation (works without authentication)
  const getUploadUrlMutation = useMutation({
    mutationFn: async () => {
      console.log('🔄 Making API request to /api/objects/upload...');
      try {
        const response = await apiRequest('POST', '/api/objects/upload');
        if (!response.ok) {
          throw new Error(`Upload preparation failed: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('📝 Upload URL API response:', data);
        return data as { uploadURL: string };
      } catch (error: any) {
        console.error('❌ Upload URL request failed:', error);
        throw new Error(error.message || 'Failed to prepare file upload');
      }
    },
    onError: (error: any) => {
      console.error('❌ Upload URL mutation failed:', error);
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
      console.log('🔬 Starting AI food analysis for image:', imageUrl);
      const response = await apiRequest('POST', '/api/ai/analyze-food', {
        imageUrl
      });
      console.log('🔬 AI analysis response received:', response.status, response.statusText);
      return response as unknown as AnalysisResult;
    },
    onSuccess: (result) => {
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete!",
        description: `Identified ${result.identifiedFoods.length} food items`,
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
  const handleGetUploadParameters = async () => {
    try {
      console.log('🔄 Requesting upload URL for AI Food Analysis...');
      const result = await getUploadUrlMutation.mutateAsync();
      console.log('✅ Upload URL received:', result);
      
      if (!result?.uploadURL) {
        throw new Error('No upload URL received from server');
      }
      
      return {
        method: 'PUT' as const,
        url: result.uploadURL,
      };
    } catch (error) {
      console.error('❌ Failed to get upload URL:', error);
      toast({
        title: "Upload Error",
        description: "Failed to get upload URL. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    console.log('📤 Upload completed:', result);
    
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      let imageUrl = uploadedFile.uploadURL;
      
      console.log('✅ Image uploaded successfully:', {
        fileName: uploadedFile.name,
        uploadURL: imageUrl,
        size: uploadedFile.size
      });
      
      if (imageUrl) {
        // Clean the URL - remove query parameters to get the clean storage URL
        try {
          const url = new URL(imageUrl);
          const cleanUrl = `${url.protocol}//${url.host}${url.pathname}`;
          imageUrl = cleanUrl;
          console.log('🔧 Cleaned upload URL for analysis:', cleanUrl);
        } catch (urlError) {
          console.log('⚠️ Could not clean URL, using original:', imageUrl);
        }
        
        setUploadedImageUrl(imageUrl);
        
        // Wait longer for upload to fully complete before starting analysis
        console.log('⏳ Waiting 5 seconds for upload to fully complete and propagate...');
        const finalImageUrl = imageUrl; // Capture in closure to ensure type safety
        setTimeout(() => {
          console.log('🚀 Starting AI food analysis with Gemini Vision...');
          analyzeFoodMutation.mutate(finalImageUrl);
        }, 5000);
        
      } else {
        console.error('❌ No upload URL received from completed upload');
        toast({
          title: "Upload Error",
          description: "Upload completed but no URL was returned. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      console.error('❌ Upload failed or no successful uploads:', result);
      toast({
        title: "Upload Failed", 
        description: `Upload failed: ${result.failed?.map(f => f.error).join(', ') || 'Unknown error'}`,
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
        };
      }
      return food;
    });

    // Recalculate total nutrition
    const totalNutrition = updatedFoods.reduce(
      (total, food) => ({
        calories: total.calories + food.calories,
        protein: total.protein + food.protein,
        carbs: total.carbs + food.carbs,
        fat: total.fat + food.fat,
        fiber: total.fiber + food.fiber,
        sugar: total.sugar + food.sugar,
        sodium: total.sodium + food.sodium,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
    );

    setAnalysisResult({
      ...analysisResult,
      identifiedFoods: updatedFoods,
      totalNutrition
    });
  };

  // Add to calorie tracker
  const handleAddToTracker = async () => {
    if (!analysisResult) return;

    const mealName = analysisResult.identifiedFoods.length === 1 
      ? analysisResult.identifiedFoods[0].name
      : `Mixed Meal (${analysisResult.identifiedFoods.length} items)`;

    await addCalculatedCalories({
      name: mealName,
      calories: analysisResult.totalNutrition.calories,
      protein: analysisResult.totalNutrition.protein,
      carbs: analysisResult.totalNutrition.carbs,
      fat: analysisResult.totalNutrition.fat,
      fiber: analysisResult.totalNutrition.fiber,
      sugar: analysisResult.totalNutrition.sugar,
      sodium: analysisResult.totalNutrition.sodium,
      ingredients: analysisResult.identifiedFoods.map(f => f.name)
    });

    toast({
      title: "Added to Tracker!",
      description: `${mealName} (${analysisResult.totalNutrition.calories} cal) added to your daily log`,
    });

    // Clear analysis for next photo
    setAnalysisResult(null);
    setUploadedImageUrl('');
  };

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
            <div className="flex flex-col items-center space-y-4">
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={10485760} // 10MB
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleUploadComplete}
                buttonClassName="w-full max-w-md h-16 text-lg bg-amber-500 hover:bg-amber-600 text-white border-amber-600"
              >
                <div className="flex items-center gap-3">
                  <Camera className="h-6 w-6" />
                  <span>Take or Upload Food Photo</span>
                </div>
              </ObjectUploader>
              
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
              <p className="text-muted-foreground text-center">
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
              <p className="text-muted-foreground text-center max-w-md">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{analysisResult.totalNutrition.calories}</div>
                  <div className="text-sm text-muted-foreground">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysisResult.totalNutrition.protein}g</div>
                  <div className="text-sm text-muted-foreground">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analysisResult.totalNutrition.carbs}g</div>
                  <div className="text-sm text-muted-foreground">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analysisResult.totalNutrition.fat}g</div>
                  <div className="text-sm text-muted-foreground">Fat</div>
                </div>
              </div>
              
              <Button 
                onClick={handleAddToTracker} 
                className="w-full" 
                size="lg"
                data-testid="button-add-meal-to-tracker"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Meal to Calorie Tracker
              </Button>
            </CardContent>
          </Card>

          {/* Individual Food Items */}
          <Card>
            <CardHeader>
              <CardTitle>Identified Foods ({analysisResult.identifiedFoods.length} items)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResult.identifiedFoods.map((food, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3" data-testid={`food-item-${index}`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-lg">{food.name}</h4>
                      <Badge variant="secondary" data-testid={`confidence-${index}`}>
                        {Math.round(food.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    
                    {/* Portion Adjustment */}
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`portion-${index}`}>Portion Size (grams):</Label>
                      <Input
                        id={`portion-${index}`}
                        type="number"
                        min="1"
                        max="1000"
                        defaultValue={food.adjustedPortion || 100}
                        onChange={(e) => handlePortionAdjustment(index, parseInt(e.target.value) || 100)}
                        className="w-24"
                        data-testid={`input-portion-${index}`}
                      />
                    </div>

                    <Separator />
                    
                    {/* Nutrition Details */}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-sm">
                      <div>
                        <div className="font-medium text-orange-600">{food.calories}</div>
                        <div className="text-muted-foreground">cal</div>
                      </div>
                      <div>
                        <div className="font-medium">{food.protein}g</div>
                        <div className="text-muted-foreground">protein</div>
                      </div>
                      <div>
                        <div className="font-medium">{food.carbs}g</div>
                        <div className="text-muted-foreground">carbs</div>
                      </div>
                      <div>
                        <div className="font-medium">{food.fat}g</div>
                        <div className="text-muted-foreground">fat</div>
                      </div>
                      <div>
                        <div className="font-medium">{food.fiber}g</div>
                        <div className="text-muted-foreground">fiber</div>
                      </div>
                      <div>
                        <div className="font-medium">{food.sodium}mg</div>
                        <div className="text-muted-foreground">sodium</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* New Analysis Button */}
          <Card>
            <CardContent className="p-4">
              <Button 
                variant="outline" 
                className="w-full" 
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
      </div>
    </div>
  );
}