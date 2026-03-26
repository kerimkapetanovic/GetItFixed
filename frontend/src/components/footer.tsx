import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";
import { useLanguage } from "@/components/providers/language-provider";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 w-full py-12 px-6 mt-auto font-sans uppercase tracking-tight">
      {" "}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* 1. SECTION: LOGO & DESCRIPTION */}
        <div className="flex flex-col gap-4">
          <div className="items-center gap-2">
             <img 
      src="/GetItFixed Logo.png" 
      alt="GetItFixed Logo" 
      className="h-10 w-auto object-contain mb-2 " 
    />
            <span className="text-xl font-black tracking-tighter normal-case">
              GetItFixed
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed normal-case font-medium">
            {t("footer.description")}
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
          <h4 className="font-black text-sm uppercase mb-6 tracking-widest dark:text-white">
            {t("footer.forClients")}
          </h4>
          <ul className="flex flex-col gap-3 text-sm font-bold text-gray-500 dark:text-zinc-400 uppercase">
            <li>
              <Link href="/services" className="hover:text-black">
                {t("footer.ourServices")}
              </Link>
            </li>

            <li>
              <Link href="/how-it-works" className="hover:text-black">
                {t("header.howItWorks")}
              </Link>
            </li>
            <li>
              <Link href="/stories" className="hover:text-black">
                {t("footer.successStories")}
              </Link>
            </li>
            <li>
              <Link href="/help" className="hover:text-black">
                {t("footer.helpCenter")}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-black">
                {t("footer.privacyPolicy")}
              </Link>
            </li>
          </ul>
        </div>

        {/* 3. SECTION: FOR PROFESSIONALS */}
        <div>
          <h4 className="font-black text-sm uppercase mb-6 tracking-widest dark:text-white">
            {t("footer.forProviders")}
          </h4>
          <ul className="flex flex-col gap-3 text-sm font-bold text-gray-500 dark:text-zinc-400 uppercase">
            <li>
              <Link href="/register?role=pro" className="hover:text-black">
                {t("footer.joinAsPro")}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-black">
                {t("footer.termsOfService")}
              </Link>
            </li>
            <li>
              <Link href="/faq-pros" className="hover:text-black">
                {t("footer.providerFaq")}
              </Link>
            </li>
          </ul>
        </div>

        {/* 4. SECTION: CONTACT */}
        <div>
          <h4 className="font-black text-sm uppercase mb-6 tracking-widest dark:text-white">
            {t("footer.contact")}
          </h4>
          <ul className="flex flex-col gap-4 text-sm font-bold">
            <li className="flex items-center gap-3 lowercase hover:text-gray-600 transition-colors">
              <FaEnvelope className="text-black" />
              <a href="mailto:contact@getitfixed.ba">getitfixed@gmail.com</a>
            </li>
            <li className="flex items-center gap-3 hover:text-gray-600 transition-colors">
              <FaPhoneAlt className="text-black" />
              <a href="tel:+38761123456">+387 61 123 456</a>
            </li>
          </ul>
        </div>
      </div>
      {/* BOTTOM: COPYRIGHT */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-100 dark:border-zinc-700">
        <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest text-center md:text-left">
          {t("footer.copyright")}
        </p>
      </div>
    </footer>
  );
}
