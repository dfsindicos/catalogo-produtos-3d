"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LayoutGrid, Menu, MessageCircle, Search, X } from "lucide-react";
import { whatsappContactLink } from "@/lib/whatsapp";
import type { Category } from "@/types/catalog";

// Categoria com a foto (capa do produto mais recente) e a quantidade de peças
// publicadas — montado no layout.
export type CategoryWithCover = Category & { cover_url?: string | null; count?: number };

function CategoryThumb({ category, size }: { category: CategoryWithCover; size: number }) {
  return (
    <span
      className="relative flex flex-none items-center justify-center overflow-hidden rounded-xl border border-ink-800 bg-ink-800 text-sm font-semibold text-ink-200"
      style={{ width: size, height: size }}
    >
      {category.cover_url ? (
        <Image src={category.cover_url} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        category.name.charAt(0).toUpperCase()
      )}
    </span>
  );
}

function countLabel(count?: number) {
  if (count === undefined) return null;
  return `${count} ${count === 1 ? "peça" : "peças"}`;
}

function SearchForm({ onSubmitted, className }: { onSubmitted?: () => void; className?: string }) {
  return (
    <form
      action="/busca"
      className={className}
      onSubmit={() => onSubmitted?.()}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          type="search"
          name="q"
          placeholder="Buscar produto..."
          className="w-full rounded-full border border-ink-800 bg-ink-900 py-2.5 pl-10 pr-4 text-sm text-ink-50 placeholder:text-ink-400 focus:outline-none focus:ring-1 focus:ring-brand-300"
        />
      </div>
    </form>
  );
}

export function SiteHeader({ categories }: { categories: CategoryWithCover[] }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [categoriasAberto, setCategoriasAberto] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const whatsapp = whatsappContactLink();

  // Fecha o menu de categorias com Esc ou ao clicar fora do cabeçalho.
  useEffect(() => {
    if (!categoriasAberto) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setCategoriasAberto(false);
    }
    function onPointer(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setCategoriasAberto(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [categoriasAberto]);

  return (
    <motion.header
      ref={headerRef}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-card sticky top-0 z-20 border-x-0 border-t-0"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" aria-label="CMG3D Studio, página inicial" className="flex-none">
          <Image src="/logo.png" alt="CMG3D Studio" width={69} height={40} priority className="h-12 w-auto" />
        </Link>

        {/* Desktop: botão Categorias, busca no meio e WhatsApp à direita */}
        {categories.length > 0 && (
          <button
            type="button"
            onClick={() => setCategoriasAberto((open) => !open)}
            aria-expanded={categoriasAberto}
            aria-controls="categorias-painel"
            className="hidden flex-none items-center gap-2 rounded-full border border-ink-800 bg-ink-900 px-4 py-2.5 text-sm font-semibold text-ink-50 transition-colors hover:border-brand-300 md:inline-flex"
          >
            <LayoutGrid className="h-4 w-4" aria-hidden />
            Categorias
            <ChevronDown className={`h-4 w-4 transition-transform ${categoriasAberto ? "rotate-180" : ""}`} aria-hidden />
          </button>
        )}
        <SearchForm className="mx-auto hidden w-full max-w-xl md:block" />
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden flex-none items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1EBE5A] md:inline-flex"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Chamar no WhatsApp
          </a>
        )}

        {/* Mobile: botão hambúrguer */}
        <button
          type="button"
          onClick={() => setMenuAberto((open) => !open)}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          className="ml-auto text-ink-50 md:hidden"
        >
          {menuAberto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Desktop: painel de categorias */}
      <AnimatePresence>
        {categoriasAberto && (
          <motion.div
            id="categorias-painel"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-full hidden rounded-b-[28px] border-b border-ink-800 bg-ink-900 shadow-2xl shadow-black/50 md:block"
          >
            <div className="mx-auto max-w-6xl px-4 pb-6 pt-5">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-lg font-bold text-ink-50">Escolha uma categoria</h2>
                <Link
                  href="/"
                  onClick={() => setCategoriasAberto(false)}
                  className="text-sm font-semibold text-brand-300 hover:text-brand-200"
                >
                  Ver todo o catálogo →
                </Link>
              </div>
              <ul className="grid max-h-[60vh] grid-cols-3 gap-x-5 gap-y-1 overflow-y-auto lg:grid-cols-4">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/categoria/${category.slug}`}
                      onClick={() => setCategoriasAberto(false)}
                      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-ink-800"
                    >
                      <CategoryThumb category={category} size={48} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink-50">{category.name}</span>
                        {countLabel(category.count) && (
                          <span className="block text-xs text-ink-400">{countLabel(category.count)}</span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile: painel do menu */}
      <AnimatePresence>
        {menuAberto && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-ink-800 md:hidden"
          >
            <div className="flex max-h-[75vh] flex-col gap-1 overflow-y-auto px-4 py-3 text-sm text-ink-200">
              <SearchForm className="mb-2" onSubmitted={() => setMenuAberto(false)} />
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 font-semibold text-white"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  Chamar no WhatsApp
                </a>
              )}
              <Link href="/" onClick={() => setMenuAberto(false)} className="rounded px-2 py-2 hover:bg-ink-800">
                Catálogo
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categoria/${category.slug}`}
                  onClick={() => setMenuAberto(false)}
                  className="flex items-center gap-3 rounded-xl p-2 hover:bg-ink-800"
                >
                  <CategoryThumb category={category} size={40} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink-50">{category.name}</span>
                    {countLabel(category.count) && <span className="block text-xs text-ink-400">{countLabel(category.count)}</span>}
                  </span>
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
