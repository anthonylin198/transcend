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
            I got into it because of the possibility: that you can write code
            once and improve life for thousands or millions of people at the
            same time. That you can make things easier, more convenient, more
            efficient. In theory, that should give us more space for the things
            that actually matter.
          </Text>
          <Text type="body">
            But in practice, most of that “extra” space ends up getting filled
            with noise.
          </Text>
          <Text type="body">
            The phone comes out the second there’s friction. Waiting for
            something to load on the TV? I’ll start checking email or texts
            without any real need to. Standing in line, sitting on the couch,
            taking a break between tasks—it’s so easy to reach for a screen
            instead of just being there.
          </Text>
          <Text type="body">
            Some days my life has felt like: wake up, work, scroll, watch
            something, scroll again, sleep, repeat. Never bored, always
            stimulated, and somehow a little emptier every time.
          </Text>
          <Text type="body">
            It’s strange to build technology that’s supposed to save time and
            then watch that time dissolve into scrolling and comparison.
          </Text>
          <Text type="body">
            It makes me wonder whether we’re actually moving closer to a good
            life, or just getting better at distracting ourselves from the
            feeling that something important is missing.
          </Text>
          <Text type="body">
            If you’re curious how I think about alignment, character, and what a
            “good life” even means, I wrote a bit more here:{" "}
            <Link
              className="font-medium text-(--foreground) underline underline-offset-4 decoration-[1.5px] decoration-zinc-400/70 transition-colors hover:decoration-zinc-200 dark:decoration-zinc-400/60 dark:hover:decoration-zinc-200"
              href="/articles/what-being-a-good-person-means-to-me"
            >
              What being a good person means to me
            </Link>
            .
          </Text>
        </section>

        <section className="mt-12 space-y-3">
          <Text type="heading-2">I wasn’t always like this</Text>
          <Text type="body">
            As a kid, I wasn’t “traditionally ambitious” in the way people
            usually mean. I cared a lot more about playing basketball, lifting,
            being active, spending time with friends.
          </Text>
          <Text type="body">
            I eventually became a personal trainer because I genuinely loved
            helping people feel better in their own bodies. That felt meaningful
            and simple in a way that didn’t need anyone else’s approval.
          </Text>
          <Text type="body">
            But slowly—never in one dramatic moment—comparison started to creep
            in. People asked about grades, what college I might get into, what I
            wanted to “do” with my life.
          </Text>
          <Text type="body">Then slowly everything became comparison:</Text>
          <Text type="body" className="text-zinc-700 dark:text-zinc-300/90">
            grades → college → career → titles → status → money
          </Text>
          <Text type="body">
            At some point I realized I could actually do pretty well in school
            if I tried, and when teachers and family responded with pride, it
            felt good. Being “the smart one,” being “on track,” being the person
            others saw as impressive—it all started to matter more than I
            realized.
          </Text>
          <Text type="body">
            I went to UCSB and worked hard. Not just out of curiosity or love of
            learning, but because it felt important to be seen as someone going
            somewhere. None of that looked unhealthy on the surface. It matched
            what the world tends to applaud: responsible, driven, high
            performing.
          </Text>
          <Text type="body">
            But underneath, my sense of direction was slowly shifting from “what
            feels meaningful to me?” to “what looks good from the outside?”
          </Text>
          <Text type="body">
            That shift is subtle. It can take years before you notice you’ve
            been slowly living further and further away from yourself.
          </Text>
        </section>

        <section className="mt-12 space-y-3">
          <Text type="heading-2">The gap I didn’t want to lose</Text>
          <Text type="body">
            A meditation retreat and some time off were the first moments in a
            long time where the noise quieted down enough for me to actually
            hear what was going on inside.
          </Text>
          <Text type="body">
            Without Slack, without constant inputs, without the usual pace, I
            could see the gap between the life I was set up to chase and the
            life that felt honest in my bones.
          </Text>
          <Text type="body">
            And then, of course, real life started up again—startup pace,
            notifications, deadlines—and I could feel how easy it would be to
            fall straight back into reaction mode.
          </Text>
          <Text type="body">
            Transcend is my attempt not to lose that awareness again.
          </Text>
        </section>

        <section className="mt-12 space-y-3">
          <Text type="heading-2">
            My issue isn’t technology — it’s incentives
          </Text>
          <Text type="body">
            I don’t think technology itself is the enemy. I think the incentives
            wrapped around it are.
          </Text>
          <Text type="body">
            In the startup world—especially in wellness tech—I’ve seen how
            quickly decisions start to orbit growth, engagement, and what will
            sound good in an investor update. Not because people are bad, but
            because that’s how the system is set up.
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

        <section className="mt-12 space-y-3">
          <Text type="heading-2">What I’m trying to build instead</Text>
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

        <section className="mt-16 space-y-5">
          <Text type="heading-2">Transcend — the first experiment</Text>
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
