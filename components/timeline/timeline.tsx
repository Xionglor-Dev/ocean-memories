"use client";

import { MemoryCard } from "@/components/memory/memory-card";
import type { MemoryWithImages } from "@/lib/types";

type TimelineProps = {
  memories: MemoryWithImages[];
  showSetupHint?: boolean;
};

export function Timeline({ memories, showSetupHint }: TimelineProps) {
  return (
    <section
      aria-label="Memory timeline"
      className="relative mx-auto max-w-[900px] pb-24 pt-8"
    >
      {/* The decorative current is hidden on phones so the memory cards get more room. */}
      <div
        aria-hidden="true"
        className="memory-ocean-current absolute bottom-0 left-0 top-0 hidden w-20 sm:block"
      />

      <div className="space-y-14 sm:space-y-20">
        {showSetupHint ? (
          <TimelineNotice
            title="Connect Supabase to begin"
            body="Add the environment variables from .env.example, run the migration, and your memories will appear here in chronological order."
          />
        ) : null}

        {memories.map((memory) => (
          <div key={memory.id} className="relative sm:pl-20">
            <MemoryCard memory={memory} />
          </div>
        ))}

        {memories.length === 0 && !showSetupHint ? (
          <TimelineNotice
            title="Future Memories"
            body="The next chapter is waiting below the surface."
          />
        ) : (
          <div className="relative sm:pl-20">
            <div className="rounded-[8px] border border-white/80 bg-white/65 p-6 text-center shadow-soft backdrop-blur-sm">
              <p className="font-handwriting text-3xl font-semibold text-ocean-deep">
                Future Memories
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function TimelineNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="relative sm:pl-20">
      <div className="rounded-[8px] border border-white/80 bg-white/75 p-6 shadow-soft backdrop-blur-sm">
        <p className="font-handwriting text-3xl font-semibold text-ocean-deep">{title}</p>
        <p className="mt-2 text-sm leading-6 text-ocean-text/75">{body}</p>
      </div>
    </div>
  );
}
