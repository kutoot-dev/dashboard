import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

interface ComingSoonProps {
  title: string;
  subtitle: string;
}

export function ComingSoon({ title, subtitle }: ComingSoonProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={subtitle} />
      <Card className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Under implementation</p>
        <p className="text-sm text-foreground">
          This screen is being migrated to the new merchant APIs and will be enabled in the next iteration.
        </p>
      </Card>
    </div>
  );
}
