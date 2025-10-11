import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Search, ExternalLink, Calendar, BookOpen } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const evidences = [
  {
    id: '1',
    title: 'Transactional Outbox Pattern - Martin Fowler',
    source: 'martinfowler.com',
    type: '공식',
    date: '2023-05-15',
    url: 'https://martinfowler.com/articles/patterns-outbox.html',
  },
  {
    id: '2',
    title: 'Spring Boot Event-Driven Architecture Best Practices',
    source: 'spring.io',
    type: '공식',
    date: '2024-02-20',
    url: 'https://spring.io/guides/event-driven',
  },
  {
    id: '3',
    title: 'Resilience4j Circuit Breaker Implementation Guide',
    source: 'resilience4j.readme.io',
    type: '레퍼런스',
    date: '2024-01-10',
    url: 'https://resilience4j.readme.io/docs/circuitbreaker',
  },
  {
    id: '4',
    title: 'AWS SQS와 DLQ를 활용한 메시지 처리 패턴',
    source: 'aws.amazon.com',
    type: '공식',
    date: '2023-11-30',
    url: 'https://docs.aws.amazon.com/sqs/dlq-patterns.html',
  },
  {
    id: '5',
    title: 'Implementing Idempotency in Distributed Systems',
    source: 'InfoQ',
    type: '블로그',
    date: '2023-09-12',
    url: 'https://www.infoq.com/articles/idempotency-patterns',
  },
];

interface EvidencePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EvidencePanel({ open, onOpenChange }: EvidencePanelProps) {
  const [selectedEvidences, setSelectedEvidences] = useState<string[]>(['1', '2', '4']);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleEvidence = (id: string) => {
    setSelectedEvidences(prev =>
      prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
    );
  };

  const filteredEvidences = evidences.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>근거 (Evidence)</DialogTitle>
        </DialogHeader>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="제목 또는 출처로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select defaultValue="all-types">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">모든 타입</SelectItem>
                <SelectItem value="official">공식</SelectItem>
                <SelectItem value="reference">레퍼런스</SelectItem>
                <SelectItem value="blog">블로그</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-dates">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="업데이트일" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-dates">모든 날짜</SelectItem>
                <SelectItem value="recent">최근 6개월</SelectItem>
                <SelectItem value="year">최근 1년</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded">
            <span className="text-muted-foreground">
              선택됨: {selectedEvidences.length} / {evidences.length}
            </span>
            {selectedEvidences.length < 3 && (
              <Badge variant="destructive">최소 3개 이상 선택 필요</Badge>
            )}
          </div>
        </div>

        {/* Evidence List */}
        <div className="flex-1 overflow-auto space-y-2">
          {filteredEvidences.map((evidence) => (
            <div
              key={evidence.id}
              className="flex items-start gap-3 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                checked={selectedEvidences.includes(evidence.id)}
                onCheckedChange={() => toggleEvidence(evidence.id)}
                className="mt-1"
              />
              
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="mb-1">{evidence.title}</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="gap-1">
                      <BookOpen className="h-3 w-3" />
                      {evidence.type}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {evidence.date}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{evidence.source}</span>
                  <Button variant="link" size="sm" className="p-0 h-auto">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            disabled={selectedEvidences.length < 3}
          >
            적용 ({selectedEvidences.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
