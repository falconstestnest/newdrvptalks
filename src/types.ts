export interface WellnessProgram {
  id: string;
  title: string;
  focus: string;
  description: string;
  pillars: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  readTime: string;
  date: string;
  author: string;
}

export interface BookingForm {
  name: string;
  email: string;
  phone: string;
  programId: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
}

export interface PCOSQuestion {
  id: string;
  text: string;
  category: "cycles" | "physical" | "metabolism" | "stress";
  options: { text: string; score: number }[];
}

export interface PrakritiQuestion {
  id: string;
  text: string;
  attribute: string;
  options: {
    text: string;
    dosha: "Vata" | "Pitta" | "Kapha";
  }[];
}
