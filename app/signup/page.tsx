"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function SignupPage() {
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Account creation is coming soon in the full product. You can explore the working demo now.");
  }

  return (
    <main className="grid min-h-[calc(100svh-82px)] items-center px-5 py-8 md:py-16">
      <section className="m-auto w-full max-w-lg rounded-[2rem] border border-line bg-surface p-6 shadow-daily md:p-12">
        <h1>Set up your restaurant.</h1>
        <p className="leading-relaxed text-muted">Create a Daily Dine workspace and make your next service feel lighter.</p>
        <form onSubmit={submit}>
          <label className="mt-4 block text-sm font-extrabold">Your name<input className="mt-2" type="text" placeholder="Aanya Sharma" required /></label>
          <label className="mt-4 block text-sm font-extrabold">Restaurant name<input className="mt-2" type="text" placeholder="The Green Table" required /></label>
          <label className="mt-4 block text-sm font-extrabold">Email address<input className="mt-2" type="email" placeholder="you@restaurant.com" required /></label>
          <button className="mt-5 min-h-12 w-full rounded-full border border-wine bg-wine px-4 py-3 font-extrabold text-surface hover:bg-wine-deep" type="submit">Create free workspace</button>
        </form>
        {message && <p className="mt-4 rounded-xl border border-terracotta/20 bg-soft p-3 text-sm leading-relaxed text-wine" role="status">{message}</p>}
        <p className="mt-6 text-center text-sm text-muted">Already have an account? <Link className="font-extrabold text-wine" href="/login">Log in</Link></p>
        <Link className="mt-5 inline-block text-sm font-extrabold text-wine hover:underline hover:underline-offset-4" href="/">← Back to home</Link>
      </section>
    </main>
  );
}
