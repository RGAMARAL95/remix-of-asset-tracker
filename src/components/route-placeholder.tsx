// Infrastructure scaffold only — routes resolve to this until the real screen
// pages are built in the screen phase. Not a product screen.
export function RoutePlaceholder({ name }: { name: string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <p className="text-sm text-muted-foreground">{name} — coming soon…</p>
    </div>
  );
}

export default RoutePlaceholder;
