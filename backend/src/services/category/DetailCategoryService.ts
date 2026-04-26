import { DetailCategoryRequest } from "../../@types/category/category";
import prismaClient from "../../config/prisma/client";
import { AppError } from "../../errors/AppError";

class DetailCategoryService {
	async execute({ category_id }: DetailCategoryRequest) {
		const category = await prismaClient.category.findUnique({
			where: { id: category_id },
		});
		if (!category) {
			throw new AppError("Category not found", 404);
		}
		return category;
	}
}

export { DetailCategoryService };
