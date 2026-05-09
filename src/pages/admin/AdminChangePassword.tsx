import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { changeAdminPassword } from "../../api/admin";
import { isSessionValid, useAuthStore } from "../../store/authStore";

const MIN_LENGTH = 12;

interface FormErrors {
  general?: string;
  current?: string;
  next?: string;
  confirm?: string;
}

/**
 * Forced when an admin logs in with a freshly seeded or reset password
 * (`mustChangePassword: true`). The seed password is on disk in dev
 * settings and should never be the long-lived production credential.
 *
 * The page is reachable on its own route so the route guard can
 * redirect here without rendering the rest of the admin layout.
 */
export default function AdminChangePassword() {
  const navigate = useNavigate();
  const sessionState = useAuthStore();
  const markPasswordChanged = useAuthStore((s) => s.markPasswordChanged);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const mutation = useMutation({
    mutationFn: () =>
      changeAdminPassword({ currentPassword, newPassword, confirmPassword }),
    onSuccess: () => {
      markPasswordChanged();
      navigate("/admin/orders", { replace: true });
    },
    onError: (err) => {
      setErrors(translate(err));
    },
  });

  if (!isSessionValid(sessionState)) {
    return <Navigate to="/admin/login" replace />;
  }

  // If the admin landed here voluntarily but doesn't actually need to
  // rotate, kick them back to the dashboard. (Voluntary rotation can
  // be added later as a separate "Account" page.)
  if (!sessionState.mustChangePassword) {
    return <Navigate to="/admin/orders" replace />;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = validate(currentPassword, newPassword, confirmPassword);
    if (validation) {
      setErrors(validation);
      return;
    }
    setErrors({});
    mutation.mutate();
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-stone-100 px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
      >
        <header>
          <h1 className="text-xl font-bold text-stone-900">
            Change your password
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            For security, you must replace the temporary password before you
            use the dashboard.
          </p>
        </header>

        <Field
          id="currentPassword"
          label="Current password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={setCurrentPassword}
          error={errors.current}
        />

        <Field
          id="newPassword"
          label={`New password (min ${MIN_LENGTH} chars, mix of cases + a digit)`}
          autoComplete="new-password"
          value={newPassword}
          onChange={setNewPassword}
          error={errors.next}
        />

        <Field
          id="confirmPassword"
          label="Confirm new password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={errors.confirm}
        />

        {errors.general && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors.general}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-full bg-amber-700 px-6 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {mutation.isPending ? "Saving…" : "Save and continue"}
        </button>
      </form>
    </section>
  );
}

function Field({
  id,
  label,
  autoComplete,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  autoComplete: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-700">
        {label}
      </label>
      <input
        id={id}
        type="password"
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

/**
 * Light client-side validation that mirrors the server's
 * ChangePasswordCommandValidator. The server is still the source of
 * truth — this just spares a round-trip on obvious mistakes.
 */
function validate(
  current: string,
  next: string,
  confirm: string,
): FormErrors | null {
  const errors: FormErrors = {};
  if (!current) errors.current = "Required.";
  if (!next) errors.next = "Required.";
  else if (next.length < MIN_LENGTH)
    errors.next = `At least ${MIN_LENGTH} characters.`;
  else if (!/[A-Z]/.test(next))
    errors.next = "Add at least one uppercase letter.";
  else if (!/[a-z]/.test(next))
    errors.next = "Add at least one lowercase letter.";
  else if (!/[0-9]/.test(next)) errors.next = "Add at least one digit.";
  else if (next === current) errors.next = "Must differ from current password.";
  if (next !== confirm) errors.confirm = "Confirmation does not match.";

  return Object.keys(errors).length === 0 ? null : errors;
}

function translate(err: unknown): FormErrors {
  if (err instanceof AxiosError) {
    if (err.response?.status === 401) {
      return { current: "Current password is incorrect." };
    }
    if (err.response?.status === 400) {
      const data = err.response.data as {
        errors?: Record<string, string[]>;
      };
      const map: FormErrors = {};
      if (data.errors) {
        for (const [field, msgs] of Object.entries(data.errors)) {
          const msg = msgs[0];
          if (field.toLowerCase().startsWith("current")) map.current = msg;
          else if (field.toLowerCase().startsWith("new")) map.next = msg;
          else if (field.toLowerCase().startsWith("confirm")) map.confirm = msg;
          else map.general = msg;
        }
      }
      if (!Object.keys(map).length) map.general = "Could not save the new password.";
      return map;
    }
  }
  return { general: "Could not save the new password. Try again." };
}
