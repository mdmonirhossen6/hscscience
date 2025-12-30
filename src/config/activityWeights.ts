// Weighted Progress System Configuration
// Science subjects: CQ internal = 50%, but capped at 35% contribution
// Math subjects: No scaling needed, totals 100%
// English Reading: 7 activities per unit, normalized to 100%
// English Writing: 4 activities per chapter, normalized to 100%

export interface SectionConfig {
  max: number;
  internalMax?: number; // For scaling (science CQ only)
  activities: Record<string, number>;
}

export interface SubjectConfig {
  sections: {
    core: SectionConfig;
    mcq: SectionConfig;
    cq: SectionConfig;
    final?: SectionConfig; // Math only
  };
}

// Physics / Chemistry / Biology / ICT
// Core Study: 30% | MCQ: 20% | CQ: 50% = 100% total (no scaling needed)
export const scienceConfig: SubjectConfig = {
  sections: {
    core: {
      max: 30,
      activities: {
        "Lecture": 15,
        "Notes": 15,
      },
    },
    mcq: {
      max: 20,
      activities: {
        "MCQ Practice": 15,
        "MCQ Summary": 5,
      },
    },
    cq: {
      max: 50,
      activities: {
        "ক": 5,
        "খ": 10,
        "CQ Summary": 5,
        "Written CQ": 20,
        "Revision": 5,
        "Exam": 5,
      },
    },
  },
};

// Higher Math 1st & 2nd Paper
// Core Study: 30% | MCQ: 20% | CQ/Problems: 40% | Final Layer: 10%
export const mathConfig: SubjectConfig = {
  sections: {
    core: {
      max: 30,
      activities: {
        "Lecture": 15,
        "Notes": 15,
      },
    },
    mcq: {
      max: 20,
      activities: {
        "MCQ Practice": 15,
        "MCQ Summary": 5,
      },
    },
    cq: {
      max: 40,
      activities: {
        "CQ Practice": 15,
        "CQ Summary": 5,
        "Book Problems": 20,
      },
    },
    final: {
      max: 10,
      activities: {
        "Revision": 5,
        "Exam": 5,
      },
    },
  },
};

// English 1st Paper - Combined Reading (60%) + Writing (40%)
// Reading: 7 activities per unit (MCQ, Open-ended, Info Transfer, Summarizing, Cloze with/without clues, Rearranging)
// Writing: 4 activities per chapter (Practice, Summary, Final Draft, Revision)
export const english1stConfig: SubjectConfig = {
  sections: {
    core: {
      max: 30,
      activities: {
        "MCQ": 8,
        "Summarizing": 8,
        "Practice": 14,
      },
    },
    mcq: {
      max: 25,
      activities: {
        "Open-ended": 12,
        "Info Transfer": 8,
        "Summary": 5,
      },
    },
    cq: {
      max: 45,
      activities: {
        "Cloze (with clues)": 10,
        "Cloze (without clues)": 10,
        "Rearranging": 10,
        "Final Draft": 10,
        "Revision": 5,
      },
    },
  },
};

// English 2nd Paper - Grammar (60%) + Composition (40%)
// Grammar chapters (1-12): Practice, Rules Summary, Mock Test, Revision
// Composition chapters (13-16): Practice, Draft Writing, Final Copy, Revision
export const english2ndConfig: SubjectConfig = {
  sections: {
    core: {
      max: 30,
      activities: {
        "Practice": 30,
      },
    },
    mcq: {
      max: 25,
      activities: {
        "Rules Summary": 15,
        "Draft Writing": 10,
      },
    },
    cq: {
      max: 45,
      activities: {
        "Mock Test": 15,
        "Final Copy": 15,
        "Revision": 15,
      },
    },
  },
};

// Get the appropriate config based on subject ID
export const getSubjectConfig = (subjectId: string): SubjectConfig => {
  const mathSubjects = ["highermath", "highermath2nd"];
  const english1stSubjects = ["english1st"];
  const english2ndSubjects = ["english2nd"];
  
  if (mathSubjects.includes(subjectId)) return mathConfig;
  if (english1stSubjects.includes(subjectId)) return english1stConfig;
  if (english2ndSubjects.includes(subjectId)) return english2ndConfig;
  
  return scienceConfig;
};
