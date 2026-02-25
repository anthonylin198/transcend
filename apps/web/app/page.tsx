import Link from "next/link";
import { Text } from "../ui/components/Text";

export default function Home() {
  return (
    <main className="min-h-svh flex justify-center px-4 py-12 sm:px-6">
      <article className="w-full max-w-[760px]">
        <header className="space-y-4">
          <Text type="lede">I have a mixed relationship with technology.</Text>
        </header>

        <section className="mt-4 space-y-3">
          <Text type="body">
            I became a developer because of the possibility — that you can build
            something once and help a ton of people at the same time. Make life
            smoother, more convenient, more efficient. In theory, that should
            mean more space for the things that truly matter.
          </Text>
          <Text type="body">
            But when I look at how I actually live… most of that “extra” space
            ends up getting filled with <strong>more technology</strong>. I’ve
            spent years watching almost every Angels game on TV, football every
            Sunday, playing video games many nights. And during the ads or
            downtime, even though I’ve deleted most social media, I’ll still
            somehow end up scrolling my phone for no reason.
          </Text>
          <Text type="body">
            Sometimes I’ll even spend entire evenings on ChatGPT — doing
            “research” on what running shoes to buy or what gear to get next —
            instead of just going outside and moving my body. And this is
            usually after a full workday of already talking to AI nonstop to
            help me code more efficiently.
          </Text>
          <Text type="body">
            From time to time, I&apos;d zoom out and think: I wasn&apos;t
            totally miserable… but was this really all there is to life? I wrote
            a bit more about that here:{" "}
            <Link
              href="/articles/what-being-a-good-person-means-to-me"
              className="font-medium text-(--foreground) underline underline-offset-4 decoration-[1.5px] decoration-zinc-400/70 transition-colors hover:decoration-zinc-200 dark:decoration-zinc-400/60 dark:hover:decoration-zinc-200"
            >
              &ldquo;what living a good, happy life means to me&rdquo;
            </Link>
            .
          </Text>
        </section>

        <section className="mt-8 space-y-3">
          <Text type="lede">
            Technology was supposed to give us time for what matters. Somehow,
            it feels like it&apos;s taken that from us instead.
          </Text>
          <Text type="body">
            I question whether a lot of the technology we&apos;re building is
            actually helping people live better happier lives, or it&apos;s more
            so helping us get really good at distracting ourselves from the
            feeling that something more important is missing.
          </Text>

          <Text type="body">
            And it’s not like the people building this stuff are bad. I’ve
            worked with and been led by genuinely good people — thoughtful,
            well-intentioned people. The problem is the incentives and the
            pressure surrounding what gets built. When success is measured in
            engagement and growth, even “wellness” tools start optimizing for
            attention instead of wellbeing.
          </Text>

          <Text type="body">
            How do things being built just always end up catering towards
            attention, retention, and not purely personal wellbeing and growth?
            Becomes a competition for attention?
          </Text>
          <Text type="lede">
            The issue isn&apos;t technology — it&apos;s incentives wrapped
            around it.
          </Text>

          <Text type="body">
            In the startup world—especially in wellness tech—I’ve seen how
            quickly decisions start to orbit growth, engagement, and what will
            sound good in an investor update. Not because people are bad, but
            because that’s how the system is set up.
          </Text>
          <Text type="body">
            Hell, when I invest my money in a company, I really just want the
            stock price to go up.
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
            If your survival depends on attention and “time-on-app,” you end up
            designing for attention and time-on-app. You’re rewarded for what
            keeps people checking, not necessarily for what helps them live
            well.
          </Text>
          <Text type="body">
            When the scoreboard is built on engagement, it’s naïve to expect the
            product to care first about your inner life.
          </Text>

          <Text type="body">
            I wrote more about this here:{" "}
            <Link
              href="/articles/why-i-think-incentives-are-so-important"
              className="font-medium text-(--foreground) underline underline-offset-4 decoration-[1.5px] decoration-zinc-400/70 transition-colors hover:decoration-zinc-200 dark:decoration-zinc-400/60 dark:hover:decoration-zinc-200"
            >
              Why I think incentives are so important
            </Link>
            .
          </Text>
          <Text type="body">
            At some point, thinking about it wasn’t enough; I wanted to see what
            it would look like to actually build with different rules.
          </Text>
        </section>

        <section className="mt-12 space-y-3">
          <Text type="lede">
            I want to experiment building technology with different rules
          </Text>
          <Text type="body">
            What I actually want are tools that help me slow down, notice how
            I’m living, and remember what matters before the day disappears into
            autopilot again.
          </Text>
          <Text type="body">
            Not perfection. Not a fully optimized life. Not another system to
            self-criticize with when I fall short. Just gentle structure and
            reflection that make it easier to choose the next right thing.
          </Text>
          <ul className="pl-5 list-disc space-y-2">
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              No guilt
            </li>
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              No streak-shaming
            </li>
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              No addiction loops disguised as “engagement”
            </li>
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              No pressure to perform a better life for the internet
            </li>
          </ul>
          <div className="mt-4 rounded-xl bg-zinc-200/20 dark:bg-zinc-200/10 px-4 py-4 border-l-2 border-zinc-200/30 dark:border-zinc-200/20">
            <Text type="quote" className="text-zinc-800 dark:text-zinc-200">
              If what I build feels like a calm hand on the shoulder saying,
              “Hey, remember what you said you care about,” then it’s doing its
              job.
            </Text>
          </div>
        </section>

        <section className="mt-12 space-y-3">
          <Text type="heading-2">
            A couple constraints I won’t compromise on
          </Text>
          <Text type="body">
            These aren’t about optimizing revenue. They’re about keeping me
            honest, and making it harder to quietly slide back into building for
            growth, attention, or appearances.
          </Text>
          <ol className="pl-5 list-decimal space-y-2">
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              <strong className="font-semibold text-(--foreground)">
                Everything is free
              </strong>{" "}
              — donation-based forever. No subscriptions. No paywalled “real”
              version. If someone donates, I’m grateful—but it’s never required.
            </li>
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              <strong className="font-semibold text-(--foreground)">
                I only ship what I truly use
              </strong>{" "}
              — if it doesn’t help me live more intentionally—if it doesn’t make
              me a little more aligned with the kind of person I want to be—I’m
              not going to pretend it will do that for anyone else.
            </li>
          </ol>
          <ul className="pl-5 list-disc space-y-2">
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              Any money that does come in gets reported{" "}
              <strong className="font-semibold text-(--foreground)">
                transparently
              </strong>{" "}
              — down to where every cent goes.
            </li>
            <li className="text-[16px] leading-[1.8] text-zinc-700 dark:text-zinc-300">
              I’m not expecting to make much money — and that’s okay.
            </li>
          </ul>
        </section>

        <section className="mt-16 space-y-5">
          <Text type="heading-2">LifeOS</Text>
          <Text type="body">
            Transcend is the first experiment in that direction—a kind of Life
            OS for intentional living.
          </Text>
          <Text type="body">
            Not a productivity engine or a self-improvement treadmill, but a
            simple home base for your inner world: a place to reconnect with
            what matters, to see your habits and choices in that light, and to
            be reminded, gently and regularly, of the person you’re actually
            trying to become.
          </Text>
          <Text type="body">
            I’m building it slowly on purpose. I don’t want to trade integrity
            for speed, or presence for polish. If this ends up helping a small
            number of people live a little more in line with their deepest
            values, that feels like real success to me.
          </Text>
          <Text type="body">
            Even if you never click another link, if any part of this resonated
            with you, that already means we’re asking similar questions.
          </Text>
          <div className="pt-1">
            <Link
              href="/apps/life-os"
              className="inline-flex font-medium text-(--foreground) underline underline-offset-4 decoration-[1.5px] decoration-zinc-400/70 transition-colors hover:decoration-zinc-200 dark:decoration-zinc-400/60 dark:hover:decoration-zinc-200"
            >
              Learn more about the experiment →
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
