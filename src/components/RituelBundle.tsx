import Link from "next/link";
import Magnetic from "@/components/Magnetic";

export default function RituelBundle() {
  return (
    <Magnetic>
      <Link
        href="/boutique/"
        className="inline-flex items-center justify-center rounded-[2px] bg-ivory px-9 py-4 text-[11px] font-normal uppercase tracking-wide2 text-copper transition-colors duration-300 hover:bg-ivory-2"
        data-cursor
      >
        Composer ma routine →
      </Link>
    </Magnetic>
  );
}
