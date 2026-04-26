"use client";

import { Controller, useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Button } from "../ui/button";
import { toast } from "sonner";
import type { Category as CategoryProps } from "@/src/@types/category/category";
import {
	CreateCategoryData,
	createCategorySchema,
} from "@/src/schemas/category";
import { createCategoryAction } from "@/src/actions/category";

interface CategoryModalProps {
	onClose: () => void;
	open: boolean;
	onChangeList: (newItem: CategoryProps) => void;
	sector_id: string;
}

export function CategoryModal({
	onClose,
	open,
	onChangeList,
	sector_id,
}: CategoryModalProps) {
	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
	} = useForm<CreateCategoryData>({
		resolver: zodResolver(createCategorySchema),
		defaultValues: {
			name: "",
			priority: "LOW",
			sector_id: sector_id,
		},
	});
	async function onSubmit(data: CreateCategoryData) {
		const response = await createCategoryAction(data);
		if (response.success) {
			toast.success(`Categoria criada com sucesso!`, {
				style: {
					background: "var(--success)",
					border: "none",
					color: "white",
				},
			});
			onChangeList(response.data as CategoryProps);
			onClose();
		} else {
			toast.error(`Erro ao tentar vincular um problema ao setor`, {
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
				onInteractOutside={(e) => e.preventDefault()}
				aria-describedby="Modal de cadastro de um novo setor"
				className="w-full max-w-md rounded-md border border-snow/15 bg-surface-alt text-white"
			>
				<DialogHeader>
					<DialogTitle className="text-xl font-bold text-white">
						Novo problema
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
										Nome do problema
									</FieldLabel>
									<div className="relative flex w-full">
										<Input
											id={field.name}
											placeholder="Digite o nome do problema"
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
							name="priority"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel className="text-white">Prioridade</FieldLabel>
									<div className="flex gap-3">
										{[
											{ value: "LOW", label: "Baixa" },
											{ value: "MEDIUM", label: "Média" },
											{ value: "HIGH", label: "Alta" },
										].map((option) => (
											<label
												key={option.value}
												className="flex cursor-pointer items-center gap-2 text-white"
											>
												<input
													type="radio"
													value={option.value}
													checked={field.value === option.value}
													onChange={() => field.onChange(option.value)}
													className="accent-teal"
												/>
												{option.label}
											</label>
										))}
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
