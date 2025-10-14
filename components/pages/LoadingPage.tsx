import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStep {
  id: number;
  message: string;
  delay: number;
}

const loadingSteps: LoadingStep[] = [
  { id: 1, message: '입력된 데이터를 수집하는 중...', delay: 2000 },
  { id: 2, message: '프로젝트 환경을 분석하는 중...', delay: 4000 },
  { id: 3, message: '외부 연동 정보를 확인하는 중...', delay: 6000 },
  { id: 4, message: '개선 방안을 도출하는 중...', delay: 8000 },
];

export function LoadingPage() {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // 각 단계별로 순차적으로 메시지를 표시
    const showNextStep = () => {
      setCurrentStep(prev => 
        prev < loadingSteps.length ? prev + 1 : prev
      );
    };

    // 각 단계별 타이머 설정
    const timers = loadingSteps.map((step, index) => {
      const totalDelay = loadingSteps
        .slice(0, index)
        .reduce((sum, s) => sum + s.delay, 0);
      
      return setTimeout(showNextStep, totalDelay);
    });

    // 클린업 함수
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="space-y-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        
        <div className="space-y-4">
          {loadingSteps.map((step) => (
            <div
              key={step.id}
              className={`transition-opacity duration-500 ${
                step.id <= currentStep ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <p className="text-lg text-foreground">
                {step.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}