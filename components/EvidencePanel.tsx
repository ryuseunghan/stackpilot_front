import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from './ui/sheet';
import { Button } from './ui/button';

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
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between">
              <SheetTitle>근거 자료</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
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
