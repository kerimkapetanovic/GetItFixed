import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t-2 border-black bg-white w-full py-12 px-6 mt-auto font-sans uppercase tracking-tight">
      {" "}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* 1. SECTION: LOGO & DESCRIPTION */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tighter normal-case">
              GetItFixed
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed normal-case font-medium">
            Find the best local experts for any home repair. Secure,
            professional, and efficient service at your fingertips.
          </p>
          <div className="flex gap-4 mt-2">
            <Link href="#" className="hover:text-gray-500 transition-colors">
              <FaFacebookF size={18} />
            </Link>
            <Link href="#" className="hover:text-gray-500 transition-colors">
              <FaInstagram size={18} />
            </Link>
          </div>
        </div>

        {/* 2. SECTION: FOR USERS */}
        <div>
          <h4 className="font-black text-sm uppercase mb-6 tracking-widest">
            For Clients
          </h4>
          <ul className="flex flex-col gap-3 text-sm font-bold text-gray-500 uppercase">
            <li>
              <Link href="/services" className="hover:text-black">
                Our Services
              </Link>
            </li>

            <li>
              <Link href="/how-it-works" className="hover:text-black">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/stories" className="hover:text-black">
                Success Stories
              </Link>
            </li>
            <li>
              <Link href="/help" className="hover:text-black">
                Help Center
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-black">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* 3. SECTION: FOR PROFESSIONALS */}
        <div>
          <h4 className="font-black text-sm uppercase mb-6 tracking-widest">
            For Providers
          </h4>
          <ul className="flex flex-col gap-3 text-sm font-bold text-gray-500 uppercase">
            <li>
              <Link href="/register" className="hover:text-black">
                Join as a Pro
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-black">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/faq-pros" className="hover:text-black">
                Provider FAQ
              </Link>
            </li>
          </ul>
        </div>

        {/* 4. SECTION: CONTACT */}
        <div>
          <h4 className="font-black text-sm uppercase mb-6 tracking-widest">
            Contact
          </h4>
          <ul className="flex flex-col gap-4 text-sm font-bold">
            <li className="flex items-center gap-3 lowercase hover:text-gray-600 transition-colors">
              <FaEnvelope className="text-black" />
              <a href="mailto:contact@getitfixed.ba">getitfixed@gmail.com</a>
            </li>
            <li className="flex items-center gap-3 hover:text-gray-600 transition-colors">
              <FaPhoneAlt className="text-black" />
              <a href="tel:+38763709440">+387 63 123 321</a>
            </li>
          </ul>
        </div>
      </div>
      {/* BOTTOM: COPYRIGHT */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center md:text-left">
          © 2026 GetItFixed. All rights reserved. Graduation project by Kerim
          Kapetanović, Amar Dizdarević, Faris Balić and Haris Šuta.
        </p>
      </div>
    </footer>
  );
}
