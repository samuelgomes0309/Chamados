"use client";

import { Card, CardContent } from "../ui/card";
import { cn } from "@/src/lib/utils";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { useState } from "react";
import { X } from "lucide-react";
import type { Ticket } from "@/src/@types/ticket/ticket";
import { formatDate } from "@/src/utils/formDate";

//  Mapeamento de status
const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
	CLOSED: { label: "Fechado", style: "bg-destructive/20 text-destructive" },
	OPEN: { label: "Aberto", style: "bg-success/20 text-success" },
};
const DEFAULT_STATUS = {
	label: "Em andamento",
	style: "bg-orange/20 text-orange",
};

//  Componente de controle de informações
const InfoField = ({
	content,
	title,
	styles,
}: {
	content: string;
	title: string;
	styles?: string;
}) => {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-md text-white">{title}</span>
			<div
				className={cn(
					"rounded-md border border-snow/15 bg-steel px-3 py-2 text-sm text-white/70",
					styles
				)}
			>
				{content}
			</div>
		</div>
	);
};

export function TicketCard({ ticket }: { ticket: Ticket }) {
	const [open, setOpen] = useState(false);
	const ticketInfo = STATUS_CONFIG[ticket.status] || DEFAULT_STATUS;
	const StatusBadge = (
		<div
			className={cn(
				"text-md rounded-full px-4 py-0.5 font-medium",
				ticketInfo.style
			)}
		>
			<span>{ticketInfo.label}</span>
		</div>
	);
	return (
		<>
			<Card
				className="w-full cursor-pointer border border-border-strong bg-surface-deep px-2 py-3 transition-all duration-700 hover:border-teal/40"
				onClick={() => setOpen(true)}
			>
				<CardContent className="flex flex-col justify-center gap-2">
					<div className="flex items-center justify-between">
						<span className="font-bold text-white">
							Chamado: {ticket.ticket_number}
						</span>
						{StatusBadge}
					</div>
					<p className="text-md max-h-6 overflow-hidden text-ellipsis text-muted-foreground">
						Breve descrição: {ticket.title}
					</p>
				</CardContent>
			</Card>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent
					onInteractOutside={(e) => e.preventDefault()}
					showCloseButton={false}
					aria-describedby="Modal de detalhes do chamado"
					className="flex max-h-[90vh] w-[calc(100%-2rem)] flex-col border border-border-strong bg-surface-deep px-4 py-3 sm:max-w-4xl"
				>
					<DialogHeader className="space-y-3">
						<div className="flex w-full justify-end">
							<Button
								type="button"
								title="Fechar"
								className="max-w-14 cursor-pointer bg-destructive font-bold transition-colors duration-700 hover:bg-destructive/90 focus-visible:ring-0"
								onClick={() => setOpen(false)}
							>
								<X aria-hidden="true" />
							</Button>
						</div>
						<div className="flex items-center justify-between">
							<h1 className="text-2xl font-bold text-white">
								Chamado: {ticket.ticket_number}
							</h1>
							<InfoField
								content={ticket.User?.name ?? "—"}
								title="Aberto por"
							/>
						</div>
						<DialogTitle className="text-xl font-bold text-white">
							{ticket.title}
						</DialogTitle>
						<DialogDescription>
							Descrição do problema: <br /> {ticket.description}
						</DialogDescription>
					</DialogHeader>
					<div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto pb-4 md:grid-cols-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent">
						<InfoField content={ticket.Sector?.name ?? "—"} title="Setor" />
						<InfoField
							content={ticket.Category?.name ?? "—"}
							title="Categoria"
						/>
						<InfoField
							content={formatDate(ticket.created_at)}
							title="Data de criação"
						/>
						<InfoField
							content={formatDate(ticket.updated_at)}
							title="Última atualização"
						/>
						<InfoField
							content={ticketInfo.label}
							title="Status"
							styles={ticketInfo.style}
						/>
						{ticket.status !== "OPEN" && (
							<>
								<InfoField
									content={ticket.AssignedUser?.name ?? "—"}
									title="Atendido por"
								/>
								<InfoField
									content={
										ticket.started_at ? formatDate(ticket.started_at) : "—"
									}
									title="Início do atendimento"
								/>
							</>
						)}
						{ticket.status === "CLOSED" && (
							<>
								<InfoField
									content={
										ticket.closed_at ? formatDate(ticket.closed_at) : "—"
									}
									title="Fechamento"
								/>
								<InfoField
									content={ticket.resolution ?? "—"}
									styles=" min-h-20 "
									title="Resolução do chamado"
								/>
							</>
						)}
					</div>
					{ticket.ticketAttachments?.length > 0 && (
						<div className="flex flex-col gap-2 text-white">
							<span className="text-md text-white">Anexos</span>
							{ticket.ticketAttachments.map((attachment) => (
								<a
									key={attachment.id}
									href={attachment.url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-between rounded-md border border-snow/15 bg-steel px-3 py-2 transition-colors hover:border-teal/40"
								>
									<span className="truncate text-sm text-white/70">
										{attachment.name}
									</span>
									<span className="text-xs text-white/40 uppercase">
										{attachment.mime_type.split("/")[1]}
									</span>
								</a>
							))}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
