/**
 * Üks allikas värvidele: `palette.json` (muuda seal; see fail impordib ja tüübitab).
 * `tailwind.config.ts` laeb sama JSON-i — ära dubleeri hex-koodid komponentides.
 *
 * Token | Tailwind klassid (näited) | Mõte
 * ------|---------------------------|------
 * canvas | `bg-canvas` | Lehe kreemjas taust, valge `main` kaardi ümber
 * surface | `bg-surface` | Header, külgriba, alumine mobiilnav (soe beež)
 * divider | `border-divider` | Peened jooned (header/nav)
 * primary | `bg-primary`, `text-primary`, läbipaistvused `/35` jne | Kollane aktsent (mockup)
 * secondary | `bg-secondary`, `ring-secondary` | Salve roheline, pehmed taustad
 * accentTeal | `bg-accent-teal`, gradiendid | Teemant pillid, gradiendi lõpp
 * accentSky | `bg-accent-sky` | Lisaks pehme sinakas toon
 * ink | `text-ink` | Pealkirjad, primaarne tekst (süsi)
 * yellowStrong | `text-yellow-strong` | Ikoonid heledal taustal (tumedam kollane)
 */
import palette from './palette.json';

export const colors = palette as {
  readonly canvas: string;
  readonly surface: string;
  readonly divider: string;
  readonly primary: string;
  readonly secondary: string;
  readonly accentTeal: string;
  readonly accentSky: string;
  readonly ink: string;
  readonly yellowStrong: string;
};
