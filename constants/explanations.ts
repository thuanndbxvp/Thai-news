
import type { Tone, Style, Voice } from '../types';

export const TONE_EXPLANATIONS: Record<Tone, string> = {
  'Friendly_PiNong': 'Giọng điệu "Anh/Chị nói với Em", ấm áp, dễ hiểu, tạo cảm giác gần gũi nhưng vẫn tôn trọng.',
  'Professional_Neutral': 'Khách quan, đưa tin thuần túy, không để lộ cảm xúc cá nhân, phù hợp với các tin nghiêm trọng.',
  'Analytical': 'Tập trung vào giải thích nguyên nhân, bối cảnh và hệ quả của sự kiện.',
  'Cautious_Diplomatic': 'Đặc biệt dùng cho tin nhạy cảm (biên giới, chính trị), dùng từ ngữ giảm nhẹ, tránh kích động.',
};

export const STYLE_EXPLANATIONS: Record<Style, string> = {
  'News_Report': 'Cấu trúc bản tin nhanh: Tin chính -> Chi tiết -> Kết luận.',
  'Deep_Dive': 'Đi sâu vào một vấn đề duy nhất, phân tích nhiều chiều.',
  'Weekly_Summary': 'Tóm tắt các sự kiện nổi bật nhất trong tuần.',
};

export const VOICE_EXPLANATIONS: Record<Voice, string> = {
  'Male_Krub': 'MC Nam, xưng hô lịch sự với trợ từ "Krub".',
  'Female_Ka': 'MC Nữ, xưng hô lịch sự với trợ từ "Ka".',
};

export const FORMATTING_EXPLANATIONS = {
  wordCount: 'Độ dài ước tính. Với tin tức, 1000 từ khoảng 6-7 phút nói.',
  videoDuration: 'Nhập thời lượng mong muốn (phút). AI sẽ tính toán số từ (khoảng 150 từ/phút).',
  scriptParts: 'Chia bản tin thành các segment (Thời sự, Chính trị, Quốc tế...).',
  includeIntro: 'Tạo lời chào đầu bản tin đúng chuẩn văn hóa Thái (Sawasdee).',
  includeOutro: 'Tạo lời kết, tóm tắt và nhắc nhở khán giả bình luận văn minh.',
  headings: 'Sử dụng tiêu đề để phân chia các mục tin (Intro, Segment A, B...).',
  bullets: 'Dùng gạch đầu dòng để tóm tắt các ý chính.',
  bold: 'In đậm các từ khóa quan trọng.',
};
