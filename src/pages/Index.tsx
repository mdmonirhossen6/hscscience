import { ProgressTracker } from "@/components/ProgressTracker";
import { BookOpen } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                PHYSICS 1st Year
              </h1>
              <p className="text-muted-foreground mt-1">Track your study progress</p>
            </div>
          </div>
        </header>

        <div className="mb-6 p-4 bg-accent/50 rounded-xl border border-accent">
          <p className="text-sm text-accent-foreground">
            <strong>How to use:</strong> Click on any status badge to cycle through: Empty → Not
            Started → In Progress → Done
          </p>
        </div>

        <ProgressTracker />
      </div>
    </div>
  );
};

export default Index;
