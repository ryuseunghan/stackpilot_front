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
      cloud: string;
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

/**
 * OpenAI API를 통해 분석 요청을 전송합니다.
 * 
 * @param data 분석을 위한 프로젝트 데이터
 * @returns 분석 결과를 담은 Promise
 */
export async function analyzeWithOpenAI(data: AnalysisRequest): Promise<any> {
  try {
    // 환경 변수에서 API 키 가져오기
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'openaiKey123456';
    
    if (!apiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    // OpenAI API 요청 구성
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '당신은 소프트웨어 아키텍처 전문가입니다. 제공된 프로젝트 정보를 바탕으로 최적의 설계 방안을 제안해 주세요.'
          },
          {
            role: 'user',
            content: `프로젝트 분석 요청:\n${JSON.stringify(data, null, 2)}`
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API 오류: ${errorData.error?.message || '알 수 없는 오류'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('OpenAI API 호출 중 오류 발생:', error);
    toast.error('분석 요청 중 오류가 발생했습니다.');
    throw error;
  }
}