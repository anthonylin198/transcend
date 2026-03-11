"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { api, useMutation, useQuery } from "@transcend/convex";
import {
  DragDropProvider,
  useDroppable,
  type DragDropEvents,
} from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";

const STATUS_SECTIONS = [
  { key: "next_up", label: "Next Up" },
  { key: "todo", label: "Todo" },
  { key: "done", label: "Done" },
] as const;

type PriorityStatus = (typeof STATUS_SECTIONS)[number]["key"];

type BoardPriority = {
  _id: string;
  name: string;
  description?: string;
  status: PriorityStatus;
};

type PriorityBoard = Record<PriorityStatus, BoardPriority[]>;

function createEmptyBoard(): PriorityBoard {
  return {
    next_up: [],
    todo: [],
    done: [],
  };
}

function isPriorityStatus(value: string): value is PriorityStatus {
  return STATUS_SECTIONS.some((section) => section.key === value);
}

function buildBoard(priorities: BoardPriority[]): PriorityBoard {
  const board = createEmptyBoard();
  for (const priority of priorities) {
    board[priority.status].push(priority);
  }
  return board;
}

function boardItems(board: PriorityBoard) {
  return STATUS_SECTIONS.flatMap((section) =>
    board[section.key].map((priority) => ({
      priorityId: priority._id,
      status: section.key,
    })),
  );
}

function findPriorityContainer(board: PriorityBoard, id: string) {
  if (isPriorityStatus(id)) return id;

  for (const section of STATUS_SECTIONS) {
    if (board[section.key].some((priority) => priority._id === id)) {
      return section.key;
    }
  }

  return null;
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function reorderBoard(
  board: PriorityBoard,
  activeId: string,
  overId: string,
): PriorityBoard {
  const from = findPriorityContainer(board, activeId);
  const to = findPriorityContainer(board, overId);

  if (!from || !to) return board;

  const fromItems = board[from];
  const sourceIndex = fromItems.findIndex((item) => item._id === activeId);
  if (sourceIndex < 0) return board;

  if (from === to) {
    if (activeId === overId) return board;
    const targetIndex = isPriorityStatus(overId)
      ? fromItems.length - 1
      : fromItems.findIndex((item) => item._id === overId);
    if (targetIndex < 0) return board;

    return {
      ...board,
      [from]: moveItem(fromItems, sourceIndex, targetIndex),
    };
  }

  const toItems = board[to];
  const moved = fromItems[sourceIndex];
  const targetIndex = isPriorityStatus(overId)
    ? toItems.length
    : toItems.findIndex((item) => item._id === overId);
  const insertIndex = targetIndex < 0 ? toItems.length : targetIndex;

  return {
    ...board,
    [from]: fromItems.filter((item) => item._id !== activeId),
    [to]: [
      ...toItems.slice(0, insertIndex),
      { ...moved, status: to },
      ...toItems.slice(insertIndex),
    ],
  };
}

function SortablePriorityCard({
  priority,
  status,
  index,
}: {
  priority: BoardPriority;
  status: PriorityStatus;
  index: number;
}) {
  const { ref, isDragging } = useSortable({
    id: priority._id,
    index,
    group: "project-priorities",
    data: { status },
  });

  return (
    <div
      ref={ref}
      className={`rounded-md border border-zinc-700 bg-black p-3 text-sm ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="w-full cursor-grab text-left active:cursor-grabbing">
        <p className="font-medium text-zinc-100">{priority.name}</p>
        {priority.description ? (
          <p className="mt-1 text-xs text-zinc-400">{priority.description}</p>
        ) : null}
      </div>
    </div>
  );
}

function BoardColumn({
  id,
  children,
}: {
  id: PriorityStatus;
  children: ReactNode;
}) {
  const { ref, isDropTarget } = useDroppable({ id });

  return (
    <div
      ref={ref}
      className={`min-h-12 space-y-2 rounded-sm ${
        isDropTarget ? "bg-zinc-800/40" : ""
      }`}
    >
      {children}
    </div>
  );
}

export default function ProjectDetailsPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [newPriorityName, setNewPriorityName] = useState("");
  const [newPriorityDescription, setNewPriorityDescription] = useState("");
  const [newPriorityStatus, setNewPriorityStatus] =
    useState<PriorityStatus>("todo");
  const [creatingPriority, setCreatingPriority] = useState(false);
  const [priorityBoard, setPriorityBoard] = useState<PriorityBoard>(
    createEmptyBoard,
  );
  const dragStartBoardRef = useRef<PriorityBoard | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priorityError, setPriorityError] = useState<string | null>(null);

  const homeBootstrap = useQuery(api.home.bootstrap.bootstrap, {});
  const priorities = useQuery(
    api.priorities.listPrioritiesByProject.listPrioritiesByProject,
    params.projectId ? { projectId: params.projectId as never } : "skip",
  );
  const updateProject = useMutation(api.projects.updateProject.updateProject);
  const deleteProject = useMutation(api.projects.deleteProject.deleteProject);
  const createPriority = useMutation(api.priorities.createPriority.createPriority);
  const setPriorityStatus = useMutation(
    api.priorities.setPriorityStatus.setPriorityStatus,
  );
  const reorderPriorities = useMutation(
    api.priorities.reorderPriorities.reorderPriorities,
  );

  const project = useMemo(
    () => homeBootstrap?.projects.find((item) => item._id === params.projectId),
    [homeBootstrap?.projects, params.projectId],
  );

  const currentName = name ?? project?.name ?? "";
  const currentDescription = description ?? project?.description ?? "";

  useEffect(() => {
    if (!priorities) return;
    setPriorityBoard(
      buildBoard(
        priorities.map((priority) => ({
          _id: priority._id,
          name: priority.name,
          description: priority.description,
          status: priority.status as PriorityStatus,
        })),
      ),
    );
  }, [priorities]);

  const persistBoard = async (nextBoard: PriorityBoard) => {
    if (!project) return;
    setPriorityError(null);
    try {
      await reorderPriorities({
        items: boardItems(nextBoard).map((item) => ({
          priorityId: item.priorityId as never,
          status: item.status,
        })),
        projectId: project._id,
      });
    } catch (reorderError) {
      setPriorityError(
        reorderError instanceof Error
          ? reorderError.message
          : "Failed to reorder priorities.",
      );
    }
  };

  const onDragEnd = (event: Parameters<DragDropEvents["dragend"]>[0]) => {
    if (event.canceled) {
      if (dragStartBoardRef.current) {
        setPriorityBoard(dragStartBoardRef.current);
      }
      dragStartBoardRef.current = null;
      return;
    }
    const sourceId = event.operation.source?.id;
    const targetId = event.operation.target?.id;
    if (sourceId === null || sourceId === undefined) return;
    if (targetId === null || targetId === undefined) return;

    const activeId = String(sourceId);
    const overId = String(targetId);

    setPriorityBoard((prev) => {
      const nextBoard = reorderBoard(prev, activeId, overId);
      if (nextBoard === prev) {
        return prev;
      }
      void persistBoard(nextBoard);
      return nextBoard;
    });
    dragStartBoardRef.current = null;
  };

  const onBeforeDragStart = () => {
    setPriorityBoard((prev) => {
      dragStartBoardRef.current = prev;
      return prev;
    });
  };

  const onDragOver = (event: Parameters<DragDropEvents["dragover"]>[0]) => {
    const sourceId = event.operation.source?.id;
    const targetId = event.operation.target?.id;
    if (sourceId === null || sourceId === undefined) return;
    if (targetId === null || targetId === undefined) return;

    const activeId = String(sourceId);
    const overId = String(targetId);
    setPriorityBoard((prev) => reorderBoard(prev, activeId, overId));
  };

  const onCreatePriority = async () => {
    if (!project || creatingPriority) return;
    const nextName = newPriorityName.trim();
    const nextDescription = newPriorityDescription.trim();
    if (!nextName) {
      setPriorityError("Priority name is required.");
      return;
    }

    setCreatingPriority(true);
    setPriorityError(null);
    try {
      const priorityId = await createPriority({
        projectId: project._id,
        name: nextName,
        description: nextDescription.length > 0 ? nextDescription : undefined,
      });
      if (newPriorityStatus !== "todo") {
        await setPriorityStatus({
          priorityId,
          status: newPriorityStatus,
        });
      }
      setNewPriorityName("");
      setNewPriorityDescription("");
      setNewPriorityStatus("todo");
    } catch (createError) {
      setPriorityError(
        createError instanceof Error
          ? createError.message
          : "Failed to create priority.",
      );
    } finally {
      setCreatingPriority(false);
    }
  };

  const onSave = async () => {
    if (!project || saving || deleting) return;
    const nextName = currentName.trim();
    const nextDescription = currentDescription.trim();
    if (!nextName) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateProject({
        projectId: project._id,
        name: nextName,
        description: nextDescription.length > 0 ? nextDescription : null,
      });
      router.push("/systems");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Failed to save",
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!project || deleting || saving) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteProject({ projectId: project._id });
      router.push("/systems");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Failed to delete",
      );
      setDeleting(false);
    }
  };

  if (!project) {
    return (
      <main className="space-y-4">
        <p className="text-zinc-400">Project not found.</p>
        <Link href="/systems" className="text-sm text-zinc-200 underline">
          Back to Systems
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl space-y-4">
      <Link
        href="/systems"
        className="text-sm text-zinc-400 hover:text-zinc-200"
      >
        ← Back to Systems
      </Link>
      <h1 className="text-2xl font-semibold text-zinc-100">Project Details</h1>

      <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <label className="space-y-1 text-sm">
          <span className="text-zinc-400">Name</span>
          <input
            value={currentName}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-zinc-400">Description</span>
          <textarea
            value={currentDescription}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </label>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={saving || deleting}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => void onDelete()}
            disabled={saving || deleting}
            className="rounded-md border border-red-900 bg-red-950/40 px-4 py-2 text-sm text-red-300 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Project"}
          </button>
        </div>
      </div>

      <section className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Priorities</h2>
          <span className="text-sm text-zinc-400">
            {priorities ? priorities.length : 0}
          </span>
        </div>

        <div className="grid gap-2 lg:grid-cols-[1.4fr_2fr_auto]">
          <input
            value={newPriorityName}
            onChange={(event) => setNewPriorityName(event.target.value)}
            placeholder="New priority name"
            className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <input
            value={newPriorityDescription}
            onChange={(event) => setNewPriorityDescription(event.target.value)}
            placeholder="Description (optional)"
            className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <div className="flex gap-2">
            <select
              value={newPriorityStatus}
              onChange={(event) =>
                setNewPriorityStatus(event.target.value as PriorityStatus)
              }
              className="rounded-md border border-zinc-700 bg-black px-2 py-2 text-sm text-zinc-100"
            >
              {STATUS_SECTIONS.map((section) => (
                <option key={section.key} value={section.key}>
                  {section.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void onCreatePriority()}
              disabled={creatingPriority || !newPriorityName.trim()}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
            >
              {creatingPriority ? "Adding..." : "Add"}
            </button>
          </div>
        </div>

        {priorityError ? (
          <p className="text-sm text-red-300">{priorityError}</p>
        ) : null}

        {!priorities ? (
          <p className="text-sm text-zinc-400">Loading priorities...</p>
        ) : (
          <DragDropProvider
            onBeforeDragStart={onBeforeDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <div className="grid gap-3 lg:grid-cols-3">
              {STATUS_SECTIONS.map((section) => (
                <div
                  key={section.key}
                  className="rounded-md border border-zinc-800 bg-black/40 p-3"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-zinc-200">
                      {section.label}
                    </h3>
                    <span className="text-xs text-zinc-500">
                      {priorityBoard[section.key].length}
                    </span>
                  </div>
                  <BoardColumn id={section.key}>
                    {priorityBoard[section.key].map((priority, index) => (
                      <SortablePriorityCard
                        key={priority._id}
                        priority={priority}
                        status={section.key}
                        index={index}
                      />
                    ))}
                  </BoardColumn>
                </div>
              ))}
            </div>
          </DragDropProvider>
        )}
      </section>
    </main>
  );
}
