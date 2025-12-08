"use client";

import React from "react";
import Link from "next/link";

export default function Contact() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black px-6">
      <div className="w-full max-w-xl space-y-10 py-20">
        <h1 className="text-4xl font-bold tracking-tight text-center">
          Get in Touch
        </h1>

        <p className="text-center text-neutral-600 text-lg">
          Have questions about our knowledge platform? Reach out anytime.
        </p>

        <form className="space-y-6">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full rounded-xl bg-neutral-100 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600"
          />

          <input
            type="email"
            placeholder="Your Email"
            className="w-full rounded-xl bg-neutral-100 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600"
          />

          <textarea
            placeholder="Your Message"
            className="w-full rounded-xl bg-neutral-100 px-4 py-3 h-40 outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 py-3 text-lg font-semibold text-white hover:bg-blue-700 transition rounded-xl! duration-300"
          >
            Send Message
          </button>
        </form>

        <div className="text-center text-neutral-600">
          Or email us directly at{" "}
          <Link
            href="mailto:contact@knowledgelab.com"
            className="text-blue-600 hover:underline"
          >
            contact@knowledgelab.com
          </Link>
        </div>
      </div>
    </div>
  );
}
