import Link from "next/link";

type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
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
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8">
          <Link href="/login" className="text-sm text-primary hover:underline">
            Back to Merchant Login
          </Link>
          <h1 className="mt-4 text-2xl font-semibold md:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            {effectiveDate ? <p>Effective Date: {effectiveDate}</p> : null}
            {lastUpdated ? <p>Last Updated: {lastUpdated}</p> : null}
          </div>
        </div>

        <div className="space-y-6 rounded-xl border border-border bg-card p-5 md:p-8">
          {sections.map((section) => (
            <section key={section.heading} className="space-y-3">
              <h2 className="text-base font-semibold md:text-lg">{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-6 text-muted-foreground">
                  {paragraph}
                </p>
              ))}
              {section.bullets?.length ? (
                <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
