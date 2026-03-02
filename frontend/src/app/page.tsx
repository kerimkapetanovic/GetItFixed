import Header from "../components/header";
import Footer from "@/components/footer";
import {
  Search,
  Zap,
  ShieldCheck,
  PenTool,
  ArrowRight,
  Wrench,
  Lightbulb,
  Droplets,
  PaintBucket,
  ClipboardList,
  Users,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const commonRadius = "20px"; // Malo sam povećao za bolji izgled
  const smallRadius = "12px";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow">
        {/* 1. HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center">
          <div
            style={{ borderRadius: "50px" }}
            className="inline-block border-2 border-black px-6 py-2 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-yellow-300 font-black text-xs uppercase tracking-widest"
          >
            Available in Bosnia & Herzegovina
          </div>

          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
            Fix everything <br />
            <span className="text-gray-400">without the stress.</span>
          </h1>

          <p className="max-w-2xl text-lg font-bold text-gray-600 normal-case mb-10 leading-relaxed">
            The smartest way to find verified local professionals for your home.
            From plumbing to electrical work, get it fixed today.
          </p>

          {/* SEARCH BAR - FIKSIRANA LIJEVA STRANA */}
          <div
            style={{ borderRadius: "24px" }}
            className="w-full max-w-3xl flex flex-col md:flex-row gap-0 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] border-4 border-black mb-20 overflow-hidden bg-white"
          >
            <div className="flex-1 flex items-center px-6 py-4 border-b-4 md:border-b-0 md:border-r-4 border-black bg-transparent">
              <Search className="mr-4 text-gray-400" size={24} />
              <input
                type="text"
                placeholder="What needs fixing? (e.g. Leaking faucet)"
                className="w-full outline-none font-bold uppercase text-sm placeholder:text-gray-300 bg-transparent"
              />
            </div>
            <button className="bg-black text-white px-10 py-5 font-black uppercase hover:bg-yellow-300 hover:text-black transition-colors tracking-widest text-sm shrink-0">
              Find Help
            </button>
          </div>

          {/* 2. TRUST BADGES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
            {[
              {
                icon: <Zap />,
                title: "Fast Response",
                desc: "Get connected with experts in under 30 minutes for urgent repairs.",
              },
              {
                icon: <ShieldCheck />,
                title: "Verified Pros",
                desc: "Every provider is manually vetted and background checked for your safety.",
              },
              {
                icon: <PenTool />,
                title: "Fair Pricing",
                desc: "No hidden fees. Upfront estimates and secure payments through our app.",
              },
            ].map((badge, i) => (
              <div
                key={i}
                style={{ borderRadius: commonRadius }}
                className="border-2 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white"
              >
                <div className="mb-6">{badge.icon}</div>
                <h3 className="font-black uppercase text-xl mb-2">
                  {badge.title}
                </h3>
                <p className="text-sm font-bold text-gray-500 normal-case">
                  {badge.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. POPULAR SERVICES */}
        <section className="bg-gray-50 border-y-2 border-black py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter">
                  Popular Services
                </h2>
                <p className="font-bold text-gray-500 uppercase text-sm mt-2">
                  Most requested repairs in your area
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: "Plumbing", icon: <Droplets />, color: "bg-blue-100" },
                {
                  name: "Electrical",
                  icon: <Lightbulb />,
                  color: "bg-yellow-100",
                },
                {
                  name: "Painting",
                  icon: <PaintBucket />,
                  color: "bg-green-100",
                },
                { name: "Repairs", icon: <Wrench />, color: "bg-orange-100" },
              ].map((service) => (
                <div
                  key={service.name}
                  style={{ borderRadius: commonRadius }}
                  className="group cursor-pointer border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all text-center overflow-hidden"
                >
                  {/* POPRAVLJENA IKONICA - Dodat margin-top */}
                  <div
                    style={{ borderRadius: smallRadius }}
                    className={`w-16 h-16 ${service.color} border-2 border-black mx-auto mt-2 mb-4 flex items-center justify-center`}
                  >
                    {service.icon}
                  </div>
                  <span className="font-black uppercase text-sm tracking-tight">
                    {service.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS */}
        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
            How it works?
          </h2>
          <p className="font-bold text-gray-500 uppercase text-sm mb-16">
            Get things fixed in three simple steps
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            {[
              {
                step: "01",
                title: "Post a Request",
                desc: "Browse categories and describe your issue. Tell us what's broken.",
                icon: <ClipboardList size={32} />,
                color: "hover:bg-yellow-300",
              },
              {
                step: "02",
                title: "Choose your Pro",
                desc: "Compare quotes, reviews, and profiles of verified professionals.",
                icon: <Users size={32} />,
                color: "hover:bg-blue-400",
              },
              {
                step: "03",
                title: "Get it Fixed",
                desc: "Your pro fixes the problem, and you pay securely through the app.",
                icon: <CheckCircle2 size={32} />,
                color: "hover:bg-green-400",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{ borderRadius: commonRadius }}
                className={`group flex flex-col items-center p-10 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${item.color} transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none overflow-hidden`}
              >
                {/* IKONICA - Dodat mt-4 da se odmakne od ivice */}
                <div
                  style={{ borderRadius: smallRadius }}
                  className=" w-16 h-16  bg-black text-white border-4 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                >
                  {item.icon}
                </div>
                <span className="font-black text-xs uppercase mb-2 opacity-50 tracking-widest">
                  Step {item.step}
                </span>
                <h4 className="font-black uppercase text-2xl mb-3 tracking-tighter">
                  {item.title}
                </h4>
                <p className="text-sm font-bold text-gray-600 normal-case">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="w-full flex justify-center pt-16">
            <Link
              href="/how-it-works"
              style={{ borderRadius: "20px" }}
              className="flex items-center justify-center gap-4 bg-black text-white px-10 py-5 font-black uppercase tracking-widest hover:bg-yellow-300 hover:text-black transition-all border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-2 active:translate-y-2 group overflow-hidden"
            >
              <span
                className="text-base md:text-lg"
                style={{ whiteSpace: "nowrap" }}
              >
                Learn more detailed
              </span>
              <ArrowRight
                size={28}
                className="shrink-0 group-hover:translate-x-2 transition-transform"
              />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
