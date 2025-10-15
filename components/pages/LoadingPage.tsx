import { useEffect, useState } from 'react';
import { Loader2, Check, Database, Search, Link2, Lightbulb } from 'lucide-react';

interface LoadingStep {
  id: number;
  message: string;
  delay: number;
  icon: React.ElementType;
}

const loadingSteps: LoadingStep[] = [
  { id: 1, message: '입력된 데이터를 수집하는 중...', delay: 5000, icon: Database },
  { id: 2, message: '프로젝트 환경을 분석하는 중...', delay: 7000, icon: Search },
  { id: 3, message: '외부 연동 정보를 확인하는 중...', delay: 10000, icon: Link2 },
  { id: 4, message: '개선 방안을 도출하는 중...', delay: 200000, icon: Lightbulb },
];

type StepStatus = 'pending' | 'active' | 'completed';

export function LoadingPage() {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const timers = loadingSteps.map((step, index) => {
      const totalDelay = loadingSteps
          .slice(0, index)
          .reduce((sum, s) => sum + s.delay, 0);

      return setTimeout(() => {
        setCurrentStep(step.id + 1);
      }, totalDelay);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  const getStepStatus = (stepId: number): StepStatus => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  const progress = ((currentStep - 1) / loadingSteps.length) * 100;

  return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* 메인 컨테이너 */}
        <div className="w-full max-w-2xl px-6">
          {/* 상단 로딩 스피너 & 타이틀 */}
          <div className="flex flex-col items-center mb-16 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <Loader2 className="relative h-20 w-20 animate-spin text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                분석 진행 중
              </h2>
              <p className="text-sm text-muted-foreground text-center">
                최적의 결과를 위해 데이터를 처리하고 있습니다
              </p>
            </div>
          </div>

          {/* 프로그레스 바 */}
          <div className="mb-12">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>진행률</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* 단계별 메시지 */}
          <div className="space-y-4">
            {loadingSteps.map((step) => {
              const status = getStepStatus(step.id);
              const Icon = step.icon;

              return (
                  <div
                      key={step.id}
                      className={`
                        relative flex items-center gap-4 p-5 rounded-xl
                        transition-all duration-700 ease-out
                        ${status === 'active'
                          ? 'bg-primary/5 border-2 border-primary/20 shadow-lg shadow-primary/5 scale-[1.02]'
                          : status === 'completed'
                              ? 'bg-muted/30 border-2 border-transparent'
                              : 'bg-transparent border-2 border-transparent'
                      }
                      `}
                  >
                    {/* 왼쪽 아이콘 영역 */}
                    <div className={`
                      flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                      transition-all duration-700
                      ${status === 'completed'
                        ? 'bg-green-500/10 ring-2 ring-green-500/20'
                        : status === 'active'
                            ? 'bg-primary/10 ring-2 ring-primary/30 animate-pulse'
                            : 'bg-muted/50'
                    }
                    `}>
                      {status === 'completed' ? (
                          <Check className="h-6 w-6 text-green-500" strokeWidth={2.5} />
                      ) : status === 'active' ? (
                          <Icon className="h-6 w-6 text-primary" strokeWidth={2} />
                      ) : (
                          <Icon className="h-6 w-6 text-muted-foreground/30" strokeWidth={1.5} />
                      )}
                    </div>

                    {/* 메시지 */}
                    <div className="flex-1">
                      <p className={`
                        text-base transition-all duration-700
                        ${status === 'active'
                          ? 'text-foreground font-semibold'
                          : status === 'completed'
                              ? 'text-muted-foreground font-medium'
                              : 'text-muted-foreground/40 font-normal'
                      }
                      `}>
                        {step.message}
                      </p>
                    </div>

                    {/* 우측 상태 표시 */}
                    <div className="flex-shrink-0">
                      {status === 'active' && (
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                      )}
                    </div>
                  </div>
              );
            })}
          </div>
        </div>

        {/* 하단 고정 안내 문구 */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-8 pb-6">
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-muted-foreground">
              잠시만 기다려주세요. <span className="font-semibold text-foreground">화면을 끄지 마세요.</span>
            </p>
          </div>
        </div>
      </div>
  );
}
