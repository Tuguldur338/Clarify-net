import { supabase } from "@/utils/supabaseClient";

export default async function ViewPage({
  params,
  searchParams,
}: {
  params?: any;
  searchParams?: any;
}) {
  // `params` or `searchParams` may be Promises in some Next runtimes — await if needed
  let p: any = params;
  if (p && typeof p.then === "function") {
    try {
      p = await p;
    } catch (_) {
      p = {};
    }
  }

  let s: any = searchParams;
  if (s && typeof s.then === "function") {
    try {
      s = await s;
    } catch (_) {
      s = {};
    }
  }

  // prefer route params, fall back to search params
  const rawId = p?.id ?? s?.id ?? null;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!id) return <div>No post id provided</div>;

  let data: any = null;
  try {
    const res = await supabase
      .from("knowledge_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (res?.error) {
      console.warn("Supabase fetch error:", res.error);
      return <div>Post not found</div>;
    }

    data = res?.data ?? null;
  } catch (err) {
    console.error("Unexpected error fetching post:", err);
    return <div>Post not found</div>;
  }

  if (!data) return <div>Post not found</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">{data.title}</h1>
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
  // common YouTube URL formats
  const reg =
    /(?:youtube(?:-nocookie)?\.com\/(?:.*v=|v\/|embed\/)|youtu\.be\/)??([a-zA-Z0-9_-]{11})/;
  const m = url.match(reg);
  return m ? m[1] : "";
}
