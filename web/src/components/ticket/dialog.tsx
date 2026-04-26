"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { CreateTicketData, createTicketSchema } from "@/src/schemas/ticket";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { Sector } from "@/src/@types/sector/sector";
import type { Category } from "@/src/@types/category/category";
import { useEffect, useMemo, useState } from "react";
import { createTicketAction } from "@/src/actions/ticket";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import type { Ticket } from "@/src/@types/ticket/ticket";

interface TicketCardProps {
	onClose: () => void;
	open: boolean;
	onChangeList: (newItem: Ticket) => void;
	sectors: Sector[];
}

export function TicketModal({
	sectors,
	open,
	onClose,
	onChangeList,
}: TicketCardProps) {
	const [files, setFiles] = useState<File[]>([]);
	const {
		handleSubmit,
		control,
		reset,
		setValue,
		formState: { isSubmitting },
	} = useForm<CreateTicketData>({
		resolver: zodResolver(createTicketSchema),
		defaultValues: {
			sector_id: "",
			category_id: "",
			description: "",
			title: "",
		},
	});
	const sector_id = useWatch({
		control,
		name: "sector_id",
	});
	const categories: Category[] = useMemo(() => {
		const sector = sectors.find((sector) => sector.id === sector_id);
		return sector ? sector.categories : [];
	}, [sector_id, sectors]);
	useEffect(() => {
		setValue("category_id", "");
	}, [sector_id, setValue]);
	async function onSubmit(data: CreateTicketData) {
		const response = await createTicketAction(data);
		if (response.success && response.data) {
			toast.success(
				`Chamado n° ${response.data.ticket_number} aberto com sucesso!`,
				{
					style: {
						background: "var(--success)",
						border: "none",
						color: "white",
					},
				}
			);
			onChangeList(response.data);
			setFiles([]);
			reset({
				sector_id: response.data.sector_id,
				category_id: response.data.category_id,
			});
			onClose();
		} else {
			toast.error(`Erro ao tentar abrir o chamado`, {
				style: {
					background: "var(--destructive)",
					border: "none",
					color: "white",
				},
			});
		}
	}
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="border border-border-strong bg-surface-deep px-4 py-3 sm:max-w-4xl">
				<DialogTitle className="text-xl font-extrabold text-white">
					Novo Chamado
				</DialogTitle>
				<form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-3">
					<Controller
						name="title"
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name} className={"text-white"}>
									Titulo do chamado
								</FieldLabel>
								<div className="relative flex w-full">
									<Input
										id={field.name}
										placeholder="Digite o titulo do chamado"
										type="text"
										className={`rounded-md border-snow/15 bg-steel text-white placeholder:text-white/50 focus-visible:ring-0 ${fieldState.error ? "border-destructive" : ""} focus-visible:border-blue-300/50`}
										{...field}
										autoComplete="off"
										maxLength={20}
									/>
								</div>
								{fieldState.error && (
									<FieldError>{fieldState.error.message}</FieldError>
								)}
							</Field>
						)}
					/>
					<div className="flex flex-col gap-4 md:flex-row">
						<div className="flex-1">
							<Controller
								name="sector_id"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel className="text-white">Setor</FieldLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<SelectTrigger className="text-white data-placeholder:text-white/50">
												<SelectValue placeholder="Selecione o setor" />
											</SelectTrigger>
											<SelectContent>
												{sectors.map((sector) => (
													<SelectItem key={sector.id} value={sector.id}>
														{sector.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{fieldState.error && (
											<FieldError>{fieldState.error.message}</FieldError>
										)}
									</Field>
								)}
							/>
						</div>
						<div className="flex-1 items-center justify-center">
							{categories.length > 0 ? (
								<Controller
									name="category_id"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel className="text-white">Problema</FieldLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<SelectTrigger className="text-white data-placeholder:text-white/50">
													<SelectValue placeholder="Selecione o setor" />
												</SelectTrigger>
												<SelectContent>
													{categories.map((category) => (
														<SelectItem key={category.id} value={category.id}>
															{category.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{fieldState.error && (
												<FieldError>{fieldState.error.message}</FieldError>
											)}
										</Field>
									)}
								/>
							) : (
								<Field>
									<FieldLabel className="text-white">Problema</FieldLabel>
									<div className="relative flex w-full">
										<div className="w-full resize-none rounded-md border border-destructive/40 bg-steel p-1.5 text-destructive/70">
											Solicite o departamento de TI a inclusão de problemas para
											este setor.
										</div>
									</div>
								</Field>
							)}
						</div>
					</div>
					<Controller
						name="description"
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name} className={"text-white"}>
									Descrição do chamado
								</FieldLabel>
								<div className="relative flex w-full">
									<Textarea
										id={field.name}
										placeholder="Descreva o problema ex: O sistema não está funcionando corretamente, está apresentando erros ao tentar processar os dados"
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
					<Controller
						name="files"
						control={control}
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						render={({ field: { onChange, value, ...field }, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name} className="text-white">
									Anexos
								</FieldLabel>
								<div className="relative flex w-full">
									{/* Input invisível cobre toda a área clicável */}
									<Input
										id={field.name}
										className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
										{...field}
										type="file"
										multiple
										accept="image/*,video/mp4,video/mpeg,application/pdf,.doc,.docx"
										onChange={(e) => {
											const newFiles = Array.from(e.target.files || []);
											const updatedFiles = [...files, ...newFiles];
											setFiles(updatedFiles);
											const dataTransfer = new DataTransfer();
											updatedFiles.forEach((file) =>
												dataTransfer.items.add(file)
											);
											onChange(dataTransfer.files);
										}}
									/>
									<div
										className={`flex min-h-20 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-steel text-white/50 transition-colors hover:bg-steel/80 ${
											fieldState.error ? "border-destructive" : "border-snow/15"
										}`}
									>
										<Upload className="size-5" />
										<span className="text-sm">
											{files.length > 0
												? `${files.length} arquivo(s) selecionado(s)`
												: "Clique para selecionar arquivos"}
										</span>
									</div>
								</div>
								{fieldState.error && (
									<FieldError>{fieldState.error.message}</FieldError>
								)}
							</Field>
						)}
					/>
					{files.length > 0 && (
						<div className="mt-2 flex flex-col gap-3">
							{files.map((file, index) => (
								<div
									key={index}
									className="flex items-center justify-between rounded-md border border-snow/15 bg-steel px-3 py-2"
								>
									<span className="truncate text-sm text-white/70">
										{file.name}
									</span>
									<div className="flex items-center gap-3">
										<span className="text-xs text-white/40 uppercase">
											{file.type.split("/")[1]}
										</span>
										<Button
											type="button"
											onClick={() => {
												const updatedFiles = files.filter(
													(_, fileIndex) => fileIndex !== index
												);
												setFiles(updatedFiles);
												const dataTransfer = new DataTransfer();
												updatedFiles.forEach((file) =>
													dataTransfer.items.add(file)
												);
												setValue("files", dataTransfer.files);
											}}
											className="cursor-pointer bg-destructive font-bold transition-colors duration-700 hover:bg-destructive/90 focus-visible:ring-0"
										>
											<X className="size-4 text-white" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
					<div className="mt-4 flex w-full items-center justify-end gap-2">
						<Button
							type="button"
							className="cursor-pointer bg-destructive font-bold transition-colors duration-700 hover:bg-destructive/90 focus-visible:ring-0"
							onClick={() => {
								reset();
								onClose();
							}}
							disabled={isSubmitting}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							className="cursor-pointer bg-teal font-bold transition-colors duration-700 hover:bg-teal-600 focus-visible:ring-0"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<div className="size-4 animate-spin rounded-full border border-t-black"></div>
							) : (
								"Cadastrar"
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
