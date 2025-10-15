import { NextRequest, NextResponse } from 'next/server';
import { AnalysisRequest, AnalysisResult } from '@/services/openai';

/**
 * OpenAI API 요청을 처리하는 API Route
 * 클라이언트에서 직접 OpenAI API를 호출하지 않고 서버를 통해 호출하도록 함
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const { action, payload } = await request.json();

    // API 키 확인
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
          { error: 'OpenAI API 키가 설정되지 않았습니다.' },
          { status: 500 }
      );
    }

    // 액션에 따라 적절한 처리
    switch (action) {
      case 'analyze':
        return await handleAnalyzeRequest(payload as AnalysisRequest, apiKey);
      default:
        return NextResponse.json(
            { error: '지원하지 않는 액션입니다.' },
            { status: 400 }
        );
    }
  } catch (error) {
    console.error('API Route 오류:', error);
    return NextResponse.json(
        { error: '서버 처리 중 오류가 발생했습니다.' },
        { status: 500 }
    );
  }
}

/**
 * 분석 요청을 처리하는 핸들러
 */
async function handleAnalyzeRequest(data: AnalysisRequest, apiKey: string) {
  try {
    // 사용자 프롬프트 생성
    const userPrompt = createPrompt(data);

    // OpenAI API 요청 구성
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: '시니어 아키텍처 컨설턴트. 서로 다른 3가지 기술 옵션을 근거 기반으로 생성. 규칙: 1) 근거 3-5개(URL 포함) 2) 실무 적용 가능한 구체적 단계 제시 3) 정량 수치는 단위 표기. 마크다운 금지.'
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'analysis_result',
            schema: parsedResponseSchema,
            strict: true
          }
        },
        temperature: 1,
        max_completion_tokens: 16000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API 오류: ${errorData.error?.message || '알 수 없는 오류'}`);
    }

    const responseData = await response.json();

    // OpenAI 응답에서 JSON 파싱
    try {
      const content = responseData.choices[0].message.content;
      // JSON 문자열만 추출 (마크다운이나 다른 텍스트가 있을 경우 제거)
      const jsonMatch = content.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      const parsedResult = JSON.parse(jsonStr);

      return NextResponse.json(parsedResult);
    } catch (parseError) {
      console.error('응답 파싱 오류:', parseError);
      return NextResponse.json(
          { error: 'OpenAI 응답을 파싱할 수 없습니다.' },
          { status: 500 }
      );
    }
  } catch (error) {
    console.error('OpenAI API 호출 중 오류 발생:', error);
    return NextResponse.json(
        { error: '분석 요청 중 오류가 발생했습니다.' },
        { status: 500 }
    );
  }
}

/**
 * 사용자 입력을 바탕으로 프롬프트 템플릿을 생성합니다.
 */
function createPrompt(data: AnalysisRequest): string {
  // 데이터베이스 정보 포맷팅
  const dbInfos = data.environment.databases.map((db, index) =>
      `- 데이터베이스${index + 1}: ${db.database} ${db.version}`
  ).join('\n');

  // 고려사항 포맷팅
  const considerations = data.goal.considerations.map((consideration, index) =>
      `- 고려사항${index + 1}: ${consideration}`
  ).join('\n');

  // 외부 연동 정보 포맷팅
  const externalIntegrations = data.externalIntegrations.map(ext =>
      `- 이름: ${ext.name}\n- 중요도: ${ext.criticality === 'critical' ? '치명' : '비치명'}\n- 호출 방식: ${ext.callType === 'sync' ? '동기' : '비동기'}\n- API 설명: ${ext.description}`
  ).join('\n');

  // 스텝 타입에 따른 목표 정보 포맷팅
  let goalInfo = '';
  if (data.goal.stepType === 'new') {
    goalInfo = `- 스텝: 신규\n- 기능요약: ${data.goal.featureSummary}\n${considerations}`;
  } else {
    goalInfo = `- 스텝: 리팩토링\n- 현재 상태(as-is): ${data.goal.currentState}\n- 희망 상태(to-be): ${data.goal.desiredState}\n${considerations}`;
  }

  // 최종 프롬프트 템플릿 구성
  return `[지시] 아래 "프로젝트 정보"를 바탕으로, 실행 가능한 아키텍처 옵션 3개 생성. JSON 외의 모든 텍스트 출력 금지.

[프로젝트 정보]
- 프레임워크: ${data.environment.framework}
- 프레임워크 버전: ${data.environment.version}
- 언어: ${data.environment.language}
- 런타임 버전: ${data.environment.runtime}
- 아키텍처: ${data.environment.architecture}
- 클라우드: ${data.environment.cloud}
${dbInfos}

[변경 목표]
${goalInfo}

[외부 연동]
${externalIntegrations}

[출력 제약]
- 옵션 수: 3
- 각 옵션은 상이한 접근 방식일 것
- 각 옵션의 근거 제공(URL 포함)
- 모든 수치에 단위를 표기`;
}

// JSON Schema 정의
const parsedResponseSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "additionalProperties": false,
  "required": ["options", "meta"],
  "properties": {
    "options": {
      "type": "array",
      "minItems": 3,
      "maxItems": 3,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "id",
          "name",
          "tags",
          "summary",
          "expectedEffect",
          "sideEffect",
          "evidenceCount",
          "benefits",
          "sideEffects",
          "conditions",
          "steps",
          "evidence"
        ],
        "properties": {
          "id": {
            "type": "string",
            "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            "description": "kebab-case unique id (예: transactional-outbox)"
          },
          "name": {
            "type": "string",
            "minLength": 3,
            "maxLength": 120
          },
          "tags": {
            "type": "array",
            "minItems": 3,
            "maxItems": 5,
            "items": {
              "type": "string",
              "pattern": "^#[^\\\\s#]{2,}$"
            }
          },
          "summary": {
            "type": "string",
            "minLength": 10,
            "maxLength": 280
          },
          "expectedEffect": {
            "type": "string",
            "minLength": 10,
            "maxLength": 280
          },
          "sideEffect": {
            "type": "string",
            "minLength": 10,
            "maxLength": 280
          },
          "evidenceCount": {
            "type": "integer",
            "minimum": 3,
            "maximum": 5
          },
          "benefits": {
            "type": "array",
            "minItems": 3,
            "maxItems": 5,
            "items": {
              "type": "string",
              "minLength": 3
            }
          },
          "sideEffects": {
            "type": "array",
            "minItems": 3,
            "maxItems": 5,
            "items": {
              "type": "string",
              "minLength": 3
            }
          },
          "conditions": {
            "type": "array",
            "minItems": 3,
            "maxItems": 5,
            "items": {
              "type": "string",
              "minLength": 3
            }
          },
          "steps": {
            "type": "array",
            "minItems": 4,
            "maxItems": 7,
            "items": {
              "type": "string",
              "minLength": 3
            }
          },
          "evidence": {
            "type": "array",
            "minItems": 3,
            "maxItems": 5,
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": ["title", "url", "summary"],
              "properties": {
                "title": {
                  "type": "string",
                  "minLength": 3
                },
                "url": {
                  "type": "string",
                  "pattern": "^https?://"
                },
                "summary": {
                  "type": "string",
                  "minLength": 10,
                  "maxLength": 240
                }
              }
            }
          }
        }
      }
    },
    "meta": {
      "type": "object",
      "additionalProperties": false,
      "required": ["inputSummary", "warnings"],
      "properties": {
        "inputSummary": {
          "type": "string",
          "minLength": 10,
          "maxLength": 500
        },
        "warnings": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "default": []
        }
      }
    }
  }
};