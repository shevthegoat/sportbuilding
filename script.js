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

        // Domain analysis
        const domainScore = this.analyzeDomain(domain);
        score += domainScore.points;
        redFlags.push(...domainScore.redFlags);
        greenFlags.push(...domainScore.greenFlags);
        details.push(...domainScore.details);

        // URL structure analysis
        const urlScore = this.analyzeUrlStructure(urlObj);
        score += urlScore.points;
        redFlags.push(...urlScore.redFlags);
        greenFlags.push(...urlScore.greenFlags);
        details.push(...urlScore.details);

        // Content analysis
        const contentScore = this.analyzeContent(path, query);
        score += contentScore.points;
        redFlags.push(...contentScore.redFlags);
        greenFlags.push(...contentScore.greenFlags);
        details.push(...contentScore.details);

        // Determine verdict
        const verdict = this.determineVerdict(score);
        const confidence = Math.min(Math.max(Math.abs(score) * 10, 0), 100);

        return {
            verdict,
            confidence,
            score,
            redFlags: [...new Set(redFlags)],
            greenFlags: [...new Set(greenFlags)],
            details,
            platform
        };
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

    analyzeDomain(domain) {
        let points = 0;
        let redFlags = [];
        let greenFlags = [];
        let details = [];

        // Check for suspicious domain patterns
        const suspiciousPatterns = [
            /[0-9]{4,}/, // Many numbers
            /[a-z]{20,}/, // Very long strings
            /[a-z0-9]{30,}/, // Very long alphanumeric
            /bit\.ly|tinyurl|goo\.gl|t\.co/, // URL shorteners
            /[a-z]+[0-9]+[a-z]+[0-9]+/, // Alternating patterns
        ];

        for (const pattern of suspiciousPatterns) {
            if (pattern.test(domain)) {
                points -= 20;
                redFlags.push('Suspicious domain pattern detected');
            }
        }

        // Check for legitimate domains
        const legitimateDomains = [
            'youtube.com', 'youtu.be', 'instagram.com', 'tiktok.com',
            'facebook.com', 'fb.com', 'twitter.com', 'x.com'
        ];

        const isLegitimate = legitimateDomains.some(legit => domain.includes(legit));
        if (isLegitimate) {
            points += 30;
            greenFlags.push('Legitimate social media platform detected');
        } else {
            points -= 15;
            redFlags.push('Unknown or suspicious domain');
        }

        details.push({
            title: 'Domain Analysis',
            value: isLegitimate ? 'Legitimate platform' : 'Suspicious domain',
            type: isLegitimate ? 'positive' : 'negative'
        });

        return { points, redFlags, greenFlags, details };
    }

    analyzeUrlStructure(urlObj) {
        let points = 0;
        let redFlags = [];
        let greenFlags = [];
        let details = [];

        const path = urlObj.pathname;
        const query = urlObj.search;

        // Check for suspicious URL patterns
        const suspiciousPatterns = [
            /[0-9]{10,}/, // Very long numbers
            /[a-z0-9]{50,}/, // Very long strings
            /[a-z]+[0-9]+[a-z]+[0-9]+/, // Alternating patterns
            /[a-z]{20,}/, // Very long alphabetic strings
        ];

        for (const pattern of suspiciousPatterns) {
            if (pattern.test(path + query)) {
                points -= 15;
                redFlags.push('Suspicious URL structure detected');
            }
        }

        // Check for legitimate URL patterns
        const legitimatePatterns = [
            /\/watch\?v=/, // YouTube video
            /\/p\//, // Instagram post
            /\/reel\//, // Instagram reel
            /\/@[a-zA-Z0-9_]+/, // Username patterns
            /\/status\//, // Twitter status
        ];

        for (const pattern of legitimatePatterns) {
            if (pattern.test(path)) {
                points += 10;
                greenFlags.push('Legitimate URL structure detected');
                break;
            }
        }

        // Check URL length
        const totalLength = urlObj.href.length;
        if (totalLength > 200) {
            points -= 10;
            redFlags.push('Unusually long URL');
        } else if (totalLength < 50) {
            points += 5;
            greenFlags.push('Reasonable URL length');
        }

        details.push({
            title: 'URL Structure',
            value: totalLength > 200 ? 'Suspiciously long' : 'Normal length',
            type: totalLength > 200 ? 'negative' : 'positive'
        });

        return { points, redFlags, greenFlags, details };
    }

    analyzeContent(path, query) {
        let points = 0;
        let redFlags = [];
        let greenFlags = [];
        let details = [];

        const content = path + query;

        // Check for suspicious content patterns
        const suspiciousContent = [
            'click', 'earn', 'money', 'free', 'win', 'prize', 'lottery',
            'crypto', 'bitcoin', 'investment', 'get-rich', 'make-money',
            'urgent', 'limited', 'exclusive', 'secret', 'hidden'
        ];

        for (const word of suspiciousContent) {
            if (content.includes(word)) {
                points -= 15;
                redFlags.push(`Suspicious content detected: "${word}"`);
            }
        }

        // Check for legitimate content patterns
        const legitimateContent = [
            'watch', 'video', 'post', 'reel', 'story', 'status',
            'user', 'profile', 'channel', 'page'
        ];

        for (const word of legitimateContent) {
            if (content.includes(word)) {
                points += 5;
                greenFlags.push(`Legitimate content detected: "${word}"`);
            }
        }

        // Check for excessive special characters
        const specialCharCount = (content.match(/[^a-zA-Z0-9\/\?=&]/g) || []).length;
        if (specialCharCount > 20) {
            points -= 10;
            redFlags.push('Excessive special characters in URL');
        }

        details.push({
            title: 'Content Analysis',
            value: specialCharCount > 20 ? 'Suspicious content' : 'Normal content',
            type: specialCharCount > 20 ? 'negative' : 'positive'
        });

        return { points, redFlags, greenFlags, details };
    }

    determineVerdict(score) {
        if (score >= 20) {
            return {
                title: 'Likely Real',
                description: 'This link appears to be legitimate based on our analysis.',
                icon: 'fas fa-check-circle',
                class: 'real'
            };
        } else if (score <= -20) {
            return {
                title: 'Likely Fake',
                description: 'This link shows multiple signs of being fake or suspicious.',
                icon: 'fas fa-times-circle',
                class: 'fake'
            };
        } else {
            return {
                title: 'Uncertain',
                description: 'This link has mixed indicators. Exercise caution and verify independently.',
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