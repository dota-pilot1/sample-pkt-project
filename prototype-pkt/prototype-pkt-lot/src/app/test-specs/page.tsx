import { TestSpecManagement } from "@/features/package-test/ui/TestSpecManagement";
import { RequireAuth } from "@/widgets/guards/RequireAuth";

export default function TestSpecsPage() { return <RequireAuth><TestSpecManagement /></RequireAuth>; }
