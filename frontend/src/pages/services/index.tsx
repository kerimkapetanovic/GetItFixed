import Header from "@/components/header"; // Adjust path if needed based on your folder structure
import Footer from "@/components/footer";

import {
  Droplets,
  Lightbulb,
  PaintBucket,
  Wrench,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";

export default function Services() {
  const commonRadius = "20px";
  const smallRadius = "12px";

  const serviceCategories = [
    {
      id: "plumbing",
      name: "Plumbing",
      icon: <Droplets size={40} />,
      color: "bg-blue-100",
      desc: "From leaky faucets to full pipe installations, our verified plumbers handle it all.",
      features: [
        "Pipe leak repair",
        "Water heater installation",
        "Drain unblocking",
      ],
    },
    {
      id: "electrical",
      name: "Electrical",
      icon: <Lightbulb size={40} />,
      color: "bg-yellow-100",
      desc: "Safe and reliable electrical repairs, wiring, and fixture installations.",
      features: [
        "Lighting installation",
        "Fault finding & repair",
        "Panel upgrades",
      ],
    },
    {
      id: "painting",
      name: "Painting",
      icon: <PaintBucket size={40} />,
      color: "bg-green-100",
      desc: "Professional interior and exterior painting to refresh your home's look.",
      features: [
        "Interior wall painting",
        "Exterior house painting",
        "Wallpaper removal",
      ],
    },
    {
      id: "repairs",
      name: "General Repairs",
      icon: <Wrench size={40} />,
      color: "bg-orange-100",
      desc: "Handyman services for odd jobs, furniture assembly, and minor fixes.",
      features: [
        "Furniture assembly",
        "Drywall patching",
        "Door & window repair",
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow">
        {/* 1. PAGE HEADER */}
        <section className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
            Our <span className="text-gray-400">Services</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg font-bold text-gray-600 normal-case leading-relaxed">
            Select a category below to find top-rated professionals ready to
            tackle your home projects.
          </p>
        </section>

        {/* 2. SERVICES GRID */}
        <section className="bg-gray-50 border-y-2 border-black py-20 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviceCategories.map((service) => (
              <div
                key={service.id}
                style={{ borderRadius: commonRadius }}
                className="group flex flex-col justify-between border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all overflow-hidden"
              >
                <div>
                  <div className="flex items-center gap-6 mb-6">
                    <div
                      style={{ borderRadius: smallRadius }}
                      className={`w-20 h-20 ${service.color} border-4 border-black flex items-center justify-center shrink-0`}
                    >
                      {service.icon}
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">
                      {service.name}
                    </h2>
                  </div>

                  <p className="font-bold text-gray-600 mb-6">{service.desc}</p>

                  <ul className="mb-8 space-y-2">
                    {service.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 font-bold text-sm uppercase text-gray-500"
                      >
                        <span className="w-2 h-2 bg-black rounded-full inline-block"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/services/${service.id}`}
                  style={{ borderRadius: smallRadius }}
                  className="flex items-center justify-center gap-3 bg-black text-white px-6 py-4 font-black uppercase tracking-widest hover:bg-yellow-300 hover:text-black transition-colors border-2 border-black w-full"
                >
                  Explore {service.name}
                  <ArrowRight size={20} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 3. CUSTOM REQUEST CTA */}
        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div
            style={{ borderRadius: commonRadius }}
            className="border-4 border-black p-12 bg-yellow-300 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
          >
            <PlusCircle size={48} className="mx-auto mb-6 text-black" />
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
              Don't see what you need?
            </h2>
            <p className="font-bold text-gray-700 max-w-xl mx-auto mb-8">
              Describe your specific problem, and our AI will help match you
              with the perfect professional for the job.
            </p>
            <Link
              href="/post-request"
              style={{ borderRadius: smallRadius }}
              className="inline-flex items-center justify-center gap-3 bg-black text-white px-10 py-5 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors border-4 border-black"
            >
              Post a Custom Job
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
