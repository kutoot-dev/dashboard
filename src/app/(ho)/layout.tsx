import { AppShell } from "@/components/layout/app-shell";

export default function HOLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
