import Link from "next/link";
import { Text } from "../../../ui/components/Text";

export default function WhyIncentivesArticle() {
  return (
    <main className="min-h-svh flex justify-center px-4 py-16 sm:px-6 sm:py-24">
      <article className="w-full max-w-[760px]">
        <header className="space-y-5">
          <Text type="kicker">Article</Text>
          <div className="space-y-5">
            <Text type="heading-1">
              Why I think incentives are so important
            </Text>
            <div className="h-px w-full bg-zinc-200/20 dark:bg-zinc-200/15" />
          </div>
          <Text type="lede">
            Most of what I’ve regretted building wasn’t caused by bad people —
            it was caused by good people inside a system that paid for the wrong
            thing.
          </Text>
        </header>

        <section className="mt-10 space-y-5">
          <Text type="body">
            I used to think “incentives” was a cold business word — something
            for investors, strategy decks, and growth teams.
          </Text>
          <Text type="body">
            But over time, it’s become one of the most human concepts I know.
          </Text>
          <Text type="body">
            Incentives are just the invisible hand on the shoulder. The quiet
            pressure that turns “what do we believe?” into “what do we do when
            it’s hard?”
          </Text>

          <Text type="body">
            Here’s what I’ve seen, repeatedly, across companies:
          </Text>
          <ul className="pl-5 list-disc space-y-2">
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              You can have sincere people and a beautiful mission.
            </li>
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              But if the system rewards attention, growth, and optics…
            </li>
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              eventually the product becomes a machine for attention, growth,
              and optics.
            </li>
          </ul>

          <Text type="body">
            It doesn’t happen all at once. It happens one “small, reasonable”
            decision at a time.
          </Text>
          <Text type="body">
            A tweak to increase engagement. A metric that becomes a goal. A
            feature that makes the chart go up. A compromise that you tell
            yourself is temporary.
          </Text>
          <Text type="body">
            And then, quietly, you wake up inside a different product than the
            one you meant to build.
          </Text>

          <Text type="body">
            That’s why I care so much about incentives with Transcend. If I’m
            trying to build something that helps me live more intentionally, I
            can’t fund it in a way that requires me to capture more attention.
          </Text>
          <Text type="body">
            I have to build in a way that makes it easier to stay honest — even
            when nobody is watching.
          </Text>

          <div className="pt-2">
            <Link
              href="/"
              className="font-medium text-(--foreground) underline underline-offset-4 decoration-[1.5px] decoration-zinc-400/70 transition-colors hover:decoration-zinc-200 dark:decoration-zinc-400/60 dark:hover:decoration-zinc-200"
            >
              ← Back to home
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
