import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, TrendingUp, Star, Flame } from "lucide-react";

interface ProgressCelebrationProps {
  previousProgress: number;
  currentProgress: number;
  onClose: () => void;
}

const MOTIVATIONAL_MESSAGES = [
  { message: "You're on fire! 🔥", subtext: "Keep pushing forward!" },
  { message: "Amazing progress! 🌟", subtext: "Every step counts!" },
  { message: "You're crushing it! 💪", subtext: "Success is built one day at a time!" },
  { message: "Fantastic work! 🎯", subtext: "Your dedication is paying off!" },
  { message: "Keep going! 🚀", subtext: "You're closer to your goal!" },
  { message: "Brilliant effort! ✨", subtext: "Hard work always pays off!" },
  { message: "You're unstoppable! 🏆", subtext: "Champions never give up!" },
  { message: "Incredible! 🎉", subtext: "Your future self will thank you!" },
];

export function ProgressCelebration({
  previousProgress,
  currentProgress,
  onClose,
}: ProgressCelebrationProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [randomMessage] = useState(
    () => MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
  );

  const progressGain = currentProgress - previousProgress;

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  // Auto-close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-2 border-primary/50 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated sparkles */}
          <Sparkles className="absolute top-4 left-4 h-6 w-6 text-yellow-500 animate-pulse" />
          <Star className="absolute top-8 right-8 h-5 w-5 text-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
          <Sparkles className="absolute bottom-12 left-8 h-4 w-4 text-primary/60 animate-pulse" style={{ animationDelay: "0.4s" }} />
          <Star className="absolute bottom-8 right-12 h-6 w-6 text-yellow-400 animate-bounce" style={{ animationDelay: "0.6s" }} />
        </div>

        <DialogHeader className="text-center space-y-4 pt-4">
          <div className="mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full p-4 w-20 h-20 flex items-center justify-center shadow-lg shadow-primary/30">
            <Trophy className="h-10 w-10 text-primary-foreground" />
          </div>
          
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {randomMessage.message}
          </DialogTitle>
          
          <DialogDescription className="text-base text-muted-foreground">
            {randomMessage.subtext}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-6">
          {/* Progress display */}
          <div className="flex items-center gap-4 bg-muted/50 rounded-2xl px-6 py-4 border border-border/50">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Before</p>
              <p className="text-2xl font-bold text-muted-foreground">{previousProgress}%</p>
            </div>
            
            <TrendingUp className="h-6 w-6 text-green-500" />
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Now</p>
              <p className="text-2xl font-bold text-primary">{currentProgress}%</p>
            </div>
          </div>

          {/* Progress gain badge */}
          <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full px-4 py-2 border border-green-500/30">
            <Flame className="h-4 w-4" />
            <span className="font-semibold">+{progressGain}% Progress</span>
          </div>
        </div>

        <Button 
          onClick={handleClose} 
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          Keep Going! 🚀
        </Button>
      </DialogContent>
    </Dialog>
  );
}
