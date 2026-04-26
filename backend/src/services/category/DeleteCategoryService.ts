import { DeleteCategoryRequest } from "../../@types/category/category";
import prismaClient from "../../config/prisma/client";
import { AppError } from "../../errors/AppError";

class DeleteCategoryService {
	async execute({ category_id }: DeleteCategoryRequest) {
		const category = await prismaClient.category.findUnique({
			where: { id: category_id },
		});
		if (!category) {
			throw new AppError("Category not found", 404);
		}
		const tickets = await prismaClient.ticket.findFirst({
			where: { category_id },
		});
		if (tickets) {
			throw new AppError("Cannot delete category with associated tickets", 409);
		}
		await prismaClient.category.delete({
			where: { id: category_id },
		});
		return { message: "Category deleted successfully" };
	}
}

export { DeleteCategoryService };
