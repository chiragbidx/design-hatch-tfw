import Image from "next/image";

export const metadata = {
  title: "PortfoliFy – Showcase Your Best Work Online",
  description:
    "PortfoliFy lets you build a striking digital portfolio — highlight your projects, tell your story, and get noticed. Launch your professional showcase with PortfoliFy today.",
  openGraph: {
    title: "PortfoliFy – Showcase Your Best Work Online",
    description:
      "Build your unique digital portfolio with PortfoliFy. Present your work, attract new opportunities, and grow your presence.",
    url: "https://portfolify.app",
    siteName: "PortfoliFy",
    images: [
      {
        url: "/globe.svg",
        width: 1200,
        height: 630,
        alt: "PortfoliFy globemark",
      },
    ],
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50">
      {/* HERO */}
      <section className="mx-auto max-w-4xl flex flex-col items-center text-center py-24 px-6">
        <div className="flex items-center gap-3 mb-4">
          <Image
            alt="PortfoliFy globemark"
            src="/globe.svg"
            width={44}
            height={44}
            priority
          />
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 tracking-tight">
            PortfoliFy
          </h1>
        </div>
        <p className="mt-2 mb-8 text-xl md:text-2xl text-gray-700 max-w-2xl">
          <strong>Showcase Your Best Work.<br />Elevate Your Story.</strong>
          <br />
          Craft a professional portfolio that grows your reputation and attracts client opportunities.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            className="rounded-lg bg-blue-700 text-white px-8 py-3 text-lg font-bold shadow hover:bg-blue-800 transition"
            href="#get-started"
          >
            Get Started Free
          </a>
          <a
            className="rounded-lg bg-white border border-blue-700 text-blue-700 px-8 py-3 text-lg font-bold shadow hover:bg-blue-50 transition"
            href="#see-examples"
          >
            View Portfolio Examples
          </a>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-16 px-6">
        <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center text-center">
          <Image
            src="/window.svg"
            alt="Beautiful layouts"
            width={60}
            height={60}
          />
          <h3 className="mt-4 font-semibold text-lg text-blue-900">
            Beautiful Layouts
          </h3>
          <p className="mt-2 text-gray-600 text-base">
            Choose from stunning templates designed to spotlight your work and style.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center text-center">
          <Image
            src="/file.svg"
            alt="Project showcase"
            width={60}
            height={60}
          />
          <h3 className="mt-4 font-semibold text-lg text-blue-900">
            Project Showcase
          </h3>
          <p className="mt-2 text-gray-600 text-base">
            Highlight your top projects with images, video, and rich descriptions.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center text-center">
          <Image
            src="/vercel.svg"
            alt="Instant portfolio online"
            width={60}
            height={60}
          />
          <h3 className="mt-4 font-semibold text-lg text-blue-900">
            Instant Presence Online
          </h3>
          <p className="mt-2 text-gray-600 text-base">
            Launch your portfolio to the world—zero code, instant updates, always on brand.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-4xl mx-auto py-14 px-6 flex flex-col gap-8">
        <h2 className="text-2xl font-extrabold text-blue-900 text-center mb-2">
          How PortfoliFy Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-blue-50 rounded-xl p-6 flex flex-col items-center">
            <span className="text-4xl font-bold text-blue-600 mb-2">1</span>
            <h4 className="text-lg font-semibold text-blue-800 mb-1">
              Sign Up
            </h4>
            <p className="text-gray-600 text-base text-center">
              Start free with your email. No credit card required.
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-6 flex flex-col items-center">
            <span className="text-4xl font-bold text-blue-600 mb-2">2</span>
            <h4 className="text-lg font-semibold text-blue-800 mb-1">
              Add Your Projects
            </h4>
            <p className="text-gray-600 text-base text-center">
              Upload images and write about your best work, skills, and experiences.
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-6 flex flex-col items-center">
            <span className="text-4xl font-bold text-blue-600 mb-2">3</span>
            <h4 className="text-lg font-semibold text-blue-800 mb-1">
              Share &amp; Grow
            </h4>
            <p className="text-gray-600 text-base text-center">
              Share your unique PortfoliFy link and attract employers, clients, or collaborators.
            </p>
          </div>
        </div>
      </section>

      {/* PORTFOLIO EXAMPLES */}
      <section id="see-examples" className="max-w-6xl mx-auto py-14 px-6">
        <h2 className="text-2xl font-extrabold text-blue-900 text-center mb-8">
          Portfolio Examples
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col">
            <Image
              src="/file.svg"
              alt="Example Portfolio Screenshot"
              width={80}
              height={60}
            />
            <h4 className="text-lg font-semibold text-blue-800 mt-4 mb-2">
              Jane Doe – UI/UX Designer
            </h4>
            <p className="text-gray-600 text-base">
              See how Jane showcases apps and web designs with image galleries and detailed case studies.
            </p>
            <a
              href="#"
              className="mt-4 text-blue-700 font-semibold inline-block hover:underline"
            >
              Preview Portfolio
            </a>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col">
            <Image
              src="/window.svg"
              alt="Example Portfolio Screenshot"
              width={80}
              height={60}
            />
            <h4 className="text-lg font-semibold text-blue-800 mt-4 mb-2">
              Mark Lee – Web Developer
            </h4>
            <p className="text-gray-600 text-base">
              Explore how Mark presents projects with code samples, project breakdowns, and testimonials.
            </p>
            <a
              href="#"
              className="mt-4 text-blue-700 font-semibold inline-block hover:underline"
            >
              Preview Portfolio
            </a>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-4xl mx-auto py-16 px-6">
        <h2 className="text-2xl font-extrabold text-blue-900 text-center mb-8">
          What Users Say
        </h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          <div className="bg-blue-50 p-6 rounded-xl shadow flex-1 text-center">
            <p className="text-lg text-blue-900 italic mb-2">
              “PortfoliFy made my design showcase effortless and beautiful. I landed my dream job!”
            </p>
            <div className="text-blue-700 font-semibold">Jane Doe</div>
            <div className="text-gray-500 text-sm">UI/UX Designer</div>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl shadow flex-1 text-center">
            <p className="text-lg text-blue-900 italic mb-2">
              “It took me 10 minutes to get my projects live, and now I get regular recruiter contacts.”
            </p>
            <div className="text-blue-700 font-semibold">Mark Lee</div>
            <div className="text-gray-500 text-sm">Web Developer</div>
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section id="get-started" className="bg-blue-900 py-16 px-6 flex justify-center">
        <form
          className="bg-white rounded-2xl shadow-lg max-w-xl w-full flex flex-col px-8 py-10 gap-6"
          method="POST"
          action="mailto:hajaraswad210299@gmail.com"
        >
          <h2 className="text-2xl font-bold text-blue-800 text-center mb-4">
            Start Your Portfolio Today
          </h2>
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-semibold text-blue-900">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="border rounded-lg px-3 py-2 text-gray-800 bg-gray-50"
              placeholder="Your full name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-semibold text-blue-900">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="border rounded-lg px-3 py-2 text-gray-800 bg-gray-50"
              placeholder="you@email.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="font-semibold text-blue-900">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              className="border rounded-lg px-3 py-2 text-gray-800 bg-gray-50"
              placeholder="Tell us about your portfolio or question"
            />
          </div>
          <button
            type="submit"
            className="mt-8 rounded-lg bg-blue-700 text-white px-6 py-3 font-bold text-lg shadow hover:bg-blue-800 transition"
          >
            Contact PortfoliFy
          </button>
          <div className="text-xs text-gray-500 text-center mt-2">
            Or email us at{" "}
            <a
              className="text-blue-700 hover:underline"
              href="mailto:hajaraswad210299@gmail.com"
            >
              hajaraswad210299@gmail.com
            </a>
          </div>
        </form>
      </section>

      {/* FOOTER */}
      <footer className="bg-blue-950 text-blue-100 py-8 mt-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-1">
              <Image alt="PortfoliFy logo" src="/globe.svg" width={32} height={32} />
              <span className="font-bold tracking-wide text-lg">PortfoliFy</span>
            </div>
            <span className="text-xs">
              &copy; {new Date().getFullYear()} PortfoliFy. All rights reserved.
            </span>
          </div>
          <nav className="flex flex-row gap-4 text-sm">
            <a className="hover:underline" href="#how-it-works">
              How It Works
            </a>
            <a className="hover:underline" href="#see-examples">
              Examples
            </a>
            <a className="hover:underline" href="#get-started">
              Get Started
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}