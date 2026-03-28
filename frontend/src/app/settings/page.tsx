"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { useLanguage } from "@/components/providers/language-provider";
import { useTheme, type Theme } from "@/components/providers/theme-provider";
import { localeLabels, type Locale } from "@/lib/i18n/translations";
import { Check, Globe2, Moon, Palette, Settings2, Sun } from "lucide-react";

export default function SettingsPage() {
  const { locale, setLocale, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const languages: Array<{
    value: Locale;
    title: string;
    description: string;
  }> = [
    {
      value: "en",
      title: t("settings.englishLabel"),
      description: t("settings.englishDesc"),
    },
    {
      value: "bs",
      title: t("settings.bosnianLabel"),
      description: t("settings.bosnianDesc"),
    },
  ];

  const themes: Array<{
    value: Theme;
    title: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      value: "light",
      title: t("settings.lightLabel"),
      description: t("settings.lightDesc"),
      icon: <Sun size={24} />,
    },
    {
      value: "dark",
      title: t("settings.darkLabel"),
      description: t("settings.darkDesc"),
      icon: <Moon size={24} />,
    },
  ];

  return (
    <div className="page-gradient flex min-h-screen flex-col text-black dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <Header />

      <main className="mx-auto flex w-full max-w-5xl flex-grow flex-col gap-8 px-6 py-12">
        <section className="border-[3px] border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(239,157,57,0.25)]" style={{ borderRadius: "28px" }}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#FFF6EC] px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-black">
                <Settings2 size={14} />
                <span>{t("settings.title")}</span>
              </div>
              <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter italic">{t("settings.title")}</h1>
                <p className="mt-3 max-w-2xl text-sm font-bold leading-relaxed text-gray-500 dark:text-zinc-400">
                  {t("settings.subtitle")}
                </p>
              </div>
            </div>

            <div className="border-2 border-black bg-black px-5 py-4 text-white shadow-[6px_6px_0px_0px_rgba(239,157,57,1)]" style={{ borderRadius: "20px" }}>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#EF9D39]">
                {t("settings.currentLanguage")}
              </p>
              <p className="mt-2 text-xl font-black uppercase">{localeLabels[locale]}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="border-[3px] border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(239,157,57,0.2)]" style={{ borderRadius: "28px" }}>
            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border-2 border-black dark:border-zinc-600 bg-[#EF9D39] text-black">
                <Globe2 size={26} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">{t("settings.languageTitle")}</h2>
                <p className="mt-2 text-sm font-bold leading-relaxed text-gray-500 dark:text-zinc-400">
                  {t("settings.languageDescription")}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {languages.map((language) => {
                const selected = locale === language.value;

                return (
                  <button
                    key={language.value}
                    type="button"
                    onClick={() => setLocale(language.value)}
                    className={`flex w-full items-center justify-between border-[3px] p-5 text-left transition-all ${
                      selected
                        ? "border-black dark:border-zinc-500 bg-[linear-gradient(90deg,#FFD25A_10%,#EF9D39_90%)] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -translate-x-1 -translate-y-1"
                        : "border-black dark:border-zinc-700 bg-[#FFFDFC] dark:bg-zinc-800 hover:bg-[#FFF6EC] dark:hover:bg-zinc-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(100,100,100,0.3)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                    }`}
                    style={{ borderRadius: "22px" }}
                  >
                    <div>
                      <p className={`text-lg font-black uppercase tracking-tight ${selected ? "text-black" : ""}`}>{language.title}</p>
                      <p className={`mt-2 max-w-xl text-sm font-bold leading-relaxed ${selected ? "text-black/70" : "text-gray-700 dark:text-zinc-400"}`}>
                        {language.description}
                      </p>
                    </div>

                    <div
                      className={`ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${
                        selected ? "border-black bg-white text-black" : "border-black dark:border-zinc-500 bg-transparent"
                      }`}
                    >
                      {selected ? <Check size={22} /> : <span className="h-4 w-4 rounded-full border-2 border-black dark:border-zinc-500" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-gray-500 dark:text-zinc-500">
              {t("settings.languageHelp")}
            </p>
          </div>

          {/* SIDEBAR */}
          <aside className="border-[3px] border-black bg-black p-8 text-white shadow-[10px_10px_0px_0px_rgba(239,157,57,1)]" style={{ borderRadius: "28px" }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-[#EF9D39]">
              <Check size={12} />
              <span>{t("settings.savedBadge")}</span>
            </div>

            <h3 className="mt-6 text-2xl font-black uppercase tracking-tight">{t("settings.accountTitle")}</h3>
            <p className="mt-3 text-sm font-bold leading-relaxed text-white/70">
              {t("settings.accountDescription")}
            </p>

            <div className="mt-8 rounded-[22px] border border-white/20 bg-white/10 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#EF9D39]">
                {t("settings.currentLanguage")}
              </p>
              <p className="mt-3 text-3xl font-black uppercase">{localeLabels[locale]}</p>
            </div>

            <div className="mt-4 rounded-[22px] border border-white/20 bg-white/10 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#EF9D39]">
                {t("settings.currentTheme")}
              </p>
              <p className="mt-3 text-3xl font-black uppercase">{t(`settings.${theme}Label`)}</p>
            </div>
          </aside>
        </section>

        {/* APPEARANCE SECTION */}
        <section className="border-[3px] border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(239,157,57,0.2)]" style={{ borderRadius: "28px" }}>
          <div className="mb-8 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border-2 border-black dark:border-zinc-600 bg-[#EF9D39] text-black">
              <Palette size={26} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">{t("settings.themeTitle")}</h2>
              <p className="mt-2 text-sm font-bold leading-relaxed text-gray-500 dark:text-zinc-400">
                {t("settings.themeDescription")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {themes.map((themeOption) => {
              const selected = theme === themeOption.value;

              return (
                <button
                  key={themeOption.value}
                  type="button"
                  onClick={() => setTheme(themeOption.value)}
                  className={`flex w-full items-center justify-between border-[3px] p-5 text-left transition-all ${
                    selected
                      ? "border-black dark:border-zinc-500 bg-[linear-gradient(90deg,#FFD25A_10%,#EF9D39_90%)] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -translate-x-1 -translate-y-1"
                      : "border-black dark:border-zinc-700 bg-[#FFFDFC] dark:bg-zinc-800 hover:bg-[#FFF6EC] dark:hover:bg-zinc-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(100,100,100,0.3)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                  }`}
                  style={{ borderRadius: "22px" }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border-2 ${
                      selected ? "border-black bg-white/30 text-black" : "border-black dark:border-zinc-600 bg-transparent"
                    }`}>
                      {themeOption.icon}
                    </div>
                    <div>
                      <p className={`text-lg font-black uppercase tracking-tight ${selected ? "text-black" : ""}`}>{themeOption.title}</p>
                      <p className={`mt-1 text-sm font-bold leading-relaxed ${selected ? "text-black/70" : "text-gray-700 dark:text-zinc-400"}`}>
                        {themeOption.description}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                      selected ? "border-black bg-white text-black" : "border-black dark:border-zinc-500 bg-transparent"
                    }`}
                  >
                    {selected ? <Check size={18} /> : <span className="h-3.5 w-3.5 rounded-full border-2 border-black dark:border-zinc-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-gray-500 dark:text-zinc-500">
            {t("settings.themeHelp")}
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}