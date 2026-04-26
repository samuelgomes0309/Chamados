import { CreateCategoryRequest } from "../../@types/category/category";
import prismaClient from "../../config/prisma/client";
import { AppError } from "../../errors/AppError";

class CreateCategoryService {
	async execute({ name, priority, sector_id }: CreateCategoryRequest) {
		const sector = await prismaClient.sector.findUnique({
			where: { id: sector_id, status: "ACTIVE" },
		});
		if (!sector) {
			throw new AppError("Sector not found or inactive", 404);
		}
		const normalizedName = name.trim().toUpperCase();
		const categoryAlreadyExists = await prismaClient.category.findFirst({
			where: { name: normalizedName, sector_id },
		});
		if (categoryAlreadyExists) {
			throw new AppError("Category already exists", 409);
		}
		const category = await prismaClient.category.create({
			data: {
				name: normalizedName,
				priority,
				sector_id,
			},
		});
		return category;
	}
}

export { CreateCategoryService };
