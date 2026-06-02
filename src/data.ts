import { PCOSQuestion, PrakritiQuestion, BlogArticle } from "./types";

export const PCOS_QUESTIONS: PCOSQuestion[] = [
  {
    id: "pcos_1",
    text: "How would you describe your menstrual cycles over the last 6-12 months?",
    category: "cycles",
    options: [
      { text: "Regular (every 28-35 days)", score: 0 },
      { text: "Slightly irregular or long cycles (35-45 days)", score: 2 },
      { text: "Highly irregular (missed multiple months or unpredictable)", score: 4 },
      { text: "Absent for long stretches / post-hormonal-pill absence", score: 5 }
    ]
  },
  {
    id: "pcos_2",
    text: "Are you experiencing unexpected hair growth on your face, chin, chest, or abdomen?",
    category: "physical",
    options: [
      { text: "None or normal facial peach fuzz", score: 0 },
      { text: "Mild hair growth needing occasional thinning/threading", score: 2 },
      { text: "Moderate to aggressive dark hair growth (Hirsutism)", score: 4 }
    ]
  },
  {
    id: "pcos_3",
    text: "Describe your recent experience with cystic acne, persistent breakouts, or hair thinning on your scalp:",
    category: "physical",
    options: [
      { text: "Clear skin; minimal to no hair fall", score: 0 },
      { text: "Moderate adult breakouts around the jawline or oily scalp", score: 2 },
      { text: "Severe cystic acne or noticeable male-pattern hair thinning", score: 4 }
    ]
  },
  {
    id: "pcos_4",
    text: "How easily do you manage or lose weight, particularly around your tummy?",
    category: "metabolism",
    options: [
      { text: "Weight has been stable; easy to manage with normal activity", score: 0 },
      { text: "Gaining weight gradually despite eating healthy", score: 2 },
      { text: "Straying/stubborn weight gain localized entirely around the lower belly, very hard to shift", score: 4 }
    ]
  },
  {
    id: "pcos_5",
    text: "How frequently do you experience intense, uncontrollable sugar or carbohydrate cravings?",
    category: "metabolism",
    options: [
      { text: "Rarely or easily managed", score: 0 },
      { text: "Occasional cravings, especially in the afternoon or during fatigue", score: 2 },
      { text: "Chronic sweet cravings after meals; feeling sluggish/tired if sugar is avoided", score: 4 }
    ]
  },
  {
    id: "pcos_6",
    text: "How would you rate your general daily energy levels and stress response?",
    category: "stress",
    options: [
      { text: "Energetic and centered; normal sleep", score: 0 },
      { text: "Tired but wired: exhausted in daytime but active/restless at night", score: 2 },
      { text: "Chronic exhaustion, brain fog, easily overwhelmed by tiny stressors", score: 4 }
    ]
  }
];

export const PRAKRITI_QUESTIONS: PrakritiQuestion[] = [
  {
    id: "prakriti_1",
    text: "What is your physical body frame and bone structure?",
    attribute: "Body Frame",
    options: [
      { text: "Lean, thin, tall, or short with prominent joints", dosha: "Vata" },
      { text: "Medium build, athletic, good muscle tone, moderate weight", dosha: "Pitta" },
      { text: "Broad, heavy built, large bones, tends to gain weight easily", dosha: "Kapha" }
    ]
  },
  {
    id: "prakriti_2",
    text: "How would you describe your skin style and tone?",
    attribute: "Skin Type",
    options: [
      { text: "Dry, rough, thin, cool to touch, easily tanned or cracked", dosha: "Vata" },
      { text: "Warm, oily, fair or reddish tone, prone to freckles and moles", dosha: "Pitta" },
      { text: "Thick, oily, soft, cold to touch, fair, smooth, and glowing", dosha: "Kapha" }
    ]
  },
  {
    id: "prakriti_3",
    text: "What are your appetite, thirst, and general digestion like?",
    attribute: "Digestion & Hunger",
    options: [
      { text: "Variable; hungry one day, disinterested the next; prone to bloating/gas", dosha: "Vata" },
      { text: "Strong and intense; cannot skip meals without feeling angry/acidity", dosha: "Pitta" },
      { text: "Slow but steady; can skip meals easily with minimal discomfort; slow metabolism", dosha: "Kapha" }
    ]
  },
  {
    id: "prakriti_4",
    text: "How would you characterize your sleeping habits?",
    attribute: "Sleep Pattern",
    options: [
      { text: "Light, restless, easily interrupted; 5-6 hours is common", dosha: "Vata" },
      { text: "Moderate, sound sleep; takes 6-7 hours and wakes up easily", dosha: "Pitta" },
      { text: "Deep, heavy, long sleep; over 8 hours; hard to wake up", dosha: "Kapha" }
    ]
  },
  {
    id: "prakriti_5",
    text: "How do you naturally react to high stress or sudden changes?",
    attribute: "Stress Reaction",
    options: [
      { text: "With anxiety, worry, fear, and racing thoughts", dosha: "Vata" },
      { text: "With anger, impatience, irritation, and absolute determination", dosha: "Pitta" },
      { text: "With calm pacing; tends to withdraw, slow down, or become stubborn", dosha: "Kapha" }
    ]
  },
  {
    id: "prakriti_6",
    text: "What is your typical speech style and activity rate?",
    attribute: "Speech & Action",
    options: [
      { text: "Fast-talking, talkative, quick walking, always multitasking", dosha: "Vata" },
      { text: "Argumentative, convincing, clear, sharp, organized, and focused actions", dosha: "Kapha" }, // balance
      { text: "Slow, deliberate, calm voice, relaxed and steady walking style", dosha: "Kapha" }
    ]
  },
  {
    id: "prakriti_7",
    text: "How is your memory recall and learning pace?",
    attribute: "Memory",
    options: [
      { text: "Learns very quickly but forgets just as fast", dosha: "Vata" },
      { text: "Learns systematically with sharp analysis; retains memory well", dosha: "Pitta" },
      { text: "Takes time to learn but never forgets; excellent long-term memory", dosha: "Kapha" }
    ]
  }
];

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: "blog_1",
    title: "Why Rigid Calorie Counting Fails for Hormonal Weight Gain",
    category: "Hormones & Metabolism",
    excerpt: "Struggling to manage weight despite restriction? Discover how insulin resistance and cortisol shape fat distribution, and why metabolic healing comes first.",
    content: `Many individuals with lifestyle disorders like PCOS, hypothyroidism, or sluggish liver health come to me in complete exhaustion. They tell me, 'Dr. VP, I are eating only 1200 calories and walking daily, but my weight won't move.'

As a medical doctor and educator, my response is simple: your body is not a mere arithmetic calculator. It is a complex biochemical orchestra.

When you have insulin resistance, your cells are locked against glucose. The calorie-counting model ignores that high circulating levels of insulin command your body to store every molecule of food as visceral adipose tissue—specifically around your abdomen.

Similarly, chronic stress raises cortisol. Cortisol activates gluconeogenesis, flooding your bloodstream with glucose even if you eat nothing, which triggers secondary insulin spikes and breaks muscle down.

### The Reversal Plan:
1. **Focus on Glycemic Load over Calorie Count**: Pair complex carbohydrates with healthy plant/ancient fats or fibers (e.g. adding avocados or home-grown spices like cinnamon and fenugreek to ease insulin receptors).
2. **Support Your Liver**: Your liver converts thyroid T4 to active metabolic T3. Heavy calorie restriction stresses the liver, slowing your metabolic fire (Agni).
3. **Pace Your Movements**: Trade intense, exhausting cardio sessions that skyrocket cortisol for low-impact, muscle-activating movements like slow walking post-meals or deep-diaphragm breathing.`,
    readTime: "5 min read",
    date: "May 28, 2026",
    author: "Dr. VP"
  },
  {
    id: "blog_2",
    title: "The Insulin Connection in PCOS: Healing From the Roots",
    category: "PCOS Reversal",
    excerpt: "Is PCOS just an ovarian issue? No. Dive deep index into the metabolic roots of PCOS—and how 90 days of structured nutrition heals ovulation naturally.",
    content: `Historically, Polycystic Ovary Syndrome (PCOS) was treated primarily with hormonal contraceptives and cosmetic pills. But masking symptoms is not reversing the disorder.

PCOS is fundamentally a metabolic condition with deep roots in three areas: insulin sensitivity, adrenal stress responses, and low-grade systemic inflammation.

When insulin is chronically elevated, it directly stimulates the Ovaries' theca cells to overproduce testosterone. This excess androgen blocks follicle maturation, leading to the hallmark physical cysts on ultrasound and symptoms like chin hirsutism, jaw breakouts, and missed/irregular cycles.

### Step-by-Step Ayurvedic & Scientific Hormonal Balancing:
- **Calm the Adrenals**: Start your morning with a warm, hydrating herbal fusion (e.g., tulsi or mild ginger) rather than high-caffeine black coffee on an empty stomach.
- **Inositol-Rich and Mineral Nutrition**: Introduce unprocessed, mineral-dense grains (such as little millets or brown rice) aligned with circadian rhythm—leaving a clear 12-hour resting window overnight.
- **Cycle Syncing Activity**: During the follicular and luteal phases, adapt movement to match natural energy, rather than pushing past fatigue.`,
    readTime: "6 min read",
    date: "April 15, 2026",
    author: "Dr. VP"
  },
  {
    id: "blog_3",
    title: "Understanding Your Prakriti: The Key to Preventive Health",
    category: "Ayurveda Wisdom",
    excerpt: "Ancient Kerala Ayurveda meets modern lifestyle science. Learn why identifying your unique dosha combination explains your digestion, energy, and temperament.",
    content: `In Ayurveda, we don't treat the disease; we treat the individual who hosts the imbalance. No two bodies are identical. 

Your unique genetic and biochemical makeup is called your **Prakriti**—constituted by three energetic principles or bio-energies:
1. **Vata** (Air & Space): Responsible for movement, circulation, and nervous system currents.
2. **Pitta** (Fire & Water): Controls metabolic transformations, cellular heat, digestive enzymes, and intellectual sharpness.
3. **Kapha** (Water & Earth): Provides physical structure, cellular hydration, immunity, and mental stability.

When we identify your predominant elements, we unlock why you thrive on warm cooked soups (excellent to ground dry Vata), crave cooling hydrating herbs (cooling for acidic Pitta), or need dry, warming spices to kickstart a slow digestion (stimulating Kapha).

Determining your Prakriti provides an invaluable preventive compass. It is the core of how our 90-Day protocols are tailored directly for your liver, thyroid, or metabolic system.`,
    readTime: "4 min read",
    date: "March 10, 2026",
    author: "Dr. VP"
  }
];
