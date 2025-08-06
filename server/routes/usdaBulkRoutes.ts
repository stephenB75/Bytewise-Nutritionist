/**
 * USDA Bulk Download API Routes
 * 
 * Provides endpoints for bulk downloading and managing local USDA food database
 */

import { Router } from 'express';
import { USDABulkDownloader } from '../services/usdaBulkDownloader';

const router = Router();

// Initialize bulk downloader (will use same API key as main USDA service)
const usdaApiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
let bulkDownloader: USDABulkDownloader | null = null;

/**
 * Initialize bulk downloader
 */
function getBulkDownloader(): USDABulkDownloader {
  if (!bulkDownloader) {
    bulkDownloader = new USDABulkDownloader(usdaApiKey);
  }
  return bulkDownloader;
}

/**
 * Start bulk download of popular foods
 * POST /api/usda/bulk-download
 */
router.post('/bulk-download', async (req, res) => {
  try {
    const downloader = getBulkDownloader();
    
    // Start the download process (this may take several minutes)
    // Starting USDA bulk download process
    const progress = await downloader.downloadPopularFoods();
    
    res.json({
      success: true,
      message: 'Bulk download completed successfully',
      progress: progress,
      totalDownloaded: progress.downloadedFoods,
      errors: progress.errors
    });
  } catch (error) {
    // Bulk download failed - error handled in response
    res.status(500).json({
      success: false,
      message: 'Failed to start bulk download',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get bulk download progress
 * GET /api/usda/bulk-progress
 */
router.get('/bulk-progress', async (req, res) => {
  try {
    const downloader = getBulkDownloader();
    const progress = downloader.getProgress();
    
    res.json({
      success: true,
      progress: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get progress',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Download specific food category
 * POST /api/usda/download-category
 */
router.post('/download-category', async (req, res) => {
  try {
    const { category, searches } = req.body;
    
    if (!category || !searches || !Array.isArray(searches)) {
      return res.status(400).json({
        success: false,
        message: 'Category and searches array are required'
      });
    }
    
    const downloader = getBulkDownloader();
    const downloadedCount = await downloader.downloadCategory(category, searches);
    
    res.json({
      success: true,
      message: `Downloaded ${downloadedCount} foods for ${category} category`,
      downloadedCount: downloadedCount
    });
  } catch (error) {
    console.error('Category download failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get cache statistics
 * GET /api/usda/cache-stats
 */
router.get('/cache-stats', async (req, res) => {
  try {
    const downloader = getBulkDownloader();
    const stats = await downloader.getCacheStatistics();
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Clean up old cache entries
 * POST /api/usda/cleanup-cache
 */
router.post('/cleanup-cache', async (req, res) => {
  try {
    const { daysOld = 90 } = req.body;
    
    const downloader = getBulkDownloader();
    const deleted = await downloader.cleanupOldCache(daysOld);
    
    res.json({
      success: true,
      message: `Cleaned up old cache entries`,
      deletedCount: deleted
    });
  } catch (error) {
    console.error('Cache cleanup failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup cache',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Test USDA API connectivity
 * GET /api/usda/test-connection
 */
router.get('/test-connection', async (req, res) => {
  try {
    const downloader = getBulkDownloader();
    
    // Test with a simple search
    const testFoods = await downloader['usdaService'].searchFoods('apple', 1);
    
    res.json({
      success: true,
      message: 'USDA API connection successful',
      testResult: testFoods.length > 0 ? 'Found test data' : 'No data returned',
      apiKey: usdaApiKey === 'DEMO_KEY' ? 'Using demo key' : 'Using production key'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'USDA API connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Check USDA_API_KEY environment variable'
    });
  }
});

export default router;