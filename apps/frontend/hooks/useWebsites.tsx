"use client";
import { API_BACKEND_URL } from "@/config";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";

interface Tick {
  id: string;
  createdAt: string;
  status: string;
  latency: number;
}

interface Website {
  id: string;
  url: string;
  ticks: Tick[];
}

export function useWebsites() {
  const { getToken } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch websites data
  const refreshWebsites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token is missing.");
      }

      const response = await axios.get(`${API_BACKEND_URL}/api/v1/websites`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (JSON.stringify(response.data.websites) !== JSON.stringify(websites)) {
        setWebsites(response.data.websites);
      }
    } catch (err) {
      console.error("Error fetching websites:", err);
      setError("Failed to fetch websites. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [getToken, websites]);

  // Auto-refresh websites every 1 minute
  useEffect(() => {
    refreshWebsites();

    const interval = setInterval(() => {
      refreshWebsites();
    }, 1000 * 60 * 1);

    return () => clearInterval(interval);
  }, [refreshWebsites]);

  return { websites, refreshWebsites, loading, error };
}
