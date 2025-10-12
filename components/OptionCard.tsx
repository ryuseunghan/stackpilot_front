import { Button } from './ui/button';
import { AnalysisResult } from '@/services/openai';
interface OptionCardProps {
    option: AnalysisResult['options'][0];
    isSelected: boolean;
    onViewDetails: () => void;
    onAddToAdr: () => void;
}

export function OptionCard({ option, isSelected, onViewDetails, onAddToAdr }: OptionCardProps) {
    return (
        <div className={`border rounded-lg p-6 ${isSelected ? 'border-primary' : 'border-border'}`}>
            <div className="flex items-start mb-4">
                <h3 className="text-lg font-medium">{option.name}</h3>
            </div>

            <p className="text-muted-foreground mb-4">{option.summary}</p>
            <div className="flex flex-wrap gap-2 mb-4">
                {option.tags.map((tag, index) => (
                    <span key={index} className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
            {tag}
          </span>
                ))}
            </div>

            <div className="space-y-2 mb-6">
                <div>
                    <span className="text-sm font-medium">예상 효과</span>
                    <p className="text-sm text-muted-foreground">{option.expectedEffect}</p>
                </div>
                <div>
                    <span className="text-sm font-medium">부작용</span>
                    <p className="text-sm text-muted-foreground">{option.sideEffect}</p>
                </div>
            </div>

            <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onViewDetails}>
                    상세 보기
                </Button>
                <Button
                    variant={isSelected ? "destructive" : "default"}
                    className="flex-1"
                    onClick={onAddToAdr}
                >
                    {isSelected ? '제거' : '추가'}
                </Button>
            </div>
        </div>
    );
}
