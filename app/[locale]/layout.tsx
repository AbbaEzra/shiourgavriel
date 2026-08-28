import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/dictionaries";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!LOCALES.includes(params.locale as Locale)) notFound();
  return <>{children}</>;
}
