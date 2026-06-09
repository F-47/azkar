"use client";

import {
  getLatestRelease,
  getTotalDownloads,
  type LatestReleaseData,
} from "@/services/latest-releases";
import { useEffect, useState } from "react";

export const useLatestRelease = () => {
  const [data, setData] = useState<LatestReleaseData | null>(null);
  const [totalDownloads, setTotalDownloads] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [releaseData, downloads] = await Promise.all([
          getLatestRelease(),
          getTotalDownloads(),
        ]);
        setData(releaseData);
        setTotalDownloads(downloads);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error, totalDownloads };
};
