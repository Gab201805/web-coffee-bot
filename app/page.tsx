// app/page.tsx
import { Chat } from "@/components/Chat";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const heroText = `👋 Welcome to **Vital Coffee Roasters** — where strength meets coffee.\n\nWe roast specialty coffees crafted for **energy, focus, and recovery.**\nPerfect for athletes, creators, and anyone who fuels their day naturally. 💪☕`;

  const renderHero = (raw: string) => {
    let escaped = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/\n{2,}/g, '<br/><br/>' ).replace(/\n/g, '<br/>' );
    return { __html: escaped };
  };
  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {/* Blank top area with only login button */}
      <div className="absolute right-6 top-6 z-10">
        <Link href="/login" className="px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-neutral-800 transition">
          Log In
        </Link>
      </div>
      <main className="flex-1 flex flex-col items-center justify-start px-4">
        {/* Centered logo block */}
        <div className="mt-16 mb-8 flex flex-col items-center gap-8">
          <Image
            src="/file.svg"
            alt="Virtual Coffee Logo"
            width={480}
            height={480}
            className="opacity-90 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 2xl:w-[30rem] 2xl:h-[30rem] transition-all"
            sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, (max-width: 1024px) 288px, (max-width: 1280px) 384px, (max-width: 1536px) 480px, 480px"
            priority
          />
          <div className="flex flex-col items-center w-full">
            <div className="w-full max-w-3xl px-4 text-center">
              <p
                className="text-lg md:text-xl leading-relaxed text-neutral-900"
                dangerouslySetInnerHTML={renderHero(heroText)}
              />
            </div>
          </div>
        </div>
        <div className="w-full max-w-3xl">
          <Chat />
        </div>
        <div className="h-12" />
      </main>
    </div>
  );
}
