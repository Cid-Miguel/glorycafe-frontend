import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../api/catalog";

export default function HealthCheck() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  return (
    <div className="min-h-full bg-stone-50 p-6">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold text-stone-800">
          Glory Cafe — health check
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Frontend ↔ Backend connectivity test
        </p>

        <div className="mt-6 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          {isLoading && (
            <p className="text-stone-500">Loading categories…</p>
          )}

          {error && (
            <div>
              <p className="font-medium text-red-600">Error reaching API</p>
              <p className="mt-1 text-sm text-red-500">
                {(error as Error).message}
              </p>
            </div>
          )}

          {data && (
            <div>
              <p className="mb-2 font-medium text-emerald-700">
                ✓ Connected — {data.length} categories
              </p>
              <ul className="space-y-1">
                {data.map((c) => (
                  <li
                    key={c.id}
                    className="flex justify-between text-sm text-stone-700"
                  >
                    <span>{c.name}</span>
                    <span className="text-stone-400">order {c.displayOrder}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
