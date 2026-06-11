import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTimeZone } from 'next-intl/server';
import ClientLayout from './ClientLayout';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const timeZone = await getTimeZone();

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
      <ClientLayout locale={locale}>{children}</ClientLayout>
    </NextIntlClientProvider>
  );
}
