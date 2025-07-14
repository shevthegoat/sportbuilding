# Social Media Truth Checker

A powerful web application that analyzes social media links to determine if they're likely real or fake using advanced AI-powered analysis and web scraping.

## 🌟 Features

- **Multi-Platform Support**: Analyzes YouTube, Instagram, TikTok, Facebook, and Twitter links
- **Advanced AI Analysis**: Uses Firecrawl web scraper for content analysis
- **YouTube Data API**: Real-time video statistics and engagement analysis
- **Comprehensive Scoring**: Multiple analysis layers with weighted scoring
- **Modern UI**: Beautiful glass morphism design with smooth animations
- **Real-time Results**: Instant analysis with detailed breakdowns

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- API keys for enhanced features (optional but recommended)

### Basic Setup

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start analyzing social media links!

### Enhanced Setup with APIs

For the best analysis results, set up the following APIs:

#### 1. Firecrawl API Setup

Firecrawl provides web scraping capabilities to analyze the actual content of links.

1. Visit [Firecrawl](https://firecrawl.dev/)
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API key
5. Open `config.js` and replace `'your_firecrawl_api_key_here'` with your actual key

#### 2. YouTube Data API Setup

YouTube Data API provides real-time video statistics and engagement data.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3:
   - Go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key
5. Open `config.js` and replace `'your_youtube_api_key_here'` with your actual key

## 🔧 Configuration

### API Keys

Edit `config.js` to add your API keys:

```javascript
const API_CONFIG = {
    FIRECRAWL_API_KEY: 'your_actual_firecrawl_key',
    YOUTUBE_API_KEY: 'your_actual_youtube_key'
};
```

### Security Notes

- Never commit API keys to version control
- Keep your API keys secure and private
- Consider using environment variables for production

## 📊 Analysis Features

### Domain Analysis
- Legitimate platform detection
- Suspicious domain pattern recognition
- URL shortener detection

### URL Structure Analysis
- URL length evaluation
- Query parameter analysis
- Tracking parameter detection

### Content Analysis
- Keyword pattern matching
- Suspicious content detection
- Legitimate content identification

### Platform-Specific Analysis
- YouTube video statistics
- Instagram post validation
- TikTok video analysis
- Twitter post verification

### Web Content Analysis (Firecrawl)
- Real-time content scraping
- Title and description analysis
- Content quality assessment
- Suspicious language detection

### YouTube Video Analysis (YouTube Data API)
- View count analysis
- Like/dislike ratio evaluation
- Comment engagement assessment
- Video title analysis

## 🎯 How It Works

1. **Input**: User pastes a social media link
2. **Platform Detection**: Identifies the social media platform
3. **URL Analysis**: Analyzes URL structure and patterns
4. **Content Scraping**: Uses Firecrawl to analyze actual content
5. **Video Analysis**: Uses YouTube API for video statistics (if applicable)
6. **Scoring**: Applies weighted scoring across multiple factors
7. **Results**: Displays comprehensive analysis with confidence score

## 🛡️ Security Features

- CORS-safe API calls
- Input validation and sanitization
- Error handling and fallbacks
- Secure API key management

## 📱 Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🔄 Auto-Push Setup

This repository includes automatic Git hooks for easy deployment:

- **Pre-commit hook**: Auto-stages all changes
- **Post-commit hook**: Auto-pushes to GitHub
- **Watch script**: Monitors file changes and auto-commits

## 📈 Analysis Scoring

The system uses a comprehensive scoring algorithm:

- **Domain Analysis**: 25% weight
- **URL Structure**: 20% weight
- **Content Analysis**: 20% weight
- **Platform Analysis**: 20% weight
- **Web Content Analysis**: 15% weight

### Verdict Categories

- **Likely Real** (50+ points): Safe to visit
- **Probably Real** (20-49 points): Exercise caution
- **Uncertain** (-19 to 19 points): Proceed with caution
- **Suspicious** (-20 to -49 points): Avoid if possible
- **Likely Fake** (-50+ points): Do not visit

## 🐛 Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure your API keys are correctly set in `config.js`
2. **CORS Errors**: The app uses client-side API calls, ensure your browser allows them
3. **Analysis Fails**: Check browser console for detailed error messages

### API Limits

- **Firecrawl**: Check your plan limits at firecrawl.dev
- **YouTube Data API**: 10,000 units per day (free tier)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [Firecrawl](https://firecrawl.dev/) for web scraping capabilities
- [YouTube Data API](https://developers.google.com/youtube/v3) for video analysis
- [Font Awesome](https://fontawesome.com/) for icons
- [Inter Font](https://rsms.me/inter/) for typography

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Ensure API keys are properly configured
4. Test with different social media links

---

**Note**: This tool provides analysis based on patterns and algorithms. Always use your judgment and verify information independently. 