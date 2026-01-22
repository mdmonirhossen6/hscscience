import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Share2, 
  FileImage, 
  FileText, 
  MessageCircleQuestion,
  Copy,
  Check,
  Calendar,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { MonthlyPlan } from "@/hooks/useMonthlyPlans";

interface SharePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: MonthlyPlan[];
  completedActivitiesMap: Map<string, string[]>;
  currentMonth: Date;
  userEmail?: string;
}

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PAGE_MARGIN = 40;

export function SharePlanDialog({
  open,
  onOpenChange,
  plans,
  completedActivitiesMap,
  currentMonth,
  userEmail,
}: SharePlanDialogProps) {
  const [activeTab, setActiveTab] = useState("share");
  const [doubt, setDoubt] = useState("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const monthYear = format(currentMonth, "MMMM yyyy", { locale: bn });

  // Calculate stats
  const totalPlanned = plans.reduce((acc, p) => acc + (p.planned_activities?.length || 0), 0);
  let totalCompleted = 0;
  plans.forEach((plan) => {
    const completed = completedActivitiesMap.get(`${plan.subject}-${plan.chapter}`) || [];
    totalCompleted += plan.planned_activities.filter((a) => completed.includes(a)).length;
  });
  const progressPercent = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;

  // Generate shareable text summary
  const generateTextSummary = () => {
    let text = `📅 ${monthYear} — মাসিক পড়ার প্ল্যান\n`;
    text += `━━━━━━━━━━━━━━━━━\n`;
    text += `📊 অগ্রগতি: ${progressPercent}% (${totalCompleted}/${totalPlanned})\n\n`;

    // Group by subject
    const bySubject = plans.reduce((acc, p) => {
      if (!acc[p.subject]) acc[p.subject] = [];
      acc[p.subject].push(p);
      return acc;
    }, {} as Record<string, MonthlyPlan[]>);

    Object.entries(bySubject).forEach(([subject, subjectPlans]) => {
      text += `📚 ${subject}\n`;
      subjectPlans.forEach((plan) => {
        const completed = completedActivitiesMap.get(`${plan.subject}-${plan.chapter}`) || [];
        const done = plan.planned_activities.filter((a) => completed.includes(a)).length;
        const icon = done === plan.planned_activities.length ? "✅" : "🔘";
        text += `   ${icon} ${plan.chapter} (${done}/${plan.planned_activities.length})\n`;
      });
      text += "\n";
    });

    text += `━━━━━━━━━━━━━━━━━\n`;
    text += `HSC Science Tracker থেকে তৈরি`;

    return text;
  };

  const handleCopyText = async () => {
    const text = generateTextSummary();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("কপি হয়েছে!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareNative = async () => {
    const text = generateTextSummary();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${monthYear} — মাসিক পড়ার প্ল্যান`,
          text: text,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      handleCopyText();
    }
  };

  // Generate Image of weekly plan
  const generateWeeklyImage = async () => {
    setGenerating(true);
    try {
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.width = "600px";
      container.style.padding = "24px";
      container.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
      container.style.fontFamily = "'Noto Sans Bengali', 'Inter', sans-serif";
      container.style.borderRadius = "16px";
      document.body.appendChild(container);

      // Week range (current week)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekPlans = plans.slice(0, 5); // Take first 5 for weekly

      container.innerHTML = `
        <div style="color: white;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">সাপ্তাহিক প্ল্যান</div>
            <div style="font-size: 20px; font-weight: 700;">${format(weekStart, "MMM d", { locale: bn })} - ${format(weekEnd, "MMM d", { locale: bn })}</div>
          </div>
          
          <div style="display: flex; justify-content: center; gap: 24px; margin-bottom: 20px;">
            <div style="text-align: center;">
              <div style="font-size: 32px; font-weight: 700;">${weekPlans.length}</div>
              <div style="font-size: 12px; opacity: 0.8;">অধ্যায়</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 32px; font-weight: 700;">${progressPercent}%</div>
              <div style="font-size: 12px; opacity: 0.8;">সম্পন্ন</div>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 16px;">
            ${weekPlans.map((p) => {
              const completed = completedActivitiesMap.get(`${p.subject}-${p.chapter}`) || [];
              const done = p.planned_activities.filter((a) => completed.includes(a)).length;
              const total = p.planned_activities.length;
              return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                  <div>
                    <div style="font-size: 12px; opacity: 0.7;">${p.subject}</div>
                    <div style="font-size: 14px; font-weight: 500;">${p.chapter.substring(0, 30)}${p.chapter.length > 30 ? '...' : ''}</div>
                  </div>
                  <div style="
                    background: ${done === total ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.2)'};
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                  ">${done}/${total}</div>
                </div>
              `;
            }).join("")}
          </div>

          <div style="text-align: center; margin-top: 16px; font-size: 11px; opacity: 0.6;">
            HSC Science Tracker
          </div>
        </div>
      `;

      const canvas = await html2canvas(container, { scale: 2, useCORS: true });
      document.body.removeChild(container);

      // Download image
      const link = document.createElement("a");
      link.download = `weekly-plan-${format(new Date(), "yyyy-MM-dd")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success("সাপ্তাহিক প্ল্যান ডাউনলোড হয়েছে!");
    } catch (error) {
      console.error(error);
      toast.error("ইমেজ তৈরি করতে সমস্যা হয়েছে");
    } finally {
      setGenerating(false);
    }
  };

  // Generate doubt summary for sharing
  const generateDoubtMessage = () => {
    if (!doubt.trim()) {
      toast.error("আপনার প্রশ্ন লিখুন");
      return null;
    }

    let text = `🎓 HSC Science — সমস্যা সমাধান\n`;
    text += `━━━━━━━━━━━━━━━━━\n\n`;
    text += `📅 মাস: ${monthYear}\n`;
    text += `📊 অগ্রগতি: ${progressPercent}%\n\n`;
    text += `❓ সমস্যা:\n${doubt}\n\n`;
    
    // Add context from recent plans
    if (plans.length > 0) {
      text += `📚 বর্তমানে পড়ছি:\n`;
      plans.slice(0, 3).forEach((p) => {
        text += `• ${p.subject}: ${p.chapter}\n`;
      });
      text += "\n";
    }

    text += `━━━━━━━━━━━━━━━━━\n`;
    text += `HSC Science Tracker থেকে`;

    return text;
  };

  const handleSendDoubt = async () => {
    const message = generateDoubtMessage();
    if (!message) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "HSC সমস্যা সমাধান",
          text: message,
        });
        setDoubt("");
        toast.success("শেয়ার হয়েছে!");
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(message);
      toast.success("কপি হয়েছে! এখন শেয়ার করতে পারবেন");
      setDoubt("");
    }
  };

  const handleCopyDoubt = async () => {
    const message = generateDoubtMessage();
    if (!message) return;
    
    await navigator.clipboard.writeText(message);
    toast.success("কপি হয়েছে!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            শেয়ার ও সাহায্য
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="share" className="gap-2">
              <Share2 className="h-4 w-4" />
              শেয়ার করুন
            </TabsTrigger>
            <TabsTrigger value="doubt" className="gap-2">
              <MessageCircleQuestion className="h-4 w-4" />
              সমস্যা জিজ্ঞাসা
            </TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-4 mt-4">
            {/* Current month stats */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                {monthYear}
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-2xl font-bold text-primary">{progressPercent}%</div>
                  <div className="text-xs text-muted-foreground">সম্পন্ন</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{plans.length}</div>
                  <div className="text-xs text-muted-foreground">অধ্যায়</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{totalCompleted}/{totalPlanned}</div>
                  <div className="text-xs text-muted-foreground">কাজ</div>
                </div>
              </div>
            </div>

            {/* Share options */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">মাসিক প্ল্যান শেয়ার করুন</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleShareNative}
                  className="h-auto py-3 flex-col gap-1"
                >
                  <Share2 className="h-5 w-5 text-primary" />
                  <span className="text-xs">শেয়ার করুন</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyText}
                  className="h-auto py-3 flex-col gap-1"
                >
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  <span className="text-xs">কপি করুন</span>
                </Button>
              </div>
            </div>

            {/* Download options */}
            <div className="space-y-3 pt-2 border-t">
              <h4 className="text-sm font-medium">ডাউনলোড করুন</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={generateWeeklyImage}
                  disabled={generating || plans.length === 0}
                  className="h-auto py-3 flex-col gap-1"
                >
                  {generating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <FileImage className="h-5 w-5 text-purple-500" />
                  )}
                  <span className="text-xs">সাপ্তাহিক (Image)</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-auto py-3 flex-col gap-1"
                  disabled={plans.length === 0}
                >
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="text-xs">মাসিক (PDF)</span>
                  <Badge variant="secondary" className="text-[10px] mt-1">
                    Planning Page
                  </Badge>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                মাসিক PDF ডাউনলোড করতে Monthly Planning পেজে যান
              </p>
            </div>
          </TabsContent>

          <TabsContent value="doubt" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  আপনার পড়াশোনার সমস্যা লিখুন। এটি আপনার বর্তমান প্রগ্রেস সহ শেয়ার করা যাবে।
                </p>
              </div>

              <Textarea
                placeholder="যেমন: পদার্থবিজ্ঞানের সরল দোলন অধ্যায়ের সমীকরণ বুঝতে পারছি না..."
                value={doubt}
                onChange={(e) => setDoubt(e.target.value)}
                rows={4}
                className="resize-none"
              />

              {plans.length > 0 && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-2">সংযুক্ত হবে:</p>
                  <div className="flex flex-wrap gap-1">
                    {plans.slice(0, 3).map((p, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {p.subject}
                      </Badge>
                    ))}
                    {plans.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{plans.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleCopyDoubt}
                  disabled={!doubt.trim()}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  কপি করুন
                </Button>
                <Button
                  onClick={handleSendDoubt}
                  disabled={!doubt.trim()}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  শেয়ার করুন
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                কপি করে WhatsApp, Messenger বা অন্য অ্যাপে পাঠান
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
