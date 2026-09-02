import { MissionDetail, missions } from "@/features/missions";
import { RequireAuth } from "@/widgets/guards/RequireAuth";

export function generateStaticParams() {
  return missions.map(({ id }) => ({ missionId: id }));
}

export default function MissionPage() {
  return <RequireAuth><MissionDetail /></RequireAuth>;
}
