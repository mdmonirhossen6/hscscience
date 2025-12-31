import { SubjectData } from "@/types/tracker";

// Group A: Grammar Core (01-12) - Rule-based + practice-heavy
const GRAMMAR_ACTIVITIES = [
  "Lecture",
  "Practice Sets",
  "Model Answers",
  "Error Log",
  "Revision",
  "Final Practice",
];

// Group B: Functional Writing (13-14) - Format-driven writing
const FUNCTIONAL_WRITING_ACTIVITIES = [
  "Lecture",
  "Practice Drafts",
  "Model Samples",
  "Final Draft",
  "Expressions",
  "Revision",
];

// Group C: Creative Writing (15-16) - Idea + structure + language
const CREATIVE_WRITING_ACTIVITIES = [
  "Lecture",
  "Idea Planning",
  "Practice Writing",
  "Model Reading",
  "Final Draft",
  "Revision",
];

export const english2ndData: SubjectData = {
  id: "english2nd",
  name: "English 2nd Paper",
  activities: [
    ...GRAMMAR_ACTIVITIES,
    ...FUNCTIONAL_WRITING_ACTIVITIES.filter(a => !GRAMMAR_ACTIVITIES.includes(a)),
    ...CREATIVE_WRITING_ACTIVITIES.filter(a => !GRAMMAR_ACTIVITIES.includes(a) && !FUNCTIONAL_WRITING_ACTIVITIES.includes(a)),
  ],
  chapters: [
    // Group A: Grammar Core (01-12)
    {
      id: 1,
      name: "01. Article (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "02. Preposition (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "03. Gap Filling with Clues (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "04. Completing Sentences (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "05. Right Form of Verbs (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "06. Changing Sentences (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 7,
      name: "07. Narration (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 8,
      name: "08. Pronoun Reference (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 9,
      name: "09. Modifiers (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 10,
      name: "10. Sentence Connectors (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 11,
      name: "11. Synonym & Antonym (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 12,
      name: "12. Punctuation & Capitalization (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    // Group B: Functional Writing (13-14)
    {
      id: 13,
      name: "13. Formal Letter & Email (8 marks)",
      activities: FUNCTIONAL_WRITING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 14,
      name: "14. Report Writing (8 marks)",
      activities: FUNCTIONAL_WRITING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    // Group C: Creative Writing (15-16)
    {
      id: 15,
      name: "15. Paragraph (10 marks)",
      activities: CREATIVE_WRITING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 16,
      name: "16. Composition (14 marks)",
      activities: CREATIVE_WRITING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
