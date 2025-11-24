export default function SiteFooter() {
  return (
    <footer className="border-t bg-white text-sm text-gray-600">
      <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Virtual Coffee. All rights reserved.</p>
        <p className="text-xs">Crafted with Next.js & a love for beans.</p>
      </div>
    </footer>
  );
}