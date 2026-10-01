import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Link2 } from "lucide-react";
import { PageShell } from "@/components/site";

export const Route = createFileRoute("/regler")({
  head: () => ({
    meta: [
      { title: "Regler — Nordisk RP" },
      { name: "description", content: "Den officielle, søgbare regeloversigt for Nordisk RP – 99 regler i ni kategorier." },
      { property: "og:title", content: "Regler — Nordisk RP" },
      { property: "og:description", content: "Find alle Nordisk RP-regler samlet i ni overskuelige kategorier." },
    ],
  }),
  component: Rules,
});

const UPDATED = "1. oktober 2026";

type Rule = { id: string; title: string; text: string[] };

const sections: { id: string; title: string; rules: Rule[] }[] = [
  { id: "generelle", title: "Generelle regler", rules: [
    { id: "1.1", title: "Trash talk", text: ["Trash talk, chikane eller nedladende opførsel rettet mod andre spillere udenfor rollespil er ikke tilladt."] },
    { id: "1.2", title: "DDoS-trusler", text: ["Trusler om DDoS-angreb mod serveren eller andre spillere tolereres ikke.", "Trusler mod spillere kan medføre kick.", "Trusler mod serveren kan medføre ban."] },
    { id: "1.3", title: "Reklame", text: ["Det er ikke tilladt at reklamere for egne eller andre FiveM-servere, Discord-servere eller communities. Overtrædelse kan medføre ban. Dette gælder også streaming fra andre servere!"] },
    { id: "1.4", title: "Racisme og diskrimination", text: ["Racisme, diskrimination og andre former for hadefuld eller krænkende adfærd er strengt forbudt."] },
    { id: "1.5", title: "God tone", text: ["Tal ordentligt til andre, og bidrag til en respektfuld og positiv stemning i fællesskabet."] },
    { id: "1.6", title: "Privat kontakt til staff", text: ["Det er ikke tilladt at kontakte Staff privat uden forudgående tilladelse fra det pågældende Staff-medlem. Benyt de officielle supportkanaler."] },
    { id: "1.7", title: "Spam og mic spam", text: ["Spam, mic spam og unødvendig støj i voice chat er ikke tilladt. Gentagne overtrædelser kan medføre advarsler eller yderligere straf."] },
    { id: "1.9", title: "Kontakt til ledelsen", text: ["Community-ejerne er ikke altid tilgængelige. Spørgsmål, problemer og henvendelser skal derfor som udgangspunkt sendes til ledelses- eller staffteamet gennem de officielle kanaler."] },
    { id: "1.10", title: "Krav om mikrofon", text: ["For at spille på serveren skal du have en velfungerende mikrofon med tydelig og forståelig lyd."] },
    { id: "1.11", title: "Admin-sager", text: ["Det er ikke tilladt at forlade serveren eller logge ud, mens du er involveret i en igangværende admin-sag."] },
    { id: "1.12", title: "Tjenestekøretøjer", text: ["Det er ikke tilladt at benytte tjenestekøretøjer såsom politibiler, ambulancer og lignende, medmindre din rolle eller dit job giver dig tilladelse til det."] },
    { id: "1.13", title: "Politivåben", text: ["Det er ikke tilladt at være i besiddelse af politiets våben eller andet politiudstyr, medmindre du har en gyldig roleplay-begrundelse og tilladelse til det."] },
    { id: "1.14", title: "Brug af admin-calls", text: ["Admin-calls må kun benyttes til at anmelde regelbrud eller situationer, som kræver hjælp fra Staff.", "Admin-calls må ikke bruges til almindelige hændelser såsom »Jeg er faldet ud af min bil«, »Jeg er faldet ned fra et tag« eller andre situationer, der kan løses gennem roleplay."] },
    { id: "1.15", title: "Uddyb dit admin-call", text: ["Et admin-call skal indeholde en tydelig beskrivelse af hændelsen. Skriv ikke kun eksempelvis »RDM« – forklar kort, hvad der er sket, og hvem der er involveret."] },
    { id: "1.16", title: "Videooptagelser", text: ["Videooptagelse og streaming på serveren er tilladt og anbefales. Ved at spille på Nordisk RP accepterer du, at dit gameplay og din stemme kan optræde i videoer eller livestreams."] },
    { id: "1.18", title: "Modding og hacking", text: ["Brug af cheats, hacks, ulovlige mods eller andre softwares, der giver en urimelig fordel, er strengt forbudt.", "Overtrædelse medfører permanent ban."] },
  ]},
  { id: "rp", title: "RP regler", rules: [
    { id: "2.1", title: "RDM", text: ["RDM, også kaldet Random Deathmatch, er strengt forbudt. Du må ikke angribe eller dræbe andre spillere uden en gyldig og forudgående roleplay-begrundelse."] },
    { id: "2.2", title: "VDM", text: ["VDM, også kaldet Vehicle Deathmatch, er strengt forbudt. Et køretøj må ikke bruges som våben til bevidst at påkøre eller skade andre spillere."] },
    { id: "2.3", title: "FailRP", text: ["FailRP er ikke tilladt. Du skal altid handle realistisk og i overensstemmelse med din karakter og den igangværende situation."] },
    { id: "2.4", title: "FearRP", text: ["FearRP skal altid overholdes. Du skal værdsætte og frygte for din karakters liv, præcis som du ville gøre i virkeligheden.", "Du må ikke handle urealistisk i situationer, hvor din karakter er truet eller befinder sig i tydelig fare."] },
    { id: "2.5", title: "NLR", text: ["Det er ikke tilladt at bryde eller misbruge NLR-reglen.", "Efter din karakter er død eller genoplivet, må du ikke huske detaljer fra hændelsen, vende direkte tilbage til området eller opsøge de involverede spillere for at tage hævn."] },
    { id: "2.6", title: "Combat logging", text: ["Det er strengt forbudt at forlade serveren for at undgå en igangværende roleplay-situation, anholdelse, konsekvens eller konflikt.", "Oplever du tekniske problemer eller et uventet nedbrud, skal du hurtigst muligt kontakte staff."] },
    { id: "2.8", title: "Militærbasen", text: ["Militærbasen er ikke et almindeligt roleplay-område og må ikke benyttes eller besøges.", "Undtagelser kræver godkendelse fra Staff."] },
    { id: "2.9", title: "Realistisk roleplay", text: ["Urealistisk roleplay er ikke tilladt. Alle krav, handlinger og scenarier skal være rimelige og realistiske.", "Det er eksempelvis ikke realistisk at kræve et urimeligt højt pengebeløb, såsom to millioner kroner, for et gidsel."] },
    { id: "2.10", title: "Politiets afspærringer og anvisninger", text: ["Du skal forlade et område, hvis politiet giver dig besked på det.", "Politiet skal have en gyldig grund til at bortvise dig, men er ikke forpligtet til at oplyse denne grund under selve roleplay-situationen. Begrundelsen skal kunne forklares i en eventuel admin-sag."] },
    { id: "2.11", title: "OOC", text: ["Det er kun staff, der må bryde roleplay og tale OOC under en aktiv situation, eksempelvis i forbindelse med en admin-sag.", "Almindelige spillere skal forblive i karakter, medmindre Staff giver anden besked."] },
    { id: "2.12", title: "Forlad ikke igangværende roleplay", text: ["Du må ikke forlade serveren eller en igangværende situation midt i roleplay.", "Har du en vigtig grund eller tekniske problemer, skal du kontakte Staff hurtigst muligt."] },
    { id: "2.13", title: "Aktiv deltagelse i roleplay", text: ["Du skal kommunikere og deltage aktivt i de situationer, du er en del af.", "Du må ikke ignorere andre spillere, undlade at svare eller bevidst forhindre et scenarie i at udvikle sig."] },
    { id: "2.14", title: "Våbenhandel", text: ["Handel med våben skal foregå gennem en godkendt våbenhandler.", "Det er ikke tilladt at omgå systemet eller handle våben uden om de godkendte roleplay-muligheder."] },
    { id: "2.15", title: "Høst, salg og omdannelse", text: ["Det er ikke tilladt at høste, sælge eller omdanne materialer, stoffer eller andre genstande, mens du befinder dig i et køretøj.", "Handlingerne skal udføres realistisk og uden for køretøjet."] },
    { id: "2.16", title: "Flugt fra politiet", text: ["Du skal have en realistisk og væsentlig grund til at flygte fra politiet.", "Du må eksempelvis flygte, hvis du er i besiddelse af ulovlige våben, større mængder stoffer eller har begået alvorlig kriminalitet. Mindre overtrædelser er ikke automatisk en gyldig grund til at starte en biljagt."] },
    { id: "2.17", title: "Lægekøretøjer", text: ["Det er ikke tilladt at stjæle eller uberettiget benytte ambulancer, lægebiler eller andre køretøjer tilhørende sundhedsberedskabet."] },
    { id: "2.18", title: "Radio peeking", text: ["Radio peeking er ikke tilladt. Du må ikke bruge information fra en anden spillers radio, stream, Discord eller andre eksterne kilder, som din karakter ikke realistisk har adgang til."] },
  ]},
  { id: "roeveri", title: "Røveri, gidseltagning og kidnapning", rules: [
    { id: "3.1", title: "Butiksrøveri", text: ["Der skal være mindst to betjente on-duty, før et butiksrøveri må påbegyndes."] },
    { id: "3.2", title: "Bankrøveri", text: ["Der skal være mindst fire betjente on-duty, før et almindeligt bankrøveri må påbegyndes."] },
    { id: "3.3", title: "Nationalbanksrøveri", text: ["Der skal være mindst fem betjente on-duty, før et røveri mod Nationalbanken må påbegyndes.", "Politielever tæller ikke med som aktive betjente i denne sammenhæng."] },
    { id: "3.4", title: "Forhandling før skudveksling", text: ["Der skal altid foregå reelle forhandlinger, før en skudveksling må påbegyndes.", "Ingen af parterne må starte et skyderi uden en gyldig roleplay-begrundelse og et tydeligt sammenbrud i forhandlingerne."] },
    { id: "3.5", title: "Realistiske forhandlingskrav", text: ["Alle krav under en forhandling skal være realistiske og rimelige.", "Politiet vil eksempelvis ikke tilbyde fri passage, hvis røverne ikke har nogen gidsler eller anden reel forhandlingsfordel."] },
    { id: "3.6", title: "Gidslernes relation", text: ["Et gidsel må ikke have en relation til gidseltagerne.", "Det betyder blandt andet, at venner, bekendte, bande- eller gruppemedlemmer ikke må anvendes som planlagte gidsler."] },
    { id: "3.7", title: "Maksimalt antal gidsler", text: ["Der må højst tages seks gidsler under et røveri eller en kidnapning."] },
    { id: "3.8", title: "Combat logging under røveri", text: ["Det betragtes som combat logging, hvis en spiller forlader serveren under et igangværende røveri, en forhandling eller den efterfølgende flugt.", "Ved tekniske problemer skal Staff kontaktes hurtigst muligt."] },
    { id: "3.9", title: "Afbrudte forhandlinger", text: ["Hvis forhandlingerne holder en uannonceret pause på mere end to minutter, betragtes de som afbrudte.", "Begge parter skal så vidt muligt gøre det tydeligt, hvis de har brug for en kort pause i forhandlingerne."] },
    { id: "3.10", title: "Cop-baiting under røveri", text: ["Cop-baiting er ikke tilladt under eller i forbindelse med et røveri.", "Det er ikke tilladt bevidst at provokere eller lokke politiet til at reagere uden en reel roleplay-begrundelse."] },
    { id: "3.11", title: "Politiets mulighed for at storme", text: ["Politiet må ikke storme en butik, bank eller anden røverilokation, så længe der foregår aktive forhandlinger.", "Politiet må først storme, hvis forhandlingerne er blevet afbrudt, eller hvis der opstår en alvorlig og tydelig trussel mod gidslernes liv."] },
    { id: "3.12", title: "Kidnapning af civile", text: ["Der skal være mindst to betjente online, før en civil må kidnappes.", "Kidnapningen skal have en gyldig og realistisk roleplay-begrundelse."] },
    { id: "3.13", title: "Kidnapning af betjente", text: ["Der skal være mindst tre øvrige betjente online, før en betjent må kidnappes.", "Den kidnappede betjent tæller ikke med i det krævede antal."] },
    { id: "3.14", title: "Kidnapning af politiledelsen", text: ["Der skal være mindst fire øvrige betjente online, før et medlem af politiledelsen må kidnappes.", "Det kidnappede medlem af politiledelsen tæller ikke med i det krævede antal."] },
    { id: "3.15", title: "Læger og sundhedspersonale", text: ["Læger og andet sundhedspersonale må som udgangspunkt ikke kidnappes eller dræbes, mens de er on-duty.", "Hvis en læge har været involveret i en alvorlig konflikt eller kriminel handling off-duty, kan vedkommende indgå i et scenarie på samme vilkår som andre civile. Der skal fortsat være en stærk og realistisk roleplay-begrundelse."] },
    { id: "3.16", title: "Boosting", text: ["Hvis man er registreret som en del af et Car Boost, forventes det, at man aktivt deltager i selve boostet. Det betyder, at man skal befinde sig i det relevante køretøj og være med til at udføre de opgaver, der hører til boostet.", "Det er ikke tilladt blot at være en del af gruppen eller modtage fordelene fra et boost uden reelt at deltage. Alle involverede personer skal kunne ses og høres som aktive deltagere under forløbet.", "Hvis det kan dokumenteres eller konstateres, at en person ikke har været i køretøjet eller på anden måde ikke har deltaget aktivt i Car Boostet, vil dette blive betragtet som brud på reglerne og kan resultere i en straf."] },
  ]},
  { id: "bande", title: "Bande regler", rules: [
    { id: "4.1", title: "Bandeledelse", text: ["En bande må højst have to ledere.", "Lederne har det overordnede ansvar for bandens medlemmer, handlinger og roleplay."] },
    { id: "4.2", title: "Samarbejde mellem bander", text: ["Bander må gerne samarbejde med andre bander, så længe samarbejdet foregår realistisk og ikke bruges til at omgå serverens øvrige regler."] },
    { id: "4.3", title: "Antal medlemmer", text: ["En bande må højst bestå af 10 medlemmer."] },
    { id: "4.4", title: "Bandehus", text: ["En bande må højst eje eller benytte ét officielt bandehus."] },
    { id: "4.5", title: "Respektfuld opførsel", text: ["Bandemedlemmer skal fortsat behandle civile, politi, læger og andre spillere med respekt.", "At være medlem af en bande giver ikke tilladelse til at chikanere andre eller bryde serverens regler."] },
    { id: "4.6", title: "Seriøst bande-roleplay", text: ["Alle bander skal udvise seriøst og realistisk rollespil.", "Banden skal have et tydeligt koncept, en fungerende struktur og bidrage positivt til serverens rollespil."] },
    { id: "4.7", title: "Andre banders beklædning", text: ["Det er ikke tilladt at bære en anden bandes officielle tøj, farver eller uniformer.", "Reglen gælder både bandemedlemmer og civile, medmindre andet er godkendt af Staff som en del af et konkret roleplay-scenarie."] },
    { id: "4.8", title: "Erklæring af bandekrig", text: ["En bandekrig skal offentliggøres og godkendes efter serverens gældende procedure, før den må begynde.", "Begge bander skal tydeligt informeres om, at der er erklæret bandekrig."] },
    { id: "4.9", title: "Kidnapning og bandekrig", text: ["En enkelt kidnapning eller et drab på et bandemedlem er ikke automatisk tilstrækkeligt til at starte en bandekrig.", "NLR skal fortsat overholdes, og hævn-roleplay uden et gyldigt og sammenhængende scenarie er ikke tilladt."] },
    { id: "4.10", title: "Vicepræsident", text: ["En bande må højst have én vicepræsident."] },
    { id: "4.11", title: "Ny bandeansøgning", text: ["Hvis en bandeansøgning bliver afvist, skal hele banden vente mellem én til to dage, før der må indsendes en ny ansøgning.", "En ny ansøgning bør tage højde for den feedback, som blev givet ved afslaget."] },
    { id: "4.12", title: "Alderskrav til bandeledere", text: ["Alle bandeledere skal være fyldt 16 år."] },
    { id: "4.13", title: "Minimumskrav til medlemmer", text: ["En bande skal bestå af mindst tre aktive medlemmer for at kunne blive godkendt og opretholde sin status som officiel bande."] },
  ]},
  { id: "discord", title: "Discord regler", rules: [
    { id: "5.1", title: "Status på ansøgninger", text: ["Det er ikke tilladt gentagne gange at spørge ind til status på sin ansøgning.", "Alle ansøgninger bliver behandlet hurtigst muligt. Unødvendige henvendelser kan forsinke processen."] },
    { id: "5.2", title: "Privat kontakt til staff", text: ["Det er ikke tilladt at kontakte Staffmedlemmer privat, medmindre det pågældende Staffmedlem på forhånd har givet tilladelse.", "Benyt altid serverens officielle support- og ansøgningskanaler."] },
    { id: "5.3", title: "Tagging af staff", text: ["Staffmedlemmer må ikke tagges unødvendigt i beskeder eller tickets.", "Staff må kun tagges, hvis det er relevant, nødvendigt eller specifikt tilladt."] },
    { id: "5.4", title: "Kode til huset", text: ["Koden til huset er: Jeg-læst-reglerne"] },
  ]},
  { id: "whitelisted", title: "Regler for whitelisted jobs", rules: [
    { id: "6.1", title: "Korruption i politiledelsen", text: ["Korruption er ikke tilladt blandt medlemmer af politiledelsen.", "Dette gælder blandt andet ledelsesrank som A-01, A-02 og A-03 samt tilsvarende ledende stillinger.", "Politiledelsen skal altid handle professionelt og må ikke misbruge sin rang, adgang eller myndighed til egen eller andres fordel."] },
    { id: "6.2", title: "Udlevering af våben", text: ["Politiets våben, ammunition og øvrige tjenesteudstyr må under ingen omstændigheder udleveres, sælges eller videregives til civile, kriminelle eller andre uvedkommende.", "Overtrædelse betragtes som et alvorligt regelbrud og kan medføre fjernelse fra politiet samt yderligere sanktioner."] },
    { id: "6.3", title: "Begrænset korruption roleplay", text: ["Almindelige betjente må deltage i begrænset og realistisk korrupt roleplay, så længe det ikke omfatter politiets ledelse eller udlevering af våben og tjenesteudstyr.", "Dette kan eksempelvis omfatte nedsættelse eller ændring af en straf, at se bort fra mindre lovovertrædelser eller begrænset magtmisbrug som en del af et seriøst scenarie.", "Korruptionen skal have en realistisk roleplay-begrundelse og må ikke bruges som undskyldning for tilfældig vold, chikane, FailRP eller misbrug af politiets systemer."] },
  ]},
  { id: "alle-jobs", title: "Regler for alle jobs", rules: [
    { id: "7.1", title: "Brug af arbejdskøretøjer", text: ["Hvis dit job stiller et arbejdskøretøj til rådighed, skal dette benyttes, mens du udfører arbejdsrelaterede opgaver.", "Private køretøjer må som udgangspunkt ikke bruges som erstatning for et tilgængeligt arbejdskøretøj."] },
    { id: "7.2", title: "Arbejdsopkald off-duty", text: ["Du må ikke modtage eller besvare arbejdsrelaterede opkald, mens du er off-duty.", "For at håndtere opkald og udføre arbejdsopgaver skal du først gå on-duty."] },
    { id: "7.3", title: "Arbejdstøj", text: ["Du skal bære det korrekte arbejdstøj eller den tilhørende uniform, mens du er on-duty.", "Når du går off-duty, skal du skifte tilbage til almindeligt tøj."] },
    { id: "7.4", title: "Realistiske arbejdshandlinger", text: ["Brug relevante handlinger og emotes til at gøre dit arbejde mere realistisk og troværdigt.", "Arbejdsopgaver må ikke blot gennemføres mekanisk. Du skal så vidt muligt skabe roleplay omkring de handlinger, din karakter udfører."] },
  ]},
  { id: "politi", title: "Politi regler", rules: [
    { id: "8.1", title: "Korruption", text: ["Korruption i politiet er som udgangspunkt ikke tilladt.", "Eventuelt korrupt rollespil må kun foregå inden for rammerne af §6 og skal være realistisk, begrænset og i overensstemmelse med serverens øvrige regler."] },
    { id: "8.2", title: "Overtrædelse af færdselsloven", text: ["Politiet må ikke bryde færdselsloven uden en gyldig tjenstlig grund.", "Ved udrykningskørsel skal blink og sirener anvendes efter situationens alvor og i overensstemmelse med politiets retningslinjer."] },
    { id: "8.3", title: "Brug af blink", text: ["Politiets blink må aktiveres i forbindelse med en tjenstlig opgave, eksempelvis hvis en person mistænkes for eller observeres i at bryde loven.", "Blink må ikke anvendes uden en relevant og saglig grund."] },
    { id: "8.4", title: "Brug af sirener", text: ["Sirener må kun aktiveres, når situationen kræver det, eksempelvis ved en akut udrykning, en farlig eftersættelse eller anden alvorlig hændelse.", "Unødvendig brug af sirener er ikke tilladt."] },
    { id: "8.5", title: "Politiets stoptegn", text: ["Hvis politiet aktiverer blink bag dit køretøj, skal du sænke farten og holde ind til siden hurtigst muligt på et sikkert sted.", "Dette gælder også, selvom politiet ikke har aktiveret sirenen."] },
    { id: "8.6", title: "Kørsel med høj hastighed", text: ["Politiet må kun køre med høj hastighed, når der er en gyldig og væsentlig tjenstlig grund.", "Mindre forseelser, såsom ulovligt neonlys, er ikke i sig selv en tilstrækkelig grund til farlig eller ekstrem høj hastighedskørsel."] },
    { id: "8.7", title: "Politiets overholdelse af loven", text: ["Politibetjente skal som udgangspunkt overholde loven, både når de er on-duty og off-duty.", "En betjent må kun fravige loven on-duty, hvis det er nødvendigt som led i en lovlig og relevant tjenestehandling."] },
    { id: "8.8", title: "Brug af våben", text: ["Politibetjente må kun bære og anvende de våben, som deres rang, uddannelse og retningslinjerne i politihåndbogen giver adgang til.", "Det er ikke tilladt at benytte våben, som betjenten ikke er godkendt eller uddannet til at anvende."] },
    { id: "8.9", title: "Brug af taser", text: ["En taser må kun anvendes, når der er en gyldig og realistisk grund til det.", "Taser må eksempelvis benyttes mod en person, der gør voldsom modstand, udgør en fare eller forsøger at flygte fra en alvorlig situation. Den må ikke bruges som straf eller for sjov."] },
    { id: "8.10", title: "Brug af skydevåben", text: ["Brug af skydevåben kræver en alvorlig og tydelig trussel mod betjenten selv eller andre personer.", "Skydevåben må aldrig anvendes unødvendigt eller uden en stærk roleplay-begrundelse. Skud mod køretøjers dæk følger de særskilte regler i politihåndbogen."] },
    { id: "8.11", title: "Visitation", text: ["Politiet må kun visitere en person, hvis der foreligger en gyldig mistanke, en anholdelse, et lovligt påbud eller en anden saglig tjenstlig begrundelse.", "Tilfældige visitationer uden roleplay-begrundelse er ikke tilladt."] },
  ]},
  { id: "ck", title: "CK regler", rules: [
    { id: "9.1", title: "CK ved raid", text: ["Hvis du deltager i et raid mod en politistation, borg eller en tilsvarende bevogtet lokation, accepterer du risikoen for, at din karakter kan blive CK'et som følge af scenariet.", "En CK skal altid have en tydelig roleplay-begrundelse og vurderes eller godkendes af staff."] },
    { id: "9.2", title: "Frivilligt CK", text: ["En spiller bestemmer som udgangspunkt selv, om vedkommendes karakter skal CK'es.", "Hvis en spiller tydeligt siger »ingen puls« tre gange, betragtes det som en bekræftelse på, at spilleren frivilligt accepterer CK af sin karakter."] },
    { id: "9.3", title: "Tvunget CK", text: ["Et tvunget CK må kun finde sted efter godkendelse fra staff.", "Der skal foreligge en alvorlig og sammenhængende roleplay-begrundelse. Personlige uenigheder, mindre konflikter eller et ønske om hævn er ikke tilstrækkeligt."] },
    { id: "9.4", title: "CK må ikke bruges som trussel", text: ["Det er ikke tilladt at true andre spillere med CK for at presse dem til bestemte handlinger.", "CK må heller ikke bruges som straf for en konflikt, der foregår uden for roleplay."] },
    { id: "9.5", title: "Staffs afgørelse", text: ["Staff har den endelige beslutning i sager om CK.", "Staff kan afvise eller annullere et CK, hvis scenariet vurderes som urealistisk, regelstridigt eller utilstrækkeligt begrundet."] },
    { id: "9.6", title: "Bevismateriale", text: ["Ved planlagte eller tvungne CK-scenarier anbefales det, at de involverede spillere har videooptagelse af hele forløbet.", "Staff kan kræve dokumentation, hvis der opstår uenighed om scenariet."] },
    { id: "9.7", title: "Konsekvenser ved CK", text: ["Når en karakter bliver CK'et, afsluttes karakterens historie permanent.", "Karakteren må ikke længere benyttes, og spilleren må ikke fortsætte karakterens tidligere relationer, konflikter, medlemskaber, rang eller arbejde, kriminelle forbindelser samt minder og informationer."] },
    { id: "9.8", title: "Ejendele efter CK", text: ["Efter et CK må karakterens penge, våben, køretøjer og andre ejendele ikke overføres til en ny karakter for at undgå konsekvenserne.", "Eventuel overførsel eller arv skal godkendes af staff på forhånd."] },
    { id: "9.9", title: "Ny karakter", text: ["En ny karakter må ikke oprettes med samme navn, udseende, historie eller personlighed som den CK'ede karakter.", "Den nye karakter skal være en selvstændig person uden adgang til den tidligere karakters viden."] },
    { id: "9.10", title: "Genkendelse af tidligere relationer", text: ["Efter et CK må spilleren ikke straks opsøge sin tidligere bande, familie, venner eller arbejdsplads med en ny karakter.", "Alle nye relationer skal opbygges naturligt gennem nyt roleplay."] },
    { id: "9.11", title: "CK under regelbrud", text: ["Et CK er ikke gyldigt, hvis det er opnået gennem RDM, FailRP, metagaming, powergaming eller andre regelbrud.", "Sagen skal i stedet behandles af staff."] },
    { id: "9.12", title: "Fortrydelse af frivilligt CK", text: ["Når en spiller har accepteret et frivilligt CK, kan beslutningen som udgangspunkt ikke trækkes tilbage.", "Undtagelser kan kun foretages af ledelsen, hvis der er sket en tydelig misforståelse eller et alvorligt regelbrud."] },
    { id: "9.13", title: "Planlagte CK-scenarier", text: ["Planlagte CK-scenarier skal være seriøse, realistiske og opbygget gennem længerevarende roleplay.", "Et CK må ikke gennemføres på baggrund af en kortvarig eller tilfældig konflikt."] },
    { id: "9.14", title: "CK af medlemmer med særlige roller", text: ["CK af bandeledere, politiledelse, virksomhedsejere eller andre personer med en væsentlig rolle på serveren skal godkendes af staff på forhånd.", "Dette sikrer, at scenariet kan afsluttes korrekt, og at eventuelle roller eller ejerskaber bliver håndteret."] },
  ]},
];

const TOTAL = sections.reduce((n, s) => n + s.rules.length, 0);

function Rules() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return sections;
    return sections
      .map((s) => ({ ...s, rules: s.rules.filter((r) => (r.title + " " + r.text.join(" ")).toLowerCase().includes(t)) }))
      .filter((s) => s.rules.length);
  }, [q]);

  return (
    <PageShell>
      <section className="border-b border-border pb-12 pt-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <span className="eyebrow">Officiel regelsamling</span>
          <h1 className="mt-4 text-5xl font-extrabold uppercase sm:text-6xl">Regler</h1>
          <p className="mt-4 text-muted-foreground">{TOTAL} regler i {sections.length} kategorier · Senest opdateret {UPDATED}</p>
          <label className="engraved mt-8 flex max-w-xl items-center gap-3 rounded-sm bg-card px-4">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="sr-only">Søg i reglerne</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Søg i reglerne…" className="h-12 w-full bg-transparent outline-none placeholder:text-muted-foreground" />
          </label>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 lg:grid-cols-[240px_1fr] lg:px-8">
        <nav aria-label="Kategorier" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex gap-2 overflow-x-auto lg:flex-col">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block whitespace-nowrap rounded-sm border border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary-glow hover:text-foreground lg:border-0 lg:border-l-2 lg:px-4">{s.title}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-14">
          {filtered.length === 0 && <p className="text-muted-foreground">Ingen regler matcher “{q}”.</p>}
          {filtered.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-3xl font-bold uppercase">{s.title}</h2>
              <div className="mt-6 space-y-4">
                {s.rules.map((r) => (
                  <article key={r.id} id={`regel-${r.id}`} className="engraved scroll-mt-24 rounded-sm bg-card p-6">
                    <div className="flex items-start gap-4">
                      <span className="font-display text-lg font-bold text-primary-glow">§{r.id}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{r.title}</h3>
                        {r.text.map((p, i) => (
                          <p key={i} className={i === 0 ? "mt-1 text-foreground/90" : "mt-2 text-foreground/90"}>{p}</p>
                        ))}
                      </div>
                      <a href={`#regel-${r.id}`} aria-label={`Direkte link til regel ${r.id}`} className="text-muted-foreground hover:text-foreground"><Link2 className="h-4 w-4" /></a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
