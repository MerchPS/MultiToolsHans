// Vercel Serverless Function for text humanization with external API
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text is required' });
        }

        if (text.length > 5000) {
            return res.status(400).json({ error: 'Text too long (max 5000 characters)' });
        }

        let humanizedText = text;

        // Try different API options for text humanization

        // Option 1: OpenAI API (if available)
        if (process.env.OPENAI_API_KEY) {
            try {
                const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a text humanizer. Take the given text and make it sound more natural, conversational, and human-like while preserving all the important information. Add personality, vary sentence structure, use contractions, and make it sound like something a real person would write. Do not add any introductory phrases or explanations - just return the humanized version of the text.'
                            },
                            {
                                role: 'user',
                                content: text
                            }
                        ],
                        max_tokens: Math.min(Math.ceil(text.length * 1.5), 2000),
                        temperature: 0.8
                    })
                });

                if (openaiResponse.ok) {
                    const openaiData = await openaiResponse.json();
                    if (openaiData.choices && openaiData.choices[0]) {
                        humanizedText = openaiData.choices[0].message.content.trim();

                        return res.status(200).json({
                            success: true,
                            humanizedText: humanizedText,
                            method: 'openai',
                            originalLength: text.length,
                            humanizedLength: humanizedText.length
                        });
                    }
                }
            } catch (error) {
                console.log('OpenAI API failed, trying fallback methods');
            }
        }

        // Option 2: Hugging Face API (if available)
        if (process.env.HUGGINGFACE_API_KEY) {
            try {
                const hfResponse = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        inputs: `Rewrite this text to sound more natural and human-like: "${text}"`
                    })
                });

                if (hfResponse.ok) {
                    const hfData = await hfResponse.json();
                    if (hfData && hfData[0] && hfData[0].summary_text) {
                        humanizedText = hfData[0].summary_text;

                        return res.status(200).json({
                            success: true,
                            humanizedText: humanizedText,
                            method: 'huggingface',
                            originalLength: text.length,
                            humanizedLength: humanizedText.length
                        });
                    }
                }
            } catch (error) {
                console.log('Hugging Face API failed, using fallback');
            }
        }

        // Option 3: Advanced local humanization
        humanizedText = await advancedLocalHumanization(text);

        return res.status(200).json({
            success: true,
            humanizedText: humanizedText,
            method: 'advanced_local',
            originalLength: text.length,
            humanizedLength: humanizedText.length
        });

    } catch (error) {
        console.error('Humanization error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}

// Advanced local humanization function
async function advancedLocalHumanization(text) {
    // Comprehensive replacement maps
    const formalToInformal = {
        // Formal phrases to casual alternatives
        'furthermore': ['also', 'plus', 'and', 'on top of that', 'what\'s more'],
        'moreover': ['also', 'besides', 'plus', 'and'],
        'consequently': ['so', 'that\'s why', 'as a result', 'because of this'],
        'therefore': ['so', 'that\'s why', 'thus'],
        'nevertheless': ['but', 'however', 'still', 'even so'],
        'nonetheless': ['still', 'but', 'even so', 'however'],
        'in order to': ['to', 'so we can', 'to help'],
        'with regard to': ['about', 'concerning', 'regarding'],
        'in conclusion': ['to wrap up', 'finally', 'in the end', 'so'],
        'in summary': ['to sum up', 'basically', 'in short'],
        'it is important to note': ['note that', 'remember', 'keep in mind'],
        'it should be emphasized': ['it\'s important that', 'remember'],
        'utilize': ['use', 'employ', 'work with'],
        'demonstrate': ['show', 'prove', 'make clear'],
        'facilitate': ['help', 'make easier', 'enable'],
        'implement': ['put in place', 'set up', 'create'],
        'acquire': ['get', 'obtain', 'pick up'],
        'purchase': ['buy', 'get', 'pick up'],
        'endeavor': ['try', 'attempt', 'work'],
        'commence': ['start', 'begin'],
        'terminate': ['end', 'stop', 'finish'],
        'substantial': ['big', 'large', 'significant'],
        'comprehensive': ['complete', 'full', 'thorough'],
        'numerous': ['many', 'lots of', 'plenty of'],
        'approximately': ['about', 'around', 'roughly'],
        'subsequently': ['later', 'after that', 'then'],
        'prior to': ['before', 'ahead of'],
        'subsequent to': ['after', 'following']
    };

    // Add contractions
    const contractions = {
        'do not': 'don\'t',
        'does not': 'doesn\'t',
        'did not': 'didn\'t',
        'will not': 'won\'t',
        'would not': 'wouldn\'t',
        'should not': 'shouldn\'t',
        'could not': 'couldn\'t',
        'cannot': 'can\'t',
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
        'here is': 'here\'s',
        'what is': 'what\'s',
        'where is': 'where\'s',
        'when is': 'when\'s',
        'how is': 'how\'s',
        'who is': 'who\'s',
        'I am': 'I\'m',
        'you are': 'you\'re',
        'we are': 'we\'re',
        'they are': 'they\'re',
        'I have': 'I\'ve',
        'you have': 'you\'ve',
        'we have': 'we\'ve',
        'they have': 'they\'ve',
        'I would': 'I\'d',
        'you would': 'you\'d',
        'we would': 'we\'d',
        'they would': 'they\'d',
        'I will': 'I\'ll',
        'you will': 'you\'ll',
        'we will': 'we\'ll',
        'they will': 'they\'ll'
    };

    let result = text;

    // 1. Replace formal words/phrases with informal alternatives
    Object.keys(formalToInformal).forEach(formal => {
        const replacements = formalToInformal[formal];
        const regex = new RegExp(`\\b${formal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        result = result.replace(regex, () => {
            return replacements[Math.floor(Math.random() * replacements.length)];
        });
    });

    // 2. Add contractions
    Object.keys(contractions).forEach(formal => {
        const informal = contractions[formal];
        const regex = new RegExp(`\\b${formal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        result = result.replace(regex, informal);
    });

    // 3. Add conversational elements
    const sentences = result.split(/([.!?]+)/).filter(s => s.trim().length > 0);
    const processedSentences = [];

    for (let i = 0; i < sentences.length; i += 2) {
        let sentence = sentences[i];
        const punctuation = sentences[i + 1] || '.';

        if (sentence.trim().length > 0) {
            // Occasionally add conversational starters
            if (Math.random() < 0.15 && processedSentences.length > 0) {
                const starters = ['Actually,', 'By the way,', 'You know,', 'Honestly,', 'Look,', 'Well,', 'I mean,'];
                sentence = starters[Math.floor(Math.random() * starters.length)] + ' ' + sentence.toLowerCase();
            }

            // Vary sentence structure occasionally
            if (Math.random() < 0.2) {
                sentence = varySentenceStructure(sentence);
            }

            processedSentences.push(sentence + punctuation);
        }
    }

    result = processedSentences.join(' ');

    // 4. Add personality touches
    result = addPersonalityTouches(result);

    // 5. Fix capitalization and spacing
    result = result.replace(/\s+/g, ' ').trim();
    result = result.charAt(0).toUpperCase() + result.slice(1);

    return result;
}

function varySentenceStructure(sentence) {
    const words = sentence.trim().split(/\s+/);

    // Move adverbs occasionally
    const adverbs = ['however', 'therefore', 'meanwhile', 'consequently', 'furthermore', 'additionally'];
    for (let adverb of adverbs) {
        const index = words.findIndex(word => word.toLowerCase().startsWith(adverb.toLowerCase()));
        if (index === 0 && words.length > 4) {
            const removed = words.splice(index, 1)[0];
            const newPos = Math.floor(words.length / 2);
            words.splice(newPos, 0, removed.toLowerCase());
            words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
            break;
        }
    }

    return words.join(' ');
}

function addPersonalityTouches(text) {
    // Add occasional emphasis
    text = text.replace(/\bvery important\b/gi, 'super important');
    text = text.replace(/\bextremely\b/gi, (match, offset) => {
        return Math.random() < 0.3 ? 'really' : match;
    });

    // Add casual connectors
    text = text.replace(/\. ([A-Z])/g, (match, letter) => {
        if (Math.random() < 0.1) {
            return '. And ' + letter.toLowerCase();
        }
        return match;
    });

    // Occasionally use "like" or "kind of"
    if (Math.random() < 0.1) {
        text = text.replace(/\bis\s+([a-z]+)/g, 'is like $1');
    }

    return text;
}