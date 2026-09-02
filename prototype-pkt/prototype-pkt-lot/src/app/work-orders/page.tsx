import { WorkOrderManagement } from "@/features/work-order-management/WorkOrderManagement";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
export default function WorkOrdersPage() { return <RequireAuth><WorkOrderManagement /></RequireAuth>; }
