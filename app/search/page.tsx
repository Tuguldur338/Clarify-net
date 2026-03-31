import { supabase } from "@/utils/supabaseClient";
import MathText from "@/components/MathText";

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>; // next 16 dynamic API
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const rawQ = resolvedParams?.q;
  const normalizedQ = Array.isArray(rawQ) ? rawQ[0] : rawQ;
  const q = (typeof normalizedQ === "string" ? normalizedQ : "").trim();

  if (!q) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold">Enter a search term</h2>
      </div>
    );
  }

  const query = q.toLowerCase();
  const { data, error } = await supabase
    .from("knowledge_posts")
    .select("*")
    .or(`title.ilike.%${query}%,topic.ilike.%${query}%`)
    .limit(200);

  const posts = error || !data ? [] : data;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Search results for “{q}”</h2>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((item: any) => (
            <a
              key={item.id}
              href={`/p/${item.id}`}
              className="block p-4 bg-white rounded-lg shadow hover:shadow-lg transform hover:-translate-y-1 transition no-underline hover:no-underline decoration-none"
              style={{ textDecoration: "none" }}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-lg">{item.title}</div>
                <div className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800 no-underline hover:no-underline">
                  {item.topic}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                <MathText value={item.content?.slice(0, 140)} />
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
