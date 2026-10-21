import type { Metadata } from "next";
import { Geist, Space_Grotesk } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader, type CategoryWithCover } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/catalog";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "CMG3D — Catálogo de produtos de impressão 3D",
  description: "Vitrine dos produtos de impressão 3D da CMG3D.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const [{ data: categories }, { data: capas }, { data: contagens }] = await Promise.all([
    supabase.from("categories").select("id, name, slug").order("name"),
    // Capa de cada categoria: a primeira foto do produto publicado mais recente dela.
    supabase
      .from("products")
      .select("category_id, images:product_images(url, position)")
      .eq("published", true)
      .not("category_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(300),
    supabase.from("products").select("category_id").eq("published", true).not("category_id", "is", null).limit(5000),
  ]);

  const capaPorCategoria = new Map<string, string>();
  for (const produto of capas ?? []) {
    if (!produto.category_id || capaPorCategoria.has(produto.category_id)) continue;
    const primeira = ([...(produto.images ?? [])] as { url: string; position: number }[]).sort((a, b) => a.position - b.position)[0];
    if (primeira) capaPorCategoria.set(produto.category_id, primeira.url);
  }
  const quantidadePorCategoria = new Map<string, number>();
  for (const produto of contagens ?? []) {
    if (produto.category_id) {
      quantidadePorCategoria.set(produto.category_id, (quantidadePorCategoria.get(produto.category_id) ?? 0) + 1);
    }
  }
  const categoriasMenu: CategoryWithCover[] = ((categories ?? []) as Category[]).map((category) => ({
    ...category,
    cover_url: capaPorCategoria.get(category.id) ?? null,
    count: quantidadePorCategoria.get(category.id) ?? 0,
  }));

  return (
    <html lang="pt-BR" className={`${geist.variable} ${spaceGrotesk.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <SiteHeader categories={categoriasMenu} />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-ink-800 bg-ink-950 text-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
            <span className="flex items-center gap-3 text-ink-400">
              <Image src="/logo.png" alt="CMG3D Studio" width={69} height={40} className="h-10 w-auto" />
              @cmg3dstudio
            </span>
            <Link href="/admin" className="text-ink-400 transition-colors hover:text-ink-200">
              Área admin
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
