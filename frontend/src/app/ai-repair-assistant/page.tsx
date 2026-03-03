import Header from '@/components/header';
import ChatClient from '../../components/ai-repair/ChatClient';
import Footer from '@/components/footer';

export default function AiRepairPage() {
  const softGradient = "linear-gradient(135deg, #FDFBF9 0%, #F5EFE6 100%)";

  return (
    // Koristimo wrapper div sa min-h-screen da gradient pokrije cijelu visinu ekrana
    <div className="flex flex-col min-h-screen" style={{ background: softGradient }}>
      <Header />
      
      <main className="flex-grow p-6 max-w-4xl mx-auto w-full py-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
            <span className="text-[#EF9D39]">AI</span> Repair Assistant
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            Describe the issue and get guidance, suggested fixes, or next steps.
          </p>
        </header>

        <section className="relative">
          {/* Dodao sam malo sjenke i zaobljenja da ChatClient "lebdi" na gradientu */}
          <div className="bg-white/50 backdrop-blur-sm border-2 border-black/5 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)]" style={{ borderRadius: '32px' }}>
             <ChatClient />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}