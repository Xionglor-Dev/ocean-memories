import { AdminDashboard } from "@/app/admin/admin-dashboard";
import { OceanBackground } from "@/components/ocean/ocean-background";
import { requireAdmin } from "@/lib/auth";
import { getAdminMemories } from "@/lib/data/memories";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // The dashboard is server-protected before any admin memory data is loaded.
  await requireAdmin();
  const memories = await getAdminMemories();

  return (
    <main className="relative min-h-screen">
      <OceanBackground />
      <AdminDashboard memories={memories} />
    </main>
  );
}
