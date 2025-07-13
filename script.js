class SocialMediaAnalyzer {
    constructor() {
        this.urlInput = document.getElementById('urlInput');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.resultSection = document.getElementById('resultSection');
        this.loading = document.getElementById('loading');
        this.analyzerSection = document.getElementById('analyzerSection');
        this.startAnalyzingBtn = document.getElementById('startAnalyzingBtn');
        this.backToInfoBtn = document.getElementById('backToInfoBtn');
        
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
        // Simulate analysis delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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

        // Channel detection for videos
        const channelInfo = this.detectChannel(urlObj, platform);
        if (channelInfo) {
            details.push({
                title: 'Channel/Account',
                value: channelInfo,
                type: 'neutral'
            });
        }

        // Comprehensive analysis with improved scoring
        const analysisResults = this.comprehensiveAnalysis(urlObj, platform);
        score += analysisResults.score;
        redFlags.push(...analysisResults.redFlags);
        greenFlags.push(...analysisResults.greenFlags);
        details.push(...analysisResults.details);

        // Determine verdict with improved logic
        const verdict = this.determineVerdict(score, analysisResults);
        const confidence = Math.min(Math.max(Math.abs(score) * 8, 0), 100);

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

    comprehensiveAnalysis(urlObj, platform) {
        let score = 0;
        let redFlags = [];
        let greenFlags = [];
        let details = [];

        const domain = urlObj.hostname.toLowerCase();
        const path = urlObj.pathname.toLowerCase();
        const query = urlObj.search.toLowerCase();
        const fullUrl = urlObj.href.toLowerCase();

        // 1. DOMAIN ANALYSIS (Weight: 30%)
        const domainScore = this.analyzeDomainComprehensive(domain);
        score += domainScore.points;
        redFlags.push(...domainScore.redFlags);
        greenFlags.push(...domainScore.greenFlags);
        details.push(...domainScore.details);

        // 2. URL STRUCTURE ANALYSIS (Weight: 25%)
        const urlStructureScore = this.analyzeUrlStructureComprehensive(urlObj);
        score += urlStructureScore.points;
        redFlags.push(...urlStructureScore.redFlags);
        greenFlags.push(...urlStructureScore.greenFlags);
        details.push(...urlStructureScore.details);

        // 3. CONTENT ANALYSIS (Weight: 25%)
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

        return { score, redFlags, greenFlags, details };
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
        } else if (totalLength > 200) {
            points -= 10;
            redFlags.push('Unusually long URL');
        } else if (totalLength < 30) {
            points -= 5;
            redFlags.push('Suspiciously short URL');
        } else {
            points += 10;
            greenFlags.push('Reasonable URL length');
        }

        // Legitimate URL patterns
        const legitimatePatterns = [
            { pattern: /\/watch\?v=/, points: 15, flag: 'YouTube video pattern' },
            { pattern: /\/p\//, points: 15, flag: 'Instagram post pattern' },
            { pattern: /\/reel\//, points: 15, flag: 'Instagram reel pattern' },
            { pattern: /\/@[a-zA-Z0-9_]+/, points: 10, flag: 'Username pattern' },
            { pattern: /\/status\//, points: 15, flag: 'Twitter status pattern' },
            { pattern: /\/video\//, points: 10, flag: 'Video content pattern' }
        ];

        for (const { pattern, points: patternPoints, flag } of legitimatePatterns) {
            if (pattern.test(path)) {
                points += patternPoints;
                greenFlags.push(flag);
                break;
            }
        }

        // Suspicious URL patterns
        const suspiciousPatterns = [
            { pattern: /[0-9]{12,}/, points: -20, flag: 'Excessive numbers in URL' },
            { pattern: /[a-z0-9]{60,}/, points: -25, flag: 'Very long URL string' },
            { pattern: /[a-z]{30,}/, points: -15, flag: 'Unusually long alphabetic string' },
            { pattern: /[^a-zA-Z0-9\/\?=&.-]/, points: -10, flag: 'Excessive special characters' }
        ];

        for (const { pattern, points: patternPoints, flag } of suspiciousPatterns) {
            if (pattern.test(path + query)) {
                points += patternPoints;
                redFlags.push(flag);
            }
        }

        details.push({
            title: 'URL Structure',
            value: totalLength > 200 ? 'Suspiciously long' : 'Normal length',
            type: totalLength > 200 ? 'negative' : 'positive'
        });

        return { points, redFlags, greenFlags, details };
    }

    analyzeContentComprehensive(path, query) {
        let points = 0;
        let redFlags = [];
        let greenFlags = [];
        let details = [];

        const content = path + query;

        // Suspicious content keywords (high weight)
        const highRiskKeywords = [
            'earn', 'money', 'free', 'win', 'prize', 'lottery', 'crypto', 'bitcoin',
            'investment', 'get-rich', 'make-money', 'urgent', 'limited', 'exclusive',
            'secret', 'hidden', 'click', 'claim', 'verify', 'confirm', 'update'
        ];

        for (const word of highRiskKeywords) {
            if (content.includes(word)) {
                points -= 20;
                redFlags.push(`High-risk keyword detected: "${word}"`);
            }
        }

        // Medium risk keywords
        const mediumRiskKeywords = [
            'discount', 'offer', 'deal', 'sale', 'bonus', 'reward', 'gift',
            'opportunity', 'chance', 'lucky', 'winner', 'selected'
        ];

        for (const word of mediumRiskKeywords) {
            if (content.includes(word)) {
                points -= 10;
                redFlags.push(`Medium-risk keyword detected: "${word}"`);
            }
        }

        // Legitimate content keywords
        const legitimateKeywords = [
            'watch', 'video', 'post', 'reel', 'story', 'status', 'user', 'profile',
            'channel', 'page', 'photo', 'image', 'upload', 'share'
        ];

        for (const word of legitimateKeywords) {
            if (content.includes(word)) {
                points += 8;
                greenFlags.push(`Legitimate content keyword: "${word}"`);
            }
        }

        // Special character analysis
        const specialCharCount = (content.match(/[^a-zA-Z0-9\/\?=&.-]/g) || []).length;
        if (specialCharCount > 25) {
            points -= 15;
            redFlags.push('Excessive special characters');
        } else if (specialCharCount > 15) {
            points -= 8;
            redFlags.push('High number of special characters');
        }

        details.push({
            title: 'Content Analysis',
            value: specialCharCount > 25 ? 'Suspicious content' : 'Normal content',
            type: specialCharCount > 25 ? 'negative' : 'positive'
        });

        return { points, redFlags, greenFlags, details };
    }

    analyzePlatformSpecific(urlObj, platform) {
        let points = 0;
        let redFlags = [];
        let greenFlags = [];
        let details = [];

        const path = urlObj.pathname;
        const query = urlObj.search;

        // Platform-specific legitimate patterns
        if (platform.name === 'YouTube') {
            if (path.includes('/watch') && query.includes('v=')) {
                points += 20;
                greenFlags.push('Valid YouTube video URL');
            } else if (path.includes('/channel/') || path.includes('/user/') || path.includes('/c/') || path.includes('/@')) {
                points += 15;
                greenFlags.push('Valid YouTube channel URL');
            }
        } else if (platform.name === 'Instagram') {
            if (path.includes('/p/') || path.includes('/reel/')) {
                points += 20;
                greenFlags.push('Valid Instagram post/reel URL');
            }
        } else if (platform.name === 'TikTok') {
            if (path.includes('/@') || path.includes('/video/')) {
                points += 20;
                greenFlags.push('Valid TikTok URL');
            }
        } else if (platform.name === 'Twitter') {
            if (path.includes('/status/')) {
                points += 20;
                greenFlags.push('Valid Twitter status URL');
            }
        }

        // Platform-specific suspicious patterns
        if (platform.name === 'YouTube') {
            if (query.includes('list=') && !query.includes('v=')) {
                points -= 10;
                redFlags.push('YouTube playlist without video ID');
            }
        }

        details.push({
            title: 'Platform-Specific Analysis',
            value: platform.name === 'Unknown Platform' ? 'Unknown platform' : `Valid ${platform.name} URL`,
            type: platform.name === 'Unknown Platform' ? 'negative' : 'positive'
        });

        return { points, redFlags, greenFlags, details };
    }

    detectPlatform(domain) {
        const platforms = {
            'youtube.com': { name: 'YouTube', type: 'video' },
            'youtu.be': { name: 'YouTube', type: 'video' },
            'instagram.com': { name: 'Instagram', type: 'social' },
            'tiktok.com': { name: 'TikTok', type: 'video' },
            'facebook.com': { name: 'Facebook', type: 'social' },
            'fb.com': { name: 'Facebook', type: 'social' },
            'twitter.com': { name: 'Twitter', type: 'social' },
            'x.com': { name: 'Twitter', type: 'social' }
        };

        for (const [platformDomain, info] of Object.entries(platforms)) {
            if (domain.includes(platformDomain)) {
                return info;
            }
        }

        return { name: 'Unknown Platform', type: 'unknown' };
    }

    detectChannel(urlObj, platform) {
        const path = urlObj.pathname;
        const query = urlObj.search;
        
        // YouTube channel detection
        if (platform.name === 'YouTube') {
            // Check for channel URL patterns
            if (path.includes('/channel/')) {
                const channelId = path.split('/channel/')[1]?.split('/')[0];
                return `YouTube Channel ID: ${channelId}`;
            }
            
            // Check for user URL patterns
            if (path.includes('/user/')) {
                const username = path.split('/user/')[1]?.split('/')[0];
                return `YouTube User: ${username}`;
            }
            
            // Check for custom URL patterns
            if (path.includes('/c/') || path.includes('/@')) {
                const customName = path.split('/').find(part => part.startsWith('c/') || part.startsWith('@'));
                if (customName) {
                    const name = customName.replace('c/', '').replace('@', '');
                    return `YouTube Channel: ${name}`;
                }
            }
            
            // For regular video URLs, try to extract channel info from query params
            if (query.includes('v=')) {
                return 'YouTube Video (Channel info not available in URL)';
            }
        }
        
        // Instagram account detection
        if (platform.name === 'Instagram') {
            if (path.includes('/p/') || path.includes('/reel/')) {
                const username = path.split('/')[1];
                if (username && !username.includes('p') && !username.includes('reel')) {
                    return `Instagram Account: @${username}`;
                }
            }
        }
        
        // TikTok account detection
        if (platform.name === 'TikTok') {
            if (path.includes('/@')) {
                const username = path.split('/@')[1]?.split('/')[0];
                if (username) {
                    return `TikTok Account: @${username}`;
                }
            }
        }
        
        // Twitter/X account detection
        if (platform.name === 'Twitter') {
            if (path.includes('/status/')) {
                const username = path.split('/')[1];
                if (username && username !== 'status') {
                    return `Twitter Account: @${username}`;
                }
            }
        }
        
        return null;
    }

    determineVerdict(score, analysisResults) {
        // More nuanced verdict system
        if (score >= 30) {
            return {
                title: 'Likely Real',
                description: 'This link appears to be legitimate based on our comprehensive analysis. It shows multiple positive indicators and few red flags.',
                icon: 'fas fa-check-circle',
                class: 'real'
            };
        } else if (score >= 10) {
            return {
                title: 'Probably Real',
                description: 'This link shows mostly legitimate characteristics with some minor concerns. Exercise normal caution.',
                icon: 'fas fa-check-circle',
                class: 'real'
            };
        } else if (score <= -30) {
            return {
                title: 'Likely Fake',
                description: 'This link shows multiple strong indicators of being fake or suspicious. Avoid clicking and verify independently.',
                icon: 'fas fa-times-circle',
                class: 'fake'
            };
        } else if (score <= -10) {
            return {
                title: 'Suspicious',
                description: 'This link has concerning characteristics that suggest it may be fake. Exercise extreme caution.',
                icon: 'fas fa-exclamation-triangle',
                class: 'fake'
            };
        } else {
            return {
                title: 'Uncertain',
                description: 'This link has mixed indicators. The analysis is inconclusive. Verify independently before proceeding.',
                icon: 'fas fa-question-circle',
                class: 'uncertain'
            };
        }
    }

    displayResults(analysis) {
        this.hideLoading();

        // Update confidence meter
        const confidenceFill = document.getElementById('confidenceFill');
        const confidenceValue = document.getElementById('confidenceValue');
        confidenceFill.style.width = `${analysis.confidence}%`;
        confidenceValue.textContent = `${analysis.confidence}%`;

        // Update verdict
        const verdictIcon = document.getElementById('verdictIcon');
        const verdictTitle = document.getElementById('verdictTitle');
        const verdictDescription = document.getElementById('verdictDescription');

        verdictIcon.className = `verdict-icon ${analysis.verdict.class}`;
        verdictIcon.innerHTML = `<i class="${analysis.verdict.icon}"></i>`;
        verdictTitle.textContent = analysis.verdict.title;
        verdictDescription.textContent = analysis.verdict.description;

        // Update details grid
        const detailsGrid = document.getElementById('detailsGrid');
        detailsGrid.innerHTML = '';
        analysis.details.forEach(detail => {
            const detailElement = document.createElement('div');
            detailElement.className = `detail-item ${detail.type}`;
            detailElement.innerHTML = `
                <h5>${detail.title}</h5>
                <p>${detail.value}</p>
            `;
            detailsGrid.appendChild(detailElement);
        });

        // Update red flags
        const redFlagsSection = document.getElementById('redFlags');
        const redFlagsList = document.getElementById('redFlagsList');
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
        const greenFlagsSection = document.getElementById('greenFlags');
        const greenFlagsList = document.getElementById('greenFlagsList');
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

        this.resultSection.style.display = 'block';
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    showLoading() {
        this.loading.style.display = 'block';
        this.resultSection.style.display = 'none';
    }

    hideLoading() {
        this.loading.style.display = 'none';
    }

    showError(message) {
        alert(message);
    }
}

// Initialize the analyzer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SocialMediaAnalyzer();
}); 