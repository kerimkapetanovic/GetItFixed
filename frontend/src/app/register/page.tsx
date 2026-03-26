"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { User, Hammer, Eye, EyeOff, MapPin, Phone, Mail, Lock, Globe, Hash, Briefcase, AlertCircle } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useSearchParams, useRouter } from 'next/navigation'; 
import api from '../../../lib/axios';
import countryList from 'react-select-country-list';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { useLanguage } from '@/components/providers/language-provider';

type ApiErrorPayload = Record<string, unknown>;

// POBOLJŠAN CSS - Da PhoneInput izgleda 1:1 kao tvoji ostali inputi
const phoneInputCustomStyles = `
  .PhoneInput {
    width: 100%;
    background: white;
    border: 2px solid black;
    padding: 1rem;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.2s;
  }
  .PhoneInput:focus-within {
    background-color: #fefce8; /* yellow-50 */
  }
  .PhoneInputInput {
    border: none !important;
    outline: none !important;
    font-weight: bold;
    font-size: 0.875rem;
    background: transparent;
    width: 100%;
    color: black;
  }
  .PhoneInputCountry {
    display: flex;
    align-items: center;
    border-right: 1px solid #000;
    padding-right: 10px;
    margin-right: 4px;
  }
  .PhoneInputCountrySelectArrow {
    margin-left: 5px;
    opacity: 0.7;
  }
`;

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  
  const countries = useMemo(() => countryList().getData(), []);
  const serviceOptions = useMemo(
    () => [
      'mechanic', 'pools', 'carpenter', 'tiler', 'cleaning', 'electrician',
      'excavation', 'facade', 'fencing', 'flooring', 'renovation', 'gardener',
      'heating', 'hvac', 'it_support', 'masonry', 'painter', 'plumber',
      'security', 'solar', 'transport', 'upholstery', 'windows', 'roofing',
      'appliances', 'pest_control'
    ] as const,
    [],
  );

  const [role, setRole] = useState<'client' | 'handyman'>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(false); // State za error lozinke

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    zipCode: '',
    password: '',
    expertise: ''
  });

  const mainCardStyle = { borderRadius: '32px', maxWidth: '650px' };
  const inputRadius = { borderRadius: '16px' };
  const roleRadius = { borderRadius: '20px' };

  useEffect(() => {
    const newRole = searchParams?.get('role') === 'handyman' ? 'handyman': 'client';
    setRole(newRole);
  }, [searchParams]);

  const cleanString = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      .replace(/đ/g, "dj")
      .replace(/\s+/g, "-") 
      .replace(/[^a-z0-9-]/g, ""); 
  };


 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. VALIDACIJA LOZINKE (Prije nego što uopšte pokreneš loading)
    if (formData.password.length < 8) {
      setPasswordError(true);
      return; // Ovdje izlazimo, loading još nije ni krenuo
    }
    
    setPasswordError(false);
    setLoading(true); // TEK SAD kreće loading jer su podaci validni

    const baseUsername = `${cleanString(formData.firstName)}-${cleanString(formData.lastName)}`;
    const randomNum = Math.floor(10 + Math.random() * 90);
    const finalUsername = `${baseUsername}-${randomNum}`;

    const dataToSubmit = {
      username: finalUsername,
      email: formData.email,
      password: formData.password,
      first_name: formData.firstName, 
      last_name: formData.lastName,
      role: role,
      phone: formData.phone,
      county: formData.country, 
      city: formData.city,
      zip_code: formData.zipCode,
      service_type: role === 'handyman' ? formData.expertise : null,
    };

    try {
      await api.post('/api/accounts/register/', dataToSubmit);
      alert(t('register.success', { name: formData.firstName }));
      router.push('/login'); 
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: ApiErrorPayload } };
      console.error("Registration error:", apiError.response?.data);
      // Ako server vrati grešku (npr. email već postoji), alert će iskočiti
      // a finally blok će ugasiti loading
      alert(`${t('register.errorPrefix')} ${JSON.stringify(apiError.response?.data || t('register.genericError'))}`);
    } finally {
      // OVO JE KLJUČNO: gasi loading i u slučaju uspjeha i u slučaju greške na serveru
      setLoading(false);
    }
  };

  return (
    <div className="page-gradient flex flex-col min-h-screen text-black dark:text-white">
      <style>{phoneInputCustomStyles}</style>
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-6 py-12">
        <div 
          style={mainCardStyle}
          className="w-full bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(239,157,57,0.25)] p-8 md:p-12 flex flex-col"
        >
          <div className="text-center mb-10">
            <h1 className="text-[32px] font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t('register.title')}</h1>
            <p className="text-gray-500 dark:text-zinc-400 font-bold text-sm mt-2 uppercase">{t('register.subtitle')}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <button 
              type="button"
              onClick={() => setRole('client')}
              style={roleRadius}
              className={`flex flex-col items-center justify-center p-6 border-4 transition-all ${
                role === 'client' 
                ? 'border-black bg-[linear-gradient(90deg,#EF9D39_10%,#FFD25A_90%)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-1 -translate-y-1' 
                : 'border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 opacity-60 hover:opacity-100 text-gray-400 dark:text-zinc-500'
              }`}
            >
              <User size={24} strokeWidth={3} className="mb-2" />
              <span className="font-black text-sm uppercase">{t('register.client')}</span>
              <span className="text-[10px] font-bold opacity-70">{t('register.clientDesc')}</span>
            </button>

            <button 
              type="button"
              onClick={() => setRole('handyman')}
              style={roleRadius}
              className={`flex flex-col items-center justify-center p-6 border-4 transition-all ${
                role === 'handyman' 
                ? 'border-black bg-[linear-gradient(90deg,#FFD25A_10%,#EF9D39_90%)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-1 -translate-y-1' 
                : 'border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 opacity-60 hover:opacity-100 text-gray-400 dark:text-zinc-500'
              }`}
            >
              <Hammer size={24} strokeWidth={3} className="mb-2" />
              <span className="font-black text-sm uppercase">{t('register.handyman')}</span>
              <span className="text-[10px] font-bold opacity-70">{t('register.handymanDesc')}</span>
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="group">
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2 ml-1">{t('register.firstName')}</label>
                <input required type="text" placeholder={t('register.placeholders.firstName')} style={inputRadius} value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full bg-white border-2 border-black p-4 text-sm font-bold outline-none focus:bg-yellow-50 transition-all placeholder:text-gray-400" />
              </div>
              <div className="group">
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2 ml-1">{t('register.lastName')}</label>
                <input required type="text" placeholder={t('register.placeholders.lastName')} style={inputRadius} value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full bg-white border-2 border-black p-4 text-sm font-bold outline-none focus:bg-yellow-50 transition-all placeholder:text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="group">
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2"><Mail size={12} /> {t('register.email')}</label>
                <input required type="email" placeholder={t('register.placeholders.email')} style={inputRadius} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white border-2 border-black p-4 text-sm font-bold outline-none focus:bg-yellow-50 transition-all placeholder:text-gray-400" />
              </div>
              <div className="group">
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                  <Phone size={12} /> {t('register.phone')}
                </label>
                <PhoneInput
                  international
                  placeholder={t('register.placeholders.phone')}
                  value={formData.phone}
                  onChange={(value) => setFormData({...formData, phone: value || ''})}
                />
              </div>
            </div>

            {/* EXPERTISE SECTION */}
            {role === 'handyman' && (
              <div className="p-6 border-4 border-black bg-gray-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" style={{ borderRadius: '24px' }}>
                <div className="group relative">
                  <label className="block text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-3 ml-2 flex items-center gap-2">
                    <Briefcase size={14} className="text-black" /> {t('register.expertise')}
                  </label>
                  <div className="relative">
                    <select 
                      required
                      style={inputRadius}
                      value={formData.expertise}
                      onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                      className="w-full bg-white border-2 border-black p-5 pr-12 text-sm font-bold normal-case tracking-tight outline-none focus:bg-[linear-gradient(90deg,#FFD25A_10%,#EF9D39_90%)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-gray-400">{t('register.expertisePlaceholder')}</option>
                      {serviceOptions.map((service) => (
                        <option key={service} value={service}>{t(`register.services.${service}`)}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none border-l-2 border-black pl-3">
                       <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="black" strokeWidth="3" strokeLinecap="round"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="group">
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2"><Globe size={12} /> {t('register.country')}</label>
                <div className="relative">
                  <select 
                    required 
                    style={inputRadius}
                    value={formData.country} 
                    onChange={(e) => setFormData({...formData, country: e.target.value})} 
                    className="w-full bg-white border-2 border-black p-4 pr-10 text-sm font-bold outline-none appearance-none cursor-pointer"
                  >
                    <option value="" disabled>{t('register.select')}</option>
                    {countries.map((c) => <option key={c.value} value={c.label}>{c.label}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="black" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                </div>
              </div>
              <div className="group">
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2"><MapPin size={12} /> {t('register.city')}</label>
                <input type="text" placeholder={t('register.placeholders.city')} style={inputRadius} value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full bg-white border-2 border-black p-4 text-sm font-bold outline-none placeholder:text-gray-400" />
              </div>
              <div className="group">
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2"><Hash size={12} /> {t('register.zipCode')}</label>
                <input type="text" placeholder={t('register.placeholders.zipCode')} style={inputRadius} value={formData.zipCode} onChange={(e) => setFormData({...formData, zipCode: e.target.value})} className="w-full bg-white border-2 border-black p-4 text-sm font-bold outline-none placeholder:text-gray-400" />
              </div>
            </div>

           {/* PASSWORD WITH VALIDATION */}
            <div className="group">
              <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2"><Lock size={12} /> {t('register.createPassword')}</label>
              <div className="relative flex flex-col w-full">
                <div className="relative flex items-center">
                  <input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    placeholder={t('register.createPasswordPlaceholder')} 
                    style={inputRadius} 
                    value={formData.password} 
                    onChange={(e) => {
                      setFormData({...formData, password: e.target.value});
                      if(e.target.value.length >= 8) setPasswordError(false);
                    }} 
                    className={`w-full bg-white border-2 p-4 pr-12 text-sm font-bold outline-none transition-all block ${passwordError ? 'border-red-500 bg-red-50' : 'border-black focus:bg-yellow-50'}`} 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-black z-30">
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-600 text-[10px] font-black uppercase mt-2 ml-2 flex items-center gap-1">
                    <AlertCircle size={12} /> {t('register.passwordTooShort')}
                  </p>
                )}
              </div>
            </div>

            <button disabled={loading} type="submit" style={inputRadius} className="w-full mt-6 mb-4 bg-black text-white py-5 font-black uppercase tracking-widest text-sm transition-all border-2 border-black shadow-[6px_6px_0px_0px_rgba(249,177,77,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-95 disabled:opacity-50">
              {loading ? t('register.creatingAccount') : t('register.createAccount')}
            </button>
          </form>

          <div className="mt-8 text-center">
             <Link href="/login" className="text-gray-500 text-xs font-bold uppercase tracking-tight">
               {t('register.alreadyHaveAccount')} <span className="text-black border-b-2 border-yellow-300 pb-0.5 hover:bg-yellow-300 transition-colors">{t('register.signInHere')}</span>
             </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}