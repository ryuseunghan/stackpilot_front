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
import { AnalysisResult } from '@/services/openai';

interface ResultsPageProps {
  selectedOptions: string[];
  onAddOption: (optionId: string) => void;
  options: AnalysisResult['options'];
}

export function ResultsPage({ selectedOptions, onAddOption, options }: ResultsPageProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Array<{
    title: string;
    url: string;
    summary: string;
  }> | null>(null);

  // 선택된 옵션의 증거 데이터 열기
  const handleOpenEvidence = (optionId: string) => {
    const option = options.find(o => o.id === optionId);
    if (option) {
      setSelectedEvidence(option.evidence);
      setEvidenceOpen(true);
    }
  };

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
                          onClick={() => handleOpenEvidence(option.id)}
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
            evidence={selectedEvidence || []}
        />
      </div>
  );
}