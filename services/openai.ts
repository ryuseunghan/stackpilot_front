import { toast } from 'sonner';

// OpenAI API 요청을 위한 인터페이스 정의
export interface AnalysisRequest {
  environment: {
    framework: string;
    version: string;
    language: string;
    runtime: string;
    architecture: string;
    cloud: string;
    databases: Array<{
      database: string;
      version: string;
    }>;
  };
  goal: {
    stepType: 'new' | 'refactoring';
    featureSummary?: string;
    currentState?: string;
    desiredState?: string;
    considerations: string[];
  };
  externalIntegrations: Array<{
    name: string;
    criticality: string;
    callType: string;
    description: string;
  }>;
}

// 분석 결과 인터페이스 정의
export interface AnalysisResult {
  options: Array<{
    id: string;
    name: string;
    tags: string[];
    summary: string;
    expectedEffect: string;
    sideEffect: string;
    evidenceCount: number;
    benefits: string[];
    sideEffects: string[];
    conditions: string[];
    steps: string[];
    evidence: Array<{
      title: string;
      url: string;
      summary: string;
    }>;
  }>;
  meta: {
    inputSummary: string;
    warnings: string[];
  };
}

/**
 * API Route를 통해 OpenAI 분석을 요청합니다.
 * 서버 사이드에서만 OpenAI API 키에 접근하도록 변경됨
 *
 * @param data 분석을 위한 프로젝트 데이터
 * @returns 분석 결과를 담은 Promise
 */
export async function analyzeWithOpenAI(data: AnalysisRequest): Promise<AnalysisResult> {
  try {
    // API Route 호출
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'analyze',
        payload: data
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API 오류: ${errorData.error || '알 수 없는 오류'}`);
    }

    const result = await response.json();
    return result as AnalysisResult;

  } catch (error) {
    console.error('OpenAI 분석 요청 중 오류 발생:', error);
    toast.error('분석 요청 중 오류가 발생했습니다.');
    throw error;
  }
}