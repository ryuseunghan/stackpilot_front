import { useEffect, useState } from 'react';
import { Loader2, Check, Database, Search, Link2, Lightbulb, Code, Server, Shield, Zap } from 'lucide-react';

interface LoadingStep {
  id: number;
  message: string;
  delay: number;
  icon: React.ElementType;
  isInfinite?: boolean; // 무한 로딩 단계를 나타내는 플래그
}

interface LoadingPageProps {
  onLoadingComplete?: () => void;
}

const loadingSteps: LoadingStep[] = [
  { id: 1, message: '입력된 데이터를 수집하는 중', delay: 20000, icon: Database },
  { id: 2, message: '프로젝트 환경을 분석하는 중', delay: 8000, icon: Search },
  { id: 3, message: '외부 연동 정보를 확인하는 중', delay: 8000, icon: Link2 },
  { id: 4, message: '코드 패턴 및 아키텍처 검토 중', delay: 8000, icon: Code },
  { id: 5, message: '시스템 확장성 및 성능 평가 중', delay: 8000, icon: Server },
  { id: 6, message: '보안 및 안정성 검증 중', delay: 8000, icon: Shield },
  { id: 7, message: '최적화 가능성 탐색 중', delay: 8000, icon: Zap },
  { id: 8, message: '개선 방안을 도출하는 중', delay: Infinity, icon: Lightbulb, isInfinite: true },
];

type StepStatus = 'pending' | 'active' | 'completed';

export function LoadingPage({ onLoadingComplete }: LoadingPageProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // 무한 로딩이 아닌 단계들만 타이머 설정
    const timers = loadingSteps
        .filter(step => !step.isInfinite)
        .map((step, index) => {
          const totalDelay = loadingSteps
              .slice(0, index)
              .filter(s => !s.isInfinite) // 무한 로딩 단계는 지연 시간 계산에서 제외
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

  // 마지막 단계는 진행률 계산에서 제외하여 100%에 도달하지 않도록 함
  const nonInfiniteSteps = loadingSteps.filter(step => !step.isInfinite);
  const lastCompletableStepId = nonInfiniteSteps.length > 0
      ? nonInfiniteSteps[nonInfiniteSteps.length - 1].id
      : 0;

  // 현재 단계가 마지막 완료 가능한 단계를 넘어가면 진행률을 95%로 고정
  const progress = currentStep > lastCompletableStepId
      ? 95
      : ((currentStep - 1) / nonInfiniteSteps.length) * 95; // 최대 95%까지만 진행

  // 현재 활성화된 단계의 아이콘 컴포넌트를 가져옴
  const getCurrentStepIcon = () => {
    if (currentStep <= loadingSteps.length) {
      const CurrentIcon = loadingSteps[currentStep - 1].icon;
      return <CurrentIcon className="h-5 w-5 text-primary" />;
    }
    return <Loader2 className="h-5 w-5 text-primary" />;
  };

  // 현재 활성화된 단계의 메시지를 가져옴
  const getCurrentStepMessage = () => {
    return currentStep <= loadingSteps.length
        ? loadingSteps[currentStep - 1].message
        : '분석 중...';
  };

  return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
        {/* 배경 장식 요소 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* 메인 컨테이너 */}
        <div className="w-full max-w-2xl px-6 relative z-10">
          {/* 상단 로딩 스피너 & 타이틀 */}
          <div className="flex flex-col items-center mb-10 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <Loader2 className="relative h-16 w-16 animate-spin text-primary" />
            </div>
            <div className="space-y-1 text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                분석 진행 중
              </h2>
              <p className="text-sm text-muted-foreground">
                최적의 결과를 위해 데이터를 처리하고 있습니다
              </p>
            </div>
          </div>

          {/* 프로그레스 바 */}
          <div className="mb-8">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
              <span>진행률</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* 단계별 메시지 - 컴팩트한 타임라인 형태로 변경 */}
          <div className="relative pl-8 border-l border-muted/50 space-y-0.5 max-h-[calc(100vh-320px)] overflow-auto py-1">
            {loadingSteps.map((step) => {
              const status = getStepStatus(step.id);
              const Icon = step.icon;

              return (
                  <div
                      key={step.id}
                      className={`
                    relative py-2.5 pl-4 pr-2 rounded-md transition-all duration-500
                    ${status === 'active'
                          ? 'bg-primary/5'
                          : 'bg-transparent'
                      }
                  `}
                  >
                    {/* 타임라인 마커 */}
                    <div
                        className={`
                      absolute left-[-1.625rem] w-5 h-5 rounded-full flex items-center justify-center
                      transition-all duration-500
                      ${status === 'completed'
                            ? 'bg-green-500'
                            : status === 'active'
                                ? 'bg-primary animate-pulse'
                                : 'bg-muted'
                        }
                    `}
                    >
                      {status === 'completed' ? (
                          <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      ) : status === 'active' ? (
                          <Icon className="h-3 w-3 text-white" strokeWidth={2} />
                      ) : null}
                    </div>

                    {/* 내용 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`
                        w-6 h-6 rounded-md flex items-center justify-center
                        ${status === 'completed'
                            ? 'bg-green-500/10 text-green-500'
                            : status === 'active'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted/30 text-muted-foreground/50'
                        }
                      `}>
                          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                        </div>
                        <p className={`
                        text-sm transition-all duration-500
                        ${status === 'active'
                            ? 'text-foreground font-medium'
                            : status === 'completed'
                                ? 'text-muted-foreground'
                                : 'text-muted-foreground/50'
                        }
                      `}>
                          {step.message}
                        </p>
                      </div>

                      {/* 활성 단계 표시 */}
                      {status === 'active' && (
                          <div className="flex gap-0.5">
                            <div className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                      )}
                    </div>
                  </div>
              );
            })}
          </div>

          {/* 현재 진행 중인 단계 정보 카드 */}
          <div className="mt-8 p-4 bg-background/80 backdrop-blur-sm border border-border/30 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                {getCurrentStepIcon()}
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  {getCurrentStepMessage()}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  단계 {currentStep}/{loadingSteps.length}
                </p>
              </div>
            </div>
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