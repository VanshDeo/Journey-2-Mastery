'use client';

import { Button } from '@/components/ui/button';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

export default function LoginPage() {
  const loginUrl = `/api/v1/auth/github`;

  return (
    <div className="min-h-screen bg-off-white flex">
      {/* Left — Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-md bg-japan-red flex items-center justify-center">
              <span className="text-white font-serif font-bold text-lg">J</span>
            </div>
            <span className="font-serif text-xl font-semibold text-primary-text tracking-tight">
              Journey to Mastery
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-text leading-tight mb-4">
            Begin Your
            <br />
            <span className="text-japan-red">Journey</span>
          </h1>

          <p className="text-secondary-text text-lg mb-10 max-w-sm mx-auto leading-relaxed">
            A 4-week coding program for developers to turn one idea into a live product.
          </p>

          {/* GitHub Login */}
          <a href={loginUrl}>
            <Button size="lg" className="w-full max-w-xs gap-3 text-base h-12">
              <GithubIcon className="h-5 w-5" />
              Continue with GitHub
            </Button>
          </a>

          <p className="text-xs text-muted-text mt-6">
            By continuing, you agree to our terms of service.
          </p>
        </div>
      </div>

      {/* Right — Decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-secondary-bg relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full border-2 border-japan-red" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full border border-japan-red" />
        </div>

        {/* Japanese typography */}
        <div className="text-center relative z-10">
          <p className="font-serif text-[120px] text-japan-red/10 leading-none font-bold select-none">
            武
          </p>
          <div className="mt-8 space-y-2">
            <p className="text-muted-text text-sm tracking-[0.3em]">RONIN → KENSHI → SAMURAI → SHOGUN</p>
            <p className="text-muted-text/60 text-xs">開発者コミュニティ</p>
          </div>
        </div>
      </div>
    </div>
  );
}
