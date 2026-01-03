import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { physicsData } from "@/data/physicsData";
import { physics2ndData } from "@/data/physics2ndData";
import { chemistryData } from "@/data/chemistryData";
import { chemistry2ndData } from "@/data/chemistry2ndData";
import { higherMathData } from "@/data/higherMathData";
import { higherMath2ndData } from "@/data/higherMath2ndData";
import { biologyData } from "@/data/biologyData";
import { biology2ndData } from "@/data/biology2ndData";
import { ictData } from "@/data/ictData";
import { english1stData } from "@/data/english1stData";
import { english2ndData } from "@/data/english2ndData";
import { bangla1stData } from "@/data/bangla1stData";
import { bangla2ndData } from "@/data/bangla2ndData";

export interface SubjectProgress {
  id: string;
  name: string;
  fullName: string;
  progress: number;
  color: string;
}

export interface ProgressSnapshot {
  overallProgress: number;
  subjects: SubjectProgress[];
  recordMap: Map<string, string>;
  loading: boolean;
}

// All subjects configuration - single source of truth
export const ALL_SUBJECTS = [
  { data: physicsData, color: "hsl(var(--primary))", displayName: "Physics 1st", id: "physics1" },
  { data: physics2ndData, color: "hsl(217 91% 60%)", displayName: "Physics 2nd", id: "physics2" },
  { data: chemistryData, color: "hsl(142 76% 36%)", displayName: "Chemistry 1st", id: "chemistry1" },
  { data: chemistry2ndData, color: "hsl(142 71% 45%)", displayName: "Chemistry 2nd", id: "chemistry2" },
  { data: higherMathData, color: "hsl(262 83% 58%)", displayName: "HM 1st", id: "higherMath1" },
  { data: higherMath2ndData, color: "hsl(262 78% 68%)", displayName: "HM 2nd", id: "higherMath2" },
  { data: biologyData, color: "hsl(25 95% 53%)", displayName: "Biology 1st", id: "biology1" },
  { data: biology2ndData, color: "hsl(25 90% 63%)", displayName: "Biology 2nd", id: "biology2" },
  { data: ictData, color: "hsl(199 89% 48%)", displayName: "ICT", id: "ict" },
  { data: english1stData, color: "hsl(340 82% 52%)", displayName: "English 1st", id: "english1" },
  { data: english2ndData, color: "hsl(280 70% 55%)", displayName: "English 2nd", id: "english2" },
  { data: bangla1stData, color: "hsl(45 93% 47%)", displayName: "বাংলা ১ম", id: "bangla1" },
  { data: bangla2ndData, color: "hsl(35 90% 50%)", displayName: "বাংলা ২য়", id: "bangla2" },
];

// Calculate progress from a record map - shared logic
export function calculateProgressFromRecords(
  recordMap: Map<string, string>
): { overallProgress: number; subjects: SubjectProgress[] } {
  let totalCompleted = 0;
  let totalItems = 0;
  const subjects: SubjectProgress[] = [];

  ALL_SUBJECTS.forEach(({ data: subject, color, displayName, id }) => {
    let subjectCompleted = 0;
    let subjectTotal = 0;

    subject.chapters.forEach((chapter) => {
      chapter.activities.forEach((activity) => {
        if (activity.name !== "Total Lec") {
          totalItems++;
          subjectTotal++;
          const status = recordMap.get(`${subject.id}-${chapter.name}-${activity.name}`);
          if (status === "Done") {
            totalCompleted++;
            subjectCompleted++;
          }
        }
      });
    });

    subjects.push({
      id,
      name: displayName,
      fullName: subject.name,
      progress: subjectTotal > 0 ? Math.round((subjectCompleted / subjectTotal) * 100) : 0,
      color,
    });
  });

  return {
    overallProgress: totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0,
    subjects,
  };
}

// Hook for current user's progress with realtime updates
export const useProgressSnapshot = (): ProgressSnapshot => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ["progress_snapshot", user?.id ?? null];

  const { data, isLoading } = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data: records } = await supabase
        .from("study_records")
        .select("subject, chapter, activity, status")
        .eq("user_id", user!.id)
        .eq("type", "status");

      const recordMap = new Map<string, string>();
      records?.forEach((r) => {
        recordMap.set(`${r.subject}-${r.chapter}-${r.activity}`, r.status || "");
      });

      return recordMap;
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("progress_snapshot_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "study_records",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Invalidate query on any change
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, queryKey]);

  const recordMap = data ?? new Map<string, string>();
  const calculated = useMemo(() => calculateProgressFromRecords(recordMap), [recordMap]);

  if (!user) {
    return {
      overallProgress: 0,
      subjects: ALL_SUBJECTS.map(({ displayName, data, color, id }) => ({
        id,
        name: displayName,
        fullName: data.name,
        progress: 0,
        color,
      })),
      recordMap: new Map(),
      loading: false,
    };
  }

  return {
    overallProgress: calculated.overallProgress,
    subjects: calculated.subjects,
    recordMap,
    loading: isLoading,
  };
};

// Calculate progress for any user given their study records
export function calculateUserProgress(
  records: Array<{ subject: string; chapter: string; activity: string; status: string | null }>
): { overallProgress: number; subjects: Record<string, number> } {
  const recordMap = new Map<string, string>();
  records.forEach((r) => {
    recordMap.set(`${r.subject}-${r.chapter}-${r.activity}`, r.status || "");
  });

  const result = calculateProgressFromRecords(recordMap);
  
  const subjectsRecord: Record<string, number> = {};
  result.subjects.forEach((s) => {
    subjectsRecord[s.id] = s.progress;
  });

  return {
    overallProgress: result.overallProgress,
    subjects: subjectsRecord,
  };
}
