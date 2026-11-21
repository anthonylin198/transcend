export function LoadingScreen({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 text-zinc-400">
      {label}
    </div>
  );
}
