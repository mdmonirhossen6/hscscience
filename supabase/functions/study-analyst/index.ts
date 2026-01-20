import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `তুমি একজন অভিজ্ঞ HSC Study Analyst। বাংলাদেশের HSC শিক্ষার্থীদের জন্য personalized study analysis এবং improvement plan তৈরি করো।

তোমার কাজ:
1. শিক্ষার্থীর উত্তর বিশ্লেষণ করো
2. তাদের শক্তি ও দুর্বলতা চিহ্নিত করো
3. একটি পরিপূর্ণ study plan তৈরি করো

Output Format (এই ফরম্যাট অবশ্যই মেনে চলো):

📊 **Student Profile Summary**
[শিক্ষার্থীর সংক্ষিপ্ত প্রোফাইল - গ্রুপ, ক্লাস, লক্ষ্য]

💪 **Strength Analysis**
[তাদের শক্তিশালী দিকগুলো]

⚠️ **Weakness Analysis**
[তাদের দুর্বল দিকগুলো এবং কারণ]

🎯 **Risk Level**
[Low / Medium / High - কেন এই রিস্ক লেভেল]

📅 **7-Day Smart Study Plan**
| দিন | সকাল | বিকেল | রাত |
|-----|------|-------|-----|
[প্রতিটি দিনের জন্য specific topics এবং activities]

📚 **Subject-wise Improvement Tips**
[প্রতিটি দুর্বল সাবজেক্টের জন্য concrete tips]

🚀 **Next Action (এখনই শুরু করো)**
[আজই কী করতে হবে - একটি specific action]

💬 **Motivational Note**
[ছোট্ট একটি অনুপ্রেরণামূলক কথা]

Rules:
- সহজ বাংলায় লেখো
- বাস্তবসম্মত কিন্তু উৎসাহব্যঞ্জক হও
- অপ্রয়োজনীয় ব্যাখ্যা দিও না
- HSC পরীক্ষায় সাফল্যের দিকে ফোকাস করো
- Output পরিষ্কার এবং structured হতে হবে`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers } = await req.json();
    
    console.log("Received study analyst request with answers:", JSON.stringify(answers));
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    // Build user prompt from answers
    const userPrompt = buildUserPrompt(answers);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded. Please try again later." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const errorText = await response.text();
      console.error("AI gateway error response:", errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Streaming response from AI gateway");
    
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Study analyst function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function buildUserPrompt(answers: Record<string, string | string[]>): string {
  const groupMap: Record<string, string> = {
    science: "Science",
    business: "Business Studies",
    arts: "Arts/Humanities",
  };

  const classMap: Record<string, string> = {
    hsc1: "HSC 1st Year",
    hsc2: "HSC 2nd Year",
  };

  const subjectMap: Record<string, string> = {
    physics: "Physics",
    chemistry: "Chemistry",
    math: "Higher Math",
    biology: "Biology",
    ict: "ICT",
    english: "English",
    bangla: "Bangla",
  };

  const hoursMap: Record<string, string> = {
    "<1h": "১ ঘণ্টার কম",
    "1-3h": "১-৩ ঘণ্টা",
    "3-5h": "৩-৫ ঘণ্টা",
    "5h+": "৫+ ঘণ্টা",
  };

  const timeMap: Record<string, string> = {
    morning: "সকাল",
    night: "রাত",
    mixed: "মিক্সড",
  };

  const goalMap: Record<string, string> = {
    gpa5: "GPA 5",
    "eng-med": "Engineering/Medical",
    "public-uni": "Public University",
    abroad: "বিদেশে পড়াশোনা",
    "not-sure": "এখনো ঠিক করিনি",
  };

  const problemMap: Record<string, string> = {
    backlog: "পড়া জমে গেছে (Backlog)",
    concept: "Concept clear হয় না",
    time: "Time management সমস্যা",
    motivation: "Motivation কম",
  };

  const helpMap: Record<string, string> = {
    "daily-plan": "Daily study plan",
    topic: "Topic explanation",
    mcq: "MCQ practice",
    weakness: "Weakness analysis",
  };

  const group = groupMap[answers.group as string] || answers.group;
  const classLevel = classMap[answers.class as string] || answers.class;
  const hardest = subjectMap[answers.hardestSubject as string] || answers.hardestSubject;
  const weakest = subjectMap[answers.weakestSubject as string] || answers.weakestSubject;
  const hours = hoursMap[answers.studyHours as string] || answers.studyHours;
  const time = timeMap[answers.studyTime as string] || answers.studyTime;
  const goal = goalMap[answers.goal as string] || answers.goal;
  const problem = problemMap[answers.problem as string] || answers.problem;
  
  const helpNeeded = Array.isArray(answers.helpNeeded)
    ? answers.helpNeeded.map((h) => helpMap[h] || h).join(", ")
    : helpMap[answers.helpNeeded as string] || answers.helpNeeded;

  return `একজন শিক্ষার্থীর তথ্য বিশ্লেষণ করো:

📋 **শিক্ষার্থীর তথ্য:**
- গ্রুপ: ${group}
- ক্লাস: ${classLevel}
- সবচেয়ে শক্ত সাবজেক্ট: ${hardest}
- সবচেয়ে দুর্বল সাবজেক্ট: ${weakest}
- দৈনিক পড়াশোনা: ${hours}
- পড়ার সময়: ${time}
- প্রধান লক্ষ্য: ${goal}
- বর্তমান সমস্যা: ${problem}
- যে ধরনের সাহায্য চায়: ${helpNeeded}

এই তথ্যের ভিত্তিতে একটি পরিপূর্ণ Study Analysis এবং 7-Day Smart Study Plan তৈরি করো। সব কিছু বাংলায় লেখো এবং বাস্তবসম্মত পরামর্শ দাও।`;
}
