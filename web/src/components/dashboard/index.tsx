"use client";

import type { Ticket } from "@/src/@types/ticket/ticket";
import { Header } from "../header";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DashboardCard } from "./card";
import { PaginationDashboard } from "./pagination";
import { useUser } from "@/src/contexts/userContext";

export function TicketsDashboard({
	tickets,
	page,
	limit,
	total,
}: {
	tickets: Ticket[];
	page: number;
	limit: number;
	total: number;
}) {
	const { id } = useUser();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const sectorName = tickets[0]?.Sector?.name;
	function handleUpdatePage(newPage: number) {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", String(newPage));
		router.push(`${pathname}?${params.toString()}`);
	}
	return (
		<div className="flex min-h-full flex-1 flex-col">
			<Header
				title="Dashboard"
				description={`${sectorName ? `Gerencie os chamados do setor do(a) ${sectorName}` : ""}`}
				buttonText="Novo chamado"
				onButtonClick={() => router.push("/tickets")}
			/>
			{tickets.length > 0 ? (
				<div className="mt-4 grid w-full auto-rows-fr grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{tickets.map((ticket) => (
						<DashboardCard key={ticket.id} ticket={ticket} user_id={id} />
					))}
				</div>
			) : (
				<p className="mt-4 text-gray-500">
					{sectorName
						? `O setor ${sectorName} está sem chamados...`
						: "Usuário não possui setor cadastrado..."}
				</p>
			)}
			{total > limit && (
				<PaginationDashboard
					page={page}
					limit={limit}
					total={total}
					onPageChange={(page) => {
						handleUpdatePage(page);
					}}
				/>
			)}
		</div>
	);
}
