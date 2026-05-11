import Link from "next/link";

export type LegalSubsection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  subsections?: LegalSubsection[];
  trailingParagraphs?: string[];
};

type LegalDocumentPageProps = {
  title: string;
  subtitle: string;
  effectiveDate?: string;
  lastUpdated?: string;
  sections: LegalSection[];
};

export function LegalDocumentPage({
  title,
  subtitle,
  effectiveDate,
  lastUpdated,
  sections,
}: LegalDocumentPageProps) {
  return (
    <main className="relative min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="gradient-brand-soft absolute inset-0 opacity-65" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <div className="mb-8">
          <Link href="/login" className="text-sm text-primary underline-offset-2 transition-colors hover:underline">
            Back to Merchant Login
          </Link>
          <h1 className="font-display mt-4 text-2xl font-semibold md:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            {effectiveDate ? <p>Effective Date: {effectiveDate}</p> : null}
            {lastUpdated ? <p>Last Updated: {lastUpdated}</p> : null}
          </div>
        </div>

        <div className="glass-card space-y-6 rounded-2xl border border-border/80 p-5 shadow-[0_22px_54px_rgba(5,8,24,0.34)] md:p-8">
          {sections.map((section, sectionIndex) => (
            <section key={`${sectionIndex}-${section.heading}`} className="space-y-3">
              <h2 className="text-base font-semibold md:text-lg">{section.heading}</h2>
              {section.paragraphs?.map((paragraph, i) => (
                <p key={i} className="text-sm leading-6 text-muted-foreground">
                  {paragraph}
                </p>
              ))}
              {section.bullets?.length ? (
                <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
                  {section.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
              {section.subsections?.map((sub, i) => (
                <div key={i} className="space-y-2 pt-1">
                  <h3 className="text-sm font-semibold text-foreground">{sub.title}</h3>
                  {sub.paragraphs?.map((p, j) => (
                    <p key={j} className="text-sm leading-6 text-muted-foreground">
                      {p}
                    </p>
                  ))}
                  {sub.bullets?.length ? (
                    <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
                      {sub.bullets.map((bullet, k) => (
                        <li key={k}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
              {section.trailingParagraphs?.map((p, i) => (
                <p key={i} className="text-sm leading-6 text-muted-foreground">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
