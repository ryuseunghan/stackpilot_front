'use client';

import {useState} from "react";
import {Header} from "@/components/Header";
import {SideNav} from "@/components/SideNav";
import {InputPage} from "@/components/pages/InputPage";
import {ResultsPage} from "@/components/pages/ResultsPage";
import {AdrPage} from "@/components/pages/AdrPage";

type Page = 'input' | 'results' | 'adr';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('input');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  return (
      <div className="size-full flex flex-col bg-background">
        <Header
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            hasSelectedOptions={selectedOptions.length > 0}
        />
        <div className="flex flex-1 overflow-hidden">
          {currentPage !== 'adr' && (
              <SideNav currentPage={currentPage} />
          )}
          <main className="flex-1 overflow-auto">
            {currentPage === 'input' && (
                <InputPage onAnalyze={() => setCurrentPage('results')} />
            )}
            {currentPage === 'results' && (
                <ResultsPage
                    selectedOptions={selectedOptions}
                    onAddOption={(optionId) => setSelectedOptions([...selectedOptions, optionId])}
                />
            )}
            {currentPage === 'adr' && (
                <AdrPage selectedOptions={selectedOptions} />
            )}
          </main>
        </div>
      </div>
  );
}
