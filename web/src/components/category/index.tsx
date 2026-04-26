"use client";

import type { Category as CategoryProps } from "@/src/@types/category/category";
import { listCategoriesAction } from "@/src/actions/category";
import { useEffect, useState } from "react";
import { CategoryModal } from "./modal";
import { Button } from "../ui/button";
import { useUser } from "@/src/contexts/userContext";

export function Category({ sector_id }: { sector_id: string }) {
	const { role } = useUser();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [categoriesActives, setCategoriesActives] = useState<CategoryProps[]>(
		[]
	);
	useEffect(() => {
		listCategoriesAction({ sector_id, status: "ACTIVE" }).then((response) => {
			if (response.success && response.data) {
				setCategoriesActives(response.data);
			}
			setLoading(false);
		});
	}, [sector_id]);
	if (loading) return <span className="mt-2">Carregando...</span>;
	return (
		<div className="mt-2 flex flex-col border-t border-border-strong">
			{role === "ADMIN" && (
				<div className="mt-2 flex w-full items-center justify-end">
					<Button
						type="button"
						className="max-w-fit cursor-pointer bg-teal font-bold transition-colors duration-700 hover:bg-teal-600 focus-visible:ring-0"
						onClick={() => setIsModalOpen(true)}
					>
						Vincular novo problema
					</Button>
				</div>
			)}
			{categoriesActives.length === 0 ? (
				<span className="mt-2">Nenhum problema disponível/cadastrado</span>
			) : (
				<>
					<span className="mt-2 font-bold">Problemas vinculados:</span>
					<ul className="mt-2">
						{categoriesActives.map((category) => (
							<li key={category.id} className="text-muted-foreground">
								{category.name}
							</li>
						))}
					</ul>
				</>
			)}
			{isModalOpen && (
				<CategoryModal
					onChangeList={(newItem) =>
						setCategoriesActives((prev) => [...prev, newItem])
					}
					onClose={() => setIsModalOpen(false)}
					open={isModalOpen}
					sector_id={sector_id}
				/>
			)}
		</div>
	);
}
