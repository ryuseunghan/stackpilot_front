interface SideNavProps {
  currentPage: 'input' | 'results' | 'adr';
}

const sections = [
  { id: 'env', label: '1) 프로젝트 환경' },
  { id: 'goal', label: '2) 기능 변경/목표' },
  { id: 'external', label: '3) 외부 연동' },
];

export function SideNav({ currentPage }: SideNavProps) {
  const handleScroll = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className="w-64 border-r border-border bg-background overflow-auto">
      <nav className="p-4 space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => handleScroll(section.id)}
            className="w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors text-foreground"
          >
            {section.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
