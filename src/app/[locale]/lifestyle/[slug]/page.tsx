import { redirect } from "@/i18n/routing"

export default async function LifestyleArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  redirect({ href: `/articles/${slug}`, locale })
}
