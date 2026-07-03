import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[85svh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute left-1/2 top-1/2 w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/motif.png" alt="" />
      </div>
      <p className="font-display text-[7rem] font-extralight leading-none text-taupe md:text-[10rem]">
        404
      </p>
      <p className="mt-6 font-serif text-xl italic text-copper md:text-2xl">
        Cette page s&apos;est égarée dans les champs de romarin.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-primary" data-cursor>
          Retour à l&apos;accueil
        </Link>
        <Link href="/boutique/" className="btn-ghost" data-cursor>
          Voir la boutique
        </Link>
      </div>
    </div>
  );
}
