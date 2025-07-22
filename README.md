# Video Tutorial Accessibility Processing

This project provides scripts to process videos using Cloudinary's AI features to generate accessibility content including:

- 🎬 **Auto-chaptering** - AI-generated video chapters
- 📝 **Auto-transcription** - Speech-to-text conversion
- 🌍 **Multi-language translation** - Transcripts in 10 languages

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Cloudinary account with API credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd video-tutorial-accessibility
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file with your Cloudinary credentials:
   ```bash
   CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

   Get these values from your [Cloudinary Dashboard](https://cloudinary.com/console).

## 📋 Usage

### Single Video Processing

Process one video at a time:

```bash
# Process a single video
node cloudinary-video-ai-processing.js my-video-id

# With options
node cloudinary-video-ai-processing.js my-video-id --type=authenticated --notification-url=https://example.com/webhook
```

### Batch Processing (Recommended)

Process multiple videos efficiently:

```bash
# Process multiple videos from command line
node batch-process-videos.js video1 video2 video3

# Process videos from file (recommended for many videos)
node batch-process-videos.js --file=video-ids.txt

# Parallel processing (faster, default: 2 concurrent)
node batch-process-videos.js --file=video-ids.txt --parallel=3

# Sequential processing (safer for large batches)
node batch-process-videos.js --file=video-ids.txt --sequential
```

### Using npm scripts

```bash
npm run process my-video-id       # Single video
npm run batch video1 video2       # Multiple videos
npm run batch-file                # From video-ids.txt file
```

## 📁 File Structure

```
video-tutorial-accessibility/
├── cloudinary-video-ai-processing.js  # Single video processor
├── batch-process-videos.js           # Batch processor
├── video-ids.txt                     # List of video IDs to process
├── package.json                      # Project dependencies
├── .env.example                      # Environment template
└── README.md                         # This file
```

## 🌍 Supported Languages

The script automatically generates transcripts in the following languages:

- 🇫🇷 French (France & Canada)
- 🇪🇸 Spanish
- 🇩🇪 German
- 🇵🇹 Portuguese (Portugal & Brazil)
- 🇮🇳 Hindi
- 🇯🇵 Japanese
- 🇨🇳 Chinese (Simplified)
- 🇻🇳 Vietnamese

## 📊 Output Files

For each processed video, Cloudinary will generate:

- `{video-id}-chapters.vtt` - Video chapters/timestamps
- `{video-id}.transcript` - Main transcript (original language)
- `{video-id}.{language}.transcript` - Translated transcripts

Example for video `my-tutorial`:
```
my-tutorial-chapters.vtt
my-tutorial.transcript
my-tutorial.fr-FR.transcript
my-tutorial.es.transcript
my-tutorial.de.transcript
...
```

## ⚙️ Configuration Options

### Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--type` | Asset type (upload, private, authenticated) | `--type=authenticated` |
| `--notification-url` | Webhook URL for completion notifications | `--notification-url=https://example.com/webhook` |
| `--invalidate` | Invalidate cached versions | `--invalidate` |
| `--parallel=NUM` | Number of parallel processes (batch only) | `--parallel=3` |
| `--sequential` | Process videos one at a time (batch only) | `--sequential` |
| `--file=FILE` | Read video IDs from file (batch only) | `--file=my-videos.txt` |

### Setting up video-ids.txt

Add your video public IDs to `video-ids.txt`, one per line:

```
# Lines starting with # are comments
video-1
folder/video-2
tutorials/advanced-video
```

## 🔧 Troubleshooting

### Common Issues

1. **Missing dependencies:**
   ```bash
   npm install
   ```

2. **Invalid credentials:**
   - Check your `.env` file
   - Verify credentials in Cloudinary Dashboard

3. **Video not found:**
   - Ensure video exists in your Cloudinary account
   - Include folder path if video is in a subfolder
   - Check video public ID spelling

4. **API rate limits:**
   - Use sequential processing for large batches
   - Reduce parallel processing concurrency

## 📖 API Documentation

- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Video Auto-Transcription](https://cloudinary.com/documentation/video_auto_transcription)
- [Video Auto-Chaptering](https://cloudinary.com/documentation/video_auto_chaptering)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the package.json file for details.

## 🆘 Support

For issues and questions:
- Check the [Cloudinary Documentation](https://cloudinary.com/documentation)
- Review the troubleshooting section above
- Open an issue in this repository 