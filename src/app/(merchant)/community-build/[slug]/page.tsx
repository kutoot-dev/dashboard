import { notFound } from "next/navigation";
import { CommunityBuildDetail } from "@/components/community-build/community-build-screen";
import {
  COMMUNITY_BUILD_SCREENS,
  getCommunityBuildScreen,
} from "@/lib/community-build/screens";

export function generateStaticParams() {
  return COMMUNITY_BUILD_SCREENS.map((screen) => ({ slug: screen.slug }));
}

export default async function CommunityBuildDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const screen = getCommunityBuildScreen(slug);

  if (!screen) {
    notFound();
  }

  return <CommunityBuildDetail screen={screen} />;
}
