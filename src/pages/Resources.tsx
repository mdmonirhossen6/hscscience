import React, { useState } from 'react';
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepCardProps {
  title: string;
  color: string;
  items: string[];
  tip: string;
  isOpen: boolean;
  onToggle: () => void;
}

function StepCard({ title, color, items, tip, isOpen, onToggle }: StepCardProps) {
  return (
    <div className="bg-card/60 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 min-h-[56px] text-left"
      >
        <h3 className="font-semibold text-foreground pr-2" style={{ color }}>{title}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          <ul className="space-y-2">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-muted-foreground text-sm">
                <span className="text-primary mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div 
            className="p-3 rounded-lg text-sm"
            style={{ 
              backgroundColor: `${color}15`,
              borderLeft: `3px solid ${color}`
            }}
          >
            <p className="text-muted-foreground">💡 {tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Resources() {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleStartJourney = () => {
    document.getElementById('steps')?.scrollIntoView({ behavior: 'smooth' });
  };

  const steps = [
    {
      id: 'step1',
      title: '📚 Step 1 — লং স্টাডি আওয়ার',
      color: '#f59e0b',
      items: ['ডিস্ট্রাকশন লিস্ট তৈরি করুন', 'একটি Big Goal Card টেবিলে রাখুন'],
      tip: '২৫ মিনিট → ৪০ → ৬০ মিনিট ফোকাস বাড়ান'
    },
    {
      id: 'step2',
      title: '📅 Step 2 — মাসিক প্ল্যানিং',
      color: '#8b5cf6',
      items: ['প্রতিটি চ্যাপ্টারের ঘন্টা হিসাব করুন', '১০% Spare Hours যোগ করুন', '৩০ দিনের ক্যালেন্ডার তৈরি করুন'],
      tip: 'আজ রাতেই নিজের ৩০ দিনের স্টাডি ক্যালেন্ডার বানান'
    },
    {
      id: 'step3',
      title: '🎯 Step 3 — স্মার্ট হ্যাবিট',
      color: '#ec4899',
      items: ['নোট নেয়ার স্টাইল দেখুন', 'কালার-কোডেড নোট ব্যবহার করুন', 'কোন চ্যাপ্টার বাদ যায় বুঝুন'],
      tip: 'আজ একজন টপার ফ্রেন্ডের নোট দেখে একটি অভ্যাস গ্রহণ করুন'
    },
    {
      id: 'step4',
      title: '✍️ Step 4 — Answer Writing',
      color: '#06b6d4',
      items: ['হেডিং, টেবিল, ডায়াগ্রাম ব্যবহার করুন', 'উত্তর গুছানোভাবে লিখুন'],
      tip: 'পরবর্তী পরীক্ষায় শুধু প্রেজেন্টেশন বদলান'
    },
    {
      id: 'step5',
      title: '👥 Step 5 — স্টাডি কমিউনিটি',
      color: '#10b981',
      items: ['৩–৫ জনের স্টাডি সার্কেল বানান', 'সাপ্তাহিক রিভিউ করুন'],
      tip: 'আজই একজন ভালো ছাত্রকে মেসেজ করুন'
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <MobileHeader title="Study Tips" />

      <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 text-center">
          <h1 className="text-xl md:text-2xl font-bold text-primary-foreground mb-2">
            Average Student → Topper
          </h1>
          <p className="text-primary-foreground/90 text-sm mb-4">
            ৫-ধাপের ইন্টারঅ্যাকটিভ সিস্টেম
          </p>
          <button
            onClick={handleStartJourney}
            className="touch-button bg-background text-foreground px-6"
          >
            জার্নি শুরু করুন
          </button>
        </div>

        {/* Main Concept */}
        <div className="bg-card/60 rounded-xl p-4 border-l-4 border-success">
          <h2 className="text-base font-semibold text-success mb-2">
            💡 ট্যালেন্ট নয়—স্ট্র্যাটেজিই আসল শক্তি
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            বেশির ভাগ স্টুডেন্ট মনোযোগ ধরে রাখতে পারে না, দ্রুত ভুলে যায়, এবং কোন প্ল্যান থাকে না। এই ৫টি ধাপ ৩–৪ মাসে আপনার পারফরম্যান্স উন্নত করবে।
          </p>
        </div>

        {/* Steps */}
        <div id="steps" className="space-y-3">
          {steps.map((step) => (
            <StepCard
              key={step.id}
              title={step.title}
              color={step.color}
              items={step.items}
              tip={step.tip}
              isOpen={!!expandedCards[step.id]}
              onToggle={() => toggleCard(step.id)}
            />
          ))}
        </div>

        {/* Expected Results */}
        <div className="bg-card/60 rounded-xl p-4 border-l-4 border-success">
          <h3 className="text-base font-semibold text-success mb-3">
            ✅ Expected Results (৩–৪ মাস)
          </h3>
          <ul className="space-y-2">
            {['ফোকাস বাড়ে', 'ভুলে যাওয়া কমে', 'রুটিন কনসিস্টেন্ট হয়', 'মার্কস +১০ থেকে +২৫ বাড়ে', 'কনফিডেন্স বাড়ে'].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-success">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Motivation */}
        <div className="bg-gradient-to-br from-destructive to-destructive/80 rounded-2xl p-6 text-center">
          <p className="text-lg font-semibold text-destructive-foreground italic mb-4">
            "Consistency beats talent. Every single time."
          </p>
          <button
            onClick={handleStartJourney}
            className="touch-button bg-background text-foreground px-6"
          >
            ৩০ দিনের প্ল্যান শুরু করুন
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
