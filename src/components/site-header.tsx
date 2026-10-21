"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, MessageCircle, Search, X } from "lucide-react";
import { whatsappContactLink } from "@/lib/whatsapp";
import type { Category } from "@/types/catalog";

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

export function SiteHeader({ categories }: { categories: Category[] }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const whatsapp = whatsappContactLink();

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-card sticky top-0 z-20 border-x-0 border-t-0"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" aria-label="CMG3D Studio, página inicial" className="flex-none">
          <Image src="/logo.png" alt="CMG3D Studio" width={69} height={40} priority className="h-12 w-auto" />
        </Link>

        {/* Desktop: busca no meio e WhatsApp à direita */}
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

      {/* Desktop: categorias em uma fileira */}
      <nav aria-label="Categorias" className="hidden border-t border-ink-800/60 md:block">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-7 gap-y-1 px-4 py-2 text-sm font-medium text-ink-200">
          <Link href="/" className="py-1 transition-colors hover:text-brand-200">
            Catálogo
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categoria/${category.slug}`}
              className="py-1 transition-colors hover:text-brand-200"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </nav>

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
            <div className="flex flex-col gap-1 px-4 py-3 text-sm text-ink-200">
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
                  className="rounded px-2 py-2 pl-4 text-ink-400 hover:bg-ink-800"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
