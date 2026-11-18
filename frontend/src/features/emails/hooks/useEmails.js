/**
 * useEmails — custom hook that owns email list state.
 *
 * Returns:
 *   emails      — current page results
 *   total       — total record count
 *   loading     — bool
 *   error       — string or ""
 *   page        — current page number (1-based)
 *   search      — current search string
 *   label       — currently selected label filter
 *   setPage     — fn
 *   setSearch   — fn (debounced internally)
 *   setLabel    — fn
 *   reload      — fn — force a fresh fetch
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { fetchEmails } from "../services/emailService";

const PAGE_SIZE = 20; // must match backend DEFAULT_PAGE_SIZE

export default function useEmails() {
  const [emails,  setEmails]  = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const [page,   setPage]   = useState(1);
  const [search, setSearch] = useState("");
  const [label,  setLabel]  = useState("");

  // Internal debounced search — avoids an API call per keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef(null);

  function handleSearchChange(value) {
    setSearch(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1); // reset to first page on new search
    }, 400);
  }

  function handleLabelChange(value) {
    setLabel(value);
    setPage(1);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page };
      if (debouncedSearch) params.search = debouncedSearch;
      if (label)           params.label  = label;
      const data = await fetchEmails(params);
      // Support both DRF paginated { count, results } and plain array responses
      if (Array.isArray(data)) {
        setEmails(data);
        setTotal(data.length);
      } else {
        setEmails(data.results ?? []);
        setTotal(data.count   ?? 0);
      }
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load emails.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, label]);

  useEffect(() => { load(); }, [load]);

  return {
    emails,
    total,
    loading,
    error,
    page,
    search,
    label,
    pageSize: PAGE_SIZE,
    setPage,
    setSearch: handleSearchChange,
    setLabel:  handleLabelChange,
    reload:    load,
  };
}
