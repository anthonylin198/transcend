"use client";

import { useParams } from "next/navigation";
import { api, useQuery } from "@transcend/convex";
import { WorkoutForm } from "@/components/workouts/WorkoutForm";
import type { StoredWod } from "@/lib/wod";

export default function WorkoutPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const wod = useQuery(api.wods.getWod.getWod, slug ? { slug } : "skip");

  if (wod === undefined) {
    return <p className="text-sm text-zinc-400">Loading...</p>;
  }
  if (wod === null) {
    return <p className="text-sm text-zinc-400">Workout not found.</p>;
  }

  const stored: StoredWod = {
    slug: wod.slug,
    title: wod.title,
    category: wod.category,
    date: wod.date,
    sections: wod.sections,
  };

  return <WorkoutForm key={wod.slug} wod={stored} />;
}
