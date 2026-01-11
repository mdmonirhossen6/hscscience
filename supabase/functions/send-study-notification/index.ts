import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Daily rotation of message tones
const getTodayTone = (): string => {
  const tones = ["reality", "encouragement", "discipline", "progress", "urgency"];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return tones[dayOfYear % tones.length];
};

const getMotivationalMessages = (monthsRemaining: number, riskLevel: string, tone: string): string[] => {
  const urgencyFactor = monthsRemaining <= 3 ? "high" : monthsRemaining <= 6 ? "medium" : "low";
  
  const messages: Record<string, string[]> = {
    reality: [
      "আজ ১ ঘণ্টা পড়লে কাল ১ ঘণ্টা এগিয়ে থাকবে।",
      "সিলেবাস নিজে নিজে শেষ হবে না—তোমাকেই করতে হবে।",
      "প্রতিদিন ছোট ছোট পদক্ষেপই বড় ফলাফল আনে।",
      "বাকি সময় কম—এখনই শুরু করো।",
      "অজুহাত না দিয়ে বই খোলো।"
    ],
    encouragement: [
      "তুমি যতটুকু পেরেছ, সেটাও একটা অর্জন।",
      "ধীরে হলেও এগিয়ে যাচ্ছ—থামবে না।",
      "প্রতিটা পৃষ্ঠা তোমাকে লক্ষ্যের কাছে নিয়ে যাচ্ছে।",
      "কঠিন লাগলেও চালিয়ে যাও—ফল পাবে।",
      "তোমার চেষ্টা বৃথা যাবে না।"
    ],
    discipline: [
      "রুটিন মানো—মন না চাইলেও পড়ো।",
      "মোবাইল দূরে রাখো, বই কাছে রাখো।",
      "প্রতিদিন নির্দিষ্ট সময় পড়ার অভ্যাস করো।",
      "ইচ্ছার উপর নির্ভর করো না—নিয়মের উপর করো।",
      "আজ ফাঁকি দিলে কাল আরও কঠিন হবে।"
    ],
    progress: [
      "গতকালের চেয়ে আজ একটু বেশি পড়ো।",
      "ছোট উন্নতিও উন্নতি—এগিয়ে যাও।",
      "প্রতিদিন ১% উন্নতি = মাসে ৩০% উন্নতি।",
      "যা পড়েছ তা রিভিশন দাও, নতুন কিছু যোগ করো।",
      "ধারাবাহিকতাই সাফল্যের চাবিকাঠি।"
    ],
    urgency: [
      urgencyFactor === "high" ? "সময় প্রায় শেষ—প্রতিটা মুহূর্ত গুরুত্বপূর্ণ!" : "সময় আছে, কিন্তু অপচয় করো না।",
      "আজ যা পড়বে না, পরীক্ষায় তা আসতে পারে।",
      "প্রতিদিন গুনে গুনে পড়ো—সময় চলে যাচ্ছে।",
      urgencyFactor === "high" ? "এখন পড়াই একমাত্র কাজ!" : "অগ্রাধিকার ঠিক রাখো।",
      "পরে পড়ব বললে পরে আর সময় থাকবে না।"
    ]
  };
  
  // Add risk-specific messages
  if (riskLevel === "high_risk") {
    messages[tone] = [
      ...messages[tone],
      "ঝুঁকিতে আছ—এখনই গতি বাড়াও।",
      "প্রতিদিন অন্তত ৩-৪ ঘণ্টা পড়া জরুরি।"
    ];
  }
  
  return messages[tone] || messages.encouragement;
};

const getTodayActions = (completion: number, monthsRemaining: number): string[] => {
  const actions: string[] = [];
  
  if (completion < 30) {
    actions.push("আজ যেকোনো ১টি নতুন অধ্যায় শুরু করো এবং মূল ধারণাগুলো বুঝে নাও।");
    actions.push("প্রতিদিন কমপক্ষে ২-৩ ঘণ্টা পড়ার রুটিন তৈরি করো।");
  } else if (completion < 50) {
    actions.push("দুর্বল বিষয়ে ১ ঘণ্টা অতিরিক্ত সময় দাও।");
    actions.push("আজ অন্তত ১টি অধ্যায়ের সমস্যা সমাধান প্র্যাকটিস করো।");
  } else if (completion < 70) {
    actions.push("পুরোনো অধ্যায়গুলো রিভিশন দিতে শুরু করো।");
    actions.push("প্রতিদিন ১ ঘণ্টা MCQ প্র্যাকটিস করো।");
  } else {
    actions.push("মডেল টেস্ট দেওয়া শুরু করো।");
    actions.push("দুর্বল টপিকগুলো চিহ্নিত করে সেগুলোতে ফোকাস করো।");
  }
  
  if (monthsRemaining <= 3) {
    actions.push("বিগত বছরের প্রশ্ন সলভ করা শুরু করো—এটা অত্যন্ত জরুরি।");
  }
  
  return actions.slice(0, 2);
};

const getRiskLabel = (riskLevel: string): string => {
  switch (riskLevel) {
    case "safe":
      return "নিরাপদ অবস্থানে ✅";
    case "slightly_behind":
      return "সামান্য পিছিয়ে ⚠️";
    case "high_risk":
      return "ঝুঁকিপূর্ণ অবস্থানে 🚨";
    default:
      return "";
  }
};

interface StudyCoachSettings {
  id: string;
  user_id: string;
  batch: string;
  months_remaining: number;
  completion_percentage: number;
  risk_level: string;
  notification_email: string;
  notifications_enabled: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured, skipping email notifications");
      return new Response(
        JSON.stringify({ message: "Email notifications not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users with notifications enabled
    const { data: settings, error: settingsError } = await supabase
      .from("study_coach_settings")
      .select("*")
      .eq("notifications_enabled", true)
      .not("notification_email", "is", null);

    if (settingsError) {
      throw new Error(`Failed to fetch settings: ${settingsError.message}`);
    }

    if (!settings || settings.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users with notifications enabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tone = getTodayTone();
    let emailsSent = 0;

    for (const userSettings of settings as StudyCoachSettings[]) {
      const messages = getMotivationalMessages(
        userSettings.months_remaining,
        userSettings.risk_level,
        tone
      );
      const actions = getTodayActions(
        userSettings.completion_percentage,
        userSettings.months_remaining
      );
      
      // Pick random messages for the email
      const selectedMessages = messages
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .status-card { background-color: ${userSettings.risk_level === 'safe' ? '#d4edda' : userSettings.risk_level === 'slightly_behind' ? '#fff3cd' : '#f8d7da'}; 
                          border-radius: 10px; padding: 20px; margin-bottom: 20px; text-align: center; }
            .status-label { font-size: 18px; font-weight: bold; color: ${userSettings.risk_level === 'safe' ? '#155724' : userSettings.risk_level === 'slightly_behind' ? '#856404' : '#721c24'}; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat { text-align: center; }
            .stat-value { font-size: 28px; font-weight: bold; color: #667eea; }
            .stat-label { font-size: 12px; color: #666; }
            .messages { background-color: #f8f9fa; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
            .message { padding: 10px 0; border-bottom: 1px solid #e9ecef; }
            .message:last-child { border-bottom: none; }
            .actions { background-color: #e8f4fd; border-radius: 10px; padding: 20px; }
            .action { padding: 8px 0; color: #0056b3; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📚 HSC Study Coach</h1>
              <p>তোমার দৈনিক মোটিভেশন</p>
            </div>
            <div class="content">
              <div class="status-card">
                <div class="status-label">${getRiskLabel(userSettings.risk_level)}</div>
              </div>
              
              <div class="stats">
                <div class="stat">
                  <div class="stat-value">${userSettings.completion_percentage}%</div>
                  <div class="stat-label">সিলেবাস সম্পন্ন</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${userSettings.months_remaining}</div>
                  <div class="stat-label">মাস বাকি</div>
                </div>
              </div>
              
              <div class="messages">
                <h3 style="margin-top: 0; color: #333;">💡 আজকের মোটিভেশন</h3>
                ${selectedMessages.map(msg => `<div class="message">• ${msg}</div>`).join('')}
              </div>
              
              <div class="actions">
                <h3 style="margin-top: 0; color: #0056b3;">🎯 আজকের কাজ</h3>
                ${actions.map(action => `<div class="action">✓ ${action}</div>`).join('')}
              </div>
            </div>
            <div class="footer">
              <p>HSC Tracker থেকে পাঠানো হয়েছে</p>
              <p>নোটিফিকেশন বন্ধ করতে অ্যাপে গিয়ে সেটিংস পরিবর্তন করো</p>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "HSC Study Coach <onboarding@resend.dev>",
            to: [userSettings.notification_email],
            subject: `📚 আজকের পড়াশোনার রিমাইন্ডার - ${getRiskLabel(userSettings.risk_level)}`,
            html: emailHtml,
          }),
        });

        if (emailResponse.ok) {
          emailsSent++;
          
          // Update last notification sent timestamp
          await supabase
            .from("study_coach_settings")
            .update({ last_notification_sent: new Date().toISOString() })
            .eq("id", userSettings.id);
        } else {
          const errorData = await emailResponse.text();
          console.error(`Failed to send email to ${userSettings.notification_email}:`, errorData);
        }
      } catch (emailError) {
        console.error(`Error sending email to ${userSettings.notification_email}:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({ message: `Successfully sent ${emailsSent} notification emails` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-study-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
