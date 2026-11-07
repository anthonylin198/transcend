"use client";

import { useMemo, useRef, useState } from "react";
import { api, useMutation, useQuery } from "@transcend/convex";
import { getUpcomingSundayWeeks } from "@/lib/currentWeek";

const WEEKS_AHEAD = 26;
const MAX_IMAGE_BYTES = 4_000_000;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

function formatSteps(value: number) {
  return Math.round(value).toLocaleString("en-US");
}

type PicturePick = {
  weekStart: string;
  file: File | null;
  cleared: boolean;
  previewUrl: string | null;
};

function ChallengePreview({
  title,
  steps,
  goal,
  imageUrl,
}: {
  title: string;
  steps: number;
  goal: number;
  imageUrl: string | null;
}) {
  const progress = goal > 0 ? Math.min(100, (steps / goal) * 100) : 0;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-black px-4 py-4">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="pointer-events-none absolute bottom-0 right-0 h-full w-[46%] object-contain object-bottom"
        />
      ) : null}
      <div className="relative z-10">
        <div className={imageUrl ? "max-w-[58%]" : undefined}>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {formatSteps(steps)}
          </p>
          <p className="text-sm text-zinc-400">of {formatSteps(goal)} steps</p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ChallengesPage() {
  const weeks = useMemo(() => getUpcomingSundayWeeks(WEEKS_AHEAD + 1), []);
  const [weekStart, setWeekStart] = useState(weeks[0].weekStart);
  const week = weeks.find((item) => item.weekStart === weekStart) ?? weeks[0];
  const isCurrentWeek = week.weekStart === weeks[0].weekStart;
  const mine = useQuery(api.challenges.myStepChallenge.myStepChallenge, {
    weekStart: week.weekStart,
  });
  const onFeed = useQuery(
    api.challenges.stepChallengeForWeek.stepChallengeForWeek,
    { weekStart: week.weekStart },
  );
  const setStepChallenge = useMutation(
    api.challenges.setStepChallenge.setStepChallenge,
  );
  const deleteStepChallenge = useMutation(
    api.challenges.deleteStepChallenge.deleteStepChallenge,
  );
  const generateUploadUrl = useMutation(
    api.challenges.generateChallengeImageUploadUrl
      .generateChallengeImageUploadUrl,
  );
  type StorageId = Exclude<
    NonNullable<Parameters<typeof setStepChallenge>[0]["imageId"]>,
    null
  >;
  const fileInput = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<{
    weekStart: string;
    goal: string;
    name: string;
  } | null>(null);
  const [picture, setPicture] = useState<PicturePick | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const goalText =
    draft?.weekStart === week.weekStart
      ? draft.goal
      : mine
        ? String(mine.goalSteps)
        : "";
  const nameText =
    draft?.weekStart === week.weekStart ? draft.name : (mine?.name ?? "");
  const pictureForWeek = picture?.weekStart === week.weekStart ? picture : null;
  const previewUrl = pictureForWeek?.cleared
    ? null
    : (pictureForWeek?.previewUrl ?? mine?.imageUrl ?? null);
  const imageChanged = Boolean(
    pictureForWeek && (pictureForWeek.cleared || pictureForWeek.file),
  );
  const parsedGoal = /^\d+$/.test(goalText) ? Number(goalText) : null;
  const nextName = nameText.trim();
  const unchanged =
    mine != null &&
    parsedGoal === mine.goalSteps &&
    nextName === (mine.name ?? "") &&
    !imageChanged;

  const rememberPicture = (next: PicturePick | null) => {
    setPicture((current) => {
      if (current?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return next;
    });
  };

  const onPickImage = (file: File | undefined) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setError("Use a PNG, JPG, or WebP");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image must be 4 MB or smaller");
      return;
    }
    rememberPicture({
      weekStart: week.weekStart,
      file,
      cleared: false,
      previewUrl: URL.createObjectURL(file),
    });
    setError(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const onSave = async () => {
    if (saving) return;
    if (!nextName) {
      setError("Enter a name for the challenge");
      return;
    }
    if (parsedGoal === null || parsedGoal < 1) {
      setError("Enter a step goal greater than 0");
      return;
    }
    const savingWeek = week.weekStart;
    const picked = pictureForWeek;
    setSaving(true);
    setError(null);
    try {
      let imageId: StorageId | null | undefined;
      if (picked?.file) {
        const uploadUrl = await generateUploadUrl();
        const uploaded = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": picked.file.type },
          body: picked.file,
        });
        if (!uploaded.ok) {
          throw new Error("Could not upload the picture");
        }
        const body = (await uploaded.json()) as { storageId?: string };
        if (!body.storageId) {
          throw new Error("Could not upload the picture");
        }
        imageId = body.storageId as StorageId;
      } else if (picked?.cleared) {
        imageId = null;
      }
      await setStepChallenge({
        weekStart: savingWeek,
        goalSteps: parsedGoal,
        name: nextName,
        ...(imageId !== undefined ? { imageId } : {}),
      });
      setDraft({
        weekStart: savingWeek,
        goal: String(parsedGoal),
        name: nextName,
      });
      rememberPicture(null);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save challenge",
      );
    } finally {
      setSaving(false);
    }
  };

  const onRemove = async () => {
    if (saving || !mine) return;
    const removingWeek = week.weekStart;
    const weekName = isCurrentWeek ? "this week" : week.label;
    if (!window.confirm(`Remove the step challenge for ${weekName}?`)) return;
    setSaving(true);
    setError(null);
    try {
      await deleteStepChallenge({ weekStart: removingWeek });
      setDraft({ weekStart: removingWeek, goal: "", name: "" });
      rememberPicture(null);
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Could not remove challenge",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="space-y-5">
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h1 className="text-xl font-semibold text-zinc-100">Challenges</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Set a shared step goal for this week or a later week. Name it, and
          that name shows on the Feed. Everyone&apos;s steps count toward one
          total. If more than one of you sets a goal, the Feed shows the one
          created most recently.
        </p>
        <label className="mt-4 flex flex-col gap-1.5 text-sm text-zinc-300">
          Name
          <input
            value={nameText}
            onChange={(event) => {
              setDraft({
                weekStart: week.weekStart,
                goal: goalText,
                name: event.target.value.slice(0, 40),
              });
              setError(null);
            }}
            maxLength={40}
            placeholder="10k together"
            disabled={mine === undefined || saving}
            className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 disabled:opacity-60"
          />
        </label>
        <div className="mt-3 flex flex-col gap-1.5 text-sm text-zinc-300">
          Picture
          <p className="text-xs leading-5 text-zinc-500">
            Optional. A transparent PNG at 900×1200 works best. Keep the subject
            in the lower half, facing left, with empty space on the left so the
            numbers stay clear. JPG and WebP work too, up to 4 MB.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-100">
              {previewUrl ? "Replace picture" : "Add picture"}
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                disabled={mine === undefined || saving}
                onChange={(event) => onPickImage(event.target.files?.[0])}
              />
            </label>
            {previewUrl ? (
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  rememberPicture({
                    weekStart: week.weekStart,
                    file: null,
                    cleared: true,
                    previewUrl: null,
                  });
                  setError(null);
                }}
                className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-200 disabled:opacity-50"
              >
                Remove picture
              </button>
            ) : null}
          </div>
          <ChallengePreview
            title={nextName || "Step challenge"}
            steps={onFeed?.isMine ? onFeed.totalSteps : 0}
            goal={parsedGoal && parsedGoal > 0 ? parsedGoal : 0}
            imageUrl={previewUrl}
          />
        </div>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="flex flex-col gap-1.5 text-sm text-zinc-300 sm:w-64">
            Week
            <select
              value={week.weekStart}
              onChange={(event) => {
                setWeekStart(event.target.value);
                setDraft(null);
                setError(null);
              }}
              disabled={saving}
              className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 disabled:opacity-60"
            >
              {weeks.map((item, index) => (
                <option key={item.weekStart} value={item.weekStart}>
                  {index === 0 ? `This week · ${item.label}` : item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-1 flex-col gap-1.5 text-sm text-zinc-300">
            Step goal
            <input
              value={goalText}
              onChange={(event) => {
                setDraft({
                  weekStart: week.weekStart,
                  goal: event.target.value.replace(/\D/g, "").slice(0, 8),
                  name: nameText,
                });
                setError(null);
              }}
              inputMode="numeric"
              placeholder="50000"
              disabled={mine === undefined || saving}
              className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 disabled:opacity-60"
            />
          </label>
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={
              saving ||
              mine === undefined ||
              !nextName ||
              parsedGoal === null ||
              unchanged
            }
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {saving ? "Saving..." : mine ? "Update goal" : "Set goal"}
          </button>
          {mine ? (
            <button
              type="button"
              onClick={() => void onRemove()}
              disabled={saving}
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-200 disabled:opacity-50"
            >
              Remove
            </button>
          ) : null}
        </div>
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        {mine && onFeed && !onFeed.isMine ? (
          <p className="mt-3 text-sm text-zinc-400">
            {onFeed.name.trim() || "A newer goal"} is the one on the Feed. Yours
            stays saved.
          </p>
        ) : null}
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-300">
          On the Feed
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {isCurrentWeek ? "This week" : week.label}
        </p>
        {onFeed === undefined ? (
          <p className="mt-3 text-sm text-zinc-400">Loading...</p>
        ) : onFeed === null ? (
          <p className="mt-3 text-sm text-zinc-400">
            {isCurrentWeek
              ? "No step challenge this week. Friend totals stay at the top of the Feed until one is set."
              : `No step challenge for ${week.label}. Friend totals stay on the Feed for that week until one is set.`}
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <ChallengePreview
              title={onFeed.name.trim() || "Step challenge"}
              steps={onFeed.totalSteps}
              goal={onFeed.goalSteps}
              imageUrl={onFeed.imageUrl}
            />
            <ul className="divide-y divide-zinc-800 border-t border-zinc-800">
              {onFeed.contributions.map((person) => (
                <li
                  key={person.profileId}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="text-zinc-100">{person.name}</span>
                  <span className="text-zinc-400">
                    {formatSteps(person.steps)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
