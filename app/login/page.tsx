export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm border border-neutral-200 rounded-lg p-6 bg-neutral-50">
        <h1 className="text-xl font-semibold mb-4">Log In</h1>
        <p className="text-sm text-neutral-600 mb-6">Placeholder login form. Integrate auth provider later.</p>
        <form className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium">Email</label>
            <input type="email" className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium">Password</label>
            <input type="password" className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <button type="submit" className="w-full bg-black text-white py-2 rounded-md text-sm font-medium hover:bg-neutral-800">Log In</button>
        </form>
      </div>
    </main>
  );
}