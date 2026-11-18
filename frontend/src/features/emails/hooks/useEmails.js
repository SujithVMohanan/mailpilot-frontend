/**
 * useEmails — custom hook that owns email list state.
 *
 * Handles single or double-wrapped API response formats,
 * debounced search, read filter, ordering, and pagination.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { fetchEmails } from "../services/emailService";

const PAGE_SIZE = 20;

export default function useEmails() {
  const [emails, setEmails] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isReadFilter, setIsReadFilter] = useState(""); // "" | "true" | "false"
  const [ordering, setOrdering] = useState("-received_datetime");

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef(null);

  function handleSearchChange(value) {
    setSearch(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
  }

  function handleIsReadChange(value) {
    setIsReadFilter(value);
    setPage(1);
  }

  function handleOrderingChange(value) {
    setOrdering(value);
    setPage(1);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (isReadFilter !== "") params.is_read = isReadFilter;
      if (ordering) params.ordering = ordering;

      const res = await fetchEmails(params);

      // Defensively unwrap single or double wrapped DRF pagination payload
      let results = [];
      let count = 0;

      if (Array.isArray(res)) {
        results = res;
        count = res.length;
      } else if (res?.results) {
        results = res.results;
        count = res.count ?? results.length;
      } else if (res?.data?.results) {
        results = res.data.results;
        count = res.data.count ?? results.length;
      }

      setEmails(results);
      setTotal(count);
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Failed to load emails.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, isReadFilter, ordering]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    emails,
    total,
    loading,
    error,
    page,
    search,
    isReadFilter,
    ordering,
    pageSize: PAGE_SIZE,
    setPage,
    setSearch: handleSearchChange,
    setIsReadFilter: handleIsReadChange,
    setOrdering: handleOrderingChange,
    reload: load,
  };
}
