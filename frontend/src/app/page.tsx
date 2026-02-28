import Header from "../components/header";
import Footer from "@/components/footer";
import { Search, Zap, ShieldCheck, PenTool, ArrowRight, Wrench, Lightbulb, Droplets, PaintBucket } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      {/* 1. HERO SECTION */}
      <main className="flex-grow">
        <section className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center">
          <div className="inline-block border-2 border-black px-4 py-1 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-yellow-300 font-black text-xs uppercase tracking-widest">
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

          {/* SEARCH BAR */}
          <div className="w-full max-w-3xl flex flex-col md:flex-row gap-0 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] border-4 border-black mb-20">
            <div className="flex-1 bg-white flex items-center px-6 py-4 border-b-4 md:border-b-0 md:border-r-4 border-black">
              <Search className="mr-4 text-gray-400" size={24} />
              <input 
                type="text" 
                placeholder="What needs fixing? (e.g. Leaking faucet)" 
                className="w-full outline-none font-bold uppercase text-sm placeholder:text-gray-300"
              />
            </div>
            <button className="bg-black text-white px-10 py-5 font-black uppercase hover:bg-gray-800 transition-colors tracking-widest text-sm">
              Find Help
            </button>
          </div>

          {/* 2. TRUST BADGES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
            <div className="border-2 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
              <Zap className="mb-4" size={32} />
              <h3 className="font-black uppercase text-xl mb-2">Fast Response</h3>
              <p className="text-sm font-bold text-gray-500 normal-case">Get connected with experts in under 30 minutes for urgent repairs.</p>
            </div>
            <div className="border-2 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
              <ShieldCheck className="mb-4" size={32} />
              <h3 className="font-black uppercase text-xl mb-2">Verified Pros</h3>
              <p className="text-sm font-bold text-gray-500 normal-case">Every provider is manually vetted and background checked for your safety.</p>
            </div>
            <div className="border-2 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
              <PenTool className="mb-4" size={32} />
              <h3 className="font-black uppercase text-xl mb-2">Fair Pricing</h3>
              <p className="text-sm font-bold text-gray-500 normal-case">No hidden fees. Upfront estimates and secure payments through our app.</p>
            </div>
          </div>
        </section>

        {/* 3. TRENDING SERVICES SECTION */}
        <section className="bg-gray-50 border-y-2 border-black py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter">Popular Services</h2>
                <p className="font-bold text-gray-500 uppercase text-sm mt-2">Most requested repairs in your area</p>
              </div>
              <Link href="/services" className="hidden md:flex items-center gap-2 font-black uppercase text-sm hover:underline underline-offset-4">
                View all <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: "Plumbing", icon: <Droplets />, color: "bg-blue-100" },
                { name: "Electrical", icon: <Lightbulb />, color: "bg-yellow-100" },
                { name: "Painting", icon: <PaintBucket />, color: "bg-green-100" },
                { name: "Repairs", icon: <Wrench />, color: "bg-orange-100" },
              ].map((service) => (
                <div key={service.name} className="group cursor-pointer border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all text-center">
                  <div className={`w-16 h-16 ${service.color} border-2 border-black mx-auto mb-4 flex items-center justify-center`}>
                    {service.icon}
                  </div>
                  <span className="font-black uppercase text-sm tracking-tight">{service.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS */}
        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-16">How it works?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-black text-xl mb-6">1</div>
              <h4 className="font-black uppercase mb-2">Post a Request</h4>
              <p className="text-sm font-bold text-gray-500 normal-case px-4">Describe what you need and set your preferred time.</p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-black text-xl mb-6">2</div>
              <h4 className="font-black uppercase mb-2">Choose your Pro</h4>
              <p className="text-sm font-bold text-gray-500 normal-case px-4">Compare quotes, reviews, and profiles of verified pros.</p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-black text-xl mb-6">3</div>
              <h4 className="font-black uppercase mb-2">Get it Fixed</h4>
              <p className="text-sm font-bold text-gray-500 normal-case px-4">Your pro arrives, fixes the problem, and you pay securely.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}