"use client";
import i18n from "i18next";
import { initReactI18next, I18nextProvider } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { useEffect, useState } from "react";

// Translations
const resources = {
  en: {
    translation: {
      "Dashboard": "Dashboard",
      "Operations": "Operations",
      "Planning": "Planning",
      "Procurement": "Procurement",
      "Inventory": "Inventory",
      "Production": "Production",
      "Recipes": "Recipes",
      "Maintenance": "Maintenance",
      "Logistics": "Logistics",
      "Quality": "Quality",
      "Sales & Finance": "Sales & Finance",
      "Sales": "Sales",
      "Finance": "Finance",
      "Admin Panel": "Admin Panel",
      "Administration": "Administration",
      "HR": "HR",
      "Users": "Users",
      "Master Data": "Master Data",
      "Sheger ERP": "Sheger ERP",
      "Sign Out": "Sign Out",
      "Toggle Theme": "Toggle Theme",
      "Change Language": "Change Language",
      "English": "English",
      "Amharic": "Amharic",
      "Afaan Oromoo": "Afaan Oromoo"
    }
  },
  am: {
    translation: {
      "Dashboard": "ዳሽቦርድ",
      "Operations": "ክዋኔዎች",
      "Planning": "እቅድ",
      "Procurement": "ግዥ",
      "Inventory": "እቃዎች",
      "Production": "ምርት",
      "Recipes": "አሰራሮች",
      "Maintenance": "ጥገና",
      "Logistics": "ሎጂስቲክስ",
      "Quality": "ጥራት",
      "Sales & Finance": "ሽያጭ እና ፋይናንስ",
      "Sales": "ሽያጭ",
      "Finance": "ፋይናንስ",
      "Admin Panel": "አስተዳዳሪ ፓነል",
      "Administration": "አስተዳደር",
      "HR": "የሰው ኃይል",
      "Users": "ተጠቃሚዎች",
      "Master Data": "ዋና ዳታ",
      "Sheger ERP": "ሸገር ERP",
      "Sign Out": "ውጣ",
      "Toggle Theme": "ገጽታ መቀየሪያ",
      "Change Language": "ቋንቋ ቀይር",
      "English": "እንግሊዝኛ",
      "Amharic": "አማርኛ",
      "Afaan Oromoo": "አፋን ኦሮሞ"
    }
  },
  om: {
    translation: {
      "Dashboard": "Daaishboordii",
      "Operations": "Hojiiwwan",
      "Planning": "Karoora",
      "Procurement": "Bittaa",
      "Inventory": "Kuusaa",
      "Production": "Oomisha",
      "Recipes": "Qajeelfama Hojii",
      "Maintenance": "Suphaa",
      "Logistics": "Lojistikii",
      "Quality": "Qulqullina",
      "Sales & Finance": "Gurgurtaa fi Faayinaansii",
      "Sales": "Gurgurtaa",
      "Finance": "Faayinaansii",
      "Admin Panel": "To'annoo Bulchaa",
      "Administration": "Bulchiinsa",
      "HR": "Namooota",
      "Users": "Fayyadamtota",
      "Master Data": "Daataa Ijoo",
      "Sheger ERP": "Sheger ERP",
      "Sign Out": "Bahaa",
      "Toggle Theme": "Dhaqna Jijjiiri",
      "Change Language": "Afaan Jijjiiri",
      "English": "Afaan Ingilizii",
      "Amharic": "Afaan Amaaraa",
      "Afaan Oromoo": "Afaan Oromoo"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid hydration mismatch by waiting for client load
    return <div style={{ display: 'none' }}>{children}</div>;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
