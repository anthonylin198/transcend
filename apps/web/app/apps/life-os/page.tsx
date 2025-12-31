import Link from "next/link";
import { Text } from "../../../ui/components/Text";

export default function LifeOSPage() {
  return (
    <main className="min-h-svh flex justify-center px-4 py-16 sm:px-6 sm:py-24">
      <article className="w-full max-w-[760px]">
        <header className="space-y-5">
          <Text type="kicker">apps/life-os</Text>
          <div className="space-y-5">
            <Text type="heading-1">Transcend — the first experiment</Text>
            <div className="h-px w-full bg-zinc-200/20 dark:bg-zinc-200/15" />
          </div>
          <Text type="lede">
            The first thing I’m building is Transcend — a kind of Life OS for
            intentional living.
          </Text>
        </header>

        <section className="mt-10 space-y-5">
          <Text type="body">
            Not a self-optimization treadmill. Not a hack-your-life system.
          </Text>

          <Text type="body">
            More like a simple home base for your inner world:
          </Text>

          <ul className="pl-5 list-disc space-y-2">
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              A place to reconnect with what matters
            </li>
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              A way to see your habits, actions, and priorities through that
              lens
            </li>
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              Gentle prompts to realign over time
            </li>
          </ul>

          <Text type="body">
            I’m building it slowly, on purpose. Letting it evolve alongside my
            own understanding.
          </Text>

          <Text type="body">
            If it ends up helping only a small number of people — but in a real,
            grounded way — that’s enough.
          </Text>

          <Text type="body">
            <Link
              href="/"
              className="font-medium text-(--foreground) underline underline-offset-4 decoration-[1.5px] decoration-zinc-400/70 transition-colors hover:decoration-zinc-200 dark:decoration-zinc-400/60 dark:hover:decoration-zinc-200"
            >
              ← Back to home
            </Link>
          </Text>
        </section>
      </article>
    </main>
  );
}
