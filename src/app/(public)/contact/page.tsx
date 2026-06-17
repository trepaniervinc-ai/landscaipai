import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-3">Contact us</h1>
      <p className="text-muted-foreground mb-8">
        Have a question or need help? Send us a message.
      </p>
      <form className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Name
          </label>
          <input
            type="text"
            className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Message
          </label>
          <textarea
            rows={5}
            className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Send message
        </button>
      </form>
    </main>
  );
}
