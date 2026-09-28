import { type ElementType } from "react";

export interface KindCard {
  name: string;
  example: string;
  icon: ElementType;
}

interface Features03Props {
  heading: string;
  kinds: KindCard[];
}

/**
 * Asset kinds grid — eight cards in a bento grid, one per asset kind. Each
 * card: Lucide/Tabler icon + kind name + a one-line example. 4-col desktop,
 * 2-col tablet, 1-col mobile. Enumerates coverage so edge-case assets read as
 * supported.
 */
export function Features03({ heading, kinds }: Features03Props) {
  return (
    <section className="landing py-24">
      <div className="mx-auto max-w-page px-6 lg:px-8">
        <h2 className="text-balance">{heading}</h2>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kinds.map((kind) => (
            <div
              key={kind.name}
              className="rounded-lg border border-border bg-card p-6"
            >
              <kind.icon className="size-6 text-primary" aria-hidden="true" />
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {kind.name}
              </h3>
              <p className="mt-1 text-pretty text-sm text-muted-foreground">
                {kind.example}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
