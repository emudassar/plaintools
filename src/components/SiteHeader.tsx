"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { site } from "@/config/site";
import {
  categories,
  liveTools,
  shouldGroupNav,
  usedCategoriesLive,
  toolsInCategory,
  type CategoryId,
} from "@/config/tools";

/**
 * The tools dropdown opens on HOVER, CLICK and KEYBOARD FOCUS.
 *
 * Hover-only is unusable on a phone and invisible to a keyboard user, so all
 * three paths are wired. Closing is on Escape and on click-away, with a short
 * delay on mouse-leave so the menu does not snap shut while the pointer
 * crosses the gap between the trigger and the panel.
 */
const CLOSE_DELAY_MS = 180;

function ToolsPanel({ onNavigate }: { onNavigate: () => void }) {
  // Flat list under 8 tools, grouped columns at or above. A seven-column
  // mega-menu over three tools looks broken.
  if (!shouldGroupNav) {
    return (
      <ul className="py-2">
        {liveTools.map((tool) => (
          <li key={tool.slug}>
            <Link
              href={`/tools/${tool.slug}/`}
              onClick={onNavigate}
              className="block px-4 py-2 text-sm hover:bg-[var(--color-accent-soft)]"
            >
              <span className="font-medium">{tool.name}</span>
              <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                {tool.tagline}
              </span>
            </Link>
          </li>
        ))}
        <li className="mt-1 border-t border-[var(--color-line)]">
          <Link
            href="/tools/"
            onClick={onNavigate}
            className="block px-4 py-2 text-sm font-medium text-[var(--color-accent)]"
          >
            See all tools →
          </Link>
        </li>
      </ul>
    );
  }

  return (
    <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-3">
      {usedCategoriesLive.map((id: CategoryId) => (
        <div key={id}>
          <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted)] uppercase">
            {categories[id].label}
          </p>
          <ul className="space-y-1">
            {toolsInCategory(id, true).map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={`/tools/${tool.slug}/`}
                  onClick={onNavigate}
                  className="block rounded px-2 py-1 text-sm hover:bg-[var(--color-accent-soft)]"
                >
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    timer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }, [cancelClose]);

  useEffect(() => cancelClose, [cancelClose]);

  // Escape closes; click-away closes. Both are required for a usable menu.
  useEffect(() => {
    if (!open && !mobileOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMobileOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, mobileOpen]);

  const closeAll = useCallback(() => {
    setOpen(false);
    setMobileOpen(false);
  }, []);

  return (
    <header className="border-b border-[var(--color-line)] bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {site.name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
          <div
            ref={wrapRef}
            className="relative"
            onMouseEnter={() => {
              cancelClose();
              setOpen(true);
            }}
            onMouseLeave={scheduleClose}
            // Focus anywhere inside opens it; leaving the whole group closes it.
            onFocus={() => {
              cancelClose();
              setOpen(true);
            }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
            }}
          >
            <button
              type="button"
              aria-expanded={open}
              aria-haspopup="true"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1 rounded px-3 py-2 text-sm font-medium hover:bg-[var(--color-accent-soft)]"
            >
              Tools
              <span aria-hidden="true" className="text-xs">
                ▾
              </span>
            </button>

            {open && (
              <div
                className={`absolute right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-[var(--color-line)] bg-white shadow-lg ${
                  shouldGroupNav ? "w-[min(46rem,85vw)]" : "w-80"
                }`}
              >
                <ToolsPanel onNavigate={closeAll} />
              </div>
            )}
          </div>

          <Link
            href="/tools/"
            className="rounded px-3 py-2 text-sm font-medium hover:bg-[var(--color-accent-soft)]"
          >
            All tools
          </Link>
          <Link
            href="/about/"
            className="rounded px-3 py-2 text-sm font-medium hover:bg-[var(--color-accent-soft)]"
          >
            About
          </Link>
        </nav>

        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded border border-[var(--color-line)] px-3 py-1.5 text-sm sm:hidden"
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="border-t border-[var(--color-line)] px-4 py-3 sm:hidden"
        >
          <p className="mb-1 text-xs font-semibold tracking-wide text-[var(--color-muted)] uppercase">
            Tools
          </p>
          <ul className="mb-3 space-y-1">
            {liveTools.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={`/tools/${tool.slug}/`}
                  onClick={closeAll}
                  className="block py-1.5 text-sm"
                >
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/tools/" onClick={closeAll} className="block py-1.5 text-sm font-medium">
            All tools
          </Link>
          <Link href="/about/" onClick={closeAll} className="block py-1.5 text-sm font-medium">
            About
          </Link>
        </nav>
      )}
    </header>
  );
}
