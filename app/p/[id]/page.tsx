import { supabase } from "@/utils/supabaseClient";
import PostActions from "@/components/PostActions";

export default async function PostPage({ params }: { params: any }) {
  // `params` may be a Promise in some Next runtimes — await it safely.
  let p: any = params;
  if (p && typeof p.then === "function") {
    try {
      p = await p;
    } catch (e) {
      p = {};
    }
  }

  let data: any = null;
  try {
    const res = await supabase
      .from("knowledge_posts")
      .select("*")
      .eq("id", p?.id)
      .single();
    if (res?.error) {
      console.warn("Supabase fetch error:", res.error);
      return <div>Post not found</div>;
    }
    data = res?.data ?? null;
  } catch (err) {
    console.error("Unexpected error fetching post:", err);
    // continue to try fallback
  }

  if (!data) {
    // Fallback for local dev: show a list of all posts so you can verify the inserted IDs
    try {
      const all = await supabase.from("knowledge_posts").select("*").limit(200);
      if (all?.error) {
        console.warn("Fallback fetch failed:", all.error);
        return <div>Post not found</div>;
      }
      const rows = all?.data || [];
      return (
        <div className="p-6 max-w-3xl mx-auto space-y-4">
          <h2 className="text-xl font-semibold">Post not found</h2>
          <div className="text-sm text-gray-600">
            Here are the posts currently in the mock DB:
          </div>
          <ul className="list-disc pl-6">
            {rows.map((r: any) => (
              <li key={r.id}>
                <strong>{r.title}</strong> — id: <code>{r.id}</code>
              </li>
            ))}
          </ul>
        </div>
      );
    } catch (err) {
      console.error("Fallback error:", err);
      return <div>Post not found</div>;
    }
  }
  // If we get here, data exists. (The rest of the page renders below.)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-start justify-between">
        <h1 className="text-3xl font-bold">{data.title}</h1>
        <div>
          <PostActions id={data.id} owner={data.owner} />
        </div>
      </div>
      <p className="text-gray-500">Topic: {data.topic}</p>
      <div className="whitespace-pre-wrap">{data.content}</div>

      {data.video_url ? (
        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-2">Attached video</div>
          <div className="w-full aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(
                data.video_url
              )}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function extractYouTubeId(url: string) {
  if (!url) return "";
  const reg =
    /(?:youtube(?:-nocookie)?\.com\/(?:.*v=|v\/|embed\/)|youtu\.be\/)??([a-zA-Z0-9_-]{11})/;
  const m = url.match(reg);
  return m ? m[1] : "";
}
