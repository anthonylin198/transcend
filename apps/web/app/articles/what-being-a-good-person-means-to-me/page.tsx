import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "What being a good person means to me — Transcend",
  description:
    "A personal note on what I mean by living with integrity, alignment, and care.",
};

export default function WhatBeingAGoodPersonMeansToMePage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <article className={styles.prose}>
          <header className={styles.header}>
            <p className={styles.kicker}>Article</p>
            <h1 className={styles.title}>What being a good person means to me</h1>
            <p className={styles.lede}>
              This is a placeholder for now. I want this to be honest, specific,
              and lived—not preachy. I’ll write it slowly.
            </p>
            <nav className={styles.nav}>
              <Link className={styles.link} href="/">
                ← Back to Transcend
              </Link>
            </nav>
          </header>

          <section className={styles.section}>
            <h2 className={styles.h2}>A starting point</h2>
            <p className={styles.p}>
              When I say “be a better person,” I don’t mean becoming more
              productive, more optimized, or more impressive. I mean becoming
              more aligned with what I actually believe is good—especially when
              no one is watching.
            </p>
            <p className={styles.p}>
              I’ll come back and expand this into something real: what I’m
              trying to practice, what I’m trying to stop doing, and what helps
              me stay honest.
            </p>
            <ul className={styles.list}>
              <li>Kindness (without self-erasure)</li>
              <li>Integrity (doing the thing I said I’d do)</li>
              <li>Presence (not living on autopilot)</li>
              <li>Responsibility (for my attention and my impact)</li>
            </ul>
          </section>
        </article>
      </main>
    </div>
  );
}


