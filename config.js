// API Configuration for Social Media Truth Checker
// 
// To use the enhanced features with Firecrawl and YouTube Data API:
// 1. Get your API keys from the respective services
// 2. Replace the placeholder values below with your actual API keys
// 3. Update the script.js file to use these keys

const API_CONFIG = {
    // Firecrawl API Key
    // Get your key from: https://firecrawl.dev/
    FIRECRAWL_API_KEY: 'your_firecrawl_api_key_here',
    
    // YouTube Data API Key
    // Get your key from: https://console.cloud.google.com/apis/credentials
    YOUTUBE_API_KEY: 'your_youtube_api_key_here'
};

// Instructions for getting API keys:
//
// FIRE CRAWL API:
// 1. Visit https://firecrawl.dev/
// 2. Sign up for an account
// 3. Navigate to your dashboard
// 4. Copy your API key
// 5. Replace 'your_firecrawl_api_key_here' with your actual key
//
// YOUTUBE DATA API:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select existing one
// 3. Enable the YouTube Data API v3
// 4. Go to Credentials → Create Credentials → API Key
// 5. Copy your API key
// 6. Replace 'your_youtube_api_key_here' with your actual key
//
// IMPORTANT: Keep your API keys secure and never share them publicly!

export default API_CONFIG; 