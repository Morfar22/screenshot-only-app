import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, BookOpen, UserPlus, CircleAlert } from "lucide-react";
import { PageShell, DISCORD_URL } from "@/components/site";
import hero from "@/assets/hero-city.jpg";
import emblem from "@/assets/emblem.png";
import police from "@/assets/role-police.jpg";
import business from "@/assets/role-business.jpg";
import civil from "@/assets/role-civil.jpg";
import crime from "@/assets/role-crime.jpg";
import event from "@/assets/gallery-event.jpg";
import calm from "@/assets/gallery-calm.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nordisk RP — Din historie. Dit eftermæle." },
      { name: "description", content: "Find din plads i byen på Nordisk RP – en dansk FiveM-server med seriøst rollespil og et levende fællesskab." },
      { property: "og:title", content: "Nordisk RP — Din historie. Dit eftermæle." },
      { property: "og:description", content: "En moderne FiveM-server med en markant nordisk identitet." },
    ],
  }),
  component: Index,
});

const steps = [
  { icon: MessageCircle, title: "Bliv en del af Discord", text: "Her møder du fællesskabet, får nyheder og finder hjælp.", cta: "Åbn Discord", href: DISCORD_URL },
  { icon: BookOpen, title: "Læs reglerne og ansøg", text: "Kend rammerne for rollespillet. Derefter sender du en adgangsansøgning (whitelist) – en kort ansøgning, så vi sikrer et godt rollespil.", cta: "Læs reglerne", to: "/regler" },
  { icon: UserPlus, title: "Opret din karakter", text: "Når du er godkendt, forbinder du til serveren og skaber den karakter, byen skal lære at kende.", cta: "Se hele guiden", to: "/kom-i-gang" },
] as const;

const roles = [
  { img: police, title: "Politi og beredskab", text: "Tag ansvar, når byen har brug for dig." },
  { img: business, title: "Virksomheder og erhverv", text: "Byg noget, byen lærer at kende." },
  { img: civil, title: "Det civile liv", text: "De største historier begynder ikke altid med en sirene." },
  { img: crime, title: "Den kriminelle underverden", text: "Ambitioner har en pris. Hvem betaler din?" },
];

const reasons = [
  { img: civil, title: "Historien før handlingen", text: "Vi prioriterer karakterdrevet rollespil, hvor relationer og konsekvenser betyder mere end hurtig action." },
  { img: event, title: "Nye spillere bliver taget imod", text: "Du bliver ikke kastet ud i byen alene. Vejledning og hjælp er let at finde fra første dag." },
  { img: business, title: "Spillerne former byen", text: "Virksomheder, arrangementer og fortællinger opstår fra spillerne selv – ikke kun fra staff." },
];

function Index() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-16">
        <img src={hero} alt="Byen i aftentimerne på Nordisk RP" width={1920} height={1088} className="absolute inset-0 -z-20 h-full w-full object-cover object-[60%_center]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-transparent to-background/40" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.1fr_1fr] lg:px-8">
          <div className="fade-up order-2 lg:order-1">
            <span className="eyebrow">FiveM · Dansk rollespil</span>
            <h1 className="mt-5 text-6xl font-extrabold uppercase leading-[0.9] sm:text-7xl lg:text-8xl">
              Din historie.<br /><span className="text-primary-glow">Dit eftermæle.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Velkommen til Nordisk RP. Find din plads i byen, skab relationer, og lad dine valg forme den historie, du bliver husket for.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/kom-i-gang" className="btn-primary">Kom i gang <ArrowRight className="h-4 w-4" /></Link>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="btn-ghost">Mød os på Discord</a>
            </div>
            <div className="engraved mt-8 inline-flex items-center gap-3 rounded-sm bg-card/80 px-4 py-3 text-sm" role="status">
              <CircleAlert className="h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="text-muted-foreground">Serverstatus er midlertidigt utilgængelig</span>
            </div>
          </div>
          <div className="relative order-1 mx-auto w-48 sm:w-64 lg:order-2 lg:w-full lg:max-w-md">
            <div className="rune-ring absolute -inset-[30%] opacity-80" aria-hidden />
            <div className="absolute inset-[15%] rounded-full bg-primary/30 blur-3xl" aria-hidden />
            <img src={emblem} alt="Nordisk RP emblem" width={1024} height={1024} className="relative drop-shadow-[0_25px_40px_rgba(0,0,0,0.7)]" />
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="om" className="scroll-mt-20 border-t border-border py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <span className="eyebrow">Sådan kommer du ind</span>
          <h2 className="mt-4 text-4xl font-bold uppercase sm:text-5xl">Din vej ind i Nordisk RP</h2>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-sm bg-border md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="flex flex-col bg-card p-8">
                <div className="flex items-center justify-between">
                  <s.icon className="h-6 w-6 text-primary-glow" aria-hidden />
                  <span className="font-display text-5xl font-bold text-foreground/10">0{i + 1}</span>
                </div>
                <h3 className="mt-6 text-2xl font-bold uppercase">{s.title}</h3>
                <p className="mt-3 flex-1 text-muted-foreground">{s.text}</p>
                {"href" in s ? (
                  <a href={s.href} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary-glow">{s.cta} <ArrowRight className="h-4 w-4" /></a>
                ) : (
                  <Link to={s.to} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary-glow">{s.cta} <ArrowRight className="h-4 w-4" /></Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Roles */}
      <section id="byen" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <span className="eyebrow">Livet i byen</span>
          <h2 className="mt-4 text-4xl font-bold uppercase sm:text-5xl">Find din plads i byen</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((r) => (
              <article key={r.title} className="group relative aspect-[3/4] overflow-hidden rounded-sm border border-border transition-colors hover:border-primary-glow/70">
                <img src={r.img} alt="" width={800} height={1024} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-2xl font-bold uppercase">{r.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="border-y border-border bg-card py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <span className="eyebrow">Hvorfor Nordisk</span>
          <h2 className="mt-4 text-4xl font-bold uppercase sm:text-5xl">Hvad gør Nordisk anderledes?</h2>
          <div className="mt-14 space-y-16">
            {reasons.map((r, i) => (
              <div key={r.title} className={`grid items-center gap-8 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <img src={r.img} alt="" width={800} height={600} loading="lazy" className="aspect-[16/10] w-full rounded-sm border border-border object-cover" />
                <div>
                  <span className="font-display text-sm font-bold tracking-[0.3em] text-primary-glow">0{i + 1}</span>
                  <h3 className="mt-2 text-3xl font-bold uppercase">{r.title}</h3>
                  <p className="mt-4 max-w-md text-lg text-muted-foreground">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <span className="eyebrow">Galleri</span>
          <h2 className="mt-4 text-4xl font-bold uppercase sm:text-5xl">Se byen, før du ankommer</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3 md:grid-rows-2">
            <img src={event} alt="Arrangement på natklub i byen" width={1280} height={800} loading="lazy" className="h-full min-h-64 w-full rounded-sm object-cover md:col-span-2 md:row-span-2" />
            <img src={calm} alt="Roligt morgenlys ved havnen" width={1024} height={768} loading="lazy" className="aspect-[4/3] w-full rounded-sm object-cover" />
            <img src={police} alt="Politiet på patrulje om natten" width={800} height={1024} loading="lazy" className="aspect-[4/3] w-full rounded-sm object-cover object-top" />
          </div>
        </div>
      </section>

      {/* News */}
      <section id="nyheder" className="scroll-mt-20 border-t border-border py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <span className="eyebrow">Fællesskabet</span>
          <h2 className="mt-4 text-4xl font-bold uppercase sm:text-5xl">Nyheder og arrangementer</h2>
          <div className="engraved mt-10 flex flex-col items-start gap-4 rounded-sm bg-card p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-xl font-bold uppercase">Ingen nyheder lige nu</p>
              <p className="mt-1 text-muted-foreground">Opdateringer og arrangementer bliver altid delt på Discord først.</p>
            </div>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="btn-ghost">Følg med på Discord</a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden border-t border-border py-32 text-center">
        <div className="rune-ring absolute left-1/2 top-1/2 -z-10 aspect-square w-[900px] -translate-x-1/2 -translate-y-1/2 opacity-70" aria-hidden />
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-5xl font-extrabold uppercase leading-none sm:text-6xl">Byen mangler kun<br /><span className="text-primary-glow">din historie.</span></h2>
          <p className="mt-6 text-lg text-muted-foreground">Tag det første skridt ind i Nordisk RP.</p>
          <Link to="/kom-i-gang" className="btn-primary mt-8">Kom i gang <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </PageShell>
  );
}
