import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI client (safe lazy style)
let ai: GoogleGenAI | null = null;
function getGenAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI Chat will work in demo/mock mode.");
      return null;
    }
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// AI Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array" });
    }

    const client = getGenAI();
    if (!client) {
      // Return a simulated high-quality response if key is missing
      return res.json({
        text: "Greetings! I am Dr. Vishnupriya. It is wonderful to connect with you. Please note that I am currently operating in a demo mode as the GEMINI_API_KEY is not configured in the Secrets panel.\n\nIn my practice as an Ayurvedic doctor and health educator in Kerala, India, I specialize in treating lifestyle disorders (like Diabetes, Fatty Liver, PCOS, Thyroid slugginshness and Weight Management) through personalized, scientific, and compassionate 90-day modification plans. \n\nFeel free to explore our 'Free PCOS Assessment' or 'Discover Your Prakriti' on this platform, or schedule a mock online consultation through the Bookings tab!"
      });
    }

    const systemInstruction = 
      "You are Dr. Vishnupriya (Dr. VP), as described in the website 'Doctor VP Talks'. You are an Ayurveda doctor and health educator with years of clinical experience, based in Kerala, India (the land of Ayurveda).\n" +
      "Your core ideology: 'A Doctor Who Listens. A Program That Works.' You focus on 90-day Lifestyle Modification Programs for lifestyle disorders like Diabetes Care, Fatty Liver reversal, Weight Management, Hypothyroidism Support, and PCOS Reversal.\n" +
      "Tone: Warm, deeply compassionate, empathetic, highly professional, scientific but accessible, and encouraging. You simplify complex medical concepts into actionable everyday advice.\n" +
      "When responding:\n" +
      "1. Speak as Dr. VP in the first person. Express clinical empathy. Listen to frustrations (clients often come after years of frustration; they do not need another rigid diet, they need someone who is listening and understanding).\n" +
      "2. Provide science-backed and Ayurveda-informed lifestyle suggestions (diet, gentle exercise, circadian rhythm alignment, herbal insights, stress reduction) specific to their concern.\n" +
      "3. Inform them about your structured 90-Day Lifestyle Modification Programs where appropriate (such as PCOS, Thyroid, Liver, Diabetes, Weight), but never push it aggressively. Explain that reversing root causes requires consistency, clarity, and personalized care.\n" +
      "4. Keep responses clear, professional, concise, and structured with bullet points. NEVER give diagnostic conclusions; always encourage professional consultation.\n" +
      "5. Avoid robotic preamble. Be conversational and maternal/clinical yet modern.";

    // Convert chat history format for @google/genai
    const formattedContents = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: msg.content }]
    }));

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during content generation." });
  }
});

// PCOS assessment endpoint to parse / categorize with AI breakdown
app.post("/api/pcos-analysis", async (req, res) => {
  try {
    const { answers } = req.body;
    const client = getGenAI();
    if (!client) {
      return res.json({
        text: "Thank you for completing the PCOS assessment! Contact our office to get a custom breakdown.\n\n(Note: Connect your GEMINI_API_KEY in the Secrets panel of AI Studio to experience the full AI analysis report generation!)"
      });
    }

    const prompt = `Analyze the following user questionnaire answers for potential PCOS risk and hormonal imbalances. This is for an educational assessment for Dr. Vishnupriya's website:
${JSON.stringify(answers, null, 2)}

Provide a beautiful, highly empathetic, personalized response with:
1. An evaluation of potential root-cause drivers (e.g., insulin resistance, adrenal stress, inflammatory, thyroid sluggishness, or standard post-pill).
2. 3 highly specific, practical lifestyle/dietary actionable recommendations.
3. Recommended next steps within our 90-day PCOS Reversal program.

Keep it warm, professional, written by Dr. VP. Do not diagnose, but educate.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are Dr. Vishnupriya, analyzing a PCOS Assessment. Focus on hormonal balance, stress management, and glucose sensitivity. Be comforting, clear, and comprehensive.",
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("PCOS Analysis Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during PCOS analysis." });
  }
});

// Prakriti analysis endpoint (AI explanation)
app.post("/api/prakriti-analysis", async (req, res) => {
  try {
    const { answers, doshaScore } = req.body;
    const client = getGenAI();
    if (!client) {
      return res.json({
        text: `Thank you for exploring your Ayurvedic constitution! Your Prakriti scores are:\n- **Vata**: ${doshaScore?.Vata || 0}\n- **Pitta**: ${doshaScore?.Pitta || 0}\n- **Kapha**: ${doshaScore?.Kapha || 0}\n\nBalance your elements with mindful nutrition and specialized guidance.\n\n(Note: Connect your GEMINI_API_KEY in the Secrets panel to activate Dr. Vishnupriya's integrated AI translation of your constitution!)`
      });
    }

    const prompt = `Analyze these physical & mental Ayurvedic traits:
Dosha scores determined: Vata: ${doshaScore.Vata}, Pitta: ${doshaScore.Pitta}, Kapha: ${doshaScore.Kapha}
Answers list: ${JSON.stringify(answers, null, 2)}

Explain:
1. What this Prakriti (constitution) means in terms of their key physical qualities (fire, air, water/earth elements).
2. Tailored daily schedule (diet, exercise level, sleep goals) suitable for this Prakriti to bring balance.
3. Potential vulnerability to typical lifestyle disorders (e.g., digestive, skin, lethargy, anxiety) and how Dr. VP can help.

Ensure the tone is educational, ancient yet scientific, written in Dr. Vishnupriya's empathetic voice.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are Dr. Vishnupriya, Ayurveda medical professional from Kerala. Explain the Ayurvedic Prakriti with deep clinical wisdom and clear everyday terms.",
        temperature: 0.6,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Prakriti Analysis Error:", error);
    res.status(500).json({ error: error.message || "An error occurred." });
  }
});

// Serving clinical materials/programs information
app.get("/api/programs", (req, res) => {
  res.json([
    {
      id: "diabetes",
      title: "90-Day Diabetes Care Program",
      focus: "Insulin sensitivity, HbA1c reversal, muscle reactivation, stress regulation.",
      description: "Take control of your diabetes with our proven reversal program. Learn how to manage your condition effectively, decrease dependency on medication, and improve your metabolic health and overall quality of life.",
      pillars: ["Glycemic control diet", "Gentle resistance activity", "Circadian timing", "Stress-reducing breath work"]
    },
    {
      id: "liver",
      title: "90-Day Liver Health & Reversal",
      focus: "Fatty liver reversal (Grade I/II), cellular detoxification, enzyme normalization.",
      description: "Support your liver health with our fatty liver reversal program. Discover the key to maintaining a healthy liver, optimizing metabolism, repairing hepatic tissue, and enhancing overall well-being.",
      pillars: ["Cholagogue-rich nutritional plan", "Visceral fat reduction", "Natural anti-inflammatory guides", "Intermittent fasting alignment"]
    },
    {
      id: "weight",
      title: "90-Day Specialized Weight Management",
      focus: "Metabolic rate optimization, healthy muscular development, systemic metabolic balancing.",
      description: "Achieve your ideal weight with our specialized weight loss and weight gain programs. Under scientific supervision, we guide you towards a sustainable, happier lifestyle without calorie deprivation.",
      pillars: ["Ayurvedic Agni balancing", "Macro-optimized wholesome diet", "Functional movement patterns", "Digestive enzyme amplification"]
    },
    {
      id: "thyroid",
      title: "90-Day Hypothyroidism Support Program",
      focus: "Boosting sluggish metabolism, hormonal balance, combating chronic fatigue.",
      description: "This program supports individuals living with hypothyroidism, Hashimoto’s, or sluggish thyroid function. We work on boosting metabolism, balancing hormones, enhancing cellular conversion, and improving energy levels.",
      pillars: ["Selenium & Iodine co-factor nutrition", "Liver conversion support", "Stress & Cortisol modulation", "Ojas-restoring therapies"]
    },
    {
      id: "pcos",
      title: "90-Day PCOS Reversal Program",
      focus: "Reversing root causes: insulin resistance, adrenal fatigue, systemic inflammation, post-pill dysfunction.",
      description: "A structured, science-backed and Ayurveda-informed program designed to reverse symptoms of PCOS from the roots. We focus on natural ovulatory cycles, dermatological relief, and sustainable weight control.",
      pillars: ["Androgen-lowering foods", "Inositol and mineral foods", "Sympathetic nervous system calming", "Gentle cyclical movement"]
    }
  ]);
});

// Encapsulate server start inside async block to resolve bundler target formats
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT || 3000}`);
  });
}

startServer().catch((err) => {
  console.error("Critical error starting Express and Vite server:", err);
});
