import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle2, ExternalLink } from 'lucide-react';

interface OptionCardProps {
  option: {
    id: string;
    name: string;
    score: number;
    tags: string[];
    summary: string;
    benefits: string[];
    sideEffects: string[];
    conditions: string[];
    steps: string[];
    evidenceCount: number;
  };
  isSelected: boolean;
  onViewDetails: () => void;
  onAddToAdr: () => void;
}

export function OptionCard({ option, isSelected, onViewDetails, onAddToAdr }: OptionCardProps) {
  return (
    <div className="border border-border rounded-lg p-6 space-y-4 bg-card">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3>옵션 {option.id.split('-')[1].toUpperCase()} — {option.name}</h3>
          <Badge variant="secondary" className="ml-2">
            {option.score}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1">
          {option.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-muted-foreground">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Core Idea */}
      <div className="space-y-1">
        <h4>핵심 아이디어</h4>
        <p className="text-muted-foreground">{option.summary}</p>
      </div>

      {/* Expected Effects */}
      <div className="space-y-2">
        <h4>기대 효과</h4>
        <ul className="space-y-1 list-disc list-inside">
          {option.benefits.map((benefit, idx) => (
            <li key={idx} className="text-muted-foreground">{benefit}</li>
          ))}
        </ul>
      </div>

      {/* Side Effects */}
      <div className="space-y-2">
        <h4>SIDE EFFECT</h4>
        <ul className="space-y-1 list-disc list-inside">
          {option.sideEffects.map((effect, idx) => (
            <li key={idx} className="text-muted-foreground">{effect}</li>
          ))}
        </ul>
      </div>

      {/* Conditions */}
      <div className="space-y-2">
        <h4>적용 조건/가정</h4>
        <ul className="space-y-1 list-disc list-inside">
          {option.conditions.map((condition, idx) => (
            <li key={idx} className="text-muted-foreground">{condition}</li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        <h4>적용 단계</h4>
        <ol className="space-y-1">
          {option.steps.map((step, idx) => (
            <li key={idx} className="text-muted-foreground">{step}</li>
          ))}
        </ol>
      </div>

      {/* Evidence */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1">
          근거 {option.evidenceCount}
        </Badge>
        <Button variant="link" size="sm" className="p-0 h-auto">
          보기 <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      </div>

      {/* CTAs */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onViewDetails} className="flex-1">
          자세히
        </Button>
        <Button 
          onClick={onAddToAdr}
          disabled={isSelected}
          className="flex-1"
        >
          {isSelected ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              추가됨
            </>
          ) : (
            'ADR 초안에 추가'
          )}
        </Button>
      </div>
    </div>
  );
}
