"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("This pitch demo does not connect to an account service yet. Try the guest demo instead.");
  }

  return (
    <main className="grid min-h-[calc(100svh-82px)] items-center px-5 py-8 md:py-16">
      <section className="m-auto w-full max-w-lg rounded-[2rem] border border-line bg-surface p-6 shadow-daily md:p-12">
        <h1>Log in to Daily Dine.</h1>
        <p className="leading-relaxed text-muted">Manage your restaurant or continue where you left off.</p>
        <form onSubmit={submit}>
          <label className="mt-4 block text-sm font-extrabold">Email address<input className="mt-2" type="email" placeholder="you@restaurant.com" required /></label>
          <label className="mt-4 block text-sm font-extrabold">Password<input className="mt-2" type="password" placeholder="••••••••" required /></label>
          <button className="mt-5 min-h-12 w-full rounded-full border border-wine bg-wine px-4 py-3 font-extrabold text-surface hover:bg-wine-deep" type="submit">Log in</button>
        </form>
        {message && <p className="mt-4 rounded-xl border border-terracotta/20 bg-soft p-3 text-sm leading-relaxed text-wine" role="status">{message}</p>}
        <p className="mt-6 text-center text-sm text-muted">New to Daily Dine? <Link className="font-extrabold text-wine" href="/signup">Create an account</Link></p>
        <Link className="mt-5 inline-block text-sm font-extrabold text-wine hover:underline hover:underline-offset-4" href="/">← Back to home</Link>
      </section>
    </main>
  );
}
