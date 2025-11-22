import { supabase } from "@/utils/supabaseClient";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: any;
}) {
  // `searchParams` may be a plain object or a Promise depending on Next runtime.
  // Await it safely when it's a Promise to avoid the runtime error:
  // "searchParams is a Promise and must be unwrapped with await or React.use()"
  let params: any = searchParams;
  if (params && typeof params.then === "function") {
    try {
      params = await params;
    } catch (e) {
      params = {};
    }
  }

  const rawQ = params?.q;
  const q = Array.isArray(rawQ) ? rawQ.join(" ").trim() : (rawQ ?? "").trim();

  if (!q) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold">Enter a search term</h2>
      </div>
    );
  }

  let data: any[] | null = null;
  try {
    const res = await supabase
      .from("knowledge_posts")
      .select("id,title,topic,content,video_url")
      .ilike("title", `%${q}%`)
      .limit(50);
    data = res?.data ?? null;
    if (res?.error) {
      // Log as a warning during dev so the Next overlay is not triggered for expected backend errors
      console.warn("Supabase error:", res.error);
      return <div className="p-6">Error searching</div>;
    }
  } catch (err) {
    console.error("Unexpected error during search", err);
    return <div className="p-6">Error searching</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Search results for “{q}”</h2>
      {data && data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((item: any) => (
            <a
              key={item.id}
              href={`/p/${item.id}`}
              className="block p-4 bg-white rounded-lg shadow hover:shadow-lg transform hover:-translate-y-1 transition !no-underline"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-lg">{item.title}</div>

                <div className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {item.topic}
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                {item.content?.slice(0, 140)}
                {item.content && item.content.length > 140 ? "..." : ""}
              </div>
              {item.video_url ? (
                <div className="mt-3 text-sm text-indigo-600 font-medium">
                  📺 Video attached
                </div>
              ) : null}
            </a>
          ))}
        </div>
      ) : (
        <div>No results</div>
      )}
    </div>
  );
}
