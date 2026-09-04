"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
};

export default function Home() {
  const [backendStatus, setBackendStatus] = useState("checking...");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/health")
      .then((res) => res.json())
      .then((data: HealthResponse) => {
        setBackendStatus(data.status);
      })
      .catch(() => {
        setBackendStatus("offline");
      });
  }, []);

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold mb-6">
        BC Housing
      </h1>

      <p className="text-lg">
        Backend status:
        <span className="ml-2 font-semibold">
          {backendStatus}
        </span>
      </p>
    </main>
  );
}