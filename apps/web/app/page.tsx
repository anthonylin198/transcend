import Link from "next/link";
import { Text } from "../ui/components/Text";

export default function Home() {
  return (
    <main className="min-h-svh flex justify-center px-4 py-16 sm:px-6 sm:py-24">
      <article className="w-full max-w-[760px]">
        <header className="space-y-4">
          <Text type="kicker">Transcend</Text>
          <div className="space-y-5">
            <Text type="heading-1">
              Technology for well-being, built with different incentives.
            </Text>
            <div className="h-px w-full bg-zinc-200/20 dark:bg-zinc-200/15" />
          </div>
          <Text type="lede">I have a mixed relationship with technology.</Text>
        </header>

        <section className="mt-4 space-y-3">
          <Text type="body">
            I build it. I depend on it. It’s given me opportunities, connection,
            and freedom.
          </Text>
          <Text type="body">
            But it has also made it incredibly easy to avoid myself.
          </Text>
          <Text type="body">
            Slack is always one swipe away. Notifications turn every spare
            moment into input.
          </Text>
          <Text type="body">
            Waiting for something to load on the TV? I’ll instinctively check
            email and texts for no real reason at all.
          </Text>
          <Text type="body">
            On autopilot, it becomes so easy to never intentionally choose what
            gets your time.
          </Text>
          <Text type="body">
            You drift. You react. And somehow the days move farther away from
            your real self.
          </Text>
          <Text type="body">That’s the tension I live with every day.</Text>
          <Text type="body">
            If you’re curious what I mean by all of this, I wrote a bit more
            here:{" "}
            <Link
              className="underline underline-offset-4 decoration-zinc-400/60 hover:decoration-zinc-300 dark:decoration-zinc-400/50 dark:hover:decoration-zinc-200"
              href="/articles/what-being-a-good-person-means-to-me"
            >
              What being a good person means to me
            </Link>
            .
          </Text>
        </section>

        <section className="mt-12 space-y-3">
          <Text type="heading-2">Why I’m doing this</Text>
          <Text type="body">
            There was a point where I realized I couldn’t clearly remember the
            last decision I made that was purely for me.
          </Text>
          <Text type="body">
            Not for how it would look on a resume. Not to keep up. Not to
            reassure myself that I was still on track.
          </Text>
          <Text type="body">Just… because it felt deeply right.</Text>
          <Text type="body">
            As a kid, things were simpler. I followed curiosity—ran around
            outside, played, moved, did whatever made me feel alive. There was
            no scoreboard.
          </Text>
          <Text type="body">Then slowly everything became comparison:</Text>
          <Text type="body" className="text-zinc-700 dark:text-zinc-300/90">
            grades → college → career → titles → status → money.
          </Text>
          <Text type="body">
            From the outside, that life looks responsible and impressive.
            Inside, I noticed something quieter: a gradual loss of the ability
            to hear what I actually cared about.
          </Text>
          <Text type="body">
            Meditation, long runs, and stillness made that gap painfully
            obvious. When everything gets quiet, I can feel the difference
            between the life I’m set up to chase… and the life that feels honest
            in my bones.
          </Text>
          <Text type="body">Transcend is me trying to close that gap.</Text>
        </section>

        <section className="mt-12 space-y-3">
          <Text type="heading-2">
            My issue isn’t technology — it’s incentives
          </Text>
          <Text type="body">
            I’ve worked across startups—early stage, late stage, even as a first
            engineer. Incentives quietly steer behavior. Always.
          </Text>
          <Text type="body">
            Even in “wellness tech,” money pulls decisions toward what scales,
            what gets funding, what looks good externally. You start building
            for numbers, not for people actually trying to live well.
          </Text>
          <Text type="body">When products are rewarded for:</Text>
          <ul className="pl-5 list-disc space-y-2">
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              Attention
            </li>
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              Time-on-screen
            </li>
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              “Engagement”
            </li>
          </ul>
          <Text type="body">
            …it’s inevitable that they’ll be designed to keep us scrolling and
            comparing.
          </Text>
          <Text type="body">
            That’s not a moral failure. It’s just what the system pays for.
          </Text>
          <Text type="body">So I want to try something different.</Text>
        </section>

        <section className="mt-12 space-y-3">
          <Text type="heading-2">Two rules for myself</Text>
          <Text type="body">
            If my whole goal is to build technology that helps me live more
            intentionally, then the structure around the work has to reflect
            that:
          </Text>
          <ol className="pl-5 list-decimal space-y-2">
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              <strong className="font-semibold text-(--foreground)">
                Everything is free
              </strong>{" "}
              — donation-based forever, no exceptions. You never need to pay. No
              locking meaning behind a paywall.
            </li>
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              <strong className="font-semibold text-(--foreground)">
                I only ship what I truly use
              </strong>{" "}
              — I won’t release software unless it’s genuinely useful in my own
              life. If it doesn’t help me live a life more aligned with my
              deeper self, I won’t pretend it can help anyone else.
            </li>
          </ol>
          <Text type="body">Additionally:</Text>
          <ul className="pl-5 list-disc space-y-2">
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              All donations will be{" "}
              <strong className="font-semibold text-(--foreground)">
                fully transparent
              </strong>{" "}
              — public reports of where every cent goes.
            </li>
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              I’m not expecting to make much money — and that’s okay.
            </li>
          </ul>
          <Text type="body">
            These constraints keep me honest. They make it harder for me to
            drift back into optimizing for growth or appearances.
          </Text>
        </section>

        <section className="mt-12 space-y-3">
          <Text type="heading-2">What I’m trying to build instead</Text>
          <Text type="body">
            Not perfection. Not productivity dashboards. Not gamification.
          </Text>
          <Text type="body">Just tools that help me:</Text>
          <ul className="pl-5 list-disc space-y-2">
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              Slow down
            </li>
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              Notice what I’m doing
            </li>
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              Remember what matters
            </li>
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              Live closer to my values, day by day
            </li>
          </ul>
          <Text type="body">
            No guilt. No addiction loops. No “engagement strategies.”
          </Text>
          <div className="mt-4 rounded-xl bg-zinc-200/20 dark:bg-zinc-200/10 px-4 py-4 border-l-2 border-zinc-200/30 dark:border-zinc-200/20">
            <Text type="quote" className="text-zinc-800 dark:text-zinc-200">
              If what I build feels like a calm hand on the shoulder saying,
              “Hey, remember what you said you care about,” then it’s doing its
              job.
            </Text>
          </div>
        </section>

        <section className="mt-12 space-y-3">
          <Text type="heading-2">Transcend — the first experiment</Text>
          <Text type="body">
            The first thing I’m building is Transcend — a kind of Life OS for
            intentional living.
          </Text>
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
        </section>
      </article>
    </main>
  );
}
