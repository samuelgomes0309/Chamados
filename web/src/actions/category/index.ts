"use server";

import type { Category } from "@/src/@types/category/category";
import api from "@/src/lib/api";
import { CreateCategoryData } from "@/src/schemas/category";

// Seguiremos o padrão de retorno
// {
// success: boolean
// data: any
// error: any
// }

async function listCategoriesAction({
	sector_id,
	status,
}: {
	sector_id?: string;
	status: "ACTIVE" | "INACTIVE";
}) {
	try {
		const response = await api.get<Category[]>(`/categories`, {
			params: {
				...(sector_id && { sector_id }),
				status,
			},
		});
		return {
			success: true,
			data: response.data,
			error: null,
		};
	} catch (error) {
		return {
			success: false,
			data: null,
			error: error instanceof Error ? error.message : "Erro desconhecido",
		};
	}
}

async function createCategoryAction(data: CreateCategoryData) {
	try {
		const response = await api.post<Category>(`/categories`, data);
		return {
			success: true,
			data: response.data,
			error: null,
		};
	} catch (error) {
		return {
			success: false,
			data: null,
			error: error instanceof Error ? error.message : "Erro desconhecido",
		};
	}
}

export { listCategoriesAction, createCategoryAction };
