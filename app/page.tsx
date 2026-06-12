import { OceanBackground } from "@/components/ocean/ocean-background";
import { PageTransition } from "@/components/shared/page-transition";
import { Timeline } from "@/components/timeline/timeline";
import { getPublishedMemories } from "@/lib/data/memories";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Read fresh memories every request so newly published notes appear immediately.
  const memories = await getPublishedMemories();

  return (
    <main className="relative min-h-screen px-2 py-8 sm:px-6 lg:px-8">
      <OceanBackground />
      <PageTransition>
        <header className="mx-auto max-w-[900px] pb-2 sm:pl-20">
          <p className="calligraffitti-text text-3xl text-ocean-deep sm:text-4xl">
            My Ocean Memories
          </p>
          <h1 className="kaushan-quote mt-2 max-w-2xl text-[1.9rem] leading-tight text-ocean-text sm:text-[2.9rem]">
            &quot;Every moment leaves a mark. Every memory tells a story.
            Together, they become the journey that defines a lifetime.&quot;
          </h1>
        </header>
        <Timeline memories={memories} showSetupHint={!hasSupabaseEnv()} />
      </PageTransition>
    </main>
  );
}
