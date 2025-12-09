
import { GoogleGenAI, Type } from "@google/genai";
import type { GenerationParams, VisualPrompt, AllVisualPromptsResult, ScriptPartSummary, StyleOptions, TopicSuggestionItem, AiProvider } from '../types';
import { TONE_OPTIONS, STYLE_OPTIONS, VOICE_OPTIONS } from '../constants';

// Helper function to handle API errors and provide more specific messages
const handleApiError = (error: unknown, context: string): Error => {
    console.error(`Lỗi trong lúc ${context}:`, error);

    if (!(error instanceof Error)) {
        return new Error(`Không thể ${context}. Đã xảy ra lỗi không xác định.`);
    }

    const errorMessage = error.message;
    const lowerCaseErrorMessage = errorMessage.toLowerCase();

    // Check for common network or client-side errors first
    if (lowerCaseErrorMessage.includes('failed to fetch')) {
        return new Error('Lỗi mạng. Vui lòng kiểm tra kết nối internet của bạn và thử lại.');
    }
    if (lowerCaseErrorMessage.includes('failed to execute') && lowerCaseErrorMessage.includes('on \'headers\'')) {
        return new Error('Lỗi yêu cầu mạng: API key có thể chứa ký tự không hợp lệ. Vui lòng đảm bảo API key của bạn không chứa ký tự đặc biệt hoặc khoảng trắng bị sao chép nhầm.');
    }

    // Gemini-specific error parsing
    try {
        const jsonStartIndex = errorMessage.indexOf('{');
        if (jsonStartIndex > -1) {
            const jsonString = errorMessage.substring(jsonStartIndex);
            const errorObj = JSON.parse(jsonString);
            if (errorObj.error) {
                const apiError = errorObj.error;
                if (apiError.code === 429 || apiError.status === 'RESOURCE_EXHAUSTED') {
                    return new Error('Bạn đã vượt quá giới hạn yêu cầu (Quota) của Gemini. Vui lòng đợi và thử lại, hoặc kiểm tra gói cước của bạn.');
                }
                if ((apiError.status === 'INVALID_ARGUMENT' && apiError.message.toLowerCase().includes('api key not valid')) || lowerCaseErrorMessage.includes('api_key_invalid')) {
                    return new Error('API Key Gemini không hợp lệ hoặc đã bị thu hồi. Vui lòng kiểm tra lại.');
                }
                return new Error(`Lỗi từ Gemini: ${apiError.message || JSON.stringify(apiError)}`);
            }
        }
    } catch (e) { /* Fall through */ }
    
    // OpenAI-specific error parsing
    try {
         const errorObj = JSON.parse(errorMessage);
         if(errorObj.error) {
             const apiError = errorObj.error;
             if (apiError.code === 'invalid_api_key') {
                return new Error('API Key OpenAI không hợp lệ hoặc đã bị thu hồi. Vui lòng kiểm tra lại.');
             }
             if (apiError.code === 'insufficient_quota') {
                return new Error('Tài khoản OpenAI của bạn đã hết tín dụng. Vui lòng kiểm tra thanh toán của bạn.');
             }
             return new Error(`Lỗi từ OpenAI: ${apiError.message || 'Lỗi không xác định.'}`);
         }
    } catch (e) { /* Fall through */ }

    // General patterns
    if (lowerCaseErrorMessage.includes('api key not valid')) {
        return new Error('API Key không hợp lệ hoặc đã bị thu hồi. Vui lòng kiểm tra lại.');
    }
    if (lowerCaseErrorMessage.includes('safety')) {
        return new Error('Yêu cầu của bạn đã bị chặn vì lý do an toàn. Vui lòng điều chỉnh chủ đề hoặc từ khóa.');
    }

    // Generic fallback
    return new Error(`Không thể ${context}. Chi tiết: ${errorMessage}`);
};


const getApiKey = (provider: AiProvider): string => {
    const keysJson = localStorage.getItem('ai-api-keys');
    if (!keysJson) {
        throw new Error("Không tìm thấy API Key. Vui lòng thêm API Key bằng nút 'API'.");
    }
    try {
        const keys: Record<AiProvider, string[]> = JSON.parse(keysJson);
        const providerKeys = keys[provider];
        if (!Array.isArray(providerKeys) || providerKeys.length === 0) {
            throw new Error(`Không tìm thấy API Key cho ${provider}. Vui lòng thêm key.`);
        }
        return providerKeys[0]; // Use the first key
    } catch (e) {
        console.error("Lỗi lấy API key:", e);
        throw new Error("Không thể đọc API Key. Dữ liệu có thể bị hỏng.");
    }
}

export const validateApiKey = async (apiKey: string, provider: AiProvider): Promise<boolean> => {
    if (!apiKey) throw new Error("API Key không được để trống.");
    try {
        if (provider === 'gemini') {
            const ai = new GoogleGenAI({ apiKey });
            await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'test' });
        } else if (provider === 'openai') {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }
        }
        return true;
    } catch (error) {
        console.error(`Lỗi trong lúc xác thực API key ${provider}:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.toLowerCase().includes('resource_exhausted') || errorMessage.toLowerCase().includes('429')) {
             console.log("Validation succeeded despite rate limit. The key is considered valid.");
             return true; 
        }
        throw handleApiError(error, `xác thực API key ${provider}`);
    }
};

const callApi = async (prompt: string, provider: AiProvider, model: string, jsonResponse = false): Promise<string> => {
    try {
        const apiKey = getApiKey(provider);
        if (provider === 'gemini') {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
                ...(jsonResponse && { config: { responseMimeType: "application/json" } })
            });
            return response.text;
        } else { // openai
            const body: any = {
                model: model,
                messages: [{ role: 'system', content: prompt }],
                max_tokens: 4096,
            };
            if (jsonResponse) {
                body.response_format = { type: 'json_object' };
            }
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(JSON.stringify(data));
            }
            return data.choices[0].message.content;
        }
    } catch (error) {
        // This re-throws the error to be caught by the specific function's catch block
        throw error;
    }
}

// --- THAI CULTURAL GUARDRAILS ---
const getThaiCulturalPrompts = (language: string): string => {
    // These guardrails apply to all Thai content generation
    return `
    **CRITICAL THAI CULTURAL, SAFETY & LEGAL GUARDRAILS (STRICT COMPLIANCE REQUIRED):**
    
    1. **Language & Tone:** 
       - Use Standard Bangkok Thai (ภาษากลาง).
       - Adopt a warm, friendly "P' (older sibling) talking to Nong (younger sibling)" tone (พี่-น้อง) when the tone setting allows, but maintain professionalism.
       - **Politeness:** You MUST use polite particles (ค่ะ/ครับ/นะคะ/นะครับ) frequently and appropriately based on the speaker's gender context.
       - **Indirectness:** Use soft requests (e.g., "ขอ...", "ลอง...", "อยากชวนให้...") instead of direct commands.

    2. **Respect & Institutions (Zero Tolerance):**
       - Show absolute respect for Buddhism, Monks, Temples, and the Royal Family.
       - **STRICT PROHIBITION:** DO NOT criticize, mock, joke about, or speak negatively about the Royal Family, Religion, or National Symbols.
       - Strictly adhere to Thai media laws (specifically Lèse-majesté).

    3. **Cultural Etiquette (Kreng Jai):** 
       - Apply the concept of 'Kreng Jai' (consideration for others). 
       - Avoid harsh criticism, aggressive judgment, or confrontational language. Be polite and considerate in all arguments.

    4. **Sensitive Topics (Politics, Protests, Border Conflicts):** 
       - If the topic touches on politics, protests, or laws, you must maintain a strictly **NEUTRAL, INFORMATIVE, and FACTUAL** tone.
       - Do not use inciting language. Do not take sides.
       - **Border Conflict (Thailand-Cambodia):**
         - Report verified info only. 
         - **NEVER** incite hatred between Thais and Cambodians. 
         - Distinctly separate "government/army policies" from "the people". Do not use derogatory terms (e.g., "enemy", "those people"). Use neutral terms like "border tensions" (ความตึงเครียด), "clashes" (เหตุปะทะ).

    5. **Accuracy & Integrity:** 
       - Base content on mainstream, verified Thai news sources. Avoid rumors or fake news.
       - **Attribution:** When discussing content from other sources (clips, images, news), clearly state it is a reference/summary. Do not plagiarize or copy verbatim. Use phrases like "อ้างอิงจาก..." (Referencing from...) or "สรุปประเด็นจาก..." (Summarizing points from...).
    `;
};

export const generateScript = async (params: GenerationParams, provider: AiProvider, model: string): Promise<string> => {
    const { title, outlineContent, targetAudience, styleOptions, keywords, formattingOptions, wordCount, scriptType, numberOfSpeakers, audienceAge, contentFocus } = params;
    const { tone, style, voice } = styleOptions;
    const { includeIntro, includeOutro } = formattingOptions;

    // Force language to Thai
    const language = 'Thai'; 
    const thaiGuardrails = getThaiCulturalPrompts(language);
    let prompt: string;

    const outlineInstruction = outlineContent.trim() 
        ? `**User's Specific News Details / Outline:** "${outlineContent}". Use this as the core information for the news report.`
        : `**User's Specific News Details:** No specific details provided. Please construct a realistic news report based on the title "${title}" using typical current event structures.`;

    // Common News Persona
    const roleDefinition = `
    You are a professional Thai News Anchor and Editor for a YouTube channel targeting ${audienceAge} audiences.
    Your Persona:
    - **Tone:** ${tone}. Use polite particles (${voice === 'Male_Krub' ? 'ครับ/ผม' : 'ค่ะ/ดิฉัน/หนู'}) consistently.
    - **Style:** ${style}.
    - **Focus:** ${contentFocus.replace('_', ' ')}.
    - **Language:** Standard Bangkok Thai (ภาษากลาง).
    `;

    if (scriptType === 'Podcast') {
        const speakersInstruction = numberOfSpeakers === 'Auto'
            ? 'Automatically determine the best number of speakers (2 or 3) for this news discussion.'
            : `Create a conversation for exactly ${numberOfSpeakers} speakers.`;

        prompt = `
            ${roleDefinition}
            ${thaiGuardrails}

            **Task:** Create a News Podcast Script in Thai.
            **Title:** "${title}"
            ${outlineInstruction}
            **Target Length:** Approximately ${wordCount} words.

            **Structure:**
            1. **Intro:** Warm greeting, introduce the hosts (assign Thai nicknames like P'A, Nong B), and the main topic.
            2. **Main Discussion:** Discuss the news topic in depth.
               - If discussing politics/border issues, keep it balanced.
               - Share opinions but always respect differing views.
            3. **Outro:** Summary and soft Call to Action (subscribe, comment respectfully).

            **Constraints:**
            - Use sound cues [Sound Effect].
            - Keep it natural and conversational ("Pi-Nong" style).
            - Strictly follow the Thai Cultural Guardrails.
            
            Please generate the full podcast script now.
        `;
    } else { // Video News Script (Default)
        prompt = `
            ${roleDefinition}
            ${thaiGuardrails}

            **Task:** Create a Daily News Video Script in Thai.
            **Title:** "${title}"
            ${outlineInstruction}
            **Target Length:** Approximately ${wordCount} words.
            **Keywords to Include:** ${keywords || 'None'}

            **REQUIRED SCRIPT STRUCTURE (Do not deviate):**

            1. **INTRO (30-60s)** ${includeIntro ? '' : '(Skip if user disabled)'}
               - Greeting (Sawasdee).
               - State the "vibe" of the day and the headline news.
               - Emphasize neutrality and verified info.
            
            2. **SEGMENT A: MAIN NEWS (Domestic/Politics/Society)**
               - Context: Who, When, Where.
               - What happened (The decision/event).
               - Viewpoints from relevant parties (Govt, Opposition, Experts).
               - Impact on the people (Taxes, rights, daily life).
               - *Note: Use neutral phrases like "Some sides view that...", "Another perspective is...".*

            3. **SEGMENT B: BORDER/RELATIONS (Thai-Cambodia)** 
               - *Only include if the topic implies border issues or if content focus is Border_Conflict. Otherwise, replace with International or Economic news.*
               - Context of relations.
               - Specific event (clash, negotiation, statement).
               - **CRITICAL:** Distinguish between "Govt/Army Policy" and "The People". Do not incite hatred.
               - Ending: Hope for diplomatic solution.

            4. **SEGMENT C: OTHER IMPORTANT NEWS**
               - Social, Economic, or Safety news affecting daily life.
               - Keep it concise: What - Where - Impact.

            5. **OUTRO (1 min)** ${includeOutro ? '' : '(Skip if user disabled)'}
               - Summarize 1-2 key points.
               - Remind viewers to comment respectfully (Soft CTA).
               - Closing greeting.

            **Output Format:**
            Use Markdown headers (##) for each section.
            For each part, provide:
            - **Timestamp Estimate**
            - **Visual/Camera Cues:** (e.g., [Show map of border], [Cut to B-roll of parliament])
            - **Script (Lời thoại):** The spoken Thai text.

            **Self-Correction Checklist (Internal Monologue - Do not output):**
            - Is the tone polite (Pi-Nong)?
            - Is it neutral on politics?
            - Did I avoid insulting the Royal Family or Religion?
            - Did I avoid inciting hatred against neighbors (Cambodia)?
            - Is the word count close to target?

            Generate the full script now.
        `;
    }

    try {
        return await callApi(prompt, provider, model);
    } catch (error) {
        throw handleApiError(error, 'tạo kịch bản');
    }
};

export const generateScriptOutline = async (params: GenerationParams, provider: AiProvider, model: string): Promise<string> => {
    const { title, outlineContent, targetAudience, wordCount } = params;
    const language = 'Thai';
    const thaiGuardrails = getThaiCulturalPrompts(language);

    const prompt = `
        You are a Thai News Editor.
        Task: Generate a detailed news rundown/outline for a video.
        **Video Title:** "${title}"
        **User Notes:** "${outlineContent || 'None'}"
        **Language:** ${language}
        
        ${thaiGuardrails}

        **Instructions:**
        - Create a rundown following the Intro -> Segment A -> Segment B -> Segment C -> Outro structure.
        - Highlight key talking points for each segment.
        - Ensure the flow is logical for a news broadcast.
        - Output in Thai.
    `;

    try {
        const outline = await callApi(prompt, provider, model);
        const userGuide = `### Dàn Ý Chi Tiết Tin Tức\n\n**Gợi ý:** Đây là khung chương trình tin tức của bạn. Bạn có thể sử dụng nút "Tạo kịch bản đầy đủ" để viết chi tiết.\n\n---\n\n`;
        return userGuide + outline;
    } catch (error) {
        throw handleApiError(error, 'tạo dàn ý');
    }
};

export const generateTopicSuggestions = async (theme: string, provider: AiProvider, model: string): Promise<TopicSuggestionItem[]> => {
    // Default to Thai news suggestions
    const prompt = `Based on the theme "${theme || 'Latest Thai News'}", generate exactly 5 specific, engaging, and verified-style news headlines in **Thai**. 
    Focus on: Politics, Social Issues, or Thai-Cambodia Relations (if relevant).
    
    Each idea must include:
    - 'title': A catchy but accurate news headline in Thai.
    - 'outline': A 2-3 sentence summary of the news story in Thai.
    
    Output JSON: {"suggestions": [{"title": "...", "outline": "..."}, ...]}
    `;

    try {
        const responseText = await callApi(prompt, provider, model, true);
        const jsonResponse = JSON.parse(responseText);
        const suggestions: TopicSuggestionItem[] = jsonResponse.suggestions;
        return suggestions;
    } catch (error) {
        throw handleApiError(error, 'tạo gợi ý chủ đề');
    }
};

export const parseIdeasFromFile = async (fileContent: string, provider: AiProvider, model: string): Promise<TopicSuggestionItem[]> => {
    if (!fileContent.trim()) return [];
    const prompt = `
        You are a data extraction assistant. Parse the text for news ideas.
        Input: """${fileContent}"""
        Extract 'title' (Thai), 'vietnameseTitle' (Thai), and 'outline' (Thai).
        Output JSON array.
    `;
    
    try {
        const responseText = await callApi(prompt, provider, model, true);
        const jsonResponse = JSON.parse(responseText);
        if (Array.isArray(jsonResponse)) {
            return jsonResponse as TopicSuggestionItem[];
        }
        throw new Error("AI returned data in an unexpected format.");

    } catch (error) {
        throw handleApiError(error, 'phân tích tệp ý tưởng');
    }
};

export const generateKeywordSuggestions = async (title: string, outlineContent: string, provider: AiProvider, model: string): Promise<string[]> => {
    if (!title.trim()) return [];
    const prompt = `Based on news title "${title}", generate 5 SEO keywords in **Thai**.
    Output JSON: {"keywords": ["...", ...]}
    `;

    try {
        const responseText = await callApi(prompt, provider, model, true);
        const jsonResponse = JSON.parse(responseText);
        return jsonResponse.keywords;
    } catch (error) {
        throw handleApiError(error, 'tạo gợi ý từ khóa');
    }
};

export const reviseScript = async (originalScript: string, revisionInstruction: string, params: GenerationParams, provider: AiProvider, model: string): Promise<string> => {
    const { styleOptions, wordCount } = params;
    const { tone, style, voice } = styleOptions;
    const language = 'Thai';
    const thaiGuardrails = getThaiCulturalPrompts(language);

    const prompt = `
      You are a Thai News Editor. Revise this script.
      
      **Original Script:**
      """${originalScript}"""
      
      **Revision Request:** "${revisionInstruction}"
      
      **Guardrails:** ${thaiGuardrails}
      
      **Requirements:**
      - Maintain strict Thai News persona (${tone}, ${style}, ${voice}).
      - Keep word count close to ${wordCount}.
      - Output full revised script in Thai.
    `;

    try {
        return await callApi(prompt, provider, model);
    } catch (error) {
        throw handleApiError(error, 'sửa kịch bản');
    }
};

export const generateScriptPart = async (fullOutline: string, previousPartsScript: string, currentPartOutline: string, params: Omit<GenerationParams, 'title' | 'outlineContent'>, provider: AiProvider, model: string): Promise<string> => {
    const { styleOptions, wordCount } = params;
    const { tone, style, voice } = styleOptions;
    const language = 'Thai';
    const thaiGuardrails = getThaiCulturalPrompts(language);
    
    const prompt = `
      You are a Thai News Anchor writing the next segment of the news.
      
      **Context (Outline):** """${fullOutline}"""
      **Previous Part:** """${previousPartsScript}"""
      **Current Task:** Write script for: """${currentPartOutline}"""
      
      **Guardrails:** ${thaiGuardrails}
      
      **Instructions:**
      - Write only this segment.
      - Maintain polite ${tone} tone.
      - Ensure smooth transition from previous part.
      - Output in Thai.
    `;
    
    try {
        return await callApi(prompt, provider, model);
    } catch (error) {
        throw handleApiError(error, 'tạo phần kịch bản tiếp theo');
    }
};

export const extractDialogue = async (script: string, language: string, provider: AiProvider, model: string): Promise<Record<string, string>> => {
    const prompt = `
      Extract ONLY the spoken Thai dialogue/narration from this script.
      Ignore visual cues, headers, and timestamps.
      Script: """${script}"""
      Output JSON object: {"Section Title": "Spoken Text", ...}
    `;

    try {
        const responseText = await callApi(prompt, provider, model, true);
        return JSON.parse(responseText);
    } catch (error) {
        throw handleApiError(error, 'tách lời thoại');
    }
};

export const generateVisualPrompt = async (sceneDescription: string, provider: AiProvider, model: string): Promise<VisualPrompt> => {
    const prompt = `
        Create an AI video generation prompt (English) for this news scene.
        Also provide Thai translation.
        Scene: """${sceneDescription}"""
        Output JSON: {"english": "...", "vietnamese": "..."} (Use 'vietnamese' key for Thai translation for compatibility)
    `;

    try {
        const responseText = await callApi(prompt, provider, model, true);
        return JSON.parse(responseText);
    } catch (error) {
        throw handleApiError(error, 'tạo prompt hình ảnh');
    }
};

export const generateAllVisualPrompts = async (script: string, provider: AiProvider, model: string): Promise<AllVisualPromptsResult[]> => {
    const prompt = `
        Generate AI video prompts for each section of this news script.
        Script: """${script}"""
        Output JSON array of objects with keys: scene, english, vietnamese (Thai).
    `;

    try {
        const responseText = await callApi(prompt, provider, model, true);
        return JSON.parse(responseText);
    } catch (error) {
        throw handleApiError(error, 'tạo tất cả prompt hình ảnh');
    }
};

export const summarizeScriptForScenes = async (script: string, provider: AiProvider, model: string): Promise<ScriptPartSummary[]> => {
    const prompt = `
        Break down this news script into 8-second scenes.
        Script: """${script}"""
        Output JSON array with parts and scenes (summary in Thai, visualPrompt in English).
    `;

    try {
        const responseText = await callApi(prompt, provider, model, true);
        return JSON.parse(responseText);
    } catch (error) {
        throw handleApiError(error, 'tóm tắt kịch bản ra các cảnh');
    }
};

export const suggestStyleOptions = async (title: string, outlineContent: string, provider: AiProvider, model: string): Promise<StyleOptions> => {
     // Mock return or simple logic since specific styles are less relevant for fixed news format, 
     // but we keep it for compatibility if user clicks 'Suggest'.
     return {
         tone: 'Professional_Neutral',
         style: 'News_Report',
         voice: 'Female_Ka'
     };
};
