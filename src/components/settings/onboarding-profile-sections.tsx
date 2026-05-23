"use client";

import { Card } from "@/components/ui/card";
import type { OnboardingProfileField, OnboardingProfileSection } from "@/lib/api/services/merchant.service";

interface OnboardingProfileSectionsProps {
  sections: OnboardingProfileSection[];
}

export function OnboardingProfileSections({ sections }: OnboardingProfileSectionsProps) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <Card key={section.id} className="overflow-hidden p-0">
          <div className="border-b border-border px-4 py-3">
            <p className="font-semibold text-foreground">{section.title}</p>
            {section.description ? (
              <p className="mt-1 text-xs text-muted-foreground">{section.description}</p>
            ) : null}
          </div>

          <dl className="divide-y divide-border">
            {section.fields.map((field) => (
              <ProfileFieldRow key={`${section.id}-${field.label}`} field={field} />
            ))}
          </dl>
        </Card>
      ))}
    </div>
  );
}

function ProfileFieldRow({ field }: { field: OnboardingProfileField }) {
  const isMultiline = field.value.includes("\n");

  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {field.label}
      </dt>
      <dd
        className={`text-sm text-foreground ${isMultiline ? "whitespace-pre-line" : "break-words"}`}
      >
        {field.type === "url" && field.value !== "Not provided" ? (
          <a
            href={field.value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2"
          >
            View uploaded file
          </a>
        ) : (
          field.value
        )}
      </dd>
    </div>
  );
}
