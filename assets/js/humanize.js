// Humanize Text functionality
class TextHumanizer {
    constructor() {
        this.aiPatterns = {
            // Common AI phrases and patterns
            phrases: [
                'furthermore', 'moreover', 'in conclusion', 'it is important to note',
                'delve into', 'dive deep', 'explore the intricacies', 'comprehensive analysis',
                'multifaceted', 'paradigm', 'leverage', 'utilize', 'facilitate',
                'in today\'s digital landscape', 'cutting-edge', 'revolutionary',
                'game-changer', 'seamlessly integrate', 'robust solution',
                'state-of-the-art', 'next-generation', 'innovative approach'
            ],

            // Repetitive sentence starters
            starters: [
                'additionally', 'furthermore', 'moreover', 'in addition',
                'it is worth noting', 'it should be mentioned', 'importantly',
                'significantly', 'notably', 'remarkably'
            ],

            // Perfect grammar patterns (too formal)
            formalPatterns: [
                /\b(shall|ought to|whereby|thus|hence|therefore)\b/gi,
                /\b(in order to|so as to|with regard to|concerning)\b/gi,
                /\b(aforementioned|henceforth|nonetheless|nevertheless)\b/gi
            ]
        };

        this.humanReplacements = {
            // Synonym replacements for more natural language
            'utilize': ['use', 'employ', 'apply', 'work with'],
            'facilitate': ['help', 'make easier', 'enable', 'support'],
            'demonstrate': ['show', 'prove', 'illustrate', 'reveal'],
            'implement': ['put in place', 'set up', 'create', 'build'],
            'comprehensive': ['complete', 'full', 'thorough', 'detailed'],
            'furthermore': ['also', 'plus', 'and', 'what\'s more'],
            'moreover': ['also', 'besides', 'on top of that', 'additionally'],
            'in conclusion': ['to wrap up', 'finally', 'in the end', 'so'],
            'paradigm': ['model', 'approach', 'way', 'method'],
            'leverage': ['use', 'take advantage of', 'make use of', 'employ'],
            'multifaceted': ['complex', 'varied', 'many-sided', 'diverse'],
            'cutting-edge': ['latest', 'modern', 'advanced', 'new'],
            'state-of-the-art': ['latest', 'modern', 'advanced', 'top-notch'],
            'revolutionary': ['groundbreaking', 'innovative', 'game-changing', 'new'],
            'seamlessly': ['smoothly', 'easily', 'without problems', 'effortlessly']
        };

        this.contractionMap = {
            'do not': 'don\'t',
            'will not': 'won\'t',
            'cannot': 'can\'t',
            'would not': 'wouldn\'t',
            'should not': 'shouldn\'t',
            'could not': 'couldn\'t',
            'is not': 'isn\'t',
            'are not': 'aren\'t',
            'was not': 'wasn\'t',
            'were not': 'weren\'t',
            'have not': 'haven\'t',
            'has not': 'hasn\'t',
            'had not': 'hadn\'t',
            'it is': 'it\'s',
            'that is': 'that\'s',
            'there is': 'there\'s',
            'I am': 'I\'m',
            'you are': 'you\'re',
            'we are': 'we\'re',
            'they are': 'they\'re'
        };
    }

    analyzeText(text) {
        if (!text || text.trim().length === 0) {
            return { score: 0, details: { reason: 'No text provided' } };
        }

        let aiScore = 0;
        const details = {};
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = text.toLowerCase().split(/\s+/);
        const totalWords = words.length;

        // 1. Check for AI-like phrases (20% weight)
        let aiPhraseCount = 0;
        this.aiPatterns.phrases.forEach(phrase => {
            const regex = new RegExp(phrase, 'gi');
            const matches = text.match(regex);
            if (matches) {
                aiPhraseCount += matches.length;
            }
        });
        const phraseScore = Math.min((aiPhraseCount / sentences.length) * 100, 30);
        aiScore += phraseScore;
        details.aiPhrases = aiPhraseCount;

        // 2. Check sentence structure uniformity (15% weight)
        const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
        const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
        const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
        const uniformityScore = Math.max(0, 20 - variance); // Low variance = high AI score
        aiScore += uniformityScore;
        details.sentenceUniformity = Math.round(uniformityScore);

        // 3. Check for repetitive sentence starters (10% weight)
        let repetitiveStarters = 0;
        const starterCounts = {};
        sentences.forEach(sentence => {
            const firstWords = sentence.trim().toLowerCase().split(/\s+/).slice(0, 2).join(' ');
            starterCounts[firstWords] = (starterCounts[firstWords] || 0) + 1;
            if (starterCounts[firstWords] > 2) repetitiveStarters++;
        });
        const starterScore = Math.min((repetitiveStarters / sentences.length) * 40, 15);
        aiScore += starterScore;
        details.repetitiveStarters = repetitiveStarters;

        // 4. Check vocabulary complexity and diversity (20% weight)
        const uniqueWords = new Set(words).size;
        const vocabularyDiversity = uniqueWords / totalWords;
        const complexWords = words.filter(word => word.length > 8).length;
        const complexityRatio = complexWords / totalWords;

        // AI tends to have lower diversity but higher complexity
        let vocabScore = 0;
        if (vocabularyDiversity < 0.3) vocabScore += 10; // Low diversity
        if (complexityRatio > 0.2) vocabScore += 15; // High complexity
        aiScore += vocabScore;
        details.vocabularyDiversity = Math.round(vocabularyDiversity * 100);
        details.complexityRatio = Math.round(complexityRatio * 100);

        // 5. Check for perfect grammar/formal language (15% weight)
        let formalityScore = 0;
        this.aiPatterns.formalPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                formalityScore += matches.length * 2;
            }
        });
        formalityScore = Math.min(formalityScore, 20);
        aiScore += formalityScore;
        details.formalLanguage = formalityScore;

        // 6. Check for lack of contractions (10% weight)
        const contractionOpportunities = Object.keys(this.contractionMap).length;
        let foundContractions = 0;
        Object.keys(this.contractionMap).forEach(formal => {
            if (text.toLowerCase().includes(formal)) {
                foundContractions++;
            }
        });
        const contractionScore = Math.max(0, 15 - (foundContractions / contractionOpportunities * 15));
        aiScore += contractionScore;
        details.lackOfContractions = Math.round(contractionScore);

        // 7. Check text entropy (10% weight)
        const entropy = this.calculateEntropy(text);
        const entropyScore = entropy < 4.0 ? (4.0 - entropy) * 5 : 0; // Low entropy = repetitive = AI-like
        aiScore += entropyScore;
        details.entropy = Math.round(entropy * 100) / 100;

        // Normalize score to 0-100
        aiScore = Math.min(Math.max(aiScore, 0), 100);

        details.overallScore = Math.round(aiScore);
        details.humanLikelihood = Math.round(100 - aiScore);

        return {
            score: aiScore,
            details: details
        };
    }

    calculateEntropy(text) {
        const frequencies = {};
        const length = text.length;

        // Count character frequencies
        for (let char of text.toLowerCase()) {
            frequencies[char] = (frequencies[char] || 0) + 1;
        }

        // Calculate entropy
        let entropy = 0;
        for (let freq of Object.values(frequencies)) {
            const probability = freq / length;
            entropy -= probability * Math.log2(probability);
        }

        return entropy;
    }

    async humanizeText(text) {
        if (!text || text.trim().length === 0) {
            return text;
        }

        try {
            // First try local humanization
            let humanizedText = this.localHumanize(text);

            // If we have an API available, enhance with AI
            try {
                const response = await fetch('/api/humanize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: humanizedText })
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.humanizedText) {
                        humanizedText = result.humanizedText;
                    }
                }
            } catch (apiError) {
                console.log('API enhancement unavailable, using local humanization');
            }

            return humanizedText;
        } catch (error) {
            console.error('Humanization error:', error);
            return text; // Return original text if humanization fails
        }
    }

    localHumanize(text) {
        let result = text;

        // 1. Replace formal words with casual synonyms
        Object.keys(this.humanReplacements).forEach(formal => {
            const replacements = this.humanReplacements[formal];
            const regex = new RegExp(`\\b${formal}\\b`, 'gi');
            result = result.replace(regex, () => {
                return replacements[Math.floor(Math.random() * replacements.length)];
            });
        });

        // 2. Add contractions
        Object.keys(this.contractionMap).forEach(formal => {
            const casual = this.contractionMap[formal];
            const regex = new RegExp(formal, 'gi');
            result = result.replace(regex, casual);
        });

        // 3. Vary sentence structure
        const sentences = result.split(/([.!?]+)/).filter(s => s.trim().length > 0);
        const processedSentences = [];

        for (let i = 0; i < sentences.length; i += 2) {
            let sentence = sentences[i];
            const punctuation = sentences[i + 1] || '.';

            if (sentence.trim().length > 0) {
                // Randomly restructure some sentences
                if (Math.random() < 0.3) {
                    sentence = this.restructureSentence(sentence);
                }

                // Add occasional interjections
                if (Math.random() < 0.15 && processedSentences.length > 0) {
                    const interjections = ['Well,', 'Actually,', 'You know,', 'I mean,', 'Honestly,', 'Look,'];
                    sentence = interjections[Math.floor(Math.random() * interjections.length)] + ' ' + sentence.toLowerCase();
                }

                processedSentences.push(sentence + punctuation);
            }
        }

        result = processedSentences.join(' ');

        // 4. Add some imperfections (typos, informal grammar)
        if (Math.random() < 0.1) {
            result = this.addMinorImperfections(result);
        }

        // 5. Vary punctuation slightly
        result = result.replace(/\.\.\./g, () => Math.random() < 0.5 ? '...' : '…');

        return result.trim();
    }

    restructureSentence(sentence) {
        const words = sentence.trim().split(/\s+/);

        // Move some adverbs to different positions
        const adverbs = ['however', 'therefore', 'meanwhile', 'consequently', 'furthermore'];
        for (let adverb of adverbs) {
            const index = words.findIndex(word => word.toLowerCase().startsWith(adverb.toLowerCase()));
            if (index === 0 && words.length > 3) {
                // Move from beginning to middle
                const removed = words.splice(index, 1)[0];
                const newPos = Math.floor(words.length / 2);
                words.splice(newPos, 0, removed.toLowerCase());
                words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
                break;
            }
        }

        return words.join(' ');
    }

    addMinorImperfections(text) {
        // Occasionally replace "and" with "&" in informal contexts
        if (Math.random() < 0.3) {
            text = text.replace(/\band\b/g, (match, offset) => {
                // Don't replace at sentence beginnings
                if (offset === 0 || text[offset - 2] === '.') return match;
                return Math.random() < 0.2 ? '&' : match;
            });
        }

        // Add occasional informal abbreviations
        const abbreviations = {
            'you': 'u',
            'your': 'ur',
            'because': 'bc',
            'between': 'b/w',
            'with': 'w/',
            'without': 'w/o'
        };

        Object.keys(abbreviations).forEach(word => {
            if (Math.random() < 0.05) { // Very rare
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                text = text.replace(regex, abbreviations[word]);
            }
        });

        return text;
    }
}

// Initialize humanizer
const textHumanizer = new TextHumanizer();

// UI functions
function analyzeText() {
    const input = document.getElementById('humanizeInput').value;
    if (!input.trim()) {
        showToast('Please enter some text to analyze', 'warning');
        return;
    }

    const analyzeBtn = document.querySelector('button[onclick="analyzeText()"]');
    const hideLoading = showLoading(analyzeBtn, 'Analyzing...');

    setTimeout(() => {
        const analysis = textHumanizer.analyzeText(input);
        displayAnalysis(analysis);
        hideLoading();
    }, 1000);
}

function displayAnalysis(analysis) {
    const resultDiv = document.getElementById('analysisResult');
    const scoreSpan = document.getElementById('aiScore');
    const scoreBar = document.getElementById('aiScoreBar');

    const score = analysis.score;
    const humanScore = 100 - score;

    scoreSpan.textContent = `${Math.round(score)}% AI / ${Math.round(humanScore)}% Human`;

    // Color code the score bar
    let barColor = '';
    if (score > 70) {
        barColor = 'bg-red-500'; // High AI likelihood
    } else if (score > 40) {
        barColor = 'bg-yellow-500'; // Moderate AI likelihood
    } else {
        barColor = 'bg-green-500'; // Low AI likelihood
    }

    scoreBar.className = `h-2 rounded-full transition-all duration-500 ${barColor}`;
    scoreBar.style.width = `${score}%`;

    resultDiv.classList.remove('hidden');

    // Add detailed analysis
    if (analysis.details) {
        const detailsHtml = `
            <div class="mt-3 text-xs space-y-1">
                <div class="flex justify-between">
                    <span>AI Phrases:</span>
                    <span>${analysis.details.aiPhrases || 0}</span>
                </div>
                <div class="flex justify-between">
                    <span>Vocabulary Diversity:</span>
                    <span>${analysis.details.vocabularyDiversity || 0}%</span>
                </div>
                <div class="flex justify-between">
                    <span>Formal Language:</span>
                    <span>${analysis.details.formalLanguage || 0}</span>
                </div>
                <div class="flex justify-between">
                    <span>Text Entropy:</span>
                    <span>${analysis.details.entropy || 0}</span>
                </div>
            </div>
        `;
        resultDiv.innerHTML += detailsHtml;
    }
}

async function humanizeText() {
    const input = document.getElementById('humanizeInput').value;
    if (!input.trim()) {
        showToast('Please enter some text to humanize', 'warning');
        return;
    }

    const humanizeBtn = document.querySelector('button[onclick="humanizeText()"]');
    const hideLoading = showLoading(humanizeBtn, 'Humanizing...');

    try {
        const humanizedText = await textHumanizer.humanizeText(input);
        document.getElementById('humanizeOutput').value = humanizedText;
        hideLoading();
        showToast('Text successfully humanized!', 'success');
    } catch (error) {
        hideLoading();
        showToast('Error humanizing text: ' + error.message, 'error');
    }
}

function copyHumanizedText() {
    const output = document.getElementById('humanizeOutput');
    if (!output.value.trim()) {
        showToast('No humanized text to copy', 'warning');
        return;
    }

    navigator.clipboard.writeText(output.value).then(() => {
        showToast('Humanized text copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        output.select();
        document.execCommand('copy');
        showToast('Humanized text copied to clipboard!', 'success');
    });
}

// Export functions
window.analyzeText = analyzeText;
window.humanizeText = humanizeText;
window.copyHumanizedText = copyHumanizedText;