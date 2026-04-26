import { listTicketsAction } from "@/src/actions/ticket";
import { TicketsDashboard } from "@/src/components/dashboard";
import { unstable_noStore as noStore } from "next/cache";
import { Suspense } from "react";

export default async function DashboardPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	noStore();
	const { page: pageParam } = await searchParams;
	const page = Math.max(1, Number(pageParam) || 1);
	const ticketsResult = await listTicketsAction({ page, limit: 10 });
	const tickets = ticketsResult.data ?? [];
	const limit = ticketsResult.meta?.limit ?? 10;
	const total = ticketsResult.meta?.total ?? 0;
	return (
		<Suspense>
			<TicketsDashboard
				tickets={tickets}
				page={page}
				limit={limit}
				total={total}
			/>
		</Suspense>
	);
}
