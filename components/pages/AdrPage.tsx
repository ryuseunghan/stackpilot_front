import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Calendar, Download, Copy, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface AdrPageProps {
  selectedOptions: string[];
}

export function AdrPage({ selectedOptions }: AdrPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState('proposed');

  const hasOptions = selectedOptions.length > 0;

  const handleDownloadMarkdown = () => {
    const markdown = generateMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ADR-matching-async-sms.md';
    a.click();
    toast.success('Markdown 파일이 다운로드되었습니다');
  };

  const handleCopyMarkdown = () => {
    const markdown = generateMarkdown();
    navigator.clipboard.writeText(markdown);
    toast.success('Markdown이 복사되었습니다');
  };

  const generateMarkdown = () => {
    return `# ADR: 매칭 신청 SMS 비동기 처리

**상태:** ${status === 'proposed' ? '제안' : status === 'approved' ? '승인' : '폐기'}
**결정일:** ${new Date().toISOString().split('T')[0]}
**책임자:** 개발팀

## 문맥

현재 매칭 신청 API의 p95 응답시간이 1500ms로 목표치인 800ms를 초과하고 있습니다.
주요 원인은 SMS 전송 처리가 동기적으로 이루어지며 외부 API 타임아웃(1000ms)으로 인한 지연입니다.

- **목표 p95:** 800ms
- **현재 p95:** 1500ms (매칭 신청), 2400ms (매칭 수락)
- **허용 지연:** 30초
- **외부 연동:** sms_provider(비치명, 동기, 1000ms), recommendation_api(비치명, 800ms)
- **실패 정책:** 분리 후 대기열

## 고려한 옵션

| 옵션 | 적합도 | 예상 효과 | 부작용 |
|------|--------|-----------|--------|
| A - 트랜잭셔널 아웃박스 | 86 | p95↓, 성공률↑, 감사추적 | 최종 일관성, 워커 운영 |
| B - SQS 큐 + 워커 + DLQ | 81 | 버스트흡수, 타임아웃 분리 | DLQ 운영, 멱등 필요 |
| C - 회로차단 + 타임리미터 | 74 | 실패격리, 대체응답 | 폴백 품질 의존 |

## 선택

**옵션 A - 트랜잭셔널 아웃박스**

아웃박스 패턴을 선택한 이유:
1. 트랜잭션 일관성을 보장하면서 비동기 처리 가능
2. 감사 추적 및 디버깅이 용이 (outbox_events 테이블)
3. SMS 실패 시에도 매칭 성공 처리 가능
4. 기존 Spring Boot + MySQL 스택에 가장 적합

## 트레이드오프

**장점:**
- p95 응답시간 800ms 이하로 개선 예상
- 트랜잭션 일관성 보장
- 실패한 메시지 자동 재처리
- 감사 추적 및 디버깅 용이

**단점:**
- 최종 일관성 모델 (SMS가 즉시 전송되지 않음)
- 워커 프로세스 운영 필요
- outbox_events 테이블 용량 관리 필요
- 멱등성 키 기반 중복 처리 방지 필수

## 마이그레이션 계획

**단계:**
1. outbox_events 테이블 추가 (event_type, payload, status, created_at)
2. 매칭 신청 트랜잭션 내 outbox INSERT 추가
3. @TransactionalEventListener(AFTER_COMMIT) 폴러 구현
4. SMS 전송 실패 시 DLQ로 이동, 재시도 로직 구현
5. 처리 완료 후 outbox 레코드 PROCESSED 상태 업데이트

**롤백 시나리오:**
- 워커 중지 후 기존 동기 SMS 전송 로직으로 복원
- outbox_events 테이블은 유지 (감사 로그로 활용)

## 근거 (출처)

- [Transactional Outbox Pattern - Martin Fowler](https://martinfowler.com/articles/patterns-outbox.html) (2023-05-15)
- [Spring Boot Event-Driven Architecture Best Practices](https://spring.io/guides/event-driven) (2024-02-20)
- [AWS SQS와 DLQ를 활용한 메시지 처리 패턴](https://docs.aws.amazon.com/sqs/dlq-patterns.html) (2023-11-30)
`;
  };

  if (!hasOptions) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3>ADR 초안 생성을 위한 옵션이 없습니다</h3>
          <p className="text-muted-foreground">
            결과 화면에서 옵션을 선택한 후 "ADR 초안에 추가" 버튼을 클릭하세요.
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            결과 화면으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto p-8">
      {/* Top Bar */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proposed">제안</SelectItem>
              <SelectItem value="approved">승인</SelectItem>
              <SelectItem value="deprecated">폐기</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input 
              type="date" 
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-[150px]"
            />
          </div>

          <Input 
            placeholder="책임자"
            defaultValue="개발팀"
            className="w-[150px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '읽기 모드' : '편집 모드'}
          </Button>
        </div>
      </div>

      {/* ADR Content */}
      <div className="space-y-8">
        {/* Title */}
        <div>
          <h1>ADR: 매칭 신청 SMS 비동기 처리</h1>
        </div>

        <Separator />

        {/* Context */}
        <section>
          <h2 className="mb-4">문맥 (Context)</h2>
          {isEditing ? (
            <Textarea 
              rows={6}
              defaultValue="현재 매칭 신청 API의 p95 응답시간이 1500ms로 목표치인 800ms를 초과하고 있습니다. 주요 원인은 SMS 전송 처리가 동기적으로 이루어지며 외부 API 타임아웃(1000ms)으로 인한 지연입니다.

- 목표 p95: 800ms
- 현재 p95: 1500ms (매칭 신청), 2400ms (매칭 수락)
- 허용 지연: 30초
- 외부 연동: sms_provider(비치명, 동기, 1000ms), recommendation_api(비치명, 800ms)
- 실패 정책: 분리 후 대기열"
            />
          ) : (
            <div className="space-y-2 text-muted-foreground">
              <p>
                현재 매칭 신청 API의 p95 응답시간이 1500ms로 목표치인 800ms를 초과하고 있습니다.
                주요 원인은 SMS 전송 처리가 동기적으로 이루어지며 외부 API 타임아웃(1000ms)으로 인한 지연입니다.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>목표 p95: 800ms</li>
                <li>현재 p95: 1500ms (매칭 신청), 2400ms (매칭 수락)</li>
                <li>허용 지연: 30초</li>
                <li>외부 연동: sms_provider(비치명, 동기, 1000ms), recommendation_api(비치명, 800ms)</li>
                <li>실패 정책: 분리 후 대기열</li>
              </ul>
            </div>
          )}
        </section>

        <Separator />

        {/* Options Considered */}
        <section>
          <h2 className="mb-4">고려한 옵션</h2>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">옵션</th>
                  <th className="p-3 text-left">적합도</th>
                  <th className="p-3 text-left">예상 효과</th>
                  <th className="p-3 text-left">부작용</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="p-3">A - 트랜잭셔널 아웃박스</td>
                  <td className="p-3"><Badge variant="secondary">86</Badge></td>
                  <td className="p-3 text-muted-foreground">p95↓, 성공률↑, 감사추적</td>
                  <td className="p-3 text-muted-foreground">최종 일관성, 워커 운영</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-3">B - SQS 큐 + 워커 + DLQ</td>
                  <td className="p-3"><Badge variant="secondary">81</Badge></td>
                  <td className="p-3 text-muted-foreground">버스트흡수, 타임아웃 분리</td>
                  <td className="p-3 text-muted-foreground">DLQ 운영, 멱등 필요</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-3">C - 회로차단 + 타임리미터</td>
                  <td className="p-3"><Badge variant="secondary">74</Badge></td>
                  <td className="p-3 text-muted-foreground">실패격리, 대체응답</td>
                  <td className="p-3 text-muted-foreground">폴백 품질 의존</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <Separator />

        {/* Decision */}
        <section>
          <h2 className="mb-4">선택 (Decision)</h2>
          {isEditing ? (
            <Textarea 
              rows={8}
              defaultValue="옵션 A - 트랜잭셔널 아웃박스

아웃박스 패턴을 선택한 이유:
1. 트랜잭션 일관성을 보장하면서 비동기 처리 가능
2. 감사 추적 및 디버깅이 용이 (outbox_events 테이블)
3. SMS 실패 시에도 매칭 성공 처리 가능
4. 기존 Spring Boot + MySQL 스택에 가장 적합"
            />
          ) : (
            <div className="space-y-3">
              <h3>옵션 A - 트랜잭셔널 아웃박스</h3>
              <p className="text-muted-foreground">아웃박스 패턴을 선택한 이유:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>트랜잭션 일관성을 보장하면서 비동기 처리 가능</li>
                <li>감사 추적 및 디버깅이 용이 (outbox_events 테이블)</li>
                <li>SMS 실패 시에도 매칭 성공 처리 가능</li>
                <li>기존 Spring Boot + MySQL 스택에 가장 적합</li>
              </ol>
            </div>
          )}
        </section>

        <Separator />

        {/* Trade-offs */}
        <section>
          <h2 className="mb-4">트레이드오프</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4>장점</h4>
              <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                <li>p95 응답시간 800ms 이하로 개선 예상</li>
                <li>트랜잭션 일관성 보장</li>
                <li>실패한 메시지 자동 재처리</li>
                <li>감사 추적 및 디버깅 용이</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4>단점</h4>
              <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                <li>최종 일관성 모델 (SMS가 즉시 전송되지 않음)</li>
                <li>워커 프로세스 운영 필요</li>
                <li>outbox_events 테이블 용량 관리 필요</li>
                <li>멱등성 키 기반 중복 처리 방지 필수</li>
              </ul>
            </div>
          </div>
        </section>

        <Separator />

        {/* Migration Plan */}
        <section>
          <h2 className="mb-4">마이그레이션 계획</h2>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2">단계</h4>
              <ol className="space-y-1 text-muted-foreground">
                <li>1. outbox_events 테이블 추가 (event_type, payload, status, created_at)</li>
                <li>2. 매칭 신청 트랜잭션 내 outbox INSERT 추가</li>
                <li>3. @TransactionalEventListener(AFTER_COMMIT) 폴러 구현</li>
                <li>4. SMS 전송 실패 시 DLQ로 이동, 재시도 로직 구현</li>
                <li>5. 처리 완료 후 outbox 레코드 PROCESSED 상태 업데이트</li>
              </ol>
            </div>
            <div>
              <h4 className="mb-2">롤백 시나리오</h4>
              <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                <li>워커 중지 후 기존 동기 SMS 전송 로직으로 복원</li>
                <li>outbox_events 테이블은 유지 (감사 로그로 활용)</li>
              </ul>
            </div>
          </div>
        </section>

        <Separator />

        {/* Evidence */}
        <section>
          <h2 className="mb-4">근거 (출처)</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <div>
                <a href="#" className="hover:underline">
                  Transactional Outbox Pattern - Martin Fowler
                </a>
                <span className="text-muted-foreground ml-2">(2023-05-15)</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <div>
                <a href="#" className="hover:underline">
                  Spring Boot Event-Driven Architecture Best Practices
                </a>
                <span className="text-muted-foreground ml-2">(2024-02-20)</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <div>
                <a href="#" className="hover:underline">
                  AWS SQS와 DLQ를 활용한 메시지 처리 패턴
                </a>
                <span className="text-muted-foreground ml-2">(2023-11-30)</span>
              </div>
            </li>
          </ul>
        </section>
      </div>

      {/* Footer CTAs */}
      <div className="mt-12 flex gap-3 justify-end pb-8">
        <Button variant="outline" onClick={() => {}}>
          <FileText className="mr-2 h-4 w-4" />
          Markdown 보기
        </Button>
        <Button variant="outline" onClick={handleCopyMarkdown}>
          <Copy className="mr-2 h-4 w-4" />
          복사
        </Button>
        <Button onClick={handleDownloadMarkdown}>
          <Download className="mr-2 h-4 w-4" />
          다운로드 .md
        </Button>
      </div>
    </div>
  );
}
