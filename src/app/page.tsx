import { FireworksBackground } from "@/components/fireworks-background";

export default function Home() {
  return (
    <FireworksBackground className="min-h-dvh">
      {/* Content ignores pointer events so clicks on empty space reach the fireworks canvas. */}
      <main className="pointer-events-none relative z-10 flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-8 text-center">
        <div>
          <p className="text-[clamp(4rem,18vw,8rem)] font-extrabold leading-none tracking-tight" aria-label="90+">
            90<span className="text-mint">+</span>
          </p>
          <p className="mt-1 text-base text-muted">by Opesi Mansion</p>
        </div>
        <h1 className="max-w-[16ch] text-balance text-[clamp(2rem,6vw,3.5rem)] font-extrabold leading-tight tracking-tight">
          Something exciting is happening.
        </h1>
      </main>
      <footer className="absolute inset-x-0 bottom-4 z-10 text-center text-sm text-muted">
        <a href="https://www.opesimansion.com" className="hover:underline">
          opesimansion.com
        </a>
      </footer>
    </FireworksBackground>
  );
}
