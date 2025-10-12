import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';

interface EvidencePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evidence: Array<{
    title: string;
    url: string;
    summary: string;
  }>;
}

export function EvidencePanel({ open, onOpenChange, evidence }: EvidencePanelProps) {
  return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        {/* 좌우 여백 보강 및 스크롤 대응 */}
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-6 sm:px-8">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between">
              {/* 기본 닫기 버튼과 겹치지 않도록 패딩 */}
              <SheetTitle className="pr-8">근거 자료</SheetTitle>
              {/* 커스텀 닫기 버튼 제거 → 기본 닫기 버튼만 사용 */}
            </div>
          </SheetHeader>

          <div className="space-y-6">
            {evidence.map((item, index) => (
                <div key={index} className="border-b border-border pb-4 last:border-0">
                  <h3 className="font-medium mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{item.summary}</p>
                  <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm flex items-center hover:underline"
                  >
                    원문 보기
                  </a>
                </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
  );
}
