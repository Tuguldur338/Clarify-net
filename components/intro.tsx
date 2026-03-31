"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "react-bootstrap";
import MathText from "@/components/MathText";

interface KnowledgePost {
  id: string;
  title: string;
  topic: string;
  content: string;
  owner?: string;
}

const Intro: React.FC = () => {
  const [posts, setPosts] = useState<KnowledgePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json?.data)) {
          setPosts(json.data.slice(0, 4));
        }
      })
      .catch((err) => console.error("Failed to load posts:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-gray-50 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4 md:px-0">
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-900">
            Welcome to ClarifyNet!
          </h1>
          <p className="mt-3 text-center text-gray-600 md:text-lg">
            Discover what people are sharing in algebra, science, and more.
          </p>

          {loading ? (
            <div className="italic text-gray-500">
              Loading latest knowledge...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-gray-500">No recent posts yet.</div>
          ) : (
            posts.map((post) => (
              <a
                href={`/p/${post.id}`}
                key={post.id}
                className="block h-full no-underline hover:no-underline"
                style={{ textDecoration: "none" }}
              >
                <Card className="h-full shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-200">
                  <Card.Body>
                    <Card.Title className="text-lg font-semibold text-slate-900">
                      {post.title}
                    </Card.Title>

                    <Card.Subtitle className="mb-2 text-sm text-gray-500">
                      {post.topic}
                    </Card.Subtitle>

                    <Card.Text className="text-sm text-gray-700 whitespace-pre-wrap">
                      <MathText value={post.content?.slice(0, 140)} />
                      {post.content?.length > 140 ? "..." : ""}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </a>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Intro;
