import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { adminLogin } from "../../api/admin";
import { isSessionValid, useAuthStore } from "../../store/authStore";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const sessionState = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => adminLogin(email, password),
    onSuccess: (data) => {
      setSession(data);
      const from =
        (location.state as { from?: string } | null)?.from ?? "/admin/orders";
      navigate(from, { replace: true });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          setError("Wrong email or password.");
        } else if (err.response?.status === 429) {
          setError("Too many attempts. Wait a minute and try again.");
        } else {
          setError("Could not sign in. Try again.");
        }
      } else {
        setError("Could not sign in. Try again.");
      }
    },
  });

  if (isSessionValid(sessionState)) {
    return <Navigate to="/admin/orders" replace />;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    mutation.mutate();
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
      >
        <header>
          <h1 className="text-xl font-bold text-stone-900">Admin sign in</h1>
          <p className="text-sm text-stone-500">Glory Cafe staff only.</p>
        </header>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-stone-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-stone-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-full bg-amber-700 px-6 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {mutation.isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </section>
  );
}

