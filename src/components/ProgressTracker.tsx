import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Loader2, 
  LinkIcon, 
  ExternalLink, 
  CheckSquare, 
  Square,
  ChevronDown,
  ChevronUp 
} from "lucide-react";
import { Chapter, Status } from "@/types/tracker";
import { useStudyRecords } from "@/hooks/useStudyRecords";
import { useAuth } from "@/contexts/AuthContext";
import { useChapterResources } from "@/hooks/useChapterResources";
import { useChapterCompletions } from "@/hooks/useChapterCompletions";
import { ResourceModal } from "@/components/ResourceModal";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const StatusButton = ({ 
  status, 
  activityName,
  onClick, 
  disabled 
}: { 
  status: Status; 
  activityName: string;
  onClick: () => void; 
  disabled?: boolean;
}) => {
  const getStatusConfig = (s: Status) => {
    switch (s) {
      case "Done":
        return {
          icon: CheckCircle2,
          className: "status-done",
        };
      case "In progress":
        return {
          icon: Clock,
          className: "status-progress",
        };
      case "Not Started":
        return {
          icon: Circle,
          className: "status-pending",
        };
      default:
        return {
          icon: Circle,
          className: "bg-muted/50 text-muted-foreground/50",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <button
      className={cn(
        "activity-button w-full",
        config.className,
        disabled && "opacity-50 pointer-events-none"
      )}
      onClick={disabled ? undefined : onClick}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{activityName}</span>
    </button>
  );
};

interface ProgressTrackerProps {
  initialChapters: Chapter[];
  subjectId: string;
}

export const ProgressTracker = ({ initialChapters, subjectId }: ProgressTrackerProps) => {
  const { user } = useAuth();
  const { loading, saveStatus, saveClassNumber, getStatus, getClassNumber } = useStudyRecords(subjectId);
  const { getResource, saveResource, deleteResource, loading: resourcesLoading } = useChapterResources(subjectId);
  const { isChapterCompleted, markChapterCompleted, loading: completionsLoading } = useChapterCompletions();
  
  const [localStatuses, setLocalStatuses] = useState<Record<string, Status>>({});
  const [localClassNumbers, setLocalClassNumbers] = useState<Record<string, string>>({});
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  useEffect(() => {
    const statuses: Record<string, Status> = {};
    const classNumbers: Record<string, string> = {};
    
    initialChapters.forEach((chapter) => {
      chapter.activities.forEach((activity) => {
        const key = `${chapter.name}-${activity.name}`;
        if (activity.name === "Total Lec") {
          classNumbers[chapter.name] = getClassNumber(chapter.name);
        } else {
          statuses[key] = getStatus(chapter.name, activity.name);
        }
      });
    });
    
    setLocalStatuses(statuses);
    setLocalClassNumbers(classNumbers);
  }, [initialChapters, getStatus, getClassNumber]);

  const cycleStatus = async (chapterName: string, activityName: string) => {
    if (!user) return;
    
    const key = `${chapterName}-${activityName}`;
    const statusCycle: Status[] = ["", "Not Started", "In progress", "Done"];
    const currentStatus = localStatuses[key] || "";
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    const newStatus = statusCycle[nextIndex];
    
    setLocalStatuses((prev) => ({ ...prev, [key]: newStatus }));
    await saveStatus(chapterName, activityName, newStatus);
  };

  const handleClassNumberChange = async (chapterName: string, value: string) => {
    if (!user) return;
    setLocalClassNumbers((prev) => ({ ...prev, [chapterName]: value }));
    const numValue = value === "" ? null : parseInt(value, 10);
    await saveClassNumber(chapterName, numValue);
  };

  const getChapterProgress = (chapter: Chapter) => {
    let completedCount = 0;
    let totalCount = 0;
    
    chapter.activities.forEach((activity) => {
      if (activity.name !== "Total Lec") {
        totalCount++;
        const key = `${chapter.name}-${activity.name}`;
        if (localStatuses[key] === "Done") {
          completedCount++;
        }
      }
    });
    
    return { completedCount, totalCount, percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0 };
  };

  const toggleChapter = (chapterName: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterName)) {
        next.delete(chapterName);
      } else {
        next.add(chapterName);
      }
      return next;
    });
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please sign in to track your progress.</p>
      </div>
    );
  }

  if (loading || resourcesLoading || completionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const openResourceModal = (chapterName: string) => {
    setSelectedChapter(chapterName);
    setResourceModalOpen(true);
  };

  const handleToggleComplete = async (chapterName: string) => {
    const isCompleted = isChapterCompleted(subjectId, chapterName);
    await markChapterCompleted(subjectId, chapterName, !isCompleted);
  };

  const selectedResource = selectedChapter ? getResource(subjectId, selectedChapter) : null;

  return (
    <>
      <div className="space-y-3">
        {initialChapters.map((chapter) => {
          const { completedCount, totalCount, percentage } = getChapterProgress(chapter);
          const resource = getResource(subjectId, chapter.name);
          const completed = isChapterCompleted(subjectId, chapter.name);
          const isExpanded = expandedChapters.has(chapter.name);
          
          return (
            <Collapsible 
              key={chapter.id} 
              open={isExpanded} 
              onOpenChange={() => toggleChapter(chapter.name)}
            >
              <div
                className={cn(
                  "bg-card/60 rounded-xl overflow-hidden transition-all",
                  completed && "bg-success/10 ring-1 ring-success/30"
                )}
              >
                {/* Chapter Header */}
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center gap-3 p-4 min-h-[64px]">
                    {/* Complete checkbox */}
                    <button
                      className="flex-shrink-0 p-1 -m-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleComplete(chapter.name);
                      }}
                    >
                      {completed ? (
                        <CheckSquare className="h-6 w-6 text-success" />
                      ) : (
                        <Square className="h-6 w-6 text-muted-foreground" />
                      )}
                    </button>
                    
                    {/* Chapter info */}
                    <div className="flex-1 min-w-0 text-left">
                      <h3 className={cn(
                        "font-medium text-foreground truncate text-base",
                        completed && "line-through text-muted-foreground"
                      )}>
                        {chapter.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {completedCount}/{totalCount}
                        </span>
                        <div className="flex-1 max-w-[80px] h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{percentage}%</span>
                      </div>
                    </div>

                    {/* Resource badge */}
                    {resource && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-2 -m-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-5 w-5 text-accent" />
                      </a>
                    )}
                    
                    {/* Expand icon */}
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>

                {/* Expanded Content */}
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-4">
                    {/* Activity Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {chapter.activities.map((activity, idx) => {
                        const key = `${chapter.name}-${activity.name}`;
                        
                        if (activity.name === "Total Lec") {
                          return (
                            <div key={idx} className="col-span-2 flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                              <span className="text-sm text-muted-foreground">Total Lectures:</span>
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={localClassNumbers[chapter.name] || ""}
                                onChange={(e) => handleClassNumberChange(chapter.name, e.target.value)}
                                className="h-9 w-20 text-sm text-center bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                          );
                        }
                        
                        return (
                          <StatusButton
                            key={idx}
                            status={localStatuses[key] || ""}
                            activityName={activity.name}
                            onClick={() => cycleStatus(chapter.name, activity.name)}
                          />
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-border/50">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openResourceModal(chapter.name)}
                        className="flex-1 min-h-[40px]"
                      >
                        <LinkIcon className="h-4 w-4 mr-1.5" />
                        {resource ? "Edit Resource" : "Add Resource"}
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>

      <ResourceModal
        open={resourceModalOpen}
        onOpenChange={setResourceModalOpen}
        chapterName={selectedChapter || ""}
        subjectId={subjectId}
        existingResource={selectedResource ? { title: selectedResource.title, url: selectedResource.url } : null}
        onSave={async (title, url) => {
          if (!selectedChapter) return { error: "No chapter selected" };
          return saveResource(subjectId, selectedChapter, title, url);
        }}
        onDelete={() => {
          if (selectedChapter) {
            deleteResource(subjectId, selectedChapter);
          }
        }}
      />
    </>
  );
};
