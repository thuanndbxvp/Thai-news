
// Literal types from constants
export type Tone = 'Friendly_PiNong' | 'Professional_Neutral' | 'Analytical' | 'Cautious_Diplomatic';
export type Style = 'News_Report' | 'Deep_Dive' | 'Weekly_Summary';
export type Voice = 'Male_Krub' | 'Female_Ka';
export type ScriptType = 'Video' | 'Podcast';
export type NumberOfSpeakers = 'Auto' | '2' | '3';
export type AiProvider = 'gemini' | 'openai';
export type AudienceAge = 'GenZ' | 'Millennials' | '30Plus';
export type ContentFocus = 'General_News' | 'Politics_Policy' | 'Border_Conflict';

// Options interfaces
export interface StyleOptions {
  tone: Tone;
  style: Style;
  voice: Voice;
}

export interface FormattingOptions {
  headings: boolean;
  bullets: boolean;
  bold: boolean;
  includeIntro: boolean;
  includeOutro: boolean;
}

// Data structures

export interface TopicSuggestionItem {
    title: string;
    vietnameseTitle?: string;
    outline: string;
}

export interface SavedIdea {
  id: number;
  title: string;
  vietnameseTitle?: string;
  outline: string;
}

export interface CachedData {
  visualPrompts: Record<string, VisualPrompt>;
  allVisualPrompts: AllVisualPromptsResult[] | null;
  summarizedScript: ScriptPartSummary[] | null;
  extractedDialogue: Record<string, string> | null;
  hasExtractedDialogue: boolean;
  hasGeneratedAllVisualPrompts: boolean;
  hasSummarizedScript: boolean;
}

export interface LibraryItem {
  id: number;
  title: string;
  outlineContent: string;
  script: string;
  cachedData?: CachedData;
}

export interface GenerationParams {
  title: string;
  outlineContent: string;
  targetAudience: string; // Always 'Thai'
  styleOptions: StyleOptions;
  keywords: string;
  formattingOptions: FormattingOptions;
  wordCount: string;
  scriptParts: string;
  scriptType: ScriptType;
  numberOfSpeakers: NumberOfSpeakers;
  // New News-specific params
  audienceAge: AudienceAge;
  contentFocus: ContentFocus;
}

export interface VisualPrompt {
    english: string;
    vietnamese: string;
}

export interface AllVisualPromptsResult {
    scene: string;
    english: string;
    vietnamese: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface SceneSummary {
  sceneNumber: number;
  summary: string;
  visualPrompt: string;
}

export interface ScriptPartSummary {
  partTitle: string;
  scenes: SceneSummary[];
}

export interface WordCountStats {
  sections: { title: string; count: number }[];
  total: number;
}
