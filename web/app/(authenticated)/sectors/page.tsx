import { listSectorAction } from "@/src/actions/sector";
import { Sector } from "@/src/components/sector";

export default async function SectorsPage() {
	const sectors = await listSectorAction({ status: "ACTIVE" });
	return <Sector sectors={sectors.data || []} />;
}
