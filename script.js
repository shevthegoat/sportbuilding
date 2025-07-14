import API_CONFIG from './config.js';

class SocialMediaAnalyzer {
    constructor() {
        this.urlInput = document.getElementById('urlInput');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.resultSection = document.getElementById('resultSection');
        this.loading = document.getElementById('loading');
        this.analyzerSection = document.getElementById('analyzerSection');
        this.startAnalyzingBtn = document.getElementById('startAnalyzingBtn');
        this.backToInfoBtn = document.getElementById('backToInfoBtn');
        
        // API Keys from config
        this.FIRECRAWL_API_KEY = API_CONFIG.FIRECRAWL_API_KEY;
        this.YOUTUBE_API_KEY = API_CONFIG.YOUTUBE_API_KEY;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.analyzeBtn.addEventListener('click', () => this.analyzeLink());
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.analyzeLink();
            }
        });
        
        // Navigation buttons
        this.startAnalyzingBtn.addEventListener('click', () => this.showAnalyzer());
        this.backToInfoBtn.addEventListener('click', () => this.showInfo());
    }

    showAnalyzer() {
        // Hide all sections except analyzer
        document.querySelectorAll('section').forEach(section => {
            if (section.classList.contains('analyzer-section')) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
        
        // Update header
        document.querySelector('header h1').innerHTML = '<i class="fas fa-search"></i> Social Media Link Analyzer';
        document.querySelector('header p').textContent = 'Paste a social media link to analyze if it\'s likely real or fake';
    }

    showInfo() {
        // Show all sections except analyzer
        document.querySelectorAll('section').forEach(section => {
            if (section.classList.contains('analyzer-section')) {
                section.style.display = 'none';
            } else {
                section.style.display = 'block';
            }
        });
        
        // Reset header
        document.querySelector('header h1').innerHTML = '<i class="fas fa-shield-alt"></i> Social Media Truth Checker';
        document.querySelector('header p').textContent = 'Understanding the Real Impact of Fake Content';
        
        // Hide results if they were showing
        this.resultSection.style.display = 'none';
        this.loading.style.display = 'none';
    }

    async analyzeLink() {
        const url = this.urlInput.value.trim();
        
        if (!url) {
            this.showError('Please enter a URL to analyze.');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showError('Please enter a valid URL.');
            return;
        }

        this.showLoading();
        
        try {
            const analysis = await this.performAnalysis(url);
            this.displayResults(analysis);
        } catch (error) {
            console.error('Analysis error:', error);
            this.showError('An error occurred during analysis. Please try again.');
        }
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    async performAnalysis(url) {
        const urlObj = new URL(url);
        const domain = urlObj.hostname.toLowerCase();
        const path = urlObj.pathname.toLowerCase();
        const query = urlObj.search.toLowerCase();
        
        let score = 0;
        let redFlags = [];
        let greenFlags = [];
        let details = [];

        // Platform detection
        const platform = this.detectPlatform(domain);
        details.push({
            title: 'Platform Detected',
            value: platform.name,
            type: 'neutral'
        });

        // Enhanced analysis with APIs
        const enhancedAnalysis = await this.enhancedAnalysis(urlObj, platform);
        score += enhancedAnalysis.score;
        redFlags.push(...enhancedAnalysis.redFlags);
        greenFlags.push(...enhancedAnalysis.greenFlags);
        details.push(...enhancedAnalysis.details);

        // Channel detection for videos
        const channelInfo = this.detectChannel(urlObj, platform);
        if (channelInfo) {
            details.push({
                title: 'Channel/Account',
                value: channelInfo,
                type: 'neutral'
            });
        }

        // Determine verdict with improved logic
        const verdict = this.determineVerdict(score, enhancedAnalysis);
        
        // Calculate base confidence
        let confidence = Math.min(Math.max(Math.abs(score) * 8, 0), 100);
        
        // Reduce confidence if red flags are present
        if (redFlags.length > 0) {
            // Reduce confidence by 20-40% depending on number of red flags
            const redFlagPenalty = Math.min(redFlags.length * 8, 40);
            confidence = Math.max(confidence - redFlagPenalty, 10);
        }

        return {
            verdict,
            confidence,
            score,
            redFlags: [...new Set(redFlags)],
            greenFlags: [...new Set(greenFlags)],
            details,
            platform,
            channelInfo
        };
    }

    async enhancedAnalysis(urlObj, platform) {
        let score = 0;
        let redFlags = [];
        let greenFlags = [];
        let details = [];

        const domain = urlObj.hostname.toLowerCase();
        const path = urlObj.pathname.toLowerCase();
        const query = urlObj.search.toLowerCase();
        const fullUrl = urlObj.href.toLowerCase();

        // 1. DOMAIN ANALYSIS (Weight: 25%)
        const domainScore = this.analyzeDomainComprehensive(domain);
        score += domainScore.points;
        redFlags.push(...domainScore.redFlags);
        greenFlags.push(...domainScore.greenFlags);
        details.push(...domainScore.details);

        // 2. URL STRUCTURE ANALYSIS (Weight: 20%)
        const urlStructureScore = this.analyzeUrlStructureComprehensive(urlObj);
        score += urlStructureScore.points;
        redFlags.push(...urlStructureScore.redFlags);
        greenFlags.push(...urlStructureScore.greenFlags);
        details.push(...urlStructureScore.details);

        // 3. CONTENT ANALYSIS (Weight: 20%)
        const contentScore = this.analyzeContentComprehensive(path, query);
        score += contentScore.points;
        redFlags.push(...contentScore.redFlags);
        greenFlags.push(...contentScore.greenFlags);
        details.push(...contentScore.details);

        // 4. PLATFORM-SPECIFIC ANALYSIS (Weight: 20%)
        const platformScore = this.analyzePlatformSpecific(urlObj, platform);
        score += platformScore.points;
        redFlags.push(...platformScore.redFlags);
        greenFlags.push(...platformScore.greenFlags);
        details.push(...platformScore.details);

        // 5. FIRE CRAWL WEB SCRAPING ANALYSIS (Weight: 15%)
        try {
            const firecrawlData = await this.analyzeWithFirecrawl(urlObj.href);
            score += firecrawlData.points;
            redFlags.push(...firecrawlData.redFlags);
            greenFlags.push(...firecrawlData.greenFlags);
            details.push(...firecrawlData.details);
        } catch (error) {
            console.warn('Firecrawl analysis failed:', error);
            details.push({
                title: 'Web Content Analysis',
                value: 'Unable to analyze (API limit or error)',
                type: 'neutral'
            });
        }

        return { score, redFlags, greenFlags, details };
    }

    async analyzeWithFirecrawl(url) {
        let points = 0;
        let redFlags = [];
        let greenFlags = [];
        let details = [];

        try {
            // Firecrawl API call
            const response = await fetch('https://api.firecrawl.dev/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.FIRECRAWL_API_KEY}`
                },
                body: JSON.stringify({
                    url: url,
                    pageOptions: {
                        onlyMainContent: true,
                        includeHtml: true,
                        includeMarkdown: true
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Firecrawl API error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.data?.markdown || data.data?.html || '';
            const title = data.data?.title || '';
            const description = data.data?.description || '';

            // Analyze scraped content
            const contentAnalysis = this.analyzeScrapedContent(content, title, description);
            points += contentAnalysis.points;
            redFlags.push(...contentAnalysis.redFlags);
            greenFlags.push(...contentAnalysis.greenFlags);

            details.push({
                title: 'Web Content Analysis',
                value: contentAnalysis.summary,
                type: contentAnalysis.points > 0 ? 'positive' : 'negative'
            });

        } catch (error) {
            console.error('Firecrawl analysis error:', error);
            // Fallback to basic analysis
            points -= 5;
            redFlags.push('Unable to verify web content');
        }

        return { points, redFlags, greenFlags, details };
    }

    analyzeScrapedContent(content, title, description) {
        let points = 0;
        let redFlags = [];
        let greenFlags = [];
        let summary = '';

        const fullText = `${title} ${description} ${content}`.toLowerCase();

        // Suspicious content patterns
        const suspiciousPatterns = [
            { pattern: /(click here|click now|click to win)/, points: -20, flag: 'Suspicious call-to-action detected' },
            { pattern: /(free.*money|make.*money.*fast|earn.*money.*online)/, points: -25, flag: 'Money-making promises detected' },
            { pattern: /(limited time|act now|don't miss out)/, points: -15, flag: 'Urgency tactics detected' },
            { pattern: /(100% free|completely free|no cost)/, points: -10, flag: 'Excessive "free" claims' },
            { pattern: /(guaranteed|promise|assure)/, points: -15, flag: 'Excessive guarantees' },
            { pattern: /(bitcoin|crypto|investment.*scheme)/, points: -20, flag: 'Cryptocurrency investment content' },
            { pattern: /(weight loss|diet.*pill|miracle.*cure)/, points: -15, flag: 'Suspicious health claims' },
            { pattern: /(lottery|sweepstakes|winner)/, points: -20, flag: 'Lottery/sweepstakes content' }
        ];

        // Legitimate content patterns
        const legitimatePatterns = [
            { pattern: /(educational|tutorial|how to)/, points: 15, flag: 'Educational content detected' },
            { pattern: /(news|article|report)/, points: 10, flag: 'News/article content' },
            { pattern: /(official|verified|authentic)/, points: 10, flag: 'Official/verified content' },
            { pattern: /(community|discussion|forum)/, points: 5, flag: 'Community content' }
        ];

        // Check suspicious patterns
        for (const { pattern, points: patternPoints, flag } of suspiciousPatterns) {
            if (pattern.test(fullText)) {
                points += patternPoints;
                redFlags.push(flag);
            }
        }

        // Check legitimate patterns
        for (const { pattern, points: patternPoints, flag } of legitimatePatterns) {
            if (pattern.test(fullText)) {
                points += patternPoints;
                greenFlags.push(flag);
            }
        }

        // Content quality analysis
        if (content.length < 100) {
            points -= 10;
            redFlags.push('Very little content detected');
        } else if (content.length > 1000) {
            points += 5;
            greenFlags.push('Substantial content detected');
        }

        // Title analysis
        if (title && title.length > 10) {
            points += 5;
            greenFlags.push('Descriptive title found');
        }

        summary = points > 0 ? 'Content appears legitimate' : 'Suspicious content detected';
        if (points === 0) summary = 'Neutral content analysis';

        return { points, redFlags, greenFlags, summary };
    }

    async analyzeYouTubeVideo(videoId) {
        if (!this.YOUTUBE_API_KEY || this.YOUTUBE_API_KEY === 'your_youtube_api_key_here') {
            return null;
        }

        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${this.YOUTUBE_API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`YouTube API error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const video = data.items[0];
                const snippet = video.snippet;
                const stats = video.statistics;

                let points = 0;
                let redFlags = [];
                let greenFlags = [];
                let details = [];

                // Analyze video statistics
                const viewCount = parseInt(stats.viewCount) || 0;
                const likeCount = parseInt(stats.likeCount) || 0;
                const dislikeCount = parseInt(stats.dislikeCount) || 0;
                const commentCount = parseInt(stats.commentCount) || 0;

                // Suspicious patterns in video data
                if (viewCount < 100 && likeCount > 50) {
                    points -= 20;
                    redFlags.push('Suspicious engagement ratio (high likes, low views)');
                }

                if (viewCount > 10000 && likeCount < 10) {
                    points -= 15;
                    redFlags.push('Suspicious engagement ratio (high views, low likes)');
                }

                if (viewCount === 0 && likeCount > 0) {
                    points -= 25;
                    redFlags.push('Impossible engagement (likes without views)');
                }

                // Legitimate patterns
                if (viewCount > 1000 && likeCount > 10) {
                    points += 15;
                    greenFlags.push('Healthy engagement ratio');
                }

                if (commentCount > 5) {
                    points += 10;
                    greenFlags.push('Active community engagement');
                }

                // Title analysis
                const title = snippet.title.toLowerCase();
                const suspiciousTitlePatterns = [
                    /(click here|click now|click to win)/,
                    /(free.*money|make.*money.*fast)/,
                    /(limited time|act now)/,
                    /(100% free|completely free)/
                ];

                for (const pattern of suspiciousTitlePatterns) {
                    if (pattern.test(title)) {
                        points -= 20;
                        redFlags.push('Suspicious video title detected');
                        break;
                    }
                }

                details.push({
                    title: 'YouTube Video Analysis',
                    value: `Views: ${viewCount.toLocaleString()}, Likes: ${likeCount.toLocaleString()}`,
                    type: points > 0 ? 'positive' : 'negative'
                });

                return { points, redFlags, greenFlags, details };
            }
        } catch (error) {
            console.error('YouTube API error:', error);
        }

        return null;
    }

    analyzeDomainComprehensive(domain) {
        let points = 0;
        let redFlags = [];
        let greenFlags = [];
        let details = [];

        // Legitimate domains
        const legitimateDomains = [
            'youtube.com', 'youtu.be', 'instagram.com', 'tiktok.com',
            'facebook.com', 'fb.com', 'twitter.com', 'x.com'
        ];

        const isLegitimate = legitimateDomains.some(legit => domain.includes(legit));
        if (isLegitimate) {
            points += 40;
            greenFlags.push('Legitimate social media platform detected');
        } else {
            points -= 30;
            redFlags.push('Unknown or suspicious domain');
        }

        // Suspicious patterns
        const suspiciousPatterns = [
            { pattern: /[0-9]{6,}/, points: -25, flag: 'Excessive numbers in domain' },
            { pattern: /[a-z]{25,}/, points: -20, flag: 'Unusually long domain string' },
            { pattern: /[a-z0-9]{40,}/, points: -25, flag: 'Very long alphanumeric domain' },
            { pattern: /bit\.ly|tinyurl|goo\.gl|t\.co/, points: -15, flag: 'URL shortener detected' },
            { pattern: /[a-z]+[0-9]+[a-z]+[0-9]+/, points: -20, flag: 'Suspicious alternating pattern' },
            { pattern: /[^a-z0-9.-]/, points: -10, flag: 'Special characters in domain' }
        ];

        for (const { pattern, points: patternPoints, flag } of suspiciousPatterns) {
            if (pattern.test(domain)) {
                points += patternPoints;
                redFlags.push(flag);
            }
        }

        details.push({
            title: 'Domain Analysis',
            value: isLegitimate ? 'Legitimate platform' : 'Suspicious domain',
            type: isLegitimate ? 'positive' : 'negative'
        });

        return { points, redFlags, greenFlags, details };
    }

    analyzeUrlStructureComprehensive(urlObj) {
        let points = 0;
        let redFlags = [];
        let greenFlags = [];
        let details = [];

        const path = urlObj.pathname;
        const query = urlObj.search;
        const totalLength = urlObj.href.length;

        // URL length analysis
        if (totalLength > 300) {
            points -= 20;
            redFlags.push('Excessively long URL');
        } else if (totalLength < 50) {
            points += 10;
            greenFlags.push('Clean, short URL');
        }

        // Query parameter analysis
        const queryParams = new URLSearchParams(query);
        const paramCount = queryParams.size;

        if (paramCount > 10) {
            points -= 15;
            redFlags.push('Excessive query parameters');
        } else if (paramCount === 0) {
            points += 5;
            greenFlags.push('Clean URL without excessive parameters');
        }

        // Suspicious query parameters
        const suspiciousParams = ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'source'];
        let suspiciousParamCount = 0;

        for (const param of suspiciousParams) {
            if (queryParams.has(param)) {
                suspiciousParamCount++;
            }
        }

        if (suspiciousParamCount > 2) {
            points -= 10;
            redFlags.push('Multiple tracking parameters detected');
        }

        // Path analysis
        if (path.includes('click') || path.includes('redirect')) {
            points -= 20;
            redFlags.push('Redirect path detected');
        }

        if (path.includes('ad') || path.includes('sponsored')) {
            points -= 15;
            redFlags.push('Advertising/sponsored content path');
        }

        details.push({
            title: 'URL Structure',
            value: `Length: ${totalLength} chars, Params: ${paramCount}`,
            type: points > 0 ? 'positive' : 'negative'
        });

        return { points, redFlags, greenFlags, details };
    }

    analyzeContentComprehensive(path, query) {
        let points = 0;
        let redFlags = [];
        let greenFlags = [];
        let details = [];

        const fullContent = `${path} ${query}`.toLowerCase();

        // Suspicious content patterns
        const suspiciousPatterns = [
            { pattern: /(click|tap|press)/, points: -15, flag: 'Clickbait language detected' },
            { pattern: /(free|gratis|no cost)/, points: -10, flag: 'Excessive "free" claims' },
            { pattern: /(money|cash|dollar|profit)/, points: -15, flag: 'Money-focused content' },
            { pattern: /(win|winner|prize|reward)/, points: -20, flag: 'Prize/winner claims' },
            { pattern: /(limited|urgent|hurry)/, points: -15, flag: 'Urgency tactics' },
            { pattern: /(guaranteed|promise|assure)/, points: -10, flag: 'Excessive guarantees' },
            { pattern: /(bitcoin|crypto|investment)/, points: -20, flag: 'Cryptocurrency content' },
            { pattern: /(weight loss|diet|miracle)/, points: -15, flag: 'Suspicious health claims' },
            { pattern: /(lottery|sweepstakes)/, points: -25, flag: 'Lottery/sweepstakes content' },
            { pattern: /(adult|xxx|porn)/, points: -30, flag: 'Adult content detected' }
        ];

        // Legitimate content patterns
        const legitimatePatterns = [
            { pattern: /(news|article|blog)/, points: 10, flag: 'News/article content' },
            { pattern: /(tutorial|guide|how to)/, points: 15, flag: 'Educational content' },
            { pattern: /(official|verified)/, points: 10, flag: 'Official content' },
            { pattern: /(community|discussion)/, points: 5, flag: 'Community content' }
        ];

        // Check suspicious patterns
        for (const { pattern, points: patternPoints, flag } of suspiciousPatterns) {
            if (pattern.test(fullContent)) {
                points += patternPoints;
                redFlags.push(flag);
            }
        }

        // Check legitimate patterns
        for (const { pattern, points: patternPoints, flag } of legitimatePatterns) {
            if (pattern.test(fullContent)) {
                points += patternPoints;
                greenFlags.push(flag);
            }
        }

        details.push({
            title: 'Content Analysis',
            value: points > 0 ? 'Legitimate content patterns' : 'Suspicious content patterns',
            type: points > 0 ? 'positive' : 'negative'
        });

        return { points, redFlags, greenFlags, details };
    }

    analyzePlatformSpecific(urlObj, platform) {
        let points = 0;
        let redFlags = [];
        let greenFlags = [];
        let details = [];

        const path = urlObj.pathname.toLowerCase();
        const query = urlObj.search.toLowerCase();

        switch (platform.name) {
            case 'YouTube':
                // YouTube-specific analysis
                if (path.includes('/watch')) {
                    points += 10;
                    greenFlags.push('Valid YouTube video URL');
                } else if (path.includes('/channel') || path.includes('/user')) {
                    points += 5;
                    greenFlags.push('Valid YouTube channel URL');
                }

                // Check for suspicious YouTube patterns
                if (query.includes('utm_source') || query.includes('ref=')) {
                    points -= 10;
                    redFlags.push('YouTube URL with tracking parameters');
                }
                break;

            case 'Instagram':
                // Instagram-specific analysis
                if (path.includes('/p/') || path.includes('/reel/')) {
                    points += 10;
                    greenFlags.push('Valid Instagram post URL');
                } else if (path.includes('/stories/')) {
                    points += 5;
                    greenFlags.push('Valid Instagram story URL');
                }

                if (query.includes('utm_')) {
                    points -= 10;
                    redFlags.push('Instagram URL with tracking parameters');
                }
                break;

            case 'TikTok':
                // TikTok-specific analysis
                if (path.includes('/video/')) {
                    points += 10;
                    greenFlags.push('Valid TikTok video URL');
                }

                if (query.includes('utm_')) {
                    points -= 10;
                    redFlags.push('TikTok URL with tracking parameters');
                }
                break;

            case 'Twitter':
                // Twitter-specific analysis
                if (path.includes('/status/')) {
                    points += 10;
                    greenFlags.push('Valid Twitter post URL');
                }

                if (query.includes('utm_')) {
                    points -= 10;
                    redFlags.push('Twitter URL with tracking parameters');
                }
                break;

            case 'Facebook':
                // Facebook-specific analysis
                if (path.includes('/posts/') || path.includes('/photo/')) {
                    points += 10;
                    greenFlags.push('Valid Facebook post URL');
                }

                if (query.includes('utm_')) {
                    points -= 10;
                    redFlags.push('Facebook URL with tracking parameters');
                }
                break;
        }

        details.push({
            title: 'Platform Analysis',
            value: `${platform.name} specific checks`,
            type: points > 0 ? 'positive' : 'negative'
        });

        return { points, redFlags, greenFlags, details };
    }

    detectPlatform(domain) {
        if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
            return { name: 'YouTube', type: 'video' };
        } else if (domain.includes('instagram.com')) {
            return { name: 'Instagram', type: 'social' };
        } else if (domain.includes('tiktok.com')) {
            return { name: 'TikTok', type: 'video' };
        } else if (domain.includes('facebook.com') || domain.includes('fb.com')) {
            return { name: 'Facebook', type: 'social' };
        } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
            return { name: 'Twitter', type: 'social' };
        } else {
            return { name: 'Unknown', type: 'unknown' };
        }
    }

    detectChannel(urlObj, platform) {
        const path = urlObj.pathname;
        
        switch (platform.name) {
            case 'YouTube':
                // Extract channel name from YouTube URL
                const channelMatch = path.match(/\/(?:channel\/|user\/|c\/)([^\/\?]+)/);
                if (channelMatch) {
                    return channelMatch[1];
                }
                break;
                
            case 'Instagram':
                // Extract username from Instagram URL
                const instaMatch = path.match(/\/([^\/\?]+)(?:\/|$)/);
                if (instaMatch && !instaMatch[1].includes('p') && !instaMatch[1].includes('reel')) {
                    return instaMatch[1];
                }
                break;
                
            case 'TikTok':
                // Extract username from TikTok URL
                const tiktokMatch = path.match(/\/([^\/\?]+)(?:\/video\/|$)/);
                if (tiktokMatch) {
                    return tiktokMatch[1];
                }
                break;
                
            case 'Twitter':
                // Extract username from Twitter URL
                const twitterMatch = path.match(/\/([^\/\?]+)(?:\/status\/|$)/);
                if (twitterMatch) {
                    return twitterMatch[1];
                }
                break;
        }
        
        return null;
    }

    determineVerdict(score, analysisResults) {
        // Check if there are any red flags
        const hasRedFlags = analysisResults.redFlags && analysisResults.redFlags.length > 0;
        
        // If there are red flags, automatically downgrade the verdict
        if (hasRedFlags) {
            if (score >= 50) {
                return {
                    title: 'Possibly Real',
                    description: 'This link appears legitimate but has some concerning indicators. Exercise caution.',
                    icon: 'fas fa-exclamation-triangle',
                    class: 'uncertain'
                };
            } else if (score >= 20) {
                return {
                    title: 'Uncertain',
                    description: 'This link has mixed indicators with some concerning patterns. Proceed with extreme caution.',
                    icon: 'fas fa-question-circle',
                    class: 'uncertain'
                };
            } else if (score >= -20) {
                return {
                    title: 'Suspicious',
                    description: 'This link shows concerning patterns and red flags. Avoid if possible.',
                    icon: 'fas fa-exclamation-triangle',
                    class: 'fake'
                };
            } else if (score >= -50) {
                return {
                    title: 'Likely Fake',
                    description: 'This link has multiple red flags and suspicious patterns. Do not visit.',
                    icon: 'fas fa-times-circle',
                    class: 'fake'
                };
            } else {
                return {
                    title: 'Definitely Fake',
                    description: 'This link has numerous red flags and is likely malicious. Do not visit under any circumstances.',
                    icon: 'fas fa-times-circle',
                    class: 'fake'
                };
            }
        } else {
            // No red flags - use original scoring
            if (score >= 50) {
                return {
                    title: 'Likely Real',
                    description: 'This link appears to be legitimate and safe to visit.',
                    icon: 'fas fa-check-circle',
                    class: 'real'
                };
            } else if (score >= 20) {
                return {
                    title: 'Probably Real',
                    description: 'This link seems legitimate but exercise caution.',
                    icon: 'fas fa-check-circle',
                    class: 'real'
                };
            } else if (score >= -20) {
                return {
                    title: 'Uncertain',
                    description: 'Unable to determine with confidence. Proceed with caution.',
                    icon: 'fas fa-question-circle',
                    class: 'uncertain'
                };
            } else if (score >= -50) {
                return {
                    title: 'Suspicious',
                    description: 'This link shows concerning patterns. Avoid if possible.',
                    icon: 'fas fa-exclamation-triangle',
                    class: 'fake'
                };
            } else {
                return {
                    title: 'Likely Fake',
                    description: 'This link appears to be fake or malicious. Do not visit.',
                    icon: 'fas fa-times-circle',
                    class: 'fake'
                };
            }
        }
    }

    displayResults(analysis) {
        this.hideLoading();
        
        const verdict = analysis.verdict;
        const confidence = analysis.confidence;
        
        // Update confidence meter
        document.getElementById('confidenceFill').style.width = `${confidence}%`;
        document.getElementById('confidenceValue').textContent = `${Math.round(confidence)}%`;
        
        // Update verdict
        const verdictIcon = document.getElementById('verdictIcon');
        verdictIcon.className = `verdict-icon ${verdict.class}`;
        verdictIcon.innerHTML = `<i class="${verdict.icon}"></i>`;
        
        document.getElementById('verdictTitle').textContent = verdict.title;
        document.getElementById('verdictDescription').textContent = verdict.description;
        
        // Add warning if red flags are present
        if (analysis.redFlags && analysis.redFlags.length > 0) {
            const warningText = `⚠️ ${analysis.redFlags.length} red flag${analysis.redFlags.length > 1 ? 's' : ''} detected - confidence reduced`;
            document.getElementById('verdictDescription').innerHTML += `<br><br><strong style="color: #dc143c;">${warningText}</strong>`;
        }
        
        // Update analysis details
        const detailsGrid = document.getElementById('detailsGrid');
        detailsGrid.innerHTML = '';
        
        analysis.details.forEach(detail => {
            const detailItem = document.createElement('div');
            detailItem.className = `detail-item ${detail.type}`;
            detailItem.innerHTML = `
                <h5>${detail.title}</h5>
                <p>${detail.value}</p>
            `;
            detailsGrid.appendChild(detailItem);
        });
        
        // Update red flags
        const redFlagsList = document.getElementById('redFlagsList');
        const redFlagsSection = document.getElementById('redFlags');
        
        if (analysis.redFlags.length > 0) {
            redFlagsList.innerHTML = '';
            analysis.redFlags.forEach(flag => {
                const li = document.createElement('li');
                li.textContent = flag;
                redFlagsList.appendChild(li);
            });
            redFlagsSection.style.display = 'block';
        } else {
            redFlagsSection.style.display = 'none';
        }
        
        // Update green flags
        const greenFlagsList = document.getElementById('greenFlagsList');
        const greenFlagsSection = document.getElementById('greenFlags');
        
        if (analysis.greenFlags.length > 0) {
            greenFlagsList.innerHTML = '';
            analysis.greenFlags.forEach(flag => {
                const li = document.createElement('li');
                li.textContent = flag;
                greenFlagsList.appendChild(li);
            });
            greenFlagsSection.style.display = 'block';
        } else {
            greenFlagsSection.style.display = 'none';
        }
        
        // Show results
        this.resultSection.style.display = 'block';
    }

    showLoading() {
        this.loading.style.display = 'block';
        this.resultSection.style.display = 'none';
    }

    hideLoading() {
        this.loading.style.display = 'none';
    }

    showError(message) {
        this.hideLoading();
        alert(message);
    }
}

// Initialize the analyzer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SocialMediaAnalyzer();
}); 