import { getToken } from "@/src/lib/token";
import axios from "axios";

const api = axios.create({
	baseURL: process.env.NEXT_KEY_API_URL,
	timeout: 60 * 1 * 1000, // 1 minuto
});

api.interceptors.request.use(
	async (config) => {
		// Verificar se possui algum token de autenticação
		const token = await getToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	// Repassando o erro
	(error) => {
		return Promise.reject(error);
	}
);

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (!error.response) {
			return Promise.reject(new Error("Servidor indisponível"));
		}
		const data = error.response?.data;
		const message = data?.details
			? data.details.map((d: { message: string }) => d.message).join(", ")
			: data?.error || data?.message || "Erro desconhecido";
		return Promise.reject(new Error(message));
	}
);

export default api;
