import { Button } from './ui/button';

interface HeaderProps {
  currentPage: 'input' | 'results' | 'adr';
  onNavigate: (page: 'input' | 'results' | 'adr') => void;
  hasSelectedOptions: boolean;
}

export function Header({ currentPage, onNavigate, hasSelectedOptions }: HeaderProps) {
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

          <Button 
            variant="default" 
            size="sm"
            onClick={() => onNavigate('adr')}
            disabled={!hasSelectedOptions && currentPage !== 'adr'}
          >
            ADR 초안
          </Button>
        </div>
      </div>
    </header>
  );
}
