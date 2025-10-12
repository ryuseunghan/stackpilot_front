import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { OptionCard } from '../OptionCard';
import { OptionDrawer } from '../OptionDrawer';
import { EvidencePanel } from '../EvidencePanel';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const options = [
  {
    id: 'option-a',
    name: '트랜잭셔널 아웃박스',
    score: 86,
    tags: ['#최종일관성', '#워커', '#멱등키', '#감사추적'],
    summary: '아웃박스 테이블에 이벤트를 기록하고 커밋 후 폴러/CDC로 처리',
    expectedEffect: '목표 p95 달성 가능, 성공률 향상, 감사 추적 용이',
    sideEffect: '최종 일관성, 워커 운영 필요',
    evidenceCount: 4,
    benefits: [
      'p95 응답시간 800ms 이하로 개선',
      '트랜잭션 일관성 보장',
      '실패한 메시지 자동 재처리',
      '감사 추적 및 디버깅 용이',
      'SMS 실패가 매칭 성공에 영향 없음'
    ],
    sideEffects: [
      '최종 일관성 모델 (즉시 전송 아님)',
      '워커 프로세스 운영 필요',
      'outbox_events 테이블 용량 관리 필요',
      '중복 처리 방지를 위한 멱등성 키 필수'
    ],
    conditions: [
      'Spring Boot 2.x 이상',
      'MySQL/PostgreSQL 트랜잭션 지원',
      '비동기 허용 지연 30초 이내',
      'DLQ 보관 정책 24시간'
    ],
    steps: [
      '1) outbox_events 테이블 추가 (event_type, payload, status, created_at)',
      '2) 매칭 신청 트랜잭션 내 outbox INSERT 추가',
      '3) @TransactionalEventListener(AFTER_COMMIT) 폴러 구현',
      '4) SMS 전송 실패 시 DLQ로 이동, 재시도 로직 구현',
      '5) 처리 완료 후 outbox 레코드 PROCESSED 상태 업데이트'
    ]
  },
  {
    id: 'option-b',
    name: 'SQS 큐 + 워커 + DLQ',
    score: 81,
    tags: ['#큐', '#AWS', '#스케일링', '#DLQ'],
    summary: 'AWS SQS를 사용하여 메시지 큐 처리 및 실패 메시지 관리',
    expectedEffect: '버스트 흡수, 타임아웃 분리',
    sideEffect: 'DLQ 운영, 멱등성 필요',
    evidenceCount: 5,
    benefits: [
      '버스트 트래픽 흡수 (피크 RPS 대응)',
      'SMS 타임아웃이 API 응답에 영향 없음',
      'AWS 관리형 서비스로 운영 부담 감소',
      '자동 재시도 및 DLQ 지원',
      '워커 스케일 아웃 용이'
    ],
    sideEffects: [
      'AWS SQS 비용 발생',
      'DLQ 모니터링 및 재처리 프로세스 필요',
      '메시지 중복 전송 가능성 (at-least-once)',
      '멱등성 키 기반 중복 처리 방지 필수'
    ],
    conditions: [
      'AWS 환경 (EC2/ECS)',
      'SQS 권한 설정 필요',
      'DLQ 보관 기간 24시간',
      'SMS Provider 멱등성 키 지원'
    ],
    steps: [
      '1) SQS 큐 생성 (match-sms-queue, match-sms-dlq)',
      '2) 매칭 신청 완료 후 SQS에 메시지 발행',
      '3) 워커 EC2/ECS에서 SQS 폴링',
      '4) SMS 전송 실패 시 재시도 (최대 3회)',
      '5) 최종 실패 시 DLQ로 이동, 알람 설정'
    ]
  },
  {
    id: 'option-c',
    name: '회로차단 + 타임리미터',
    score: 74,
    tags: ['#Resilience4j', '#동기', '#폴백'],
    summary: 'Resilience4j를 사용하여 실패 격리 및 빠른 실패 응답',
    expectedEffect: '실패 격리, 대체 응답',
    sideEffect: '폴백 품질 의존',
    evidenceCount: 3,
    benefits: [
      'SMS 장애 시 빠른 실패 (p95 개선)',
      '연쇄 장애 방지 (회로차단)',
      '타임아웃 제한으로 응답 시간 보장',
    ],
    sideEffects: [
      '폴백 응답 품질에 의존',
      'SMS 전송은 여전히 실패할 수 있음',
      '회로차단 임계값 튜닝 필요',
      '모니터링 대시보드 구축 필요'
    ],
    conditions: [
      'Resilience4j 라이브러리 추가',
      '폴백 응답 정의 필요',
      'SMS 실패 허용 비즈니스 정책'
    ],
    steps: [
      '1) Resilience4j 의존성 추가',
      '2) @CircuitBreaker, @TimeLimiter 설정',
      '3) SMS 전송 메서드에 어노테이션 적용',
      '4) 폴백 메서드 구현 (로그 기록 후 성공 응답)',
      '5) 회로차단 메트릭 모니터링 설정'
    ]
  }
];

interface ResultsPageProps {
  selectedOptions: string[];
  onAddOption: (optionId: string) => void;
}

export function ResultsPage({ selectedOptions, onAddOption }: ResultsPageProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  return (
    <div className="max-w-[1280px] mx-auto p-8">
      {/* Comparison Table */}
      <div className="mb-8 border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>옵션명</TableHead>
              <TableHead>예상 효과 요약</TableHead>
              <TableHead>부작용 요약</TableHead>
              <TableHead>근거 수</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {options.map((option) => (
              <TableRow key={option.id}>
                <TableCell>
                  <span>{option.name}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{option.expectedEffect}</TableCell>
                <TableCell className="text-muted-foreground">{option.sideEffect}</TableCell>
                <TableCell>
                  <Button 
                    variant="link" 
                    size="sm"
                    onClick={() => setEvidenceOpen(true)}
                    className="p-0 h-auto"
                  >
                    {option.evidenceCount} <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Option Cards Grid */}
      <div className="grid grid-cols-2 gap-6">
        {options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            isSelected={selectedOptions.includes(option.id)}
            onViewDetails={() => setSelectedOption(option.id)}
            onAddToAdr={() => onAddOption(option.id)}
          />
        ))}
      </div>

      {/* Option Detail Drawer */}
      <OptionDrawer
        open={selectedOption !== null}
        onOpenChange={(open) => !open && setSelectedOption(null)}
        option={options.find(o => o.id === selectedOption) || options[0]}
      />

      {/* Evidence Panel */}
      <EvidencePanel
        open={evidenceOpen}
        onOpenChange={setEvidenceOpen}
      />
    </div>
  );
}
