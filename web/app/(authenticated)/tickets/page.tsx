import { listSectorAction } from "@/src/actions/sector";
import { listTicketByUserAction } from "@/src/actions/ticket";
import { Ticket } from "@/src/components/ticket";

export default async function TicketsPage() {
	const sectorsResult = await listSectorAction({ status: "ACTIVE" });
	const ticketsResult = await listTicketByUserAction();
	const sectors = sectorsResult.data ?? [];
	const tickets = ticketsResult.data ?? [];
	return <Ticket sectors={sectors} tickets={tickets} />;
}
