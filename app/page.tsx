import { BondsDashboard } from "@/components/bonds-dashboard";

export default function Home() {
  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(217,119,6,0.14),_transparent_28%)]" />
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Finance Counter
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Веб-приложение для realtime-расчёта доходности облигаций.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Вместо Excel-таблицы у тебя будет один экран, где собираются
                данные из T-Bank Invest API и сразу считаются комиссия, налог,
                годовая доходность и чистый результат по каждой бумаге.
              </p>
            </div>
          </div>

          <div className="rounded-[32px] border border-border/80 bg-card/70 p-6 shadow-[0_32px_80px_-52px_rgba(28,37,35,0.5)] backdrop-blur">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Что приходит с бэка
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Номинал",
                  "Цена и НКД",
                  "Купон и остаток выплат",
                  "Дата последнего купона / погашения",
                  "Комиссия банка",
                  "Доходность до и после налога",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <BondsDashboard />
      </div>
    </main>
  );
}
