import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, PenLine } from "lucide-react";
import { Link } from "react-router-dom";
import { ALL_SUBJECTS } from "@/hooks/useProgressSnapshot";

const SUBJECT_OPTIONS = ALL_SUBJECTS.map(s => ({ id: s.data.id, name: s.displayName }));

interface AskDoubtInputProps {
  onPost: (subject: string, question: string, chapter?: string) => Promise<void>;
}

export function AskDoubtInput({ onPost }: AskDoubtInputProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [question, setQuestion] = useState("");
  const [posting, setPosting] = useState(false);

  if (!user) {
    return (
      <div className="glass-card p-4 flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">?</AvatarFallback>
        </Avatar>
        <Link
          to="/auth"
          className="flex-1 rounded-full bg-muted/50 border border-border/50 px-4 py-2.5 text-sm text-muted-foreground hover:border-primary/30 transition-colors"
        >
          Sign in to ask a doubt...
        </Link>
      </div>
    );
  }

  const handlePost = async () => {
    if (!subject || !question.trim()) return;
    setPosting(true);
    await onPost(subject, question.trim(), chapter.trim() || undefined);
    setSubject("");
    setChapter("");
    setQuestion("");
    setPosting(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="glass-card p-3 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-all group">
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {user.email?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 rounded-full bg-muted/40 border border-border/40 px-4 py-2.5 text-sm text-muted-foreground group-hover:border-primary/30 transition-colors">
            Ask a doubt...
          </div>
          <Button size="sm" variant="ghost" className="text-primary">
            <PenLine className="h-4 w-4" />
          </Button>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="p-4 pb-3 border-b border-border/30">
          <DialogTitle className="text-base flex items-center gap-2">
            <PenLine className="h-4 w-4 text-primary" />
            Ask a Doubt
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-3">
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="bg-muted/30 border-border/40">
              <SelectValue placeholder="Select Subject *" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECT_OPTIONS.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input
            type="text"
            placeholder="Chapter (optional)"
            value={chapter}
            onChange={e => setChapter(e.target.value)}
            className="flex h-10 w-full rounded-md border border-border/40 bg-muted/30 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          <Textarea
            placeholder="Describe your doubt... *"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="bg-muted/30 border-border/40 min-h-[120px] resize-none"
            maxLength={2000}
          />

          <Button
            onClick={handlePost}
            disabled={!subject || !question.trim() || posting}
            className="w-full"
          >
            {posting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Post Doubt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
