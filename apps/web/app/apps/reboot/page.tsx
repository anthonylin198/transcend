import Link from "next/link";
import { Text } from "../../../ui/components/Text";

export default function RebootPage() {
  return (
    <main className="min-h-svh flex justify-center px-4 py-16 sm:px-6 sm:py-24">
      <article className="w-full max-w-[760px]">
        <header className="space-y-5">
          <Text type="kicker">apps/reboot</Text>
          <div className="space-y-5">
            <Text type="heading-1">Reboot</Text>
            <div className="h-px w-full bg-zinc-200/20 dark:bg-zinc-200/15" />
          </div>
          <Text type="lede">
            A hard reset: bootcamp-style structure for people drowning in
            choice.
          </Text>
        </header>

        <section className="mt-10 space-y-8">
          <Text type="body">
            Modern life gives you endless freedom: eat whenever, sleep whenever,
            go out whenever, scroll whenever. You can perform mediocre at work,
            call it the “American Dream,” and still have people proud of you.
          </Text>

          <Text type="body">
            But “doing what you feel” all day is a trap. It feels like freedom,
            and slowly turns into drift.
          </Text>

          <div className="space-y-4">
            <Text type="heading-2">What Reboot is</Text>
            <Text type="body">
              Reboot is a short, rigid routine you commit to for a fixed period
              of time. It’s intentionally opinionated. It removes choices so you
              can build discipline and re-learn what intentional living feels
              like.
            </Text>
          </div>

          <div className="space-y-4">
            <Text type="heading-2">The point</Text>
            <Text type="quote">
              Discipline isn’t motivation — it’s structure you follow when you
              don’t feel like it.
            </Text>
            <Text type="body">
              Think athletes. Wake early. Sleep early. Eat properly. Train. Do
              focused work. Repeat. These inputs compound into a life that feels
              steady, clean, and intentional.
            </Text>
          </div>

          <div className="space-y-4">
            <Text type="heading-2">What it enforces (examples)</Text>
            <ul className="list-disc space-y-3 pl-5 text-zinc-700 marker:text-zinc-400/80 dark:text-zinc-300 dark:marker:text-zinc-500/80">
              <Text type="body" as="li">
                Fixed wake/sleep windows (no “just one more episode”).
              </Text>
              <Text type="body" as="li">
                Planned meals (simple, repeatable, protein-forward).
              </Text>
              <Text type="body" as="li">
                Non-negotiable movement (walks + training).
              </Text>
              <Text type="body" as="li">
                Deep work blocks (ship something, don’t just stay busy).
              </Text>
              <Text type="body" as="li">
                Screen hygiene at night (protect sleep, protect tomorrow).
              </Text>
            </ul>
          </div>

          <div className="space-y-4">
            <Text type="heading-2">How it fits with LifeOS</Text>
            <Text type="body">
              LifeOS is the unopinionated, no-BS way to manage your life. But
              without discipline, any system is easy to ignore.
            </Text>
            <Text type="body">
              Reboot is the discipline layer: a wave you ride to re-align, then
              you keep the gains with LifeOS.
            </Text>
          </div>

          <Text type="body" className="text-zinc-600 dark:text-zinc-400">
            Coming soon. The goal is simple: fewer choices, more intention.
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
