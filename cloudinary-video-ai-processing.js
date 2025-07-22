#!/usr/bin/env node

/**
 * Cloudinary Video AI Processing Script
 * 
 * This script uses the Cloudinary Upload API's explicit method to invoke:
 * - Auto-chaptering (AI-generated chapters)
 * - Auto-transcription (speech-to-text)  
 * - Translation to multiple languages
 * 
 * Usage: node cloudinary-video-ai-processing.js <video_public_id>
 * Example: node cloudinary-video-ai-processing.js my-video
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Translation languages as specified
const TRANSLATION_LANGUAGES = [
  'fr-FR',  // French (France)
  'fr-CA',  // French (Canada) 
  'es',     // Spanish
  'de',     // German
  'pt-PT',  // Portuguese (Portugal)
  'pt-BR',  // Portuguese (Brazil)
  'hi',     // Hindi
  'ja',     // Japanese
  'zh-CN',  // Chinese (Simplified)
  'vi'      // Vietnamese
];

/**
 * Process video with AI features using Cloudinary's explicit method
 * @param {string} publicId - The public ID of the video to process
 * @param {Object} options - Processing options
 */
async function processVideoWithAI(publicId, options = {}) {
  try {
    console.log(`🎬 Starting AI processing for video: ${publicId}`);
    console.log(`📋 Features enabled: chapters, transcription, translations`);
    console.log(`🌍 Translation languages: ${TRANSLATION_LANGUAGES.join(', ')}`);
    
    const explicitOptions = {
      resource_type: 'video',
      type: options.type || 'upload',
      
      // Enable automatic chaptering
      auto_chaptering: true,
      
      // Enable automatic transcription with translations
      auto_transcription: {
        translate: TRANSLATION_LANGUAGES
      },
      
      // Optional: Invalidate cached versions
      invalidate: options.invalidate || false,
      
      // Optional: Notification URL for completion webhook
      ...(options.notification_url && { notification_url: options.notification_url })
    };

    console.log('🚀 Calling Cloudinary explicit method...');
    
    const result = await cloudinary.uploader.explicit(publicId, explicitOptions);
    
    console.log('✅ Explicit method call successful!');
    console.log('\n📊 Response Summary:');
    console.log(`- Public ID: ${result.public_id}`);
    console.log(`- Resource Type: ${result.resource_type}`);
    console.log(`- Type: ${result.type}`);
    console.log(`- Version: ${result.version}`);
    console.log(`- Format: ${result.format}`);
    console.log(`- Duration: ${result.duration}s`);
    
    // Check processing status
    if (result.info) {
      console.log('\n🔄 Processing Status:');
      
      if (result.info.auto_chaptering) {
        console.log(`- Chaptering: ${result.info.auto_chaptering.status || 'initiated'}`);
      }
      
      if (result.info.auto_transcription) {
        console.log(`- Transcription: ${result.info.auto_transcription.status || 'initiated'}`);
      }
    }
    
    console.log('\n📁 Expected Generated Files:');
    console.log(`- Chapters: ${publicId}-chapters.vtt`);
    console.log(`- Main transcript: ${publicId}.transcript`);
    console.log('- Translated transcripts:');
    TRANSLATION_LANGUAGES.forEach(lang => {
      console.log(`  - ${publicId}.${lang}.transcript`);
    });
    
    console.log('\n🔔 Note: Processing happens asynchronously. Files will be created when processing completes.');
    if (options.notification_url) {
      console.log(`📬 Completion notifications will be sent to: ${options.notification_url}`);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Error processing video:', error.message);
    
    if (error.http_code) {
      console.error(`HTTP Status: ${error.http_code}`);
    }
    
    if (error.message.includes('Invalid public ID')) {
      console.error('💡 Make sure the video exists in your Cloudinary account');
      console.error('💡 For videos in folders, include the folder path (e.g., "folder/video-name")');
    }
    
    if (error.message.includes('Invalid credentials')) {
      console.error('💡 Check your CLOUDINARY_URL environment variable or .env file');
    }
    
    throw error;
  }
}

/**
 * Validate environment configuration
 */
function validateConfig() {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n💡 Set these in your .env file or environment variables');
    console.error('💡 Example .env file:');
    console.error('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.error('   CLOUDINARY_API_KEY=your_api_key'); 
    console.error('   CLOUDINARY_API_SECRET=your_api_secret');
    process.exit(1);
  }
}

/**
 * Display usage information
 */
function showUsage() {
  console.log('Usage: node cloudinary-video-ai-processing.js <video_public_id> [options]');
  console.log('\nExamples:');
  console.log('  node cloudinary-video-ai-processing.js my-video');
  console.log('  node cloudinary-video-ai-processing.js folder/my-video');
  console.log('  node cloudinary-video-ai-processing.js my-video --type=authenticated');
  console.log('  node cloudinary-video-ai-processing.js my-video --notification-url=https://example.com/webhook');
  console.log('\nOptions:');
  console.log('  --type=TYPE                Asset type (upload, private, authenticated). Default: upload');
  console.log('  --notification-url=URL     Webhook URL for completion notifications');
  console.log('  --invalidate               Invalidate cached versions');
  console.log('  --help                     Show this help message');
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
  
  const publicId = args[0];
  const options = {};
  
  // Parse options
  args.slice(1).forEach(arg => {
    if (arg.startsWith('--type=')) {
      options.type = arg.split('=')[1];
    } else if (arg.startsWith('--notification-url=')) {
      options.notification_url = arg.split('=')[1];
    } else if (arg === '--invalidate') {
      options.invalidate = true;
    }
  });
  
  return { publicId, options };
}

/**
 * Main execution
 */
async function main() {
  console.log('🎯 Cloudinary Video AI Processing Tool\n');
  
  // Validate configuration
  validateConfig();
  
  // Parse arguments
  const { publicId, options } = parseArgs();
  
  try {
    await processVideoWithAI(publicId, options);
    console.log('\n🎉 Script completed successfully!');
  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { processVideoWithAI, TRANSLATION_LANGUAGES }; 