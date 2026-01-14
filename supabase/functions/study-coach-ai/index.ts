import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `তুমি একজন অভিজ্ঞ HSC স্টাডি কোচ। তুমি বাংলায় পরামর্শ দাও এবং শিক্ষার্থীদের HSC পরীক্ষার জন্য প্রস্তুতি নিতে সাহায্য করো।

তোমার কাজ হলো শিক্ষার্থীর বর্তমান অবস্থা দেখে তাকে ব্যক্তিগতকৃত পরামর্শ ও অনুপ্রেরণা দেওয়া।

নিয়ম:
1. সবসময় বাংলায় উত্তর দাও
2. সংক্ষিপ্ত, কার্যকর পরামর্শ দাও
3. শিক্ষার্থীকে "তুমি" বলে সম্বোধন করো
4. ইতিবাচক কিন্তু বাস্তবসম্মত থাকো
5. নির্দিষ্ট, কার্যকর পদক্ষেপ দাও`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { completion, monthsRemaining, batch, riskLevel, tone, progressData } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context about student's situation
    let situationContext = `শিক্ষার্থীর তথ্য:
- ব্যাচ: HSC ${batch}
- পরীক্ষায় বাকি: ${monthsRemaining} মাস
- সিলেবাস সম্পন্ন: ${completion}%
- অবস্থা: ${riskLevel === 'safe' ? 'নিরাপদ' : riskLevel === 'slightly_behind' ? 'সামান্য পিছিয়ে' : 'ঝুঁকিপূর্ণ'}
- আজকের টোন: ${tone}`;

    // Add progress data if available
    if (progressData && progressData.subjects) {
      situationContext += `\n\nবিষয়ভিত্তিক অগ্রগতি:`;
      progressData.subjects.forEach((subject: { name: string; progress: number }) => {
        situationContext += `\n- ${subject.name}: ${subject.progress}%`;
      });
      
      // Find weak and strong subjects
      const weakSubjects = progressData.subjects.filter((s: { progress: number }) => s.progress < 30);
      const strongSubjects = progressData.subjects.filter((s: { progress: number }) => s.progress >= 70);
      
      if (weakSubjects.length > 0) {
        situationContext += `\n\nদুর্বল বিষয়: ${weakSubjects.map((s: { name: string }) => s.name).join(', ')}`;
      }
      if (strongSubjects.length > 0) {
        situationContext += `\nশক্তিশালী বিষয়: ${strongSubjects.map((s: { name: string }) => s.name).join(', ')}`;
      }
    }

    const userPrompt = `${situationContext}

এই শিক্ষার্থীর জন্য নিচের তথ্য দাও:

1. "todayActions": আজকের জন্য ৩টি নির্দিষ্ট ও কার্যকর পরামর্শ। প্রতিটি পরামর্শ ১-২ বাক্যে হবে। বিষয়ভিত্তিক পরামর্শ দাও।

2. "motivationalMessages": ${tone} টোনে ৫টি অনুপ্রেরণামূলক বার্তা। প্রতিটি বার্তা ১ বাক্যে হবে।

JSON ফরম্যাটে উত্তর দাও:
{
  "todayActions": ["পরামর্শ ১", "পরামর্শ ২", "পরামর্শ ৩"],
  "motivationalMessages": ["বার্তা ১", "বার্তা ২", "বার্তা ৩", "বার্তা ৪", "বার্তা ৫"]
}`;

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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response
    let parsedContent;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    return new Response(
      JSON.stringify({
        todayActions: parsedContent.todayActions || [],
        motivationalMessages: parsedContent.motivationalMessages || [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("study-coach-ai error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        fallback: true 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
