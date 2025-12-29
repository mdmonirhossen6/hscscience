import jsPDF from "jspdf";
import { format } from "date-fns";

interface SubjectProgress {
  name: string;
  fullName: string;
  progress: number;
}

interface ChapterCompletion {
  subject: string;
  chapter: string;
  completed_at: string | null;
}

const PDF_CONFIG = {
  margin: 20,
  lineHeight: 7,
  titleSize: 18,
  subtitleSize: 12,
  bodySize: 10,
  smallSize: 9,
};

const addHeader = (doc: jsPDF, title: string) => {
  doc.setFontSize(PDF_CONFIG.titleSize);
  doc.setFont("helvetica", "bold");
  doc.text(title, PDF_CONFIG.margin, 25);
  
  doc.setFontSize(PDF_CONFIG.smallSize);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Generated: ${format(new Date(), "PPpp")}`, PDF_CONFIG.margin, 33);
  doc.setTextColor(0);
  
  return 45;
};

const addSection = (doc: jsPDF, title: string, y: number) => {
  doc.setFontSize(PDF_CONFIG.subtitleSize);
  doc.setFont("helvetica", "bold");
  doc.text(title, PDF_CONFIG.margin, y);
  return y + 8;
};

export const generateOverallProgressPDF = (
  email: string,
  overallProgress: number,
  subjectProgresses: SubjectProgress[]
) => {
  const doc = new jsPDF();
  let y = addHeader(doc, "HSC Science — Overall Progress Report");
  
  // Student email
  doc.setFontSize(PDF_CONFIG.bodySize);
  doc.setFont("helvetica", "normal");
  doc.text(`Student: ${email}`, PDF_CONFIG.margin, y);
  y += 12;
  
  // Overall progress
  y = addSection(doc, "Overall Completion", y);
  doc.setFontSize(PDF_CONFIG.bodySize);
  doc.setFont("helvetica", "normal");
  doc.text(`${overallProgress}% complete`, PDF_CONFIG.margin, y);
  y += 15;
  
  // Subject progress
  y = addSection(doc, "Subject-wise Progress", y);
  doc.setFontSize(PDF_CONFIG.bodySize);
  doc.setFont("helvetica", "normal");
  
  subjectProgresses.forEach((subject) => {
    doc.text(`• ${subject.fullName}: ${subject.progress}%`, PDF_CONFIG.margin + 5, y);
    y += PDF_CONFIG.lineHeight;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("HSC Science Study Tracker", PDF_CONFIG.margin, 285);
  
  doc.save(`hsc-overall-progress-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const generateMonthlyProgressPDF = (
  email: string,
  monthYear: string,
  completions: ChapterCompletion[]
) => {
  const doc = new jsPDF();
  let y = addHeader(doc, "HSC Science — Monthly Progress Report");
  
  // Month and student
  doc.setFontSize(PDF_CONFIG.bodySize);
  doc.setFont("helvetica", "normal");
  doc.text(`Month: ${monthYear}`, PDF_CONFIG.margin, y);
  y += 6;
  doc.text(`Student: ${email}`, PDF_CONFIG.margin, y);
  y += 12;
  
  // Total chapters
  y = addSection(doc, "Summary", y);
  doc.setFontSize(PDF_CONFIG.bodySize);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Chapters Completed: ${completions.length}`, PDF_CONFIG.margin, y);
  y += 12;
  
  // Subject breakdown
  const bySubject = completions.reduce((acc, c) => {
    acc[c.subject] = (acc[c.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  if (Object.keys(bySubject).length > 0) {
    y = addSection(doc, "Subject-wise Breakdown", y);
    doc.setFontSize(PDF_CONFIG.bodySize);
    doc.setFont("helvetica", "normal");
    
    Object.entries(bySubject).forEach(([subject, count]) => {
      doc.text(`• ${subject}: ${count} chapter${count > 1 ? "s" : ""}`, PDF_CONFIG.margin + 5, y);
      y += PDF_CONFIG.lineHeight;
    });
    y += 5;
  }
  
  // Chronological list
  if (completions.length > 0) {
    y = addSection(doc, "Completed Chapters", y);
    doc.setFontSize(PDF_CONFIG.smallSize);
    doc.setFont("helvetica", "normal");
    
    const sortedCompletions = [...completions].sort((a, b) => {
      if (!a.completed_at || !b.completed_at) return 0;
      return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
    });
    
    sortedCompletions.forEach((c) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      const dateStr = c.completed_at 
        ? format(new Date(c.completed_at), "MMM d, h:mm a") 
        : "";
      doc.text(`• ${c.chapter} (${c.subject}) — ${dateStr}`, PDF_CONFIG.margin + 5, y);
      y += PDF_CONFIG.lineHeight;
    });
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("HSC Science Study Tracker", PDF_CONFIG.margin, 285);
  
  doc.save(`hsc-monthly-progress-${format(new Date(), "yyyy-MM")}.pdf`);
};
