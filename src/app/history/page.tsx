import Image from "next/image"
import { contentRepository } from "@/content"

export const revalidate = 3600

export default async function HistoryPage() {
  const repository = await contentRepository()
  const terms = await repository.listTermsWithCommittees()

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
      <header className="mb-14 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
          People & Service
        </p>
        <h1 className="font-heading text-4xl font-bold md:text-5xl">歷屆執委</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          感謝每一屆願意以時間與心力服務團體的伙伴。此處只公開本人同意的正式職務資料。
        </p>
      </header>

      {terms.length > 0 ? (
        <div className="space-y-14">
          {terms.map(({ term, committee }) => (
            <section key={term.id} aria-labelledby={`term-${term.id}`}>
              <div className="mb-6 flex items-end justify-between border-b border-border/50 pb-4">
                <h2 id={`term-${term.id}`} className="font-heading text-3xl font-bold">
                  {term.name}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {term.startDate} — {term.endDate}
                </span>
              </div>

              {committee.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {committee.map(({ role, person }) => (
                    <article
                      key={role.id}
                      className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-5"
                    >
                      <div className="relative h-14 w-14 flex-none overflow-hidden rounded-full bg-primary/10">
                        {person.portraitUrl?.includes("res.cloudinary.com") && (
                          <Image
                            src={person.portraitUrl}
                            alt={`${person.name} 的公開頭像`}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{person.name}</h3>
                        <p className="text-sm text-muted-foreground">{role.title}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">此屆公開名單仍在整理中。</p>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/50 bg-muted/20 px-6 py-20 text-center text-muted-foreground">
          歷屆執委資料正在取得同意並逐屆整理。
        </div>
      )}
    </div>
  )
}
