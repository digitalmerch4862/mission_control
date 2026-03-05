"use client";

import { getSupabaseClient } from "@/lib/supabase-client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("Signing in...");
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setMsg("Login success ✅ You can go back to Mission Control.");
    } catch (err: unknown) {
      setMsg((err as Error)?.message || "Login failed");
    }
  };

  return (
    <main className="min-h-screen bg-[#0f1115] p-6 text-white">
      <div className="mx-auto mt-16 max-w-md rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h1 className="text-xl font-semibold">Mission Control Login</h1>
        <p className="mt-2 text-sm text-white/60">Supabase auth (email/password)</p>
        <form onSubmit={onLogin} className="mt-5 space-y-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2" />
          <button className="w-full rounded-lg bg-cyan-500 px-3 py-2 font-medium text-black">Sign In</button>
        </form>
        {msg ? <p className="mt-3 text-sm text-white/70">{msg}</p> : null}
      </div>
    </main>
  );
}
