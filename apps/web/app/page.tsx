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
            <p className={styles.lede}>
              I have a mixed relationship with technology.
            </p>
          </header>

          <section className={styles.section}>
            <p className={styles.p}>
              I build it. I depend on it. It’s given me opportunities,
              connection, and freedom.
            </p>
            <p className={styles.p}>
              But it has also made it incredibly easy to avoid myself.
            </p>
            <p className={styles.p}>
              Slack is always one swipe away. Notifications turn every spare
              moment into input.
            </p>
            <p className={styles.p}>
              Waiting for something to load on the TV? I’ll instinctively check
              email and texts for no real reason at all.
            </p>
            <p className={styles.p}>
              On autopilot, it becomes so easy to never intentionally choose
              what gets your time.
            </p>
            <p className={styles.p}>
              You drift. You react. And somehow the days move farther away from
              your real self.
            </p>
            <p className={styles.p}>
              That’s the tension I live with every day.
            </p>
            <p className={styles.p}>
              If you’re curious what I mean by all of this, I wrote a bit more
              here:{" "}
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
              Not for how it would look on a resume. Not to keep up. Not to
              reassure myself that I was still on track.
            </p>
            <p className={styles.p}>Just… because it felt deeply right.</p>
            <p className={styles.p}>
              As a kid, things were simpler. I followed curiosity—ran around
              outside, played, moved, did whatever made me feel alive. There was
              no scoreboard.
            </p>
            <p className={styles.p}>
              Then slowly everything became comparison:
            </p>
            <p className={styles.p}>
              grades → college → career → titles → status → money.
            </p>
            <p className={styles.p}>
              From the outside, that life looks responsible and impressive.
              Inside, I noticed something quieter: a gradual loss of the ability
              to hear what I actually cared about.
            </p>
            <p className={styles.p}>
              Meditation, long runs, and stillness made that gap painfully
              obvious. When everything gets quiet, I can feel the difference
              between the life I’m set up to chase… and the life that feels
              honest in my bones.
            </p>
            <p className={styles.p}>
              Transcend is me trying to close that gap.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>
              My issue isn’t technology — it’s incentives
            </h2>
            <p className={styles.p}>
              I’ve worked across startups—early stage, late stage, even as a
              first engineer. Incentives quietly steer behavior. Always.
            </p>
            <p className={styles.p}>
              Even in “wellness tech,” money pulls decisions toward what scales,
              what gets funding, what looks good externally. You start building
              for numbers, not for people actually trying to live well.
            </p>
            <p className={styles.p}>When products are rewarded for:</p>
            <ul className={styles.list}>
              <li>Attention</li>
              <li>Time-on-screen</li>
              <li>“Engagement”</li>
            </ul>
            <p className={styles.p}>
              …it’s inevitable that they’ll be designed to keep us scrolling and
              comparing.
            </p>
            <p className={styles.p}>
              That’s not a moral failure. It’s just what the system pays for.
            </p>
            <p className={styles.p}>So I want to try something different.</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>Two rules for myself</h2>
            <p className={styles.p}>
              If my whole goal is to build technology that helps me live more
              intentionally, then the structure around the work has to reflect
              that:
            </p>
            <ol className={styles.list}>
              <li>
                <strong>Everything is free</strong> — donation-based forever, no
                exceptions. You never need to pay. No locking meaning behind a
                paywall.
              </li>
              <li>
                <strong>I only ship what I truly use</strong> — I won’t release
                software unless it’s genuinely useful in my own life. If it
                doesn’t help me live a life more aligned with my deeper self, I
                won’t pretend it can help anyone else.
              </li>
            </ol>
            <p className={styles.p}>Additionally:</p>
            <ul className={styles.list}>
              <li>
                All donations will be <strong>fully transparent</strong> —
                public reports of where every cent goes.
              </li>
              <li>I’m not expecting to make much money — and that’s okay.</li>
            </ul>
            <p className={styles.p}>
              These constraints keep me honest. They make it harder for me to
              drift back into optimizing for growth or appearances.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>What I’m trying to build instead</h2>
            <p className={styles.p}>
              Not perfection. Not productivity dashboards. Not gamification.
            </p>
            <p className={styles.p}>Just tools that help me:</p>
            <ul className={styles.list}>
              <li>Slow down</li>
              <li>Notice what I’m doing</li>
              <li>Remember what matters</li>
              <li>Live closer to my values, day by day</li>
            </ul>
            <p className={styles.p}>
              No guilt. No addiction loops. No “engagement strategies.”
            </p>
            <blockquote className={styles.quote}>
              If what I build feels like a calm hand on the shoulder saying,
              “Hey, remember what you said you care about,” then it’s doing its
              job.
            </blockquote>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>Transcend — the first experiment</h2>
            <p className={styles.p}>
              The first thing I’m building is Transcend — a kind of Life OS for
              intentional living.
            </p>
            <p className={styles.p}>
              Not a self-optimization treadmill. Not a hack-your-life system.
            </p>
            <p className={styles.p}>
              More like a simple home base for your inner world:
            </p>
            <ul className={styles.list}>
              <li>A place to reconnect with what matters</li>
              <li>
                A way to see your habits, actions, and priorities through that
                lens
              </li>
              <li>Gentle prompts to realign over time</li>
            </ul>
            <p className={styles.p}>
              I’m building it slowly, on purpose. Letting it evolve alongside my
              own understanding.
            </p>
            <p className={styles.p}>
              If it ends up helping only a small number of people — but in a
              real, grounded way — that’s enough.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
