
import type { Tone, Style, Voice, ScriptType, NumberOfSpeakers, AiProvider, AudienceAge, ContentFocus } from './types';

interface LabeledOption<T> {
  value: T;
  label: string;
}

export const AI_PROVIDER_OPTIONS: LabeledOption<AiProvider>[] = [
    { value: 'gemini', label: 'Google Gemini' },
    { value: 'openai', label: 'OpenAI' },
];

export const GEMINI_MODELS: LabeledOption<string>[] = [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Khuyên dùng)' },
    { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (New)' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
];

export const OPENAI_MODELS: LabeledOption<string>[] = [
    { value: 'gpt-5', label: 'GPT-5' },
    { value: 'gpt-5-turbo', label: 'GPT-5 Turbo' },
    { value: 'gpt-4o', label: 'GPT-4o' },
];


export const SCRIPT_TYPE_OPTIONS: LabeledOption<ScriptType>[] = [
    { value: 'Video', label: 'Bản tin Video' },
    { value: 'Podcast', label: 'Podcast Tin tức' },
];

export const NUMBER_OF_SPEAKERS_OPTIONS: LabeledOption<NumberOfSpeakers>[] = [
  { value: 'Auto', label: 'Tự động' },
  { value: '2', label: '2 người' },
  { value: '3', label: '3 người' },
];

// Updated Options for Thai News Editor Persona

export const TONE_OPTIONS: LabeledOption<Tone>[] = [
  { value: 'Friendly_PiNong', label: 'Thân thiện (Pi-Nong)' },
  { value: 'Professional_Neutral', label: 'Chuyên nghiệp & Trung lập' },
  { value: 'Analytical', label: 'Phân tích sâu' },
  { value: 'Cautious_Diplomatic', label: 'Thận trọng & Ngoại giao' },
];

export const STYLE_OPTIONS: LabeledOption<Style>[] = [
  { value: 'News_Report', label: 'Bản tin hàng ngày' },
  { value: 'Deep_Dive', label: 'Phân tích chuyên sâu' },
  { value: 'Weekly_Summary', label: 'Tổng hợp tuần' },
];

export const VOICE_OPTIONS: LabeledOption<Voice>[] = [
  { value: 'Male_Krub', label: 'Nam (Dùng Krub/Phom)' },
  { value: 'Female_Ka', label: 'Nữ (Dùng Ka/Dichan/Nu)' },
];

export const AUDIENCE_AGE_OPTIONS: LabeledOption<AudienceAge>[] = [
    { value: 'GenZ', label: 'Gen Z (18-25)' },
    { value: 'Millennials', label: 'Millennials (26-40)' },
    { value: '30Plus', label: 'Trưởng thành (30+)' },
];

export const CONTENT_FOCUS_OPTIONS: LabeledOption<ContentFocus>[] = [
    { value: 'General_News', label: 'Thời sự & Xã hội' },
    { value: 'Politics_Policy', label: 'Chính trị & Chính sách' },
    { value: 'Border_Conflict', label: 'Quan hệ Thái - Cam' },
];

export const LANGUAGE_OPTIONS: { value: string, label: string }[] = [
    { value: 'Thai', label: 'Tiếng Thái (Thai)' },
];
