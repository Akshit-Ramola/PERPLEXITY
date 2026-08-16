import { useDispatch } from "react-redux";
import { register, login, getMe, logout } from "../service/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";

export function useAuth() {
    const dispatch = useDispatch();

    async function handleRegister({ email, username, password }) {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            await register({ email, username, password });
            return true;
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || "Registration failed";
            dispatch(setError(msg));
            return false;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await login({ email, password });
            dispatch(setUser(data));
            return true;
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || "Login failed";
            dispatch(setError(msg));
            return false;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await getMe();
            dispatch(setUser(data));
        } catch (error) {
            dispatch(setUser(null));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleLogout() {
        try {
            dispatch(setLoading(true));
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            dispatch(setUser(null));
            dispatch(setLoading(false));
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout,
    }
}