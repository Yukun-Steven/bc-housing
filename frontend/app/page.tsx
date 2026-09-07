"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const [city, setCity] = useState("");
  const [result, setResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [searchType, setSearchType] = useState<"city" | "id">("city");
  const searchParams = useSearchParams();
  const cityFromUrl = searchParams.get("city");

  async function searchProperties(searchCity?: string) {
    const value = searchCity ?? city;
    if (!city.trim()) {
      setError("Please enter a city.");
      setResult([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    setError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/properties/?city=${encodeURIComponent(city)}`
      );

      if (!response.ok) {
        throw new Error("Server returned an error");
      }

      const data = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to server.");
      setResult([]);
    } finally {
      setLoading(false);
    }
  }

  async function searchById(){
    if (!city.trim()) {
      setError("Please enter a property ID.");
      setResult([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    setError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/properties/${city.trim()}`
      );

      if (response.status === 404) {
        setResult([]);
        return;
      }

      if (!response.ok) {
        throw new Error("Server returned an error");
      }

      const data = await response.json();
      setResult([data]);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to server.");
      setResult([]);
    } finally {
      setLoading(false);
    }
  }

  function changeSearchType(type: "city" | "id") {
    setSearchType(type);
    setCity("");
    setResult([]);
    setSearched(false);
    setError("");
  }

  useEffect(() => {
    if (cityFromUrl) {
      setSearchType("city");
      setCity(cityFromUrl);
      searchProperties(cityFromUrl);
    }
  }, [cityFromUrl]);




  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* 顶部导航 */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight">BC Housing</h1>
            <p className="text-xs text-slate-400">British Columbia Real Estate</p>
          </div>

          <nav className="flex gap-6 text-sm text-slate-300">
            <span>Market</span>
            <span>Properties</span>
            <span>About</span>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-slate-400">
            BC Real Estate
          </p>

          <h2 className="text-5xl font-bold leading-tight md:text-7xl">
            Find the right home.
            <span className="block text-slate-400">
              Understand the market.
              </span>
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Search properties across British Columbia and compare pricing,
            location, size, and market data.
          </p>




          {/* 搜索框 */}
          <div className="mt-10 flex gap-6 border-b border-white/10">
          <button
            onClick={() => changeSearchType("city")}
            className={`pb-3 text-sm ${
              searchType === "city"
                ? "border-b-2 border-white text-white"
                : "text-slate-500"
            }`}
          >
            Search by city
          </button>

          <button
            onClick={() => changeSearchType("id")}
            className={`pb-3 text-sm ${
              searchType === "id"
              ? "border-b-2 border-white text-white"
              : "text-slate-500"
            }`}
              >
                Search by ID
              </button>
            </div>



          <div className="mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur sm:flex-row">
            <input
              type="text"
              placeholder={
                searchType === "city"
                  ? "Vancouver, Burnaby, Richmond..."
                  : "Enter property ID, e.g. 1"
              }
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1 rounded-xl bg-transparent px-4 py-4 text-white outline-none placeholder:text-slate-500"
            />

            <button onClick={searchType === "city" ? searchProperties : searchById}
                    className="rounded-xl bg-white px-7 py-4 font-semibold text-black transition hover:bg-slate-200">
              Search
            </button>
            {loading && (
                <p className="mt-4 text-slate-400">
                  Searching...
                </p>
            )}
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Current search: {city || "No city selected"}
          </p>
          

          {error && (
            <p className="mt-4 text-red-400">
              {error}
            </p>
          )}

          {searched && !loading && !error && (
            <p className="mt-4 text-slate-400">
              Found: {result.length}
            </p>
          )}

          {searched && !loading && !error && result.length === 0 && (
            <p className="mt-4 text-slate-500">
              No properties found in {city}.
            </p>
          )}

          
          
        </div>
        <div className="mt-8 grid gap-4">
          {result.map((property) => (
            <Link
              href={`/properties/${property.id}?city=${encodeURIComponent(city)}`}
              key={property.id}
              className="block rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-white/30"
            >
              <h2 className="text-xl font-semibold">
                {property.address}
              </h2>

              <p className="mt-1 text-slate-400">
                {property.city}
              </p>

              <p className="mt-4 text-2xl font-bold">
                ${property.price.toLocaleString()}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                {property.bedrooms ?? "-"} bed ·{" "}
                {property.bathrooms ?? "-"} bath ·{" "}
                {property.floor_area ?? "-"} sqft
              </p>

              {property.floor_area && (
                <p className="mt-2 text-sm text-slate-500">
                  $
                  {Math.round(
                    property.price / property.floor_area
                  ).toLocaleString()}
                  /sqft
                </p>
              )}
            </Link>
          ))}
        </div>






      </section>

      {/* 数据卡片 */}
      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-24 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-slate-400">Markets</p>
          <p className="mt-2 text-3xl font-bold">BC</p>
          <p className="mt-2 text-sm text-slate-500">
            Vancouver · Burnaby · Richmond · Surrey
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-slate-400">Property Search</p>
          <p className="mt-2 text-3xl font-bold">Fast</p>
          <p className="mt-2 text-sm text-slate-500">
            Search listings by city and location.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-slate-400">Market Insights</p>
          <p className="mt-2 text-3xl font-bold">Coming Soon</p>
          <p className="mt-2 text-sm text-slate-500">
            Price history, comparables and trends.
          </p>
        </div>
      </section>
    </main>
  );
}