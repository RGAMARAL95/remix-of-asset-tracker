import { Link } from "react-router-dom";
import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/base/button";

interface Cta01Props {
  heading: string;
  primaryCta: { label: string; to: string };
}

/**
 * CTA banner — centered headline + a single primary button. One last, clear
 * push before the footer. No secondary CTA.
 */
export function Cta01({ heading, primaryCta }: Cta01Props) {
  return (
    <section className="landing py-24">
      <div className="mx-auto flex max-w-page flex-col items-center px-6 text-center lg:px-8">
        <h2 className="max-w-2xl text-balance">{heading}</h2>
        <div className="mt-10">
          <Button size="lg" asChild>
            <Link to={primaryCta.to}>
              {primaryCta.label}
              <IconArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
