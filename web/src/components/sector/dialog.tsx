"use client";

import { Controller, useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateSectorData, createSectorSchema } from "@/src/schemas/sector";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Button } from "../ui/button";
import { createSectorAction } from "@/src/actions/sector";
import { toast } from "sonner";
import type { Sector as SectorProps } from "@/src/@types/sector/sector";
import { Textarea } from "../ui/textarea";

interface SectorModalProps {
	onClose: () => void;
	open: boolean;
	onChangeList: (newItem: SectorProps) => void;
}

export function SectorModal({ onClose, open, onChangeList }: SectorModalProps) {
	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
	} = useForm<CreateSectorData>({
		resolver: zodResolver(createSectorSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	});
	async function onSubmit(data: CreateSectorData) {
		const response = await createSectorAction(data);
		if (response.success) {
			toast.success(`Setor criado com sucesso!`, {
				style: {
					background: "var(--success)",
					border: "none",
					color: "white",
				},
			});
			onChangeList(response.data as SectorProps);
			onClose();
		} else {
			toast.error(`Erro ao criar setor`, {
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
			<DialogContent
				showCloseButton={false}
				aria-describedby="Modal de cadastro de um novo setor"
				className="w-full max-w-md rounded-md border border-snow/15 bg-surface-alt text-white"
			>
				<DialogHeader>
					<DialogTitle className="text-xl font-bold text-white">
						Novo setor
					</DialogTitle>
				</DialogHeader>
				<div>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
						<Controller
							name="name"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name} className={"text-white"}>
										Nome do setor
									</FieldLabel>
									<div className="relative flex w-full">
										<Input
											id={field.name}
											placeholder="Digite o nome do setor"
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
						<Controller
							name="description"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name} className={"text-white"}>
										Descrição do setor
									</FieldLabel>
									<div className="relative flex w-full">
										<Textarea
											id={field.name}
											placeholder="Digite a descrição do setor"
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
						<div className="mt-4 flex w-full items-center justify-end gap-2">
							<Button
								type="button"
								className="cursor-pointer bg-destructive font-bold transition-colors duration-700 hover:bg-destructive/90 focus-visible:ring-0"
								onClick={onClose}
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
				</div>
			</DialogContent>
		</Dialog>
	);
}
