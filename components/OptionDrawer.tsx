import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from './ui/sheet';
import { Button } from './ui/button';
import { AnalysisResult } from '@/services/openai';

interface OptionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  option: AnalysisResult['options'][0];
}
export function OptionDrawer({ open, onOpenChange, option }: OptionDrawerProps) {
  return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between">
              <SheetTitle>{option.name}</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>

          <div className="space-y-6">
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
        </SheetContent>
      </Sheet>
  );
}
