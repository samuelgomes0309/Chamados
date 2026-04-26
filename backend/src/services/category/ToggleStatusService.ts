import { CategoryToggleStatusRequest } from "../../@types/category/category";
import prismaClient from "../../config/prisma/client";
import { AppError } from "../../errors/AppError";

class ToggleStatusService {
	async execute({ category_id, status }: CategoryToggleStatusRequest) {
		const category = await prismaClient.category.findUnique({
			where: { id: category_id },
		});
		if (!category) {
			throw new AppError("Category not found", 404);
		}
		if (category.status === status) {
			throw new AppError("Category is already in the desired status", 409);
		}
		const updatedCategory = await prismaClient.category.update({
			where: { id: category_id },
			data: { status },
		});
		return updatedCategory;
	}
}

export { ToggleStatusService };
