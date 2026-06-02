import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

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

// Program Translation Helper
function getProgramTitle(programId: string): string {
  const programs: Record<string, string> = {
    diabetes: "90-Day Diabetes Care Program",
    liver: "90-Day Liver Health & Reversal",
    weight: "90-Day Specialized Weight Management",
    thyroid: "90-Day Hypothyroidism Support Program",
    pcos: "90-Day PCOS Reversal Program"
  };
  return programs[programId] || "Comprehensive Lifestyle Program";
}

// Route to handle sending emails upon program reservation
app.post("/api/reservations/notify", async (req, res) => {
  try {
    const { name, email, phone, programId, preferredDate, preferredTime, notes } = req.body;
    
    if (!name || !email || !phone || !programId || !preferredDate) {
      return res.status(400).json({ error: "Missing required reservation details for sending emails." });
    }

    const programTitle = getProgramTitle(programId);
    const adminEmail = process.env.ADMIN_EMAIL || "jimmymanalel@gmail.com";
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
    const smtpFrom = process.env.SMTP_FROM || `Dr. VP Health Portal <${smtpUser || "no-reply@dr-vp-talks.com"}>`;

    // Patient email HTML markup
    const patientHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcfbfa; padding: 40px 20px; color: #1c2d24; max-width: 600px; margin: 0 auto; border: 1px solid #eae7e2; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #eae7e2; padding-bottom: 20px;">
          <h1 style="color: #405f4c; font-size: 24px; font-weight: normal; margin: 0 0 10px 0; font-family: Georgia, serif; font-style: italic;">Dr. Vishnupriya's Health Portal</h1>
          <p style="font-size: 13px; color: #768175; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Lifestyle & Ayurvedic Coaching</p>
        </div>
        
        <div style="line-height: 1.6; font-size: 15px; color: #333d37; margin-bottom: 35px;">
          <p>Dear <strong>${name}</strong>,</p>
          <p>Thank you for inquiring about a reservation for our <strong>${programTitle}</strong>. We are delighted to assist you on your journey toward restorative health.</p>
          <p>Dr. Vishnupriya and our coaching team have received your request. We will review your files and touch base within 24–48 operating hours to finalize your introductory consultation space.</p>
          
          <h2 style="font-family: Georgia, serif; font-size: 18px; color: #405f4c; font-weight: normal; border-bottom: 1px solid #f0eee9; padding-bottom: 8px; margin-top: 30px;">Your Reservation Summary</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #405f4c; width: 160px; border-bottom: 1px solid #f0eee9;">Program Select:</td>
              <td style="padding: 10px 0; color: #555; border-bottom: 1px solid #f0eee9;">${programTitle}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #405f4c; border-bottom: 1px solid #f0eee9;">Preferred Date:</td>
              <td style="padding: 10px 0; color: #555; border-bottom: 1px solid #f0eee9;">${preferredDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #405f4c; border-bottom: 1px solid #f0eee9;">Preferred Time:</td>
              <td style="padding: 10px 0; color: #555; border-bottom: 1px solid #f0eee9;">${preferredTime}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #405f4c; border-bottom: 1px solid #f0eee9;">Contact Phone:</td>
              <td style="padding: 10px 0; color: #555; border-bottom: 1px solid #f0eee9;">${phone}</td>
            </tr>
            ${notes?.trim() ? `
            <tr>
              <td style="vertical-align: top; padding: 10px 0; font-weight: bold; color: #405f4c; border-bottom: 1px solid #f0eee9;">Health Notes:</td>
              <td style="padding: 10px 0; color: #555; border-bottom: 1px solid #f0eee9; line-height: 1.5; font-style: italic;">${notes}</td>
            </tr>
            ` : ''}
          </table>
          
          <div style="background-color: #f3f6f4; border-left: 4px solid #405f4c; padding: 15px; margin-top: 30px; border-radius: 4px; font-size: 13.5px; color: #4a544f;">
            <strong>Next Steps:</strong> Please monitor your inbox or phone lines. One of our health guides will contact you to schedule the initial Ayurvedic assessment and align your 90-day protocol elements.
          </div>
        </div>
        
        <div style="text-align: center; border-top: 1px solid #eae7e2; padding-top: 25px; margin-top: 35px; font-size: 12px; color: #8e958d; line-height: 1.5;">
          <p style="margin: 0 0 5px 0;"><strong>Dr. Vishnupriya's Lifestyle Reversal Clinics</strong></p>
          <p style="margin: 0 0 15px 0;">Kerala, India — The Land of Ayurvedic Healing</p>
          <p style="font-style: italic; font-size: 11px; margin: 0;">This is an automatically generated receipt of your reservation inquiry. Medical suggestions are only validated upon personal consult.</p>
        </div>
      </div>
    `;

    // Admin email HTML markup
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #f7faf8; padding: 30px; color: #2C3531; max-width: 600px; margin: 0 auto; border: 1px solid #ddece6; border-radius: 6px;">
        <div style="padding-bottom: 15px; border-bottom: 2px solid #a6cfbe; margin-bottom: 20px;">
          <h1 style="color: #2e5944; font-size: 20px; font-weight: bold; margin: 0;">[New Inquiry] 90-Day Program Reservation</h1>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">A new client booking has been registered on the website.</p>
        </div>
        
        <p style="font-size: 15px;">A request for 90-day lifestyle program reservation was submitted with active details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <tr style="background-color: #eef5f2;">
            <th style="padding: 10px; border: 1px solid #d6ebd9; text-align: left; width: 140px;">Field</th>
            <th style="padding: 10px; border: 1px solid #d6ebd9; text-align: left;">Client Submission Details</th>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #d6ebd9; font-weight: bold;">Client Name:</td>
            <td style="padding: 10px; border: 1px solid #d6ebd9;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #d6ebd9; font-weight: bold;">Client Email:</td>
            <td style="padding: 10px; border: 1px solid #d6ebd9;"><a href="mailto:${email}" style="color: #2e5944; text-decoration: underline;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #d6ebd9; font-weight: bold;">Client Phone:</td>
            <td style="padding: 10px; border: 1px solid #d6ebd9;"><a href="tel:${phone}" style="color: #2e5944; text-decoration: underline;">${phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #d6ebd9; font-weight: bold;">Target Program:</td>
            <td style="padding: 10px; border: 1px solid #d6ebd9; font-weight: bold; color: #2e5944;">${programTitle} (ID: ${programId})</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #d6ebd9; font-weight: bold;">Proposed Date:</td>
            <td style="padding: 10px; border: 1px solid #d6ebd9;">${preferredDate}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #d6ebd9; font-weight: bold;">Proposed Time:</td>
            <td style="padding: 10px; border: 1px solid #d6ebd9;">${preferredTime}</td>
          </tr>
          ${notes?.trim() ? `
          <tr>
            <td style="padding: 10px; border: 1px solid #d6ebd9; font-weight: bold; vertical-align: top;">Health History:</td>
            <td style="padding: 10px; border: 1px solid #d6ebd9; white-space: pre-line; line-height: 1.5; color: #444;">${notes}</td>
          </tr>
          ` : ''}
        </table>
        
        <div style="margin-top: 25px; padding: 15px; background-color: #fffde6; border-left: 4px solid #ccbc25; font-size: 13px; border-radius: 4px;">
          <strong>Action Required:</strong> Please contact the patient at their preferred email <strong>${email}</strong> or key in an assessment call at <strong>${phone}</strong> within 1 business day.
        </div>
      </div>
    `;

    // Check if SMTP configuration is established
    if (smtpUser && smtpPass) {
      // Build transporter
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      // Send to patient
      await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: `Program Reservation Received - Dr. VP Lifestyle Programs`,
        html: patientHtml,
      });

      // Send to admin
      await transporter.sendMail({
        from: smtpFrom,
        to: adminEmail,
        subject: `[New Reservation Inquiry] ${name} - ${programTitle}`,
        html: adminHtml,
      });

      return res.json({
        success: true,
        smtpConfigured: true,
        message: "Reservation receipt and administrative emails have been dispatched successfully via configured SMTP."
      });
    } else {
      // SMTP not configured - Perform high-clarity log simulation
      console.log("\n================[ RESERVATION NOTIFICATION SIMULATOR ]================\n");
      console.log(`To configure real delivery, set SMTP_USER, SMTP_PASS, and optionally SMTP_HOST, SMTP_PORT, SMTP_FROM, ADMIN_EMAIL in your active Environment Settings.`);
      console.log(`\n--- TO PATIENT: ${email} ---`);
      console.log(`Subject: Program Reservation Received - Dr. VP Lifestyle Programs`);
      console.log(`[HTML Notification Generated Successfully. Render size: ${patientHtml.length} characters]`);
      console.log(`\n--- TO ADMIN: ${adminEmail} ---`);
      console.log(`Subject: [New Reservation Inquiry] ${name} - ${programTitle}`);
      console.log(`[HTML Notification Generated Successfully. Render size: ${adminHtml.length} characters]`);
      console.log("\n======================================================================\n");

      return res.json({
        success: true,
        smtpConfigured: false,
        message: "Reservation printed successfully to backend server logs. To dispatch live emails, set environmental credentials inside Secrets."
      });
    }

  } catch (err: any) {
    console.error("Email Notification Route Error:", err);
    res.status(500).json({ error: err.message || "An error occurred while routing notifications." });
  }
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
