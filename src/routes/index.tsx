import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, BookOpen, UserPlus, ShieldCheck, Users, Landmark } from "lucide-react";
import { PageShell, DISCORD_URL } from "@/components/site";
import hero from "@/assets/nordisk-hero-city.jpg";
import emblem from "@/assets/emblem.png";
import police from "@/assets/nordisk-role-police.jpg";
import business from "@/assets/nordisk-role-business.jpg";
import civil from "@/assets/nordisk-role-civil.jpg";
import crime from "@/assets/nordisk-role-crime.jpg";
import event from "@/assets/nordisk-community-event.jpg";
import harbor from "@/assets/nordisk-harbor-dawn.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nordisk RP — Din historie. Dit eftermæle." },
      { name: "description", content: "Træd ind i Nordisk RP – et dansk FiveM-fællesskab med seriøst, karakterdrevet rollespil og plads til historier, der får konsekvenser." },
      { property: "og:title", content: "Nordisk RP — Din historie. Dit eftermæle." },
      { property: "og:description", content: "Et dansk FiveM-fællesskab bygget omkring karakterer, relationer og konsekvenser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const steps = [
  { icon: MessageCircle, title: "Mød fællesskabet", text: "Discord er indgangen til byen. Her finder du nyheder, hjælp og de mennesker, du skal skabe historier med.", cta: "Åbn Discord", href: DISCORD_URL },
  { icon: BookOpen, title: "Kend rammerne", text: "Læs reglerne, og forstå den fælles standard for realistisk og respektfuldt rollespil.", cta: "Læs reglerne", to: "/regler" },
  { icon: UserPlus, title: "Sæt en karakter i spil", text: "Send din ansøgning med en karakteridé, der kan vokse gennem relationer, valg og konsekvenser.", cta: "Ansøg nu", to: "/ansog" },
] as const;

const roles = [
  { img: police, alt: "Betjent ved en hændelse i byen", title: "Politi og beredskab", text: "Hold hovedet koldt, når byen mister sit." },
  { img: business, alt: "Virksomhedsejer i sit værksted", title: "Virksomheder og erhverv", text: "Byg et navn, skab arbejdspladser og sæt dit præg." },
  { img: civil, alt: "Borgere mødes ved havnen", title: "Det civile liv", text: "Venskaber, ambitioner og hverdage bliver til historier." },
  { img: crime, alt: "Møde i havnens industrielle område", title: "Den kriminelle underverden", text: "Tillid er dyr. Konsekvenser er dyrere." },
];

const principles = [
  { icon: ShieldCheck, title: "Karakteren først", text: "Valg skal give mening for den person, du spiller – også når den nemme løsning frister." },
  { icon: Users, title: "Plads til modspil", text: "Godt rollespil skabes sammen. Scener skal give andre noget at reagere på, ikke lukke historien." },
  { icon: Landmark, title: "En by med hukommelse", text: "Relationer, omdømme og konflikter følger med videre. Det, du gør i dag, former mulighederne i morgen." },
];

function Index() {
  return (
    <PageShell>
      <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden pb-16 pt-28 sm:items-center sm:pb-20">
        <img src={hero} alt="Nordisk havneby i regn ved aftenstid" width={1920} height={1080} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-[68%_center]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--background)_0%,color-mix(in_oklab,var(--background)_86%,transparent)_42%,color-mix(in_oklab,var(--background)_30%,transparent)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-transparent to-background/40" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 lg:grid-cols-[1.15fr_.85fr] lg:px-8">
          <div className="fade-up max-w-3xl">
            <span className="eyebrow">Dansk FiveM · Seriøst rollespil</span>
            <h1 className="mt-5 text-6xl font-extrabold uppercase leading-[0.9] sm:text-7xl lg:text-8xl">Din historie.<br /><span className="text-primary-glow">Dit eftermæle.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Nordisk RP er en levende by, hvor karakterer kommer før hurtige gevinster. Skab relationer, tag chancer og lev med det, dine valg sætter i gang.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/ansog" className="btn-primary">Ansøg om adgang <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/kom-i-gang" className="btn-ghost">Se hvordan du starter</Link>
            </div>
          </div>
          <div className="relative mx-auto hidden w-full max-w-sm lg:block">
            <div className="rune-ring absolute -inset-[32%] opacity-60" aria-hidden />
            <img src={emblem} alt="Nordisk RP emblem" width={1024} height={1024} className="relative drop-shadow-[0_24px_38px_rgba(0,0,0,0.72)]" />
          </div>
        </div>
      </section>

      <section id="om" className="scroll-mt-20 border-t border-border py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-3xl"><span className="eyebrow">Vejen ind</span><h2 className="mt-4 text-4xl font-bold uppercase sm:text-5xl">Fra første møde til første vagt</h2><p className="mt-5 text-lg text-muted-foreground">Du skal ikke kende alle systemer på forhånd. Du skal komme med lysten til at skabe troværdigt rollespil sammen med andre.</p></div>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-sm bg-border md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="flex flex-col bg-card p-8">
                <div className="flex items-center justify-between"><s.icon className="h-6 w-6 text-primary-glow" aria-hidden /><span className="font-display text-5xl font-bold text-foreground/10">0{i + 1}</span></div>
                <h3 className="mt-6 text-2xl font-bold uppercase">{s.title}</h3><p className="mt-3 flex-1 text-muted-foreground">{s.text}</p>
                {"href" in s ? <a href={s.href} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold hover:text-primary-glow">{s.cta}<ArrowRight className="h-4 w-4" /></a> : <Link to={s.to} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold hover:text-primary-glow">{s.cta}<ArrowRight className="h-4 w-4" /></Link>}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="byen" className="scroll-mt-20 border-y border-border bg-card py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <span className="eyebrow">Livet i byen</span><h2 className="mt-4 text-4xl font-bold uppercase sm:text-5xl">Hvem bliver du, når byen svarer igen?</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((r) => <article key={r.title} className="group relative aspect-[3/4] overflow-hidden rounded-sm border border-border transition-colors hover:border-primary-glow/70"><img src={r.img} alt={r.alt} width={1200} height={1500} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6"><h3 className="text-2xl font-bold uppercase">{r.title}</h3><p className="mt-2 text-sm text-muted-foreground">{r.text}</p></div></article>)}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8">
          <div><span className="eyebrow">Det fælles løfte</span><h2 className="mt-4 text-4xl font-bold uppercase sm:text-5xl">Historier fungerer kun, når vi bygger dem sammen</h2><p className="mt-5 text-lg text-muted-foreground">Nordisk RP handler ikke om at vinde enhver scene. Det handler om at efterlade byen med mere historie, end da du kom.</p></div>
          <div className="divide-y divide-border border-y border-border">
            {principles.map((p) => <div key={p.title} className="grid grid-cols-[auto_1fr] gap-5 py-6"><p.icon className="mt-1 h-6 w-6 text-primary-glow" aria-hidden /><div><h3 className="text-2xl font-bold uppercase">{p.title}</h3><p className="mt-2 text-muted-foreground">{p.text}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8"><span className="eyebrow">Glimt fra byen</span><h2 className="mt-4 text-4xl font-bold uppercase sm:text-5xl">Mellem møderne og konsekvenserne</h2><div className="mt-12 grid gap-4 md:grid-cols-[1.6fr_1fr]"><img src={event} alt="Borgere samlet til biltræf ved havnen" width={1600} height={1000} loading="lazy" className="h-full min-h-72 w-full rounded-sm object-cover" /><img src={harbor} alt="Stille morgen ved byens havn" width={1600} height={1000} loading="lazy" className="h-full min-h-72 w-full rounded-sm object-cover" /></div></div>
      </section>

      <section className="relative isolate overflow-hidden py-28 text-center"><div className="rune-ring absolute left-1/2 top-1/2 -z-10 aspect-square w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-60" aria-hidden /><div className="mx-auto max-w-3xl px-5"><span className="eyebrow">Din plads venter</span><h2 className="mt-5 text-5xl font-extrabold uppercase leading-none sm:text-6xl">Kom med en karakter.<br /><span className="text-primary-glow">Forlad byen med en historie.</span></h2><p className="mt-6 text-lg text-muted-foreground">Læs rammerne, find din idé og send din ansøgning.</p><Link to="/ansog" className="btn-primary mt-8">Ansøg om adgang <ArrowRight className="h-4 w-4" /></Link></div></section>
    </PageShell>
  );
}