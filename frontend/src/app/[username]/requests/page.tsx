"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { Clock, CheckCircle, AlertCircle, MapPin, Wrench, Star, User } from "lucide-react";

export default function RequestsPage() {
  const brandColor = "#EF9D39";
  const softGradient = "linear-gradient(135deg, #FFE8D6 0%, #FFD4B3 100%)";
  
  // DUMMY PODACI SA HANDYMAN INFORMACIJAMA
  const dummyRequests = [
    {
      id: 1,
      title: "Broken Kitchen Sink",
      category: "Plumbing",
      status: "pending",
      date: "Oct 24, 2023",
      location: "Sarajevo, Centar",
      price_estimate: "50 - 80 KM",
      handyman: null // Još niko nije prihvatio
    },
    {
      id: 2,
      title: "Living Room Painting",
      category: "Renovation",
      status: "completed",
      date: "Oct 20, 2023",
      location: "Sarajevo, Novo Sarajevo",
      price_estimate: "200 KM",
      handyman: {
        name: "Mujo Mujić",
        rating: 4.9,
        avatar_text: "MM"
      }
    },
    {
      id: 3,
      title: "Electrical Outlet Replacement",
      category: "Electrical",
      status: "in_progress",
      date: "Oct 22, 2023",
      location: "Ilidža",
      price_estimate: "30 KM",
      handyman: {
        name: "Kenan K.",
        rating: 4.7,
        avatar_text: "KK"
      }
    }
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-400";
      case "in_progress": return "bg-blue-400";
      default: return "bg-yellow-400";
    }
  };

  return (
    <div 
      className="flex flex-col min-h-screen text-black selection:bg-black selection:text-white font-sans" 
      style={{ background: softGradient }}
    >
      <Header />
      
      <main className="flex-grow max-w-3xl mx-auto px-6 py-12 w-full">
        {/* HEADER */}
        <div 
          className="text-center mb-12 p-8 border-[3px] border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          style={{ borderRadius: '30px' }}
        >
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
            MY <span style={{ color: brandColor }}>REQUESTS</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
            track your repairs and handymen
          </p>
        </div>

        {/* LISTA */}
        <div className="space-y-8">
          {dummyRequests.map((req) => (
            <div 
              key={req.id}
              className="bg-white border-[3px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              style={{ borderRadius: '24px' }}
            >
              {/* GORNJI DIO: Naslov i Status */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Wrench size={14} style={{ color: brandColor }} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {req.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight leading-none">{req.title}</h3>
                </div>
                
                <div className={`px-4 py-1.5 border-2 border-black rounded-full text-[10px] font-black uppercase flex items-center gap-2 ${getStatusStyle(req.status)}`}>
                  {req.status === 'completed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                  {req.status.replace('_', ' ')}
                </div>
              </div>

              {/* SREDNJI DIO: Handyman sekcija */}
              <div className="mb-6 p-4 bg-gray-50 border-2 border-black rounded-[20px] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {req.handyman ? (
                    <>
                      <div className="w-10 h-10 bg-black border-2 border-black rounded-xl flex items-center justify-center text-white font-black text-xs shadow-[3px_3px_0px_0px_rgba(239,157,57,1)]">
                        {req.handyman.avatar_text}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Assigned Handyman</p>
                        <p className="text-sm font-black uppercase">{req.handyman.name}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-gray-200 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center text-gray-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Status</p>
                        <p className="text-sm font-black uppercase text-gray-400">Waiting for offers...</p>
                      </div>
                    </>
                  )}
                </div>

                {req.handyman && (
                  <div className="flex items-center gap-1 bg-white px-3 py-1 border-2 border-black rounded-lg">
                    <Star size={12} fill="black" />
                    <span className="text-xs font-black">{req.handyman.rating}</span>
                  </div>
                )}
              </div>

              {/* DONJI DIO: Detalji i Akcija */}
              <div className="flex items-end justify-between border-t-2 border-black pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-bold">
                    <MapPin size={14} />
                    {req.location}
                  </div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Posted on: {req.date}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Est. Price</span>
                    <p className="text-lg font-black leading-none">{req.price_estimate}</p>
                  </div>
                  <button 
                    style={{ backgroundColor: brandColor }}
                    className="px-6 py-2.5 border-2 border-black rounded-xl font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    View details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}