"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Button } from "../ui/button";
import { toast } from "sonner";
import type { Sector } from "@/src/@types/sector/sector";
import {
	AssignSectorUserData,
	assignSectorUserSchema,
} from "@/src/schemas/user";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { assignSectorUserAction } from "@/src/actions/user";
import type { User } from "@/src/@types/user/user";

interface UserModalProps {
	onChangeUsersData: (updatedUser: User) => void;
	user_id: string;
	sectors: Sector[];
}

export function UserForm({
	sectors,
	user_id,
	onChangeUsersData,
}: UserModalProps) {
	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
	} = useForm<AssignSectorUserData>({
		resolver: zodResolver(assignSectorUserSchema),
		defaultValues: {
			sector_id: "",
			user_id: user_id,
		},
	});
	async function onSubmit(data: AssignSectorUserData) {
		const response = await assignSectorUserAction(data);
		if (response.success) {
			toast.success(`Setor atribuído com sucesso!`, {
				style: {
					background: "var(--success)",
					border: "none",
					color: "white",
				},
			});
			onChangeUsersData(response.data);
		} else {
			toast.error(`Erro ao tentar atribuir o setor`, {
				style: {
					background: "var(--destructive)",
					border: "none",
					color: "white",
				},
			});
		}
	}
	return (
		<div className="mt-2 flex flex-col border-t border-border-strong">
			<form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-3">
				<Controller
					name="sector_id"
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel className="text-white">Setor</FieldLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<SelectTrigger>
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
				<div className="flex w-full justify-end">
					<Button
						type="submit"
						className="cursor-pointer bg-teal font-bold transition-colors duration-700 hover:bg-teal-600 focus-visible:ring-0"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<div className="size-4 animate-spin rounded-full border border-t-black"></div>
						) : (
							"Vincular"
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}
