import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <article className={styles.prose}>
          <header className={styles.header}>
            <p className={styles.kicker}>Transcend</p>
            <h1 className={styles.title}>
              Technology for well-being, built with different incentives.
            </h1>
            <p className={styles.lede}>Hi, I’m Anthony.</p>
          </header>

          <section className={styles.section}>
            <p className={styles.p}>
              Transcend is a personal experiment: what would I create if I
              wasn’t optimizing for revenue, hype, or growth—only for what’s
              genuinely useful in my own journey to understand myself and become
              a better person?
            </p>
            <p className={styles.p}>
              This isn’t a startup pitch. It’s me trying to build software in a
              way that actually feels aligned with my deeper self.
            </p>
            <p className={styles.p}>
              I want to build technology that helps me feel more aligned—not
              more distracted. Not something that thinks for me, or replaces my
              judgment, or turns life into a game. Just a tool I can use to live
              a little better: calmer, clearer, kinder. A better, happier
              person.
            </p>
            <p className={styles.p}>
              If you’re curious what I mean by that, I wrote a bit more here:{" "}
              <Link
                className={styles.link}
                href="/articles/what-being-a-good-person-means-to-me"
              >
                What being a good person means to me
              </Link>
              .
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>Why I’m doing this</h2>
            <p className={styles.p}>
              There was a point where I realized I couldn’t clearly remember the
              last decision I made that was purely for me.
            </p>
            <p className={styles.p}>
              Not for a metric. Not for how it would look on a resume. Not to
              keep up with people I admired. Just… because it felt deeply right.
            </p>
            <p className={styles.p}>
              Somewhere along the way, I drifted from that.
            </p>
            <p className={styles.p}>
              As a kid, things were simpler. I did what made me feel free—run
              around outside, play, move, follow curiosity. I wasn’t optimizing
              anything. I wasn’t thinking about whether it all “added up” to a
              narrative of success.
            </p>
            <p className={styles.p}>
              Then life slowly shifted into comparison: grades, college, career,
              titles, money, stability. The more I internalized those things as
              “what matters,” the more my choices became about keeping up,
              proving myself, doing the smart thing, doing the expected thing.
            </p>
            <p className={styles.p}>
              From the outside, that kind of life can look responsible and
              impressive. On the inside, I noticed something quieter: a gradual
              loss of the ability to hear what I actually cared about.
            </p>
            <p className={styles.p}>
              Meditation, long runs, and still moments have made that gap really
              obvious to me. When everything gets quiet, I can feel the
              difference between the life I’m set up to chase… and the life that
              feels honest in my bones.
            </p>
            <p className={styles.p}>
              Transcend is me trying to close that gap.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>My mixed relationship with technology</h2>
            <p className={styles.p}>
              I build technology. I’m grateful for what it can do. But I also
              see how easily it pulls me away from myself.
            </p>
            <p className={styles.p}>
              I’ve worked at earlier- and later-stage startups (including as a
              first engineer), and I’ve seen how—even in “wellness tech”—money
              quietly pulls decisions. You start building for the next round, a
              promotion, a headline. Eventually you can lose track of what’s
              genuinely good for people, and optimize for what sounds good to
              investors (and everyone watching).
            </p>
            <p className={styles.p}>
              Slack is always one swipe away. Notifications and feeds turn every
              spare moment into input. There’s always something new to check,
              something else to respond to.
            </p>
            <p className={styles.p}>
              Hell, if my phone is in my pocket and I’m waiting for something to
              load on the TV, I’ll sometimes pull it out and click through
              email, texts, and whatever else—without there really being
              anything I actually need to check.
            </p>
            <p className={styles.p}>
              On autopilot, it becomes incredibly easy to never intentionally
              choose what gets your time. You drift. You react. Days get filled,
              but not always with what matters.
            </p>
            <p className={styles.p}>
              I don’t think technology is inherently bad. I think the incentives
              often are.
            </p>
            <p className={styles.p}>When products are rewarded for:</p>
            <ul className={styles.list}>
              <li>More attention</li>
              <li>More “engagement”</li>
              <li>More time-on-app</li>
            </ul>
            <p className={styles.p}>
              …then of course they’ll be designed to keep us scrolling,
              checking, and comparing.
            </p>
            <p className={styles.p}>
              That’s not a moral failing of the people building them. It’s just
              what the system pays for.
            </p>
            <p className={styles.p}>
              Transcend is my attempt to see what happens when I don’t play that
              game.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>Two rules I’m holding myself to</h2>
            <p className={styles.p}>
              If I’m going to build software that aims to support living
              intentionally, I want the structure around it to reflect that:
            </p>
            <ul className={styles.list}>
              <li>
                <strong>Everything is free</strong> — donation-based forever, no
                exceptions. You never need to pay to use anything I build. If
                someone chooses to donate, that’s appreciated, but it’s not the
                point.
              </li>
              <li>
                <strong>I only ship what I truly use</strong> — I won’t release
                software unless it’s deeply, genuinely useful in my own life. If
                it doesn’t actually help me live more intentionally, I won’t
                pretend it will help anyone else.
              </li>
            </ul>
            <p className={styles.p}>On top of that, any donations will be:</p>
            <ul className={styles.list}>
              <li>
                <strong>Fully transparent</strong> — I’ll share regular public
                reports of where every cent goes.
              </li>
              <li>
                <strong>Expected to be small</strong> — I don’t assume this will
                generate meaningful money, and that’s okay. This is about
                integrity and accountability more than funding.
              </li>
            </ul>
            <p className={styles.p}>
              These constraints are here to keep me honest. They’re my way of
              refusing to quietly slide back into building for growth, metrics,
              or appearances.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>What I’m trying to build instead</h2>
            <p className={styles.p}>
              I’m not trying to “optimize” my life into some perfect system.
            </p>
            <p className={styles.p}>I’m trying to build tools that:</p>
            <ul className={styles.list}>
              <li>Help me slow down</li>
              <li>Notice what I’m doing</li>
              <li>Remember what actually matters to me</li>
              <li>
                Live a little more in line with my deeper values, day by day
              </li>
            </ul>
            <p className={styles.p}>
              No guilt. No gamified streaks pretending to care about my
              well-being. No trying to hack my way out of being human.
            </p>
            <p className={styles.p}>
              Just gentle structure, reflection, and reminders that help me make
              better choices with the time I have.
            </p>
            <blockquote className={styles.quote}>
              If something I build feels like a calm hand on the shoulder
              saying, “Hey, remember what you said you care about,” then it’s
              doing its job.
            </blockquote>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>Transcend — the first experiment</h2>
            <p className={styles.p}>
              The first thing I’m building in this spirit is Transcend, a kind
              of Life OS.
            </p>
            <p className={styles.p}>
              Not a productivity engine. Not a self-improvement treadmill. More
              like a home base for intentional living:
            </p>
            <ul className={styles.list}>
              <li>A place to reconnect with what matters most to you</li>
              <li>
                A way to see your habits, actions, and priorities through that
                lens
              </li>
              <li>
                Gentle, thoughtful prompts to review, adjust, and realign over
                time
              </li>
            </ul>
            <p className={styles.p}>
              I’m building it slowly, on purpose. I want it to evolve alongside
              my own understanding, not chase trends or growth hacks.
            </p>
            <p className={styles.p}>
              If it ends up helping only a small number of people—but in a real,
              grounded way—that’s enough.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
