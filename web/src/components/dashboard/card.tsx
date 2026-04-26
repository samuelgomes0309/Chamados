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
import { assignTicketAction, closeTicketAction } from "@/src/actions/ticket";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { Controller, useForm } from "react-hook-form";
import { CloseTicketData, closeTicketSchema } from "@/src/schemas/ticket";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldLabel } from "../ui/field";

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

export function DashboardCard({
	ticket,
	user_id,
}: {
	ticket: Ticket;
	user_id: string;
}) {
	const isAssigned = user_id === ticket.assigned_to;
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const ticketInfo = STATUS_CONFIG[ticket.status] || DEFAULT_STATUS;
	const created_at = formatDate(ticket.created_at);
	const canAssign =
		ticket.status === "OPEN" &&
		!ticket.assigned_to &&
		ticket.user_id !== user_id;
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
	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
	} = useForm<CloseTicketData>({
		resolver: zodResolver(closeTicketSchema),
		defaultValues: {
			resolution: "",
		},
	});
	async function assignTicket() {
		const response = await assignTicketAction({ ticket_id: ticket.id });
		if (response.success) {
			setOpen(false);
			router.refresh();
		} else {
			toast.error(`Falha ao atribuir chamado, ${response.error}`, {
				style: {
					background: "var(--destructive)",
					border: "none",
					color: "white",
				},
			});
		}
	}
	async function onSubmit(data: CloseTicketData) {
		const response = await closeTicketAction({ ticket_id: ticket.id, ...data });
		if (response.success) {
			toast.success(
				`Chamado encerrado n° ${ticket.ticket_number} com sucesso!`,
				{
					style: {
						background: "var(--success)",
						border: "none",
						color: "white",
					},
				}
			);
			setOpen(false);
			router.refresh();
		} else {
			toast.error(`Erro ao encerrar chamado n° ${ticket.ticket_number}`, {
				style: {
					background: "var(--destructive)",
					border: "none",
					color: "white",
				},
			});
		}
	}
	return (
		<>
			<Card
				className="w-full cursor-pointer border border-border-strong bg-surface-deep px-2 py-3 transition-all duration-700 hover:border-teal/40"
				onClick={() => setOpen(true)}
			>
				<CardContent className="flex h-full flex-col justify-between space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-lg font-bold text-white">
							Chamado: {ticket.ticket_number}
						</span>
						{StatusBadge}
					</div>
					<p className="text-md max-h-6 overflow-hidden text-ellipsis text-muted-foreground">
						Breve descrição: {ticket.title}
					</p>
					<p className="text-md max-h-6 overflow-hidden text-end text-ellipsis text-muted-foreground">
						Criado em: {created_at}
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
					{canAssign && (
						<div className="flex justify-end">
							<Button
								onClick={assignTicket}
								className="cursor-pointer bg-success/50 font-bold transition-colors duration-700 hover:bg-success/70 focus-visible:ring-0"
							>
								Atender
							</Button>
						</div>
					)}
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
							<InfoField
								content={ticket.closed_at ? formatDate(ticket.closed_at) : "—"}
								title="Fechamento"
							/>
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
					{ticket.status === "IN_PROGRESS" && isAssigned && (
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
							<Controller
								name="resolution"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name} className={"text-white"}>
											Resolução do chamado
										</FieldLabel>
										<div className="relative flex w-full">
											<Textarea
												id={field.name}
												placeholder="Descreva a resolução do chamado ex: O problema foi identificado e corrigido, o sistema está funcionando corretamente"
												className={`min-h-20 w-full resize-none rounded-md border bg-steel p-2 text-white placeholder:text-white/50 focus:outline-none ${
													fieldState.error
														? "border-destructive focus:border-destructive"
														: "border-snow/15 focus:border-blue-300/50"
												}`}
												{...field}
												autoComplete="off"
												maxLength={100}
											/>
										</div>
										{fieldState.error && (
											<FieldError>{fieldState.error.message}</FieldError>
										)}
									</Field>
								)}
							/>
							<div className="flex justify-end">
								<Button
									type="submit"
									className="cursor-pointer bg-teal font-bold transition-colors duration-700 hover:bg-teal-600 focus-visible:ring-0"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<div className="size-4 animate-spin rounded-full border border-t-black"></div>
									) : (
										"Encerrar"
									)}
								</Button>
							</div>
						</form>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
