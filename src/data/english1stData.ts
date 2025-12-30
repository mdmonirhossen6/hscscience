import { SubjectData } from "@/types/tracker";

// Reading Section activities (for Units 1-12)
const READING_ACTIVITIES = [
  "MCQ",
  "Open-ended",
  "Info Transfer",
  "Summarizing",
  "Cloze (with clues)",
  "Cloze (without clues)",
  "Rearranging",
];

// Writing Section activities (for chapters 13-17)
const WRITING_ACTIVITIES = [
  "Practice",
  "Summary",
  "Final Draft",
  "Revision",
];

export const english1stData: SubjectData = {
  id: "english1st",
  name: "English 1st Paper",
  activities: [...READING_ACTIVITIES, ...WRITING_ACTIVITIES.filter(a => !READING_ACTIVITIES.includes(a))],
  chapters: [
    // Part A: Reading Section (60 Marks) - 12 Units
    {
      id: 1,
      name: "Unit 01 - Education & Life",
      activities: READING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "Unit 02 - Art and Craft",
      activities: READING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "Unit 03 - Myths and Literature",
      activities: READING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "Unit 04 - History",
      activities: READING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "Unit 05 - Human Rights",
      activities: READING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "Unit 06 - Dreams",
      activities: READING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 7,
      name: "Unit 07 - Youthful Achievers",
      activities: READING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 8,
      name: "Unit 08 - Relationships",
      activities: READING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 9,
      name: "Unit 09 - Adolescence",
      activities: READING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 10,
      name: "Unit 10 - Lifestyle",
      activities: READING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 11,
      name: "Unit 11 - Peace and Conflict",
      activities: READING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 12,
      name: "Unit 12 - Environment and Nature",
      activities: READING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    // Part B: Writing Section (40 Marks) - 5 Writing Types
    {
      id: 13,
      name: "13. Paragraph (10 marks)",
      activities: WRITING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 14,
      name: "14. Story / Completing Story (10 marks)",
      activities: WRITING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 15,
      name: "15. Letter / Email (5 marks)",
      activities: WRITING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 16,
      name: "16. Graph / Chart (10 marks)",
      activities: WRITING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 17,
      name: "17. Theme Writing (8 marks)",
      activities: WRITING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
