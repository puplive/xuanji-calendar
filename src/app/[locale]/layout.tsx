import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import ClientLayout from './ClientLayout';
import zhMessages from '@/messages/zh.json';
import enMessages from '@/messages/en.json';

const messagesMap: Record<string, Record<string, unknown>> = {
  zh: zhMessages,
  en: enMessages,
};

export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = messagesMap[locale] || zhMessages;

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Shanghai">
      <ClientLayout locale={locale}>{children}</ClientLayout>
    </NextIntlClientProvider>
  );
}
