import { useSession } from "next-auth/react";
import axios from "axios";
import { useEffect } from "react";

const useAxiosAuth = () => {
  const { data: session } = useSession();

  const axiosAuth = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: { "Content-Type": "application/json" },
  });
  useEffect(() => {
    if (!session?.user.accessToken) return;
    const requestIntercept = axiosAuth.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] =
            `Bearer ${session?.user?.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axiosAuth.interceptors.request.eject(requestIntercept);
    };
  }, [session, axiosAuth]);

  return axiosAuth;
};

export default useAxiosAuth;
