// app/page.tsx
import { Chat } from "@/components/Chat";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
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
        <div className="mt-24 mb-12 flex flex-col items-center gap-8">
          <Image
            src="/file.svg"
            alt="Virtual Coffee Logo"
            width={480}
            height={480}
            className="opacity-90 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 2xl:w-[30rem] 2xl:h-[30rem] transition-all"
            sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, (max-width: 1024px) 288px, (max-width: 1280px) 384px, (max-width: 1536px) 480px, 480px"
            priority
          />
          <div className="flex flex-col items-center text-center max-w-2xl">
            <p className="font-semibold tracking-tight text-3xl md:text-4xl">Hey there ☕</p>
            <p className="font-semibold tracking-tight text-3xl md:text-4xl mt-2">Need great roasted beans or quick coffee tips? Just ask.</p>
          </div>
        </div>
        <div className="w-full max-w-3xl">
          <Chat />
        </div>
        <div className="h-24" />
      </main>
    </div>
  );
}
