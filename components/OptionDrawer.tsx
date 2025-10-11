import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

interface OptionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  option: {
    id: string;
    name: string;
    score: number;
    steps: string[];
  };
}

export function OptionDrawer({ open, onOpenChange, option }: OptionDrawerProps) {
  const handleCopySteps = () => {
    const stepsText = option.steps.join('\n');
    navigator.clipboard.writeText(stepsText);
    toast.success('적용 단계가 복사되었습니다');
  };

  const handleExportJson = () => {
    const json = JSON.stringify(option, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${option.id}.json`;
    a.click();
    toast.success('JSON 파일이 다운로드되었습니다');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] overflow-auto">
        <SheetHeader>
          <SheetTitle>{option.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Risk & Mitigation */}
          <section>
            <h4 className="mb-3">리스크 & 완화책</h4>
            <div className="space-y-2">
              <div className="p-3 bg-muted rounded border border-border">
                <h4 className="mb-1">리스크: 테이블 용량 증가</h4>
                <p className="text-muted-foreground">
                  outbox_events 테이블이 시간이 지남에 따라 커질 수 있음
                </p>
              </div>
              <div className="p-3 bg-muted rounded border border-border">
                <p className="text-muted-foreground">
                  <span className="text-foreground">완화책:</span> 파티셔닝 (일자별) + TTL 정책으로 30일 이후 자동 삭제
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Performance Estimate */}
          <section>
            <h4 className="mb-3">성능 추정 근거</h4>
            <ul className="space-y-2">
              <li className="p-3 bg-muted rounded border border-border">
                <p className="text-muted-foreground">
                  현재 p95 1500ms → SMS 제거 시 800ms 이하 예상
                </p>
              </li>
              <li className="p-3 bg-muted rounded border border-border">
                <p className="text-muted-foreground">
                  Outbox INSERT는 평균 5ms 미만 (인덱스 최적화 시)
                </p>
              </li>
              <li className="p-3 bg-muted rounded border border-border">
                <p className="text-muted-foreground">
                  워커 처리: 초당 100건 이상 가능 (비동기)
                </p>
              </li>
            </ul>
          </section>

          <Separator />

          {/* Metrics Impact */}
          <section>
            <h4 className="mb-3">메트릭 영향</h4>
            <div className="space-y-2">
              <div className="flex justify-between p-2 border-b border-border">
                <span className="text-muted-foreground">API p95</span>
                <span>1500ms → 800ms</span>
              </div>
              <div className="flex justify-between p-2 border-b border-border">
                <span className="text-muted-foreground">SMS 성공률</span>
                <span>유지 (비동기 재처리)</span>
              </div>
              <div className="flex justify-between p-2 border-b border-border">
                <span className="text-muted-foreground">DB 부하</span>
                <span>+5% (outbox 쓰기)</span>
              </div>
              <div className="flex justify-between p-2 border-b border-border">
                <span className="text-muted-foreground">워커 리소스</span>
                <span>신규 (1~2 인스턴스)</span>
              </div>
            </div>
          </section>

          <Separator />

          {/* Operations Checklist */}
          <section>
            <h4 className="mb-3">운영 체크리스트</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" />
                <span className="text-muted-foreground">outbox_events 테이블 파티셔닝 설정</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" />
                <span className="text-muted-foreground">워커 프로세스 배포 및 모니터링</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" />
                <span className="text-muted-foreground">DLQ 알람 설정 (Slack/PagerDuty)</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" />
                <span className="text-muted-foreground">멱등성 키 중복 처리 테스트</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" />
                <span className="text-muted-foreground">롤백 시나리오 준비</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer CTAs */}
        <div className="sticky bottom-0 bg-background pt-6 pb-4 border-t border-border mt-8 space-y-2">
          <Button variant="outline" className="w-full" onClick={handleCopySteps}>
            <Copy className="mr-2 h-4 w-4" />
            적용 단계 스니펫 복사
          </Button>
          <Button variant="outline" className="w-full" onClick={handleExportJson}>
            <Download className="mr-2 h-4 w-4" />
            JSON 내보내기
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
