"use client";

import React from "react";
import Image from "next/image";
import { Carousel, CarouselItem } from "react-bootstrap";

const slides = [
  {
    src: "/images/girl-looking-at-computer.jpg",
    title: "Learn Faster",
    desc: "Clear explanations to help you understand anything.",
  },
  {
    src: "/images/knowledge-book.jpg",
    title: "Explore Concepts",
    desc: "Dive into topics with structured, simple lessons.",
  },
  {
    src: "/images/math-algebra.jpg",
    title: "Search Smarter",
    desc: "Find explanations instantly across subjects.",
  },
];

const Intro: React.FC = () => {
  return (
    <div className="flex flex-col bg-gray-100 w-[90%] rounded-[16px] mt-[30px] p-6 items-center">
      <h1 className="text-3xl font-semibold">Welcome to ClarifyNet!</h1>

      <h3 className="text-lg text-gray-600 mt-2">
        Get started by searching Algebra and more.
      </h3>

      <Carousel
        interval={5000}
        pause={false}
        indicators={false}
        className="w-full max-w-[600px] mt-8"
      >
        {slides.map((slide, i) => (
          <CarouselItem key={i}>
            <div className="flex flex-col items-center p-4">
              <Image
                src={slide.src}
                alt={slide.title}
                width={600}
                height={400}
                className="rounded-xl object-cover"
              />

              <h2 className="text-2xl mt-4 font-semibold">{slide.title}</h2>
              <p className="text-gray-600 text-center">{slide.desc}</p>
            </div>
          </CarouselItem>
        ))}
      </Carousel>
    </div>
  );
};

export default Intro;
