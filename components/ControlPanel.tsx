
import React from 'react';
import { OptionSelector } from './OptionSelector';
import { SparklesIcon } from './icons/SparklesIcon';
import type { StyleOptions, FormattingOptions, Tone, Style, Voice, ScriptType, NumberOfSpeakers, TopicSuggestionItem, SavedIdea, AiProvider, AudienceAge, ContentFocus } from '../types';
import { TONE_OPTIONS, STYLE_OPTIONS, VOICE_OPTIONS, SCRIPT_TYPE_OPTIONS, NUMBER_OF_SPEAKERS_OPTIONS, AI_PROVIDER_OPTIONS, GEMINI_MODELS, OPENAI_MODELS, AUDIENCE_AGE_OPTIONS, CONTENT_FOCUS_OPTIONS } from '../constants';
import { TONE_EXPLANATIONS, STYLE_EXPLANATIONS, VOICE_EXPLANATIONS } from '../constants/explanations';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { GlobeIcon } from './icons/GlobeIcon';

interface ControlPanelProps {
  title: string;
  setTitle: (title: string) => void;
  outlineContent: string;
  setOutlineContent: (content: string) => void;
  referenceUrls: string;
  setReferenceUrls: (urls: string) => void;
  onGenerateSuggestions: () => void;
  isSuggesting: boolean;
  suggestions: TopicSuggestionItem[];
  suggestionError: string | null;
  hasGeneratedTopicSuggestions: boolean;
  targetAudience: string;
  setTargetAudience: (audience: string) => void;
  styleOptions: StyleOptions;
  setStyleOptions: (options: StyleOptions) => void;
  keywords: string;
  setKeywords: (keywords: string) => void;
  formattingOptions: FormattingOptions;
  setFormattingOptions: (options: FormattingOptions) => void;
  wordCount: string;
  setWordCount: (count: string) => void;
  scriptParts: string;
  setScriptParts: (parts: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onGenerateKeywordSuggestions: () => void;
  isSuggestingKeywords: boolean;
  keywordSuggestions: string[];
  keywordSuggestionError: string | null;
  hasGeneratedKeywordSuggestions: boolean;
  scriptType: ScriptType;
  setScriptType: (type: ScriptType) => void;
  numberOfSpeakers: NumberOfSpeakers;
  setNumberOfSpeakers: (num: NumberOfSpeakers) => void;
  onSuggestStyle: () => void;
  isSuggestingStyle: boolean;
  styleSuggestionError: string | null;
  hasSuggestedStyle: boolean;
  lengthType: 'words' | 'duration';
  setLengthType: (type: 'words' | 'duration') => void;
  videoDuration: string;
  setVideoDuration: (duration: string) => void;
  savedIdeas: SavedIdea[];
  onSaveIdea: (idea: TopicSuggestionItem) => void;
  onOpenSavedIdeasModal: () => void;
  aiProvider: AiProvider;
  setAiProvider: (provider: AiProvider) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  audienceAge: AudienceAge;
  setAudienceAge: (age: AudienceAge) => void;
  contentFocus: ContentFocus;
  setContentFocus: (focus: ContentFocus) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  title, setTitle,
  outlineContent, setOutlineContent,
  referenceUrls, setReferenceUrls,
  onGenerateSuggestions, isSuggesting, suggestions, suggestionError,
  styleOptions, setStyleOptions,
  keywords, setKeywords,
  formattingOptions, setFormattingOptions,
  onGenerate, isLoading,
  onGenerateKeywordSuggestions, isSuggestingKeywords, keywordSuggestions, keywordSuggestionError,
  scriptType, setScriptType,
  numberOfSpeakers, setNumberOfSpeakers,
  videoDuration, setVideoDuration,
  savedIdeas, onSaveIdea, onOpenSavedIdeasModal,
  aiProvider, setAiProvider, selectedModel, setSelectedModel,
  audienceAge, setAudienceAge,
  contentFocus, setContentFocus
}) => {
  const handleCheckboxChange = (key: keyof FormattingOptions, value: boolean) => {
    setFormattingOptions({ ...formattingOptions, [key]: value });
  };

  const handleAddKeyword = (keyword: string) => {
    setKeywords(keywords ? `${keywords}, ${keyword}` : keyword);
  };
  
  const isIdeaSaved = (idea: TopicSuggestionItem) => {
    return savedIdeas.some(saved => saved.title === idea.title && saved.outline === idea.outline);
  };

  const handleSaveAll = (ideasToSave: TopicSuggestionItem[]) => {
      ideasToSave.forEach(idea => {
          if (!isIdeaSaved(idea)) {
              onSaveIdea(idea);
          }
      });
  };

  const handleProviderChange = (provider: AiProvider) => {
    setAiProvider(provider);
    if (provider === 'gemini') {
        setSelectedModel(GEMINI_MODELS[0].value);
    } else {
        setSelectedModel(OPENAI_MODELS[0].value);
    }
  };

  const modelOptions = aiProvider === 'gemini' ? GEMINI_MODELS : OPENAI_MODELS;

  const IdeaList: React.FC<{
    ideaList: TopicSuggestionItem[], 
    listTitle: string,
  }> = ({ ideaList, listTitle }) => (
    <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-text-secondary">{listTitle}:</p>
            {ideaList.length > 0 && (
                <button 
                    onClick={() => handleSaveAll(ideaList)}
                    className="flex items-center gap-1 text-xs bg-secondary hover:bg-primary text-text-secondary px-2 py-1 rounded-md transition"
                    aria-label="Lưu tất cả ý tưởng hiển thị"
                >
                    <BookmarkIcon className="w-3 h-3"/>
                    <span>Lưu tất cả</span>
                </button>
            )}
        </div>
        <div className="h-48 min-h-[10rem] resize-y overflow-auto border border-primary/50 rounded-md space-y-2 p-2">
            {ideaList.map((idea, index) => (
                <div key={`${listTitle}-${idea.title}-${index}`} className="text-left text-sm w-full p-3 rounded-md bg-primary/70">
                  <strong className="text-text-primary block">{idea.title}</strong>
                  {idea.vietnameseTitle && idea.vietnameseTitle !== idea.title && <span className="text-xs mt-1 block text-accent/80">{idea.vietnameseTitle}</span>}
                  <span className="text-xs mt-1 block text-text-secondary">{idea.outline}</span>
                  <div className="flex items-center gap-2 mt-2">
                    <button 
                      onClick={() => {
                        setTitle(idea.title);
                        setOutlineContent(idea.outline);
                      }}
                      className="text-xs bg-accent/80 hover:bg-accent text-white px-2 py-1 rounded-md transition"
                    >
                        Sử dụng
                    </button>
                    <button 
                      onClick={() => onSaveIdea(idea)}
                      disabled={isIdeaSaved(idea)}
                      className="flex items-center gap-1 text-xs bg-secondary hover:bg-primary text-text-secondary px-2 py-1 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <BookmarkIcon className="w-3 h-3"/>
                      {isIdeaSaved(idea) ? 'Đã lưu' : 'Lưu'}
                    </button>
                  </div>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="bg-secondary rounded-lg p-6 shadow-xl space-y-6">
      
      {/* 1. Tin tức chính */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-2">1. Tin tức / Sự kiện hôm nay</label>
        <input
          id="title"
          type="text"
          className="w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition"
          placeholder="VD: Cập nhật tình hình biên giới Thái-Cam; Chính sách ví số..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          id="outline"
          rows={2}
          className="mt-2 w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition text-sm"
          placeholder="Chi tiết tóm tắt (tùy chọn)..."
          value={outlineContent}
          onChange={(e) => setOutlineContent(e.target.value)}
        />
        
        {/* URL Input Section */}
        <div className="mt-2 relative">
            <div className="absolute top-2 left-2 text-text-secondary">
                <GlobeIcon className="w-4 h-4" />
            </div>
            <textarea
                id="referenceUrls"
                rows={3}
                className="w-full bg-primary/70 border border-secondary rounded-md p-2 pl-8 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition text-sm"
                placeholder="Dán các đường link (URL) bài báo tham khảo vào đây (mỗi dòng 1 link). AI sẽ tổng hợp tin từ nguồn này."
                value={referenceUrls}
                onChange={(e) => setReferenceUrls(e.target.value)}
            />
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
            <button 
              onClick={onGenerateSuggestions} 
              disabled={isSuggesting || !title || isLoading}
              className="w-full flex items-center justify-center bg-secondary hover:bg-primary disabled:bg-primary/50 disabled:cursor-not-allowed text-text-primary font-bold py-2 px-4 rounded-lg transition"
            >
              {isSuggesting ? 'Đang tạo...' : 'Gợi ý Tin hot'}
            </button>
            <button 
              onClick={onOpenSavedIdeasModal} 
              className="w-full flex items-center justify-center bg-secondary hover:bg-primary text-text-primary font-bold py-2 px-4 rounded-lg transition"
            >
              <LightbulbIcon className="w-5 h-5 mr-2" />
              Kho Tin
            </button>
        </div>

        {suggestionError && <p className="text-red-400 text-sm mt-2">{suggestionError}</p>}
        {suggestions.length > 0 && <IdeaList ideaList={suggestions} listTitle="Tin tức gợi ý" />}
      </div>
      
      {/* 2. Provider */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">2. Nhà cung cấp AI & Model</label>
        <div className="flex bg-primary/70 rounded-lg p-1 mb-3">
            {AI_PROVIDER_OPTIONS.map(option => (
                <button
                    key={option.value}
                    onClick={() => handleProviderChange(option.value)}
                    className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${
                        aiProvider === option.value ? 'bg-accent text-white' : 'text-text-secondary hover:bg-primary'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
         <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition"
        >
          {modelOptions.map(model => (
            <option key={model.value} value={model.value}>{model.label}</option>
          ))}
        </select>
      </div>

      {/* 3. Keywords */}
      <div>
        <label htmlFor="keywords" className="block text-sm font-medium text-text-secondary mb-2">3. Điểm nhấn / Từ khóa (Tùy chọn)</label>
        <input
          id="keywords"
          type="text"
          className="w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition"
          placeholder="VD: hòa bình, đàm phán, kinh tế biên giới"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />
        <button 
          onClick={onGenerateKeywordSuggestions} 
          disabled={isSuggestingKeywords || !title || isLoading}
          className="w-full mt-2 bg-secondary/70 hover:bg-primary disabled:bg-primary/50 text-text-secondary py-2 px-4 rounded-lg transition text-sm"
        >
          {isSuggestingKeywords ? 'Đang tìm từ khóa...' : 'Gợi ý từ khóa'}
        </button>
        {keywordSuggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
                {keywordSuggestions.map((suggestion, index) => (
                    <button key={index} onClick={() => handleAddKeyword(suggestion)} className="px-3 py-1 text-xs font-medium rounded-full bg-primary/70 hover:bg-primary text-text-secondary">
                        {suggestion}
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* New Section: News Settings replacing Language */}
      <div className="space-y-4 pt-2 border-t border-primary/50">
          <OptionSelector<AudienceAge>
            title="4. Độ tuổi khán giả mục tiêu"
            options={AUDIENCE_AGE_OPTIONS}
            selectedOption={audienceAge}
            onSelect={setAudienceAge}
          />

          <OptionSelector<ContentFocus>
            title="5. Trọng tâm nội dung hôm nay"
            options={CONTENT_FOCUS_OPTIONS}
            selectedOption={contentFocus}
            onSelect={setContentFocus}
          />
      </div>

      {/* Style Options */}
      <OptionSelector<Tone>
        title="6. Giọng điệu (Tone) - Văn hóa Thái"
        options={TONE_OPTIONS}
        selectedOption={styleOptions.tone}
        onSelect={(option) => setStyleOptions({ ...styleOptions, tone: option })}
        explanations={TONE_EXPLANATIONS}
      />

      <OptionSelector<Style>
        title="7. Cấu trúc bản tin (Style)"
        options={STYLE_OPTIONS}
        selectedOption={styleOptions.style}
        onSelect={(option) => setStyleOptions({ ...styleOptions, style: option })}
        explanations={STYLE_EXPLANATIONS}
      />
      
      <OptionSelector<Voice>
        title="8. Người dẫn (Voice) & Xưng hô"
        options={VOICE_OPTIONS}
        selectedOption={styleOptions.voice}
        onSelect={(option) => setStyleOptions({ ...styleOptions, voice: option })}
        explanations={VOICE_EXPLANATIONS}
      />

      {/* Formatting & Type */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">9. Định dạng & Độ dài</label>
        
        <div className="flex bg-primary/70 rounded-lg p-1 mb-4">
            {SCRIPT_TYPE_OPTIONS.map(option => (
                <button
                    key={option.value}
                    onClick={() => setScriptType(option.value)}
                    className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${
                        scriptType === option.value ? 'bg-accent text-white' : 'text-text-secondary hover:bg-primary'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>

        {scriptType === 'Podcast' && (
             <OptionSelector<NumberOfSpeakers>
                title="Số lượng người nói"
                options={NUMBER_OF_SPEAKERS_OPTIONS}
                selectedOption={numberOfSpeakers}
                onSelect={setNumberOfSpeakers}
            />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
             <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Thời lượng (phút)</label>
                <input type="number" value={videoDuration} onChange={e => setVideoDuration(e.target.value)} className="w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary" placeholder="8-12"/>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-4">
            <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded bg-primary/70 text-accent" checked={formattingOptions.includeIntro} onChange={(e) => handleCheckboxChange('includeIntro', e.target.checked)} />
                <span className="text-text-primary text-sm">Intro văn hóa Thái</span>
            </label>
             <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded bg-primary/70 text-accent" checked={formattingOptions.includeOutro} onChange={(e) => handleCheckboxChange('includeOutro', e.target.checked)} />
                <span className="text-text-primary text-sm">Outro & CTA mềm</span>
            </label>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || !title}
        className="w-full flex items-center justify-center bg-accent hover:bg-indigo-500 disabled:bg-indigo-400/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 ease-in-out transform hover:scale-105"
      >
        {isLoading ? 'Đang viết tin...' : (
          <>
            <SparklesIcon className="w-5 h-5 mr-2" />
            Tạo Kịch bản Tin tức
          </>
        )}
      </button>
    </div>
  );
};
