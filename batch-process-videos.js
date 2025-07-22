#!/usr/bin/env node

/**
 * Batch Video AI Processing Script
 * 
 * Processes multiple videos using the Cloudinary Video AI Processing functionality.
 * Can read video public IDs from a file or command line arguments.
 * 
 * Usage: 
 *   node batch-process-videos.js video1 video2 video3
 *   node batch-process-videos.js --file=video-ids.txt
 *   node batch-process-videos.js --file=video-ids.txt --parallel=3
 */

require('dotenv').config();
const fs = require('fs');
const { processVideoWithAI } = require('./cloudinary-video-ai-processing.js');

/**
 * Read video IDs from a file
 * @param {string} filePath - Path to the file containing video IDs
 * @returns {Array} Array of video public IDs
 */
function readVideoIdsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#')); // Filter out empty lines and comments
  } catch (error) {
    console.error(`❌ Error reading file ${filePath}:`, error.message);
    process.exit(1);
  }
}

/**
 * Process videos in parallel with concurrency limit
 * @param {Array} videoIds - Array of video public IDs
 * @param {Object} options - Processing options
 * @param {number} concurrency - Maximum number of parallel processes
 */
async function processVideosInParallel(videoIds, options = {}, concurrency = 2) {
  const results = [];
  const errors = [];
  
  console.log(`🎬 Processing ${videoIds.length} videos with concurrency: ${concurrency}`);
  console.log('📋 Video IDs:', videoIds.join(', '));
  console.log('═'.repeat(80));
  
  // Process videos in batches
  for (let i = 0; i < videoIds.length; i += concurrency) {
    const batch = videoIds.slice(i, i + concurrency);
    console.log(`\n📦 Processing batch ${Math.floor(i / concurrency) + 1}/${Math.ceil(videoIds.length / concurrency)}: [${batch.join(', ')}]`);
    
    const batchPromises = batch.map(async (videoId, index) => {
      const globalIndex = i + index + 1;
      console.log(`\n🚀 [${globalIndex}/${videoIds.length}] Starting: ${videoId}`);
      
      try {
        const result = await processVideoWithAI(videoId, options);
        console.log(`✅ [${globalIndex}/${videoIds.length}] Completed: ${videoId}`);
        return { videoId, success: true, result };
      } catch (error) {
        console.error(`❌ [${globalIndex}/${videoIds.length}] Failed: ${videoId} - ${error.message}`);
        return { videoId, success: false, error: error.message };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    // Separate successful and failed results
    batchResults.forEach(result => {
      if (result.success) {
        results.push(result);
      } else {
        errors.push(result);
      }
    });
    
    // Short delay between batches to avoid overwhelming the API
    if (i + concurrency < videoIds.length) {
      console.log('\n⏳ Waiting 2 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return { results, errors };
}

/**
 * Process videos sequentially (safer for large batches)
 * @param {Array} videoIds - Array of video public IDs
 * @param {Object} options - Processing options
 */
async function processVideosSequentially(videoIds, options = {}) {
  const results = [];
  const errors = [];
  
  console.log(`🎬 Processing ${videoIds.length} videos sequentially`);
  console.log('📋 Video IDs:', videoIds.join(', '));
  console.log('═'.repeat(80));
  
  for (let i = 0; i < videoIds.length; i++) {
    const videoId = videoIds[i];
    console.log(`\n🚀 [${i + 1}/${videoIds.length}] Processing: ${videoId}`);
    
    try {
      const result = await processVideoWithAI(videoId, options);
      console.log(`✅ [${i + 1}/${videoIds.length}] Completed: ${videoId}`);
      results.push({ videoId, success: true, result });
      
      // Short delay between requests
      if (i < videoIds.length - 1) {
        console.log('⏳ Waiting 1 second before next video...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`❌ [${i + 1}/${videoIds.length}] Failed: ${videoId} - ${error.message}`);
      errors.push({ videoId, success: false, error: error.message });
    }
  }
  
  return { results, errors };
}

/**
 * Display final summary
 */
function displaySummary(results, errors, totalCount) {
  console.log('\n' + '═'.repeat(80));
  console.log('📊 BATCH PROCESSING SUMMARY');
  console.log('═'.repeat(80));
  
  console.log(`📈 Total videos: ${totalCount}`);
  console.log(`✅ Successful: ${results.length}`);
  console.log(`❌ Failed: ${errors.length}`);
  
  if (results.length > 0) {
    console.log('\n✅ Successfully processed:');
    results.forEach(({ videoId }) => {
      console.log(`   - ${videoId}`);
    });
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Failed to process:');
    errors.forEach(({ videoId, error }) => {
      console.log(`   - ${videoId}: ${error}`);
    });
  }
  
  console.log('\n🔔 Note: All successful videos are being processed asynchronously by Cloudinary.');
  console.log('📁 Transcript and chapter files will be generated when processing completes.');
}

/**
 * Show usage information
 */
function showUsage() {
  console.log('Usage: node batch-process-videos.js [options] [video_ids...]');
  console.log('\nExamples:');
  console.log('  node batch-process-videos.js video1 video2 video3');
  console.log('  node batch-process-videos.js --file=video-ids.txt');
  console.log('  node batch-process-videos.js --file=video-ids.txt --parallel=3');
  console.log('  node batch-process-videos.js --file=video-ids.txt --sequential');
  console.log('\nOptions:');
  console.log('  --file=FILE              Read video IDs from file (one per line)');
  console.log('  --parallel=NUM           Process NUM videos in parallel (default: 2)');
  console.log('  --sequential             Process videos one at a time');
  console.log('  --type=TYPE              Asset type (upload, private, authenticated)');
  console.log('  --notification-url=URL   Webhook URL for completion notifications');
  console.log('  --invalidate             Invalidate cached versions');
  console.log('  --help                   Show this help message');
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showUsage();
    process.exit(0);
  }
  
  const options = {};
  let videoIds = [];
  let filePath = null;
  let concurrency = 2;
  let sequential = false;
  
  // Parse options and collect video IDs
  args.forEach(arg => {
    if (arg.startsWith('--file=')) {
      filePath = arg.split('=')[1];
    } else if (arg.startsWith('--parallel=')) {
      concurrency = parseInt(arg.split('=')[1]) || 2;
    } else if (arg === '--sequential') {
      sequential = true;
    } else if (arg.startsWith('--type=')) {
      options.type = arg.split('=')[1];
    } else if (arg.startsWith('--notification-url=')) {
      options.notification_url = arg.split('=')[1];
    } else if (arg === '--invalidate') {
      options.invalidate = true;
    } else if (!arg.startsWith('--')) {
      videoIds.push(arg);
    }
  });
  
  // Read from file if specified
  if (filePath) {
    const fileVideoIds = readVideoIdsFromFile(filePath);
    videoIds = [...videoIds, ...fileVideoIds];
  }
  
  if (videoIds.length === 0) {
    console.error('❌ No video IDs provided');
    showUsage();
    process.exit(1);
  }
  
  return { videoIds, options, concurrency, sequential };
}

/**
 * Main execution
 */
async function main() {
  console.log('🎯 Cloudinary Batch Video AI Processing Tool\n');
  
  const { videoIds, options, concurrency, sequential } = parseArgs();
  
  try {
    let results, errors;
    
    if (sequential) {
      ({ results, errors } = await processVideosSequentially(videoIds, options));
    } else {
      ({ results, errors } = await processVideosInParallel(videoIds, options, concurrency));
    }
    
    displaySummary(results, errors, videoIds.length);
    
    if (errors.length > 0) {
      console.log('\n💥 Some videos failed to process. Check the errors above.');
      process.exit(1);
    } else {
      console.log('\n🎉 All videos submitted for processing successfully!');
    }
    
  } catch (error) {
    console.error('\n💥 Batch processing failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { processVideosInParallel, processVideosSequentially }; 