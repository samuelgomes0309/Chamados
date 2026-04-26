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
import type { User } from "@/src/@types/user/user";
import { UserForm } from "./form";
import type { Sector } from "@/src/@types/sector/sector";

interface UserCardProps {
	onChangeUsersData: (updatedUser: User) => void;
	user: User;
	sectors: Sector[];
}

export function UserCard({ onChangeUsersData, user, sectors }: UserCardProps) {
	const [open, setOpen] = useState(false);
	const hasSector_id = !!user?.sector_id?.trim();
	return (
		<>
			<Card
				className="w-full cursor-pointer border border-border-strong bg-surface-deep px-2 py-3 transition-all duration-700 hover:border-teal/40"
				onClick={() => setOpen(true)}
			>
				<CardContent className="flex flex-col justify-center gap-2">
					<div className="flex items-center justify-between">
						<span className="font-bold text-white">{user.name}</span>
						<span className="font-bold text-teal">{user.email}</span>
					</div>
				</CardContent>
			</Card>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent
					onInteractOutside={(e) => e.preventDefault()}
					showCloseButton={false}
					aria-describedby="Modal de cadastro de um novo setor"
					className="min-h-44 w-full max-w-md rounded-md border border-snow/15 bg-surface-alt text-white"
				>
					<DialogHeader className="space-y-3">
						<div className="flex items-center justify-between">
							<div
								className={cn(
									"text-md rounded-full px-4 py-0.5 font-medium",
									hasSector_id
										? "bg-success/20 text-success"
										: "bg-destructive/20 text-destructive"
								)}
							>
								<span>{hasSector_id ? `Setor atribuído` : "Sem setor"}</span>
							</div>
							<Button
								type="button"
								className="max-w-14 cursor-pointer bg-destructive font-bold transition-colors duration-700 hover:bg-destructive/90 focus-visible:ring-0"
								onClick={() => setOpen(false)}
							>
								<X />
							</Button>
						</div>
						<DialogTitle className="text-xl font-bold text-white">
							{user.name}
						</DialogTitle>
						{hasSector_id && (
							<DialogDescription>
								{sectors.find((sector) => sector.id === user.sector_id)?.name}
							</DialogDescription>
						)}
					</DialogHeader>
					<UserForm
						user_id={user.id}
						sectors={sectors}
						onChangeUsersData={onChangeUsersData}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
