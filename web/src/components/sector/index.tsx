"use client";

import { useState } from "react";
import { Header } from "../header";
import { SectorModal } from "./dialog";
import { useUser } from "@/src/contexts/userContext";
import type { Sector } from "@/src/@types/sector/sector";
import { SectorCard } from "./card";

export function Sector({ sectors }: { sectors: Sector[] }) {
	const [list, setList] = useState<Sector[]>(sectors);
	const [isOpen, setIsOpen] = useState(false);
	const user = useUser();
	return (
		<div className="flex flex-col justify-center gap-4">
			<Header
				title="Setores"
				description="Gerencie os setores da sua organização"
				buttonText={user.role === "ADMIN" ? "Novo setor" : undefined}
				onButtonClick={
					user.role === "ADMIN" ? () => setIsOpen(true) : undefined
				}
			/>
			{isOpen && (
				<SectorModal
					onClose={() => setIsOpen(false)}
					open={isOpen}
					onChangeList={(newItem) => setList((prev) => [...prev, newItem])}
				/>
			)}
			{list.length > 0 ? (
				<div className="grid w-full grid-cols-1 items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{list.map((sector) => (
						<SectorCard key={sector.id} sector={sector} />
					))}
				</div>
			) : (
				<p className="text-xl font-bold text-muted-foreground">
					Nenhum setor encontrado.
				</p>
			)}
		</div>
	);
}
