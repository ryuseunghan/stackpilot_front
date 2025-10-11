interface ProjectEnvironment {
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
}

interface GoalInfo {
  stepType: 'new' | 'refactoring';
  featureSummary?: string;
  currentState?: string;
  desiredState?: string;
  considerations: string[];
}

interface ExternalIntegration {
  name: string;
  criticality: string;
  callType: string;
  apiDescription: string;
}

interface PromptInput {
  environment: ProjectEnvironment;
  goal: GoalInfo;
  externals: ExternalIntegration[];
}

export function generateAnalysisPrompt(input: PromptInput): string {
  const { environment, goal, externals } = input;

  // 데이터베이스 정보 포맷팅
  const databaseInfo = environment.databases.map((db, idx) => 
    `${idx + 1}. ${db.database} ${db.version}`
  ).join('\n');

  // 고려사항 포맷팅 (빈 값 제외)
  const considerationsInfo = goal.considerations
    .filter(c => c.trim().length > 0)
    .map((c, idx) => `${idx + 1}. ${c}`)
    .join('\n');

  // 외부 연동 정보 포맷팅
  const externalsInfo = externals
    .filter(e => e.name.trim().length > 0)
    .map((e, idx) => {
      return `${idx + 1}. ${e.name}
   - 중요도: ${e.criticality === 'critical' ? '치명' : '비치명'}
   - 호출 방식: ${e.callType === 'sync' ? '동기' : '비동기'}${e.apiDescription ? `\n   - API 설명: ${e.apiDescription}` : ''}`;
    })
    .join('\n\n');

  // 기능 목표 섹션 (신규 vs 리팩토링)
  let goalSection = '';
  if (goal.stepType === 'new') {
    goalSection = `## 변경 목표
- 스텝: 신규 기능
- 기능 요약: ${goal.featureSummary || '(입력되지 않음)'}`;
  } else {
    goalSection = `## 변경 목표
- 스텝: 리팩토링
- 현재 상태 (as-is): ${goal.currentState || '(입력되지 않음)'}
- 희망 상태 (to-be): ${goal.desiredState || '(입력되지 않음)'}`;
  }

  // 고려사항 추가
  if (considerationsInfo) {
    goalSection += `\n- 고려사항:\n${considerationsInfo}`;
  }

  // 최종 프롬프트 조합
  const prompt = `당신은 소프트웨어 아키텍처 의사결정을 돕는 전문 컨설턴트입니다.
사용자가 제공한 프로젝트 정보를 바탕으로 실행 가능한 아키텍처 옵션을 제안하고,
각 옵션의 장단점을 근거와 함께 분석해주세요.

## 프로젝트 환경
- 프레임워크: ${environment.framework} ${environment.version}
- 언어: ${environment.language}
- 런타임: ${environment.runtime}
- 아키텍처: ${environment.architecture}
- 클라우드: ${environment.cloud}
- 데이터베이스:
${databaseInfo}

${goalSection}

${externalsInfo ? `## 외부 연동\n${externalsInfo}` : ''}

위 정보를 바탕으로 2-4개의 구체적인 아키텍처 옵션을 제안하고,
각 옵션의 장단점, 전제조건, 구현 단계, 그리고 신뢰할 수 있는 근거를 함께 제시해주세요.

각 옵션은 다음 정보를 포함해야 합니다:
1. 옵션명: 명확하고 구체적인 패턴/기술 이름
2. 점수: 요구사항 적합도 0-100점
3. 태그: 핵심 키워드 3-5개 (#형태)
4. 한줄 요약: 옵션의 핵심 개념 1-2문장
5. 예상 효과: 긍정적 영향 요약
6. 부작용: 잠재적 단점 요약
7. 세부 장점: 구체적 이점 3-5개 항목
8. 세부 부작용: 구체적 고려사항 3-5개 항목
9. 전제 조건: 적용을 위한 필수 조건 3-4개
10. 구현 단계: 구체적 실행 단계 5개 내외
11. 근거: 각 옵션마다 3-5개의 신뢰할 수 있는 근거/레퍼런스 (URL 또는 출처명 포함)

응답은 아래 JSON 형식으로 제공해주세요:

\`\`\`json
{
  "options": [
    {
      "id": "option-a",
      "name": "옵션명",
      "score": 86,
      "tags": ["#태그1", "#태그2", "#태그3"],
      "summary": "한줄 요약",
      "expectedEffect": "예상 효과 요약",
      "sideEffect": "부작용 요약",
      "evidenceCount": 4,
      "benefits": ["장점1", "장점2", "장점3"],
      "sideEffects": ["부작용1", "부작용2", "부작용3"],
      "conditions": ["전제조건1", "전제조건2", "전제조건3"],
      "steps": ["단계1", "단계2", "단계3", "단계4", "단계5"],
      "evidence": [
        {
          "title": "근거 제목",
          "url": "https://example.com",
          "summary": "근거 요약"
        }
      ]
    }
  ]
}
\`\`\``;

  return prompt;
}

// 프롬프트를 콘솔에 출력하는 헬퍼 함수
export function logPrompt(input: PromptInput): void {
  const prompt = generateAnalysisPrompt(input);
  console.log('='.repeat(80));
  console.log('LLM에 전송할 프롬프트:');
  console.log('='.repeat(80));
  console.log(prompt);
  console.log('='.repeat(80));
}
