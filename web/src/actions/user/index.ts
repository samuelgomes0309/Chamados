"use server";

import { User, UserApiResponse } from "@/src/@types/user/user";
import { destroyToken, saveToken } from "@/src/lib/token";
import { SigninData, SignupData } from "@/src/schemas/login";
import api from "@/src/lib/api";
import { redirect } from "next/navigation";
import { destroyUserLocal, saveUserLocal } from "@/src/lib/auth";
import { AssignSectorUserData } from "@/src/schemas/user";

// Seguiremos o padrão de retorno
// {
// sucess: boolean
// data: any
// error: any
// }

async function createUserAction(userData: SignupData) {
	try {
		await api.post("/users", {
			name: userData.name,
			email: userData.email,
			password: userData.password,
		});
		return {
			success: true,
			data: null,
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

async function loginAction(userData: SigninData) {
	try {
		const user = await api.post<UserApiResponse>("/sessions", {
			email: userData.email,
			password: userData.password,
		});
		const { email, name, sector_id, id, token, role } = user.data;
		await saveToken(token);
		await saveUserLocal({ email, name, sector_id, id, role });
		return {
			success: true,
			data: { email, name, sector_id, id, role } as User,
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

async function logoutAction() {
	await destroyToken();
	await destroyUserLocal();
	redirect("/");
}

async function listUsersAction() {
	try {
		const users = await api.get<User[]>("/users");
		return {
			success: true,
			data: users.data,
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

async function assignSectorUserAction(userData: AssignSectorUserData) {
	try {
		const response = await api.put("/users/sector", userData);
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

export {
	loginAction,
	logoutAction,
	createUserAction,
	listUsersAction,
	assignSectorUserAction,
};
