import { UpdateCategoryRequest } from "../../@types/category/category";
import prismaClient from "../../config/prisma/client";
import { AppError } from "../../errors/AppError";

class UpdateCategoryService {
	async execute({
		category_id,
		name,
		priority,
		sector_id,
	}: UpdateCategoryRequest) {
		const normalizedName = name?.trim().toLocaleUpperCase();
		const category = await prismaClient.category.findFirst({
			where: {
				id: category_id,
				sector_id,
			},
		});
		if (!category) {
			throw new AppError("Category not found", 404);
		}
		if (normalizedName) {
			const existingCategoryWithName = await prismaClient.category.findFirst({
				where: {
					name: normalizedName,
					sector_id,
					NOT: {
						id: category_id,
					},
				},
			});
			if (existingCategoryWithName) {
				throw new AppError("Category with this name already exists", 409);
			}
		}
		const updatedCategory = await prismaClient.category.update({
			where: {
				id: category_id,
			},
			data: {
				// Apenas para garantir que não atualizamos com valores nulos ou indefinidos
				...(normalizedName && { name: normalizedName }),
				...(priority && { priority }),
			},
		});
		return updatedCategory;
	}
}

export { UpdateCategoryService };
