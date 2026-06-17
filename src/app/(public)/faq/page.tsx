import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ" };

const FAQS = [
  {
    q: "What is a credit?",
    a: "One credit = one AI operation: an initial generation, an in-painting edit, or a re-prompt. Credits are deducted before generation and refunded if the AI call fails.",
  },
  {
    q: "Do credits roll over?",
    a: "Subscription credits reset monthly and do not roll over. One-time credit pack credits never expire.",
  },
  {
    q: "What file formats are supported?",
    a: "JPG, PNG, WEBP, and HEIC up to 10 MB.",
  },
  {
    q: "Can I use the images commercially?",
    a: "Pro and Business plan subscribers have a commercial use license. Starter and free tier are personal use only.",
  },
  {
    q: "How does in-painting work?",
    a: "Draw a mask over the area you want to change using the canvas tool, then describe what you want there. The AI modifies only that area while leaving the rest untouched.",
  },
  {
    q: "Is my data private?",
    a: "Your uploads and generated images are stored privately. Projects are only visible to you unless you explicitly share them.",
  },
];

export default function FaqPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-10">
        Frequently asked questions
      </h1>
      <div className="space-y-8">
        {FAQS.map(({ q, a }) => (
          <div key={q}>
            <h2 className="font-semibold text-foreground mb-2">{q}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
