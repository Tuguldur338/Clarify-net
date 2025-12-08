"use client";

import React from "react";
import Image from "next/image";

export default function About() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black px-6">
      <div className="w-full max-w-4xl space-y-12 py-20">
        <h1 className="text-4xl font-bold tracking-tight text-center">
          About Us
        </h1>

        <p className="text-neutral-600 text-lg leading-relaxed text-center max-w-2xl mx-auto">
          We’re building a space where ideas, insights, and knowledge are shared
          openly. Our mission is to make learning accessible, enjoyable, and
          useful for anyone curious about the world.
        </p>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Our Mission</h2>

            <p className="text-neutral-600 leading-relaxed">
              Information becomes powerful when it’s shared. Whether it’s
              research, explanations, or personal discoveries, we publish
              knowledge that sparks curiosity and helps people understand ideas
              with clarity.
            </p>

            <h2 className="text-2xl font-semibold pt-4">What We Offer</h2>

            <p className="text-neutral-600 leading-relaxed">
              Structured articles, insights, and guides designed to empower
              readers. Everything is created to be reliable, simple to
              understand, and valuable for students, creators, and lifelong
              learners.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <Image
              src="/images/website-logo.png"
              alt="website-logo"
              width={500}
              height={500}
              className="w-[300px] h-[200px]"
            />
          </div>
        </div>

        <div className="text-center pt-10">
          <h2 className="text-2xl font-semibold">Join Us</h2>
          <p className="text-neutral-600 mt-4 max-w-2xl mx-auto leading-relaxed">
            We’re growing every day. If you have knowledge to share or ideas you
            want to publish, this platform welcomes your voice. Let’s create
            something meaningful together.
          </p>
        </div>
      </div>
    </div>
  );
}
