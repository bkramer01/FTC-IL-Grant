"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="space-y-4" aria-describedby={state.error ? "login-error" : undefined}>
      {state.error && (
        <p id="login-error" role="alert" className="rounded-md border border-danger/40 bg-danger-bg px-3 py-2 text-[#58151c]">
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="username" className="mb-1 block font-medium">
          Username
        </label>
        <input id="username" name="username" className="form-control" autoComplete="username" required />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block font-medium">
          Password
        </label>
        <input id="password" name="password" type="password" className="form-control" autoComplete="current-password" required />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
