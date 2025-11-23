// app/page.tsx
import { Chat } from "@/components/Chat";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center px-4">
      <Chat />
    </main>
  );
}
