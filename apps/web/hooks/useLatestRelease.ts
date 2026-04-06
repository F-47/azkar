"use client";

import {
  getLatestRelease,
  type LatestReleaseData,
} from "@/services/latest-releases";
import { useEffect, useState } from "react";

export const useLatestRelease = () => {
  const [data, setData] = useState<LatestReleaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        const releaseData = await getLatestRelease();
        setData(releaseData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestRelease();
  }, []);

  return { data, loading, error };
};
