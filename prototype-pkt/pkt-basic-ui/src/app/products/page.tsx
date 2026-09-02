import { ProductManagement } from "@/features/product-management/ProductManagement";
import { RequireAuth } from "@/widgets/guards/RequireAuth";

export default function ProductsPage() {
  return <RequireAuth><ProductManagement /></RequireAuth>;
}
