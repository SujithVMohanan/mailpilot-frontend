/**
 * SelectDropdown — Polished, accessible custom dropdown component.
 *
 * Replaces ugly default browser <select> inputs with a smooth,
 * modern popover menu with click-outside detection and check indicators.
 */

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function SelectDropdown({
  label,
  options = [],
  value,
  onChange,
  icon: Icon = null,
  placeholder = "Select...",
  className = "",
  size = "md",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const selectedOption = options.find((opt) => {
    const optVal = typeof opt === "object" ? opt.value : opt;
    return String(optVal) === String(value);
  });

  const displayLabel = selectedOption
    ? typeof selectedOption === "object"
      ? selectedOption.label || selectedOption.name
      : selectedOption
    : placeholder;

  const sizeClasses =
    size === "sm"
      ? "py-1.5 px-3 text-xs rounded-lg"
      : "py-2 px-3.5 text-sm rounded-lg";

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2.5 bg-white border border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-subtle transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${
          isOpen ? "ring-2 ring-blue-500/20 border-blue-500" : ""
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon className="h-4 w-4 text-slate-400 flex-shrink-0" />}
          <span className={`truncate font-medium ${!selectedOption ? "text-slate-400" : "text-slate-800"}`}>
            {displayLabel}
          </span>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 sm:right-auto sm:min-w-[12rem] mt-1.5 bg-white border border-slate-200 rounded-xl shadow-dropdown z-50 overflow-hidden animate-slide-down py-1 max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3.5 py-2 text-xs text-slate-400">No options available</div>
          ) : (
            options.map((opt, i) => {
              const optVal = typeof opt === "object" ? opt.value : opt;
              const optLabel = typeof opt === "object" ? opt.label || opt.name : opt;
              const isSelected = String(optVal) === String(value);

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(optVal);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/80 text-blue-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="truncate pr-2">{optLabel}</span>
                  {isSelected && <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
