"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Property = {
  id?: number;
  address: string;
  city: string;
  postal_code?: string | null;
  property_type?: string | null;
  price: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  floor_area?: number | null;
  listing_url?: string | null;
};

type DataSource = "real" | "test";
type SearchType = "city" | "id";

const API_URL = "http://127.0.0.1:8000";

const REGIONS = [
  { label: "Vancouver", value: "vancouver-city" },
  { label: "Burnaby", value: "mapby" },
  { label: "Richmond", value: "mapri" },
  { label: "North Vancouver", value: "mapnv" },
  { label: "Victoria", value: "victoria-city" },
];

function PropertyCard({
  property,
  source,
  searchCity,
}: {
  property: Property;
  source: DataSource;
  searchCity: string;
}) {
  const content = (
    <>
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {property.property_type ?? "Residential"}
      </p>

      <h3 className="mt-2 text-xl font-semibold text-white">
        {property.address}
      </h3>

      <p className="mt-1 text-slate-400">
        {property.city}
        {property.postal_code ? `, ${property.postal_code}` : ""}
      </p>

      <p className="mt-4 text-2xl font-bold text-white">
        {property.price != null
          ? `$${property.price.toLocaleString("en-CA")}`
          : "Price unavailable"}
      </p>

      <p className="mt-2 text-sm text-slate-400">
        {property.bedrooms ?? "-"} bed ·{" "}
        {property.bathrooms ?? "-"} bath ·{" "}
        {property.floor_area ?? "-"} sqft
      </p>

      {property.floor_area != null &&
        property.floor_area > 0 &&
        property.price != null && (
          <p className="mt-2 text-sm text-slate-500">
            $
            {Math.round(
              property.price / property.floor_area
            ).toLocaleString("en-CA")}
            /sqft
          </p>
        )}

      <p className="mt-4 text-sm text-slate-300">
        {source === "real"
          ? "View original listing →"
          : "View details →"}
      </p>
    </>
  );

  const className =
    "block rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-white/30";

  if (source === "real") {
    return property.listing_url ? (
      <a
        href={property.listing_url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    ) : (
      <div className={className}>{content}</div>
    );
  }

  return property.id != null ? (
    <Link
      href={`/properties/${property.id}?city=${encodeURIComponent(
        searchCity
      )}`}
      className={className}
    >
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

export default function Home() {
  const searchParams = useSearchParams();
  const cityFromUrl = searchParams.get("city");

  const [dataSource, setDataSource] = useState<DataSource>("real");
  const [searchType, setSearchType] = useState<SearchType>("city");
  const [city, setCity] = useState("");
  const [realCity, setRealCity] = useState("vancouver-city");

  const [result, setResult] = useState<Property[]>([]);
  const [resultSource, setResultSource] =
    useState<DataSource | null>(null);
  const [resultCity, setResultCity] = useState("");
  const [disclosure, setDisclosure] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const requestId = useRef(0);

  function clearResults() {
    requestId.current += 1;
    setResult([]);
    setResultSource(null);
    setResultCity("");
    setDisclosure("");
    setLoading(false);
    setSearched(false);
    setError("");
  }

  function changeDataSource(source: DataSource) {
    setDataSource(source);
    setSearchType("city");
    clearResults();
  }

  function changeSearchType(type: SearchType) {
    setSearchType(type);
    clearResults();
  }

  async function runSearch(
    source: DataSource,
    type: SearchType,
    value: string
  ) {
    const searchValue = value.trim();
    const currentRequest = ++requestId.current;

    if (!searchValue) {
      setError(
        type === "id"
          ? "Please enter a property ID."
          : "Please select or enter a city."
      );
      setResult([]);
      setResultSource(null);
      setSearched(false);
      return;
    }

    if (
      source === "test" &&
      type === "id" &&
      !/^\d+$/.test(searchValue)
    ) {
      setError("Please enter a numeric property ID.");
      setResult([]);
      setResultSource(null);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    setError("");
    setResult([]);
    setResultSource(source);
    setResultCity(
      source === "test"
        ? type === "city"
          ? searchValue
          : ""
        : searchValue
    );
    setDisclosure("");

    try {
      let url: string;

      if (source === "real") {
        url = `${API_URL}/zealty/search?city=${encodeURIComponent(
          searchValue
        )}`;
      } else if (type === "id") {
        url = `${API_URL}/properties/${encodeURIComponent(searchValue)}`;
      } else {
        url = `${API_URL}/properties/?city=${encodeURIComponent(
          searchValue
        )}`;
      }

      const response = await fetch(url);

      if (currentRequest !== requestId.current) return;

      if (
        source === "test" &&
        type === "id" &&
        response.status === 404
      ) {
        setResult([]);
        return;
      }

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      if (currentRequest !== requestId.current) return;

      if (source === "real") {
        const note =
          typeof data.disclosure === "string"
            ? data.disclosure
            : "";

        if (!note.trim()) {
          throw new Error("The required MLS disclosure is missing.");
        }

        setResult(
          Array.isArray(data.properties) ? data.properties : []
        );
        setDisclosure(note);
      } else {
        setResult(Array.isArray(data) ? data : [data]);
      }
    } catch (caughtError) {
      if (currentRequest !== requestId.current) return;

      console.error(caughtError);

      setError(
        source === "real"
          ? "Unable to retrieve real listings. Check the backend and disclosure."
          : "Unable to connect to server."
      );

      setResult([]);
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  }

  function searchMain() {
    if (dataSource === "real") {
      void runSearch("real", "city", realCity);
    } else {
      void runSearch("test", searchType, city);
    }
  }

  // Restore the test-data city search when returning from a detail page.
  useEffect(() => {
    if (cityFromUrl) {
      setDataSource("test");
      setSearchType("city");
      setCity(cityFromUrl);
      void runSearch("test", "city", cityFromUrl);
    }
  }, [cityFromUrl]);

  const visibleResults =
    resultSource === dataSource ? result : [];

  const isBusy = loading && resultSource === dataSource;

  const hasSearched =
    searched && resultSource === dataSource;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* 顶部导航 */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              BC Housing
            </h1>
            <p className="text-xs text-slate-400">
              British Columbia Real Estate
            </p>
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

          {/* 数据来源切换 */}
          <div className="mt-10 flex gap-2">
            <button
              type="button"
              onClick={() => changeDataSource("real")}
              className={`rounded-lg px-4 py-2 text-sm transition ${
                dataSource === "real"
                  ? "bg-white text-black"
                  : "border border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              Real Listings
            </button>

            <button
              type="button"
              onClick={() => changeDataSource("test")}
              className={`rounded-lg px-4 py-2 text-sm transition ${
                dataSource === "test"
                  ? "bg-white text-black"
                  : "border border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              Test Data
            </button>
          </div>

          {/* 测试数据保留 City / ID 搜索 */}
          {dataSource === "test" && (
            <div className="mt-10 flex gap-6 border-b border-white/10">
              <button
                type="button"
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
                type="button"
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
          )}

          {/* 统一主搜索框 */}
          <div className="mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur sm:flex-row">
            {dataSource === "real" ? (
              <select
                value={realCity}
                onChange={(e) => setRealCity(e.target.value)}
                aria-label="Select region"
                className="min-w-0 flex-1 rounded-xl bg-slate-900 px-4 py-4 text-white outline-none"
              >
                {REGIONS.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder={
                  searchType === "city"
                    ? "Vancouver, Burnaby, Richmond..."
                    : "Enter property ID, e.g. 1"
                }
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchMain();
                }}
                className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-4 text-white outline-none placeholder:text-slate-500"
              />
            )}

            <button
              type="button"
              onClick={searchMain}
              disabled={isBusy}
              className="rounded-xl bg-white px-7 py-4 font-semibold text-black transition hover:bg-slate-200 disabled:opacity-50"
            >
              {isBusy ? "Searching..." : "Search"}
            </button>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            {dataSource === "real"
              ? "Select a region to search active listings."
              : searchType === "id"
                ? "Search your local test database by property ID."
                : "Search your local test database by city."}
          </p>
        </div>

        {/* 统一结果区域 */}
        <div className="mt-10">
          {error && <p className="text-red-400">{error}</p>}

          {hasSearched && !isBusy && !error && (
            <p className="text-slate-400">
              {resultSource === "real"
                ? `Showing ${visibleResults.length} real listings`
                : `Found: ${visibleResults.length}`}
            </p>
          )}

          {hasSearched &&
            !isBusy &&
            !error &&
            visibleResults.length === 0 && (
              <p className="mt-4 text-slate-500">
                No properties found.
              </p>
            )}

          <div
            className={`mt-6 grid gap-4 ${
              dataSource === "real" ? "md:grid-cols-2" : ""
            }`}
          >
            {visibleResults.map((property, index) => (
              <PropertyCard
                key={property.listing_url ?? property.id ?? index}
                property={property}
                source={dataSource}
                searchCity={resultCity}
              />
            ))}
          </div>

          {resultSource === "real" &&
            hasSearched &&
            !isBusy &&
            !error &&
            disclosure && (
              <details className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
                <summary className="cursor-pointer text-sm font-medium text-slate-300">
                  MLS® Data Disclosure — View full statement
                </summary>
                <p className="mt-4 whitespace-pre-wrap text-xs leading-relaxed text-slate-400">
                  {disclosure}
                </p>
              </details>
            )}
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