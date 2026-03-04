import Link from "next/link";

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 md:px-8 lg:px-10">
        {/* glow background */}
        <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-72 max-w-4xl rounded-full bg-emerald-500/10 blur-3xl" />

        {/* nav */}
        <header className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.45)]">
              <span className="text-xl">🐼</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-emerald-400">
                PandaWork
              </span>
              <span className="text-base font-medium text-black">
                Freelance Market
              </span>
            </div>
          </div>

          <nav className="flex shrink-0 items-center gap-2 text-sm text-gray-700 sm:gap-4">
            <Link
              href="/auth/login"
              className="hidden rounded-full border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-emerald-500 hover:bg-gray-50 sm:inline-flex sm:px-4"
            >
              Log in
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(16,185,129,0.55)] transition hover:bg-emerald-400"
            >
              Get started
            </Link>
          </nav>
        </header>

        {/* hero + marketplace sections */}
        <main className="relative z-10 mt-12 flex flex-1 flex-col gap-12 sm:mt-16 md:mt-20 md:gap-16 md:px-4 lg:px-16">
          {/* hero */}
          <section className="grid items-center gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            {/* left content */}
            <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-50 px-3 py-1 text-sm text-emerald-700 shadow-[0_0_0_1px_rgba(15,118,110,0.2)]">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.2)]" />
              <span className="font-medium">PandaWork, Upwork-inspired UI</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-black sm:text-5xl lg:text-6xl">
                Find the right{" "}
                <span className="bg-linear-to-r from-emerald-500 via-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                  talent
                </span>{" "}
                for every project.
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-gray-700 sm:text-base">
                PandaWork gives you a clean, Upwork-like experience where
                clients and freelancers connect effortlessly. White and green
                theme, focused on speed, clarity and simple onboarding.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/auth/register?role=client"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(16,185,129,0.6)] transition hover:bg-emerald-400"
              >
                Hire for a project
              </Link>
              <Link
                href="/auth/register?role=freelancer"
                className="inline-flex items-center justify-center rounded-full border border-emerald-500 px-5 py-2.5 text-sm font-medium text-emerald-600 transition hover:border-emerald-600 hover:bg-emerald-50"
              >
                Apply as freelancer
              </Link>
              <Link
                href="/freelancer/jobs"
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-emerald-500 hover:text-emerald-600"
              >
                Browse jobs
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="space-y-1">
                <p className="font-medium text-gray-800">
                  Smart, minimal design
                </p>
                <p>Built for fast onboarding and simple flows.</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-800">
                  PandaWork branding
                </p>
                <p>White base with vibrant green accents.</p>
              </div>
              </div>
            </div>

            {/* right side card */}
            <section className="relative">
              <div className="pointer-events-none absolute -inset-12 rounded-[3rem] bg-emerald-500/10 blur-3xl" />

              <div className="relative rounded-3xl border border-emerald-200 bg-white p-6 shadow-[0_30px_120px_rgba(15,118,110,0.2)] sm:p-7 lg:p-8">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-600">
                      Live overview
                    </p>
                    <p className="mt-1 text-medium text-gray-700">
                      Who&apos;s joining your marketplace
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[13px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Realtime preview
                  </span>
                </div>

                <div className="grid gap-3 rounded-2xl bg-gray-50 p-3 ring-1 ring-gray-200">
                  <div className="flex items-center justify-between rounded-xl bg-white px-3 py-3 shadow-sm">
                    <div className="space-y-1">
                      <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-gray-500">
                        Active clients
                      </p>
                      <p className="text-2xl font-semibold text-black">
                        1,284
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-700">
                      +18% this week
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                    <div className="space-y-2 rounded-xl bg-white p-3 shadow-sm">
                      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-gray-500">
                        Top skill demand
                      </p>
                      <ul className="space-y-1.5">
                        <li className="flex items-center justify-between">
                          <span>Web development</span>
                          <span className="text-emerald-600 font-semibold">64%</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Design</span>
                          <span className="text-emerald-600 font-semibold">22%</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>AI &amp; data</span>
                          <span className="text-emerald-600 font-semibold">14%</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2 rounded-xl bg-white p-3 shadow-sm">
                      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-gray-500">
                        New signups
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span>Freelancers</span>
                          <span className="text-emerald-600 font-semibold">+342</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Clients</span>
                          <span className="text-emerald-600 font-semibold">+96</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                          <div className="h-full w-4/5 rounded-full bg-linear-to-r from-emerald-400 via-emerald-500 to-lime-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[13px] text-gray-600">
                  <p>
                    Start with a simple auth flow, then plug in your backend of
                    choice.
                  </p>
                  <p className="text-emerald-600">
                    Registration UI ready in minutes.
                  </p>
                </div>
              </div>
            </section>
          </section>

          {/* marketplace discovery sections */}
          <section className="space-y-12">
            {/* popular categories */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
                    Popular categories
                  </h2>
                  <p className="mt-1 text-medium text-gray-600">
                    Browse in-demand skills and jump into the right work fast.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: "Web Development", jobs: "1.2k jobs", tag: "React, Next.js, APIs" },
                  { name: "Design & Creative", jobs: "860 jobs", tag: "UI, UX, Branding" },
                  { name: "Mobile Apps", jobs: "540 jobs", tag: "iOS, Android, Flutter" },
                  { name: "AI & Data", jobs: "430 jobs", tag: "LLMs, dashboards" },
                  { name: "Writing & Translation", jobs: "690 jobs", tag: "Blogs, copy, UX" },
                  { name: "Marketing & Growth", jobs: "510 jobs", tag: "SEO, paid ads" },
                ].map((cat) => (
                  <button
                    key={cat.name}
                    className="group flex flex-col items-start gap-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left text-md text-gray-700 transition hover:border-emerald-500 hover:bg-emerald-50"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-black">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {cat.name}
                    </span>
                    <span className="text-[13px] text-gray-600">
                      {cat.jobs} · {cat.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* featured freelancers & jobs */}
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              {/* featured freelancers */}
              <div className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
                      Featured freelancers
                    </h2>
                    <p className="mt-1 text-medium text-gray-600">
                      Hand-picked talent for web, design, AI and more.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      name: "Aarav Shah",
                      role: "Full‑stack Developer",
                      rate: "$45/hr",
                      badge: "Next.js • TypeScript",
                    },
                    {
                      name: "Sara Patel",
                      role: "Product Designer",
                      rate: "$55/hr",
                      badge: "SaaS • Web apps",
                    },
                    {
                      name: "Dev Mehta",
                      role: "AI Engineer",
                      rate: "$70/hr",
                      badge: "Chatbots • Automation",
                    },
                  ].map((freelancer) => (
                    <div
                      key={freelancer.name}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-sm font-semibold text-emerald-700">
                          {freelancer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="text-medium font-semibold text-black">
                            {freelancer.name}
                          </p>
                          <p className="text-[13px] text-gray-600">
                            {freelancer.role}
                          </p>
                          <p className="mt-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[13px] font-medium text-emerald-700">
                            {freelancer.badge}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-[14px]">
                        <p className="font-semibold text-emerald-600">
                          {freelancer.rate}
                        </p>
                        <p className="text-gray-500">4.9 ★ rating</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* featured jobs */}
              <div className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
                      Featured jobs
                    </h2>
                    <p className="mt-1 text-medium text-gray-600">
                      Fresh, high-intent work from serious clients.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      title: "Build a modern landing page for SaaS",
                      budget: "$1,200 fixed",
                      tags: ["Next.js", "Tailwind", "Animation"],
                    },
                    {
                      title: "Product design for freelance marketplace",
                      budget: "$45/hr · 30+ hrs/week",
                      tags: ["Figma", "Design systems"],
                    },
                    {
                      title: "AI assistant for customer support",
                      budget: "$2,500 fixed",
                      tags: ["OpenAI", "Node.js"],
                    },
                  ].map((job) => (
                    <div
                      key={job.title}
                      className="space-y-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-medium text-gray-700 shadow-sm"
                    >
                      <p className="text-medium font-semibold text-black">
                        {job.title}
                      </p>
                      <p className="text-[13px] text-emerald-600">
                        {job.budget}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {job.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-gray-100 px-2 py-0.5 text-[13px] text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* trust indicators + CTA */}
            <div className="grid gap-6 rounded-3xl border border-gray-200 bg-white p-5 text-sm text-gray-700 shadow-sm sm:p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:p-7">
              <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
                  Built for trust
                </h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      title: "Secure payments",
                      body: "Track work and release funds only when you're happy.",
                    },
                    {
                      title: "Escrow protection",
                      body: "Funds stay protected until milestones are approved.",
                    },
                    {
                      title: "Verified talent",
                      body: "Profiles, reviews and work history in one place.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-black">
                          {item.title}
                        </p>
                      </div>
                      <p className="text-[14px] leading-relaxed text-gray-600">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4 rounded-2xl bg-emerald-50 px-4 py-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
                    Ready to start?
                  </p>
                  <p className="text-sm font-semibold text-black">
                    Browse open jobs or post your first project in minutes.
          </p>
        </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <Link
                    href="/freelancer/jobs"
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-500 px-4 py-2 font-semibold text-white shadow-[0_18px_60px_rgba(16,185,129,0.7)] transition hover:bg-emerald-400 sm:flex-none"
                  >
                    Browse jobs
                  </Link>
                  <Link
                    href="/auth/register?role=client"
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-emerald-500 bg-white px-4 py-2 font-medium text-emerald-600 transition hover:border-emerald-600 hover:bg-emerald-50 sm:flex-none"
                  >
                    Hire talent
                  </Link>
                </div>
              </div>
        </div>
          </section>
      </main>

        {/* footer */}
        <footer className="relative z-10 mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4 text-[12px] text-gray-600">
          <span>© {currentYear} PandaWork marketplace concept.</span>
          <span className="flex items-center gap-2">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Designed for clean, minimal onboarding.
          </span>
        </footer>
      </div>
    </div>
  );
}
