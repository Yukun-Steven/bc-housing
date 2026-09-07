"use client";

import { useParams, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import Link from "next/link";

export default function PropertyPage() {
    const params = useParams();
    const id = params.id;
    const searchParams = useSearchParams();
    const city = searchParams.get("city") || "";
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProperty() {
            setLoading(true)
            setError("");

            try {
                const response = await fetch(
                `http://127.0.0.1:8000/properties/${id}`
                );

                if (response.status === 404){
                    setError("Property not found.")
                    return;
                }

                if (!response.ok){
                    throw new Error("Server returned an error");
                }
                const data = await response.json();
                setProperty(data);
            } catch (error) {
                console.error(error);
                setError("Unable to connect to server.");
            } finally {
                setLoading(false);
            }
        }

        loadProperty();
    },[id]);
    
    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <header className="border-b border-white/10">
            <div className="mx-auto max-w-6xl px-6 py-5">
                <Link href="/" className="text-xl font-bold">
                BC Housing
                </Link>
            </div>
            </header>

            <section className="mx-auto max-w-6xl px-6 py-12">
            <Link
                href={city ? `/?city=${encodeURIComponent(city)}` : "/"}
                className="text-sm text-slate-400 hover:text-white"
            >
                ← Back to search
            </Link>

            <h1 className="mt-8 text-3xl font-bold">
                Property Details
            </h1>

            {loading && (
                <p className="mt-6 text-slate-400">Loading...</p>
            )}

            {error && (
                <p className="mt-6 text-red-400">{error}</p>
            )}

            {!loading && !error && property && (
                <div className="mt-8">
                <p className="text-sm text-slate-400">
                    {property.property_type || "Residential"}
                </p>

                <h2 className="mt-2 text-3xl font-semibold">
                    {property.address}
                </h2>

                <p className="mt-2 text-slate-400">
                    {property.city}
                    {property.postal_code
                    ? `, ${property.postal_code}`
                    : ""}
                </p>

                <div className="mt-8 border-y border-white/10 py-8">
                    <p className="text-sm text-slate-400">Asking price</p>
                    <p className="mt-2 text-4xl font-bold">
                    ${property.price.toLocaleString()}
                    </p>
                </div>

                <div className="mt-8 grid gap-6 sm:grid-cols-3">
                    <div>
                    <p className="text-sm text-slate-500">Bedrooms</p>
                    <p className="mt-2 text-2xl font-semibold">
                        {property.bedrooms ?? "-"}
                    </p>
                    </div>

                    <div>
                    <p className="text-sm text-slate-500">Bathrooms</p>
                    <p className="mt-2 text-2xl font-semibold">
                        {property.bathrooms ?? "-"}
                    </p>
                    </div>

                    <div>
                    <p className="text-sm text-slate-500">Floor area</p>
                    <p className="mt-2 text-2xl font-semibold">
                        {property.floor_area ?? "-"} sqft
                    </p>
                    </div>
                </div>

                {property.floor_area > 0 && (
                    <div className="mt-10 border-t border-white/10 pt-6">
                    <p className="text-sm text-slate-500">Price per sqft</p>
                    <p className="mt-2 text-xl font-semibold">
                        $
                        {Math.round(
                        property.price / property.floor_area
                        ).toLocaleString()}
                        /sqft
                    </p>
                    </div>
                )}
                </div>
            )}
            </section>
        </main>
        );
}