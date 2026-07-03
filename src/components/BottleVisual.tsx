import { Variant } from "@/lib/products";

const Defs = () => (
  <defs>
    <linearGradient id="mk-body" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#B68D78" />
      <stop offset="0.45" stopColor="#C89678" />
      <stop offset="1" stopColor="#A87D64" />
    </linearGradient>
    <linearGradient id="mk-cap" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#6B4230" />
      <stop offset="0.5" stopColor="#82503C" />
      <stop offset="1" stopColor="#5E3A2A" />
    </linearGradient>
  </defs>
);

const Label = ({ y, h, name, category }: { y: number; h: number; name?: string; category?: string }) => (
  <g>
    <rect x="34" y={y} width="52" height={h} rx="1.5" fill="#F5F3EF" />
    <text
      x="60"
      y={y + h / 2 - 2}
      textAnchor="middle"
      fontSize="7"
      letterSpacing="2"
      fill="#82503C"
      fontFamily="var(--font-jost), sans-serif"
    >
      MANIKA
    </text>
    {name && (
      <text
        x="60"
        y={y + h / 2 + 9}
        textAnchor="middle"
        fontSize="4"
        letterSpacing="0.8"
        fill="#B68D78"
        fontFamily="var(--font-jost), sans-serif"
      >
        {name.toUpperCase()}
      </text>
    )}
    {category && (
      <text
        x="60"
        y={y + h / 2 + 17}
        textAnchor="middle"
        fontSize="3.2"
        letterSpacing="1"
        fill="#C8BEB4"
        fontFamily="var(--font-jost), sans-serif"
      >
        {category.toUpperCase()}
      </text>
    )}
  </g>
);

export default function BottleVisual({
  variant,
  name,
  category,
  className = "",
}: {
  variant: Variant;
  name?: string;
  category?: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 120 210" className={className} role="img" aria-label={name ? `Flacon ${name}` : "Flacon MANIKA"}>
      <Defs />
      {variant === "serum" && (
        <g>
          <rect x="49" y="2" width="22" height="9" rx="3.5" fill="url(#mk-cap)" />
          <rect x="53" y="11" width="14" height="26" rx="2" fill="url(#mk-cap)" />
          <rect x="57" y="14" width="6" height="30" rx="3" fill="#82503C" opacity="0.55" />
          <path
            d="M40 46 H80 C87 55 90 62 90 74 V186 A10 10 0 0 1 80 196 H40 A10 10 0 0 1 30 186 V74 C30 62 33 55 40 46 Z"
            fill="url(#mk-body)"
          />
          <rect x="36" y="58" width="5" height="126" rx="2.5" fill="#FFFFFF" opacity="0.22" />
          <Label y={96} h={58} name={name} category={category} />
        </g>
      )}
      {variant === "jar" && (
        <g>
          <rect x="28" y="58" width="64" height="20" rx="4" fill="url(#mk-cap)" />
          <rect x="30" y="76" width="60" height="4" fill="#5E3A2A" opacity="0.5" />
          <path
            d="M30 82 H90 C93 82 95 85 95 89 V172 A18 18 0 0 1 77 190 H43 A18 18 0 0 1 25 172 V89 C25 85 27 82 30 82 Z"
            fill="url(#mk-body)"
          />
          <rect x="31" y="90" width="5" height="86" rx="2.5" fill="#FFFFFF" opacity="0.22" />
          <Label y={106} h={52} name={name} category={category} />
        </g>
      )}
      {variant === "tall" && (
        <g>
          <rect x="54" y="4" width="12" height="16" rx="2" fill="url(#mk-cap)" />
          <path d="M50 20 H84 V32 H70 V40 H50 Z" fill="url(#mk-cap)" />
          <path
            d="M42 40 H78 C84 48 86 54 86 64 V188 A9 9 0 0 1 77 197 H43 A9 9 0 0 1 34 188 V64 C34 54 36 48 42 40 Z"
            fill="url(#mk-body)"
          />
          <rect x="40" y="52" width="5" height="134" rx="2.5" fill="#FFFFFF" opacity="0.22" />
          <Label y={92} h={62} name={name} category={category} />
        </g>
      )}
      {variant === "slim" && (
        <g>
          <rect x="52" y="6" width="16" height="14" rx="2.5" fill="url(#mk-cap)" />
          <rect x="55" y="20" width="10" height="12" fill="#B68D78" />
          <path
            d="M48 32 H72 C77 42 79 50 79 62 V188 A8 8 0 0 1 71 196 H49 A8 8 0 0 1 41 188 V62 C41 50 43 42 48 32 Z"
            fill="url(#mk-body)"
          />
          <rect x="46" y="46" width="4" height="140" rx="2" fill="#FFFFFF" opacity="0.22" />
          <g transform="translate(-14 0)">
            <Label y={94} h={58} name={name} category={category} />
          </g>
        </g>
      )}
    </svg>
  );
}
