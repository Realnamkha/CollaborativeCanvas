// app/page.tsx
import Link from "next/link";
import { CreateRoomButton } from "./components/CreateRoom";
import { cookies } from "next/headers";
import { SignOutButton } from "./components/Sign_Out";

export default async function Home() {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("token");
  return (
    <div className="font-sans bg-stone-950 text-stone-100 min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">
          <div
            className="text-xl font-black tracking-widest uppercase text-orange-400"
            style={{ letterSpacing: "0.2em" }}
          >
            MyBrand
          </div>
          <nav className="flex items-center gap-8 text-xs uppercase tracking-widest text-stone-400 font-medium">
            <Link
              href="#features"
              className="hover:text-orange-400 transition-colors duration-300"
            >
              Features
            </Link>
            <Link
              href="#contact"
              className="hover:text-orange-400 transition-colors duration-300"
            >
              Contact
            </Link>
            {isLoggedIn ? (
              <SignOutButton />
            ) : (
              <Link
                href="/signin"
                className="border border-stone-700 hover:border-orange-400 hover:text-orange-400 transition-all duration-300 px-5 py-2 rounded-full"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative min-h-screen flex items-center">
        {/* Background decorative grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(251,146,60,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(251,146,60,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glowing orb */}
        <div
          className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, #f97316, transparent)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-8 pt-32 pb-24 w-full grid md:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 border border-orange-400/30 bg-orange-400/10 rounded-full px-4 py-1.5 text-orange-400 text-xs uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
              Now in beta
            </div>
            <h1
              className="text-5xl md:text-6xl font-black text-stone-50 leading-none tracking-tight"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              Build your
              <br />
              <span className="text-orange-400">next project</span>
              <br />
              effortlessly.
            </h1>
            <p className="text-stone-400 text-lg leading-relaxed max-w-sm">
              Launch your ideas faster with a modern, responsive foundation
              built with Next.js and Tailwind CSS.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#features"
                className="group inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-400 text-stone-950 font-bold px-7 py-4 rounded-full transition-all duration-300 text-sm uppercase tracking-wider"
              >
                Get Started
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              <CreateRoomButton />
            </div>
          </div>

          {/* Right: Visual card */}
          <div className="relative flex justify-center">
            {/* Decorative background card */}
            <div className="absolute inset-4 bg-orange-500/10 rounded-3xl border border-orange-500/20 rotate-3" />
            <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 space-y-6 shadow-2xl">
              {/* Mock UI inside card */}
              <div className="flex items-center gap-3 border-b border-stone-800 pb-6">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-stone-950 font-black text-sm">M</span>
                </div>
                <div>
                  <div className="text-stone-200 font-semibold text-sm">
                    MyBrand Dashboard
                  </div>
                  <div className="text-stone-500 text-xs">
                    mybrand.app/workspace
                  </div>
                </div>
                <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div className="space-y-3">
                {[
                  { label: "Active Users", value: "12,481", up: true },
                  { label: "Revenue", value: "$48,320", up: true },
                  { label: "Conversion", value: "3.6%", up: false },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex justify-between items-center bg-stone-800/50 rounded-xl px-4 py-3"
                  >
                    <span className="text-stone-400 text-sm">{stat.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-100 font-semibold text-sm">
                        {stat.value}
                      </span>
                      <span
                        className={`text-xs font-medium ${stat.up ? "text-green-400" : "text-red-400"}`}
                      >
                        {stat.up ? "↑" : "↓"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
                <div className="text-orange-400 font-semibold text-sm">
                  Your site is live
                </div>
                <div className="text-stone-500 text-xs mt-1">
                  Last deploy: 2 min ago
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative py-32">
        <div className="max-w-7xl mx-auto px-8">
          {/* Section label */}
          <div className="flex items-center gap-4 mb-16">
            <div className="h-px flex-1 bg-stone-800" />
            <span className="text-xs uppercase tracking-widest text-stone-500 font-medium">
              What you get
            </span>
            <div className="h-px flex-1 bg-stone-800" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                number: "01",
                title: "Fast",
                desc: "Optimized performance to make your site load lightning fast for your users.",
                accent: "border-orange-500/30",
                glow: "bg-orange-500/5",
              },
              {
                number: "02",
                title: "Responsive",
                desc: "Looks great on all devices, from phones to desktops without extra work.",
                accent: "border-amber-500/30",
                glow: "bg-amber-500/5",
              },
              {
                number: "03",
                title: "Modern",
                desc: "Built with Next.js and modern web standards for easy customization and maintenance.",
                accent: "border-yellow-500/30",
                glow: "bg-yellow-500/5",
              },
            ].map((feature) => (
              <div
                key={feature.number}
                className={`group relative border ${feature.accent} ${feature.glow} rounded-2xl p-8 hover:bg-stone-900/80 transition-all duration-300`}
              >
                <div className="text-xs font-black text-stone-700 tracking-widest mb-6 group-hover:text-orange-500 transition-colors duration-300">
                  {feature.number}
                </div>
                <h3 className="text-2xl font-black text-stone-100 mb-4 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="relative bg-orange-500 rounded-3xl px-12 py-16 overflow-hidden text-center">
            {/* Decorative circles */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-orange-400 rounded-full opacity-40" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-600 rounded-full opacity-40" />
            <div className="relative">
              <h2 className="text-4xl font-black text-stone-950 mb-4 tracking-tight">
                Ready to ship something great?
              </h2>
              <p className="text-orange-900 mb-8 text-lg">
                Start building in minutes, not days.
              </p>
              <Link
                href="#contact"
                className="inline-flex items-center gap-2 bg-stone-950 hover:bg-stone-800 text-stone-50 font-bold px-8 py-4 rounded-full transition-all duration-300 text-sm uppercase tracking-wider"
              >
                Start for free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-stone-800 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="text-xl font-black tracking-widest text-orange-400 uppercase mb-4">
                MyBrand
              </div>
              <p className="text-stone-500 text-sm leading-relaxed max-w-xs">
                Building tools that help teams move faster and ship with
                confidence.
              </p>
            </div>
            <div>
              <p className="text-stone-400 text-sm mb-4 font-medium">
                Subscribe for updates
              </p>
              <form className="flex gap-3">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-stone-900 border border-stone-700 focus:border-orange-500 focus:outline-none px-4 py-3 rounded-full text-sm text-stone-200 placeholder-stone-600 transition-colors duration-300"
                />
                <button className="bg-orange-500 hover:bg-orange-400 text-stone-950 font-bold px-6 py-3 rounded-full transition-colors duration-300 text-sm uppercase tracking-wider whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div className="border-t border-stone-800 mt-12 pt-8 text-stone-600 text-xs text-center tracking-widest uppercase">
            © 2026 MyBrand. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
