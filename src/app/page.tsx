import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductCard } from "@/components/product-card";
import { flattenProductColors } from "@/lib/colors";
import { whatsappContactLink } from "@/lib/whatsapp";
import type { Category, Product } from "@/types/catalog";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase
      .from("products")
      .select("id, name, slug, description, size, price, category_id, featured, view_count, color_mode, created_at, images:product_images(id, product_id, url, position), product_colors(color:colors(id, name, hex, metallic))")
      .eq("published", true)
      .order("created_at", { ascending: false })
      // A home só mostra uma amostra por seção — limitar a busca evita
      // baixar o catálogo inteiro (que deve crescer para centenas de
      // produtos) a cada carregamento.
      .limit(120),
  ]);

  const allProducts = (products ?? []).map(flattenProductColors) as Product[];
  for (const product of allProducts) {
    product.images?.sort((a, b) => a.position - b.position);
  }

  if (allProducts.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-ink-400">
        Catálogo ainda sem produtos cadastrados.
      </div>
    );
  }

  const categoriesList = (categories ?? []) as Category[];
  const countByCategory = new Map<string, number>();
  for (const product of allProducts) {
    if (product.category_id) {
      countByCategory.set(product.category_id, (countByCategory.get(product.category_id) ?? 0) + 1);
    }
  }
  const categoriasComProduto = categoriesList.filter((category) => (countByCategory.get(category.id) ?? 0) > 0);

  const featured = allProducts.filter((product) => product.featured);
  // O carrossel do topo mostra os produtos marcados como "destacar" (ou os 5
  // mais recentes, se nenhum estiver marcado).
  const banners = featured.length > 0 ? featured : allProducts.slice(0, 5);
  // allProducts já vem do mais recente pro mais antigo.
  const novidades = allProducts.slice(0, 8);
  const maisVistos = allProducts
    .filter((product) => product.view_count > 0)
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 8);
  // Foto do círculo de cada categoria: a capa do produto mais recente dela.
  const capaDaCategoria = new Map<string, string>();
  for (const product of allProducts) {
    const capa = product.images?.[0]?.url;
    if (product.category_id && capa && !capaDaCategoria.has(product.category_id)) {
      capaDaCategoria.set(product.category_id, capa);
    }
  }
  const whatsapp = whatsappContactLink();

  return (
    <div>
      {/* Topo escuro: carrossel de destaques + cartão de novidades */}
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-6 md:pb-20 md:pt-8">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <HeroCarousel products={banners} />
          <a
            href="#novidades"
            className="hidden flex-col justify-between rounded-3xl bg-gradient-to-br from-[#f0e8ff] to-[#cdb6ff] p-8 text-ink-950 transition-opacity hover:opacity-95 lg:flex"
          >
            <div>
              <span className="rounded-full bg-ink-950 px-3 py-1 text-xs font-semibold text-white">Novo</span>
              <h2 className="mt-3 text-3xl font-bold leading-tight">Novidades da semana</h2>
              <p className="mt-2 text-[#3b2a66]">Os produtos mais recentes do catálogo.</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-ink-950 px-5 py-2.5 text-sm font-semibold text-white">
              Ver novidades <ArrowUpRight className="h-4 w-4" aria-hidden />
            </span>
          </a>
        </div>
      </section>

      {/* Parte clara: categorias, mais vistos, banners, novidades e contato */}
      <section id="catalogo" className="rounded-t-[48px] bg-[#f6f2fc] pb-16 pt-12 text-ink-950 md:pt-16">
        <div className="mx-auto max-w-6xl space-y-14 px-4 md:space-y-16">
          {maisVistos.length > 0 && (
            <div>
              <h2 className="mb-5 text-3xl font-bold md:text-4xl">Mais vistos</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {maisVistos.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

          {/* Faixa de banners */}
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/busca"
              className="flex min-h-[190px] flex-col justify-between rounded-3xl bg-ink-950 p-7 text-white transition-opacity hover:opacity-95"
            >
              <h3 className="max-w-xs text-2xl font-bold leading-tight">Escolha a cor que você quer</h3>
              <span className="flex gap-2" aria-hidden>
                {["#e5484d", "#f5b72c", "#2fa36b", "#3b82f6", "#a78bfa"].map((cor) => (
                  <span key={cor} className="h-6 w-6 rounded-full" style={{ background: cor }} />
                ))}
              </span>
            </Link>
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[190px] flex-col justify-between rounded-3xl border border-[#e4dbf5] bg-white p-7 transition-shadow hover:shadow-lg hover:shadow-brand-700/10"
              >
                <h3 className="max-w-xs text-2xl font-bold leading-tight">Não achou? Peça pelo WhatsApp</h3>
                <span className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand-700">
                  Falar com a CMG3D <ArrowUpRight className="h-4 w-4" aria-hidden />
                </span>
              </a>
            ) : (
              <div className="flex min-h-[190px] flex-col justify-between rounded-3xl border border-[#e4dbf5] bg-white p-7">
                <h3 className="max-w-xs text-2xl font-bold leading-tight">Peças sob medida</h3>
              </div>
            )}
          </div>

          <div id="novidades" className="scroll-mt-32">
            <h2 className="mb-5 text-3xl font-bold md:text-4xl">Novidades</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {novidades.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {categoriasComProduto.length > 0 && (
            <div>
              <h2 className="mb-5 text-3xl font-bold md:text-4xl">Escolha a sua categoria</h2>
              <ul className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
                {categoriasComProduto.map((category) => {
                  const capa = capaDaCategoria.get(category.id);
                  return (
                    <li key={category.id} className="w-28 flex-none">
                      <Link
                        href={`/categoria/${category.slug}`}
                        className="group flex flex-col items-center gap-2.5 text-center text-sm font-medium"
                      >
                        <span className="relative block h-24 w-24 overflow-hidden rounded-full border border-[#e4dbf5] bg-white transition-shadow group-hover:shadow-lg group-hover:shadow-brand-700/20 md:h-28 md:w-28">
                          {capa && (
                            <Image src={capa} alt="" fill sizes="112px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                          )}
                        </span>
                        {category.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {whatsapp && (
            <div className="grid items-center gap-8 rounded-[44px] bg-ink-950 p-8 text-white md:grid-cols-[1.4fr_1fr] md:p-14">
              <div>
                <h2 className="text-3xl font-bold md:text-5xl">Fale com a gente e receba um orçamento.</h2>
                <p className="mt-3 max-w-md text-[#d9ccf5]">Mande a peça que você quer e respondemos com cor, prazo e valor.</p>
              </div>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 justify-self-start rounded-full bg-[#25D366] px-7 py-4 font-semibold text-white transition-colors hover:bg-[#1EBE5A] md:justify-self-end"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                Chamar no WhatsApp
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
