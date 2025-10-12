import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Button } from './ui/button';
import { AnalysisResult } from '@/services/openai';

interface OptionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  option: AnalysisResult['options'][0];
}

export function OptionDrawer({ open, onOpenChange, option }: OptionDrawerProps) {
  // 파일명에 사용할 안전한 문자열 생성
  const sanitizeFilename = (name: string) =>
      (name || 'option')
          .replace(/[\\/:*?"<>|]+/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .toLowerCase()
          .slice(0, 60) || 'option';

  // 현재 옵션을 JSON으로 복사
  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(option, null, 2));
      // 필요 시 toast 사용 고려: sonner 등
    } catch {
      // 클립보드 접근 실패는 조용히 무시
    }
  };

  // 현재 옵션을 JSON 파일로 다운로드
  const handleExportJson = () => {
    const json = JSON.stringify(option, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFilename(option?.name)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-6 sm:px-8">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="pr-8">{option.name}</SheetTitle>
            </div>
          </SheetHeader>

          {/* 본문: 하단 고정 액션바에 가리지 않도록 여유 패딩 추가 */}
          <div className="space-y-6 pb-24">
            <div>
              <h3 className="text-sm font-medium mb-2">요약</h3>
              <p className="text-muted-foreground">{option.summary}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">기대 효과</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {option.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">부작용</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {option.sideEffects.map((effect, index) => (
                    <li key={index}>{effect}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">전제 조건</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {option.conditions.map((condition, index) => (
                    <li key={index}>{condition}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">구현 단계</h3>
              <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                {option.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* 하단 액션바: 좌우 전체폭, 스크롤 시 항상 노출 */}
          <div className="sticky bottom-0 -mx-6 sm:-mx-8 px-6 sm:px-8 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={handleCopyJson}>복사</Button>
              <Button onClick={handleExportJson}>JSON 내보내기</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
  );
}
