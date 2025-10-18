import { Button } from './ui/button';
import { ExternalLink } from 'lucide-react';

interface HeaderProps {
  currentPage: 'input' | 'results' | 'adr';
  onNavigate: (page: 'input' | 'results' | 'adr') => void;
  hasSelectedOptions: boolean;
}

const FEEDBACK_FORM_URL = "https://forms.gle/your-google-form-url-here";

export function Header({ currentPage, onNavigate, hasSelectedOptions }: HeaderProps) {
  /**
   * 피드백 폼을 새 창에서 열기 위한 핸들러
   * @returns {void}
   */
  const handleOpenFeedbackForm = () => {
    window.open(FEEDBACK_FORM_URL, '_blank', 'noopener,noreferrer');
  };

  return (
      <header className="h-16 border-b border-border bg-background flex items-center px-6">
        <div className="flex items-center justify-between w-full max-w-[1280px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <button
                onClick={() => onNavigate('input')}
                className="hover:opacity-70 transition-opacity"
            >
              <h1 className="text-foreground">StackPilot</h1>
            </button>
          </div>

          {/* Right: KPI Badges + CTAs */}
          <div className="flex items-center gap-3">
            {currentPage !== 'input' && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('input')}
                >
                  Go Back
                </Button>
            )}

            {/*<Button*/}
            {/*    variant="default"*/}
            {/*    size="sm"*/}
            {/*    onClick={() => onNavigate('adr')}*/}
            {/*    disabled={!hasSelectedOptions && currentPage !== 'adr'}*/}
            {/*>*/}
            {/*  ADR 초안*/}
            {/*</Button>*/}

            <Button
                variant="outline"
                size="sm"
                onClick={handleOpenFeedbackForm}
                className="flex items-center gap-1"
            >
              피드백 보내기
              <ExternalLink className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </header>
  );
}
