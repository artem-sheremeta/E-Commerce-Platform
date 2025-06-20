import axiosClient from "./axiosClient";

export type Role = "admin" | "seller" | "customer";

export const registerUser = async (
  username: string,
  email: string,
  password: string,
  role: Role
) => {
  return await axiosClient.post("/auth/register", {
    username,
    email,
    password,
    role,
  });
};

export const loginUser = async (login: string, password: string) => {
  localStorage.clear();

  const response = await axiosClient.post("/auth/login", { login, password });
  localStorage.setItem("token", response.data.access_token);
  localStorage.setItem("userId", response.data.user.userId);

  return response.data;
};
