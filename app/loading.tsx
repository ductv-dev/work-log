import Image from "next/image";

export default function Loading() {
  return (
    <main className="app-gradient app-surface flex min-h-dvh items-center justify-center px-4 py-[calc(env(safe-area-inset-top)+1.25rem)] text-slate-900 dark:text-white">
      <section className="screen-enter w-full max-w-sm">
        <div className="glass rounded-[2.5rem] p-6 text-center">
          <div className="relative mx-auto aspect-square w-32 overflow-hidden rounded-[2rem] bg-white/50 ring-1 ring-white/40 dark:bg-white/10">
            <Image src="/images/worklog-mascot.png" alt="WorkLog đang tải" fill sizes="128px" className="floaty object-cover" priority />
          </div>

          <h1 className="mt-6 text-2xl font-black tracking-tight">Đang mở WorkLog</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-white/60">Đồng bộ dữ liệu và chuẩn bị màn hình cho bạn.</p>

          <div className="mx-auto mt-6 flex w-36 justify-center gap-2">
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-240ms]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-violet-500 [animation-delay:-120ms]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-fuchsia-500" />
          </div>

          <div className="mt-6 overflow-hidden rounded-full bg-white/45 p-1 ring-1 ring-white/30 dark:bg-white/10">
            <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500" />
          </div>
        </div>
      </section>
    </main>
  );
}
