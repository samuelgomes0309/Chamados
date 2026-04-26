"use client";

import type { Sector } from "@/src/@types/sector/sector";
import { Header } from "../header";
import { TicketModal } from "./dialog";
import { useState } from "react";
import type { Ticket } from "@/src/@types/ticket/ticket";
import { TicketCard } from "./card";

export function Ticket({
	sectors,
	tickets,
}: {
	sectors: Sector[];
	tickets: Ticket[];
}) {
	const [ticketList, setTicketList] = useState<Ticket[]>(tickets);
	const [visible, setVisible] = useState(false);
	return (
		<div>
			<Header
				title="Chamados"
				description="Gerencie um novo chamado"
				buttonText="Novo chamado"
				onButtonClick={() => setVisible(true)}
			/>
			{visible && (
				<TicketModal
					sectors={sectors}
					open={visible}
					onClose={() => setVisible(false)}
					onChangeList={(newItem) =>
						setTicketList((prev) => [...prev, newItem])
					}
				/>
			)}
			{ticketList.length > 0 ? (
				<>
					<h1 className="mt-4 text-xl font-bold">Meus chamados</h1>
					<div className="mt-4 grid w-full grid-cols-1 items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{ticketList.map((ticket) => (
							<TicketCard key={ticket.id} ticket={ticket} />
						))}
					</div>
				</>
			) : (
				<p className="mt-4 text-gray-500">Abra um novo chamado...</p>
			)}
		</div>
	);
}
