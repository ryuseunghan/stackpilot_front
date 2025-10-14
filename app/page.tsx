'use client';

import { useState } from "react";
import { Header } from "@/components/Header";
import { SideNav } from "@/components/SideNav";
import { InputPage } from "@/components/pages/InputPage";
import { ResultsPage } from "@/components/pages/ResultsPage";
import { AdrPage } from "@/components/pages/AdrPage";
import { LoadingPage } from "@/components/pages/LoadingPage";
import { AnalysisResult } from "@/services/openai";

type Page = 'input' | 'results' | 'adr';

export default function Home() {
    const [currentPage, setCurrentPage] = useState<Page>('input');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

    // 분석 결과 처리 핸들러
    const handleAnalyzeComplete = (result?: AnalysisResult) => {
        if (result) {
            setAnalysisResult(result);
            setCurrentPage('results');
        }
        setIsLoading(false);
    };

    // 옵션 추가/제거 핸들러
    const handleAddOption = (optionId: string) => {
        if (selectedOptions.includes(optionId)) {
            setSelectedOptions(selectedOptions.filter(id => id !== optionId));
        } else {
            setSelectedOptions([...selectedOptions, optionId]);
        }
    };

    const shouldShowSideNav = currentPage === 'input';

    return (
        <div className="size-full flex flex-col bg-background">
            {isLoading ? (
                <LoadingPage />
            ) : (
                <>
                    <Header
                        currentPage={currentPage}
                        onNavigate={setCurrentPage}
                        hasSelectedOptions={selectedOptions.length > 0}
                    />
                    <div className="flex flex-1 overflow-hidden">
                        {shouldShowSideNav && (
                            <SideNav currentPage={currentPage} />
                        )}
                        <main className="flex-1 overflow-auto">
                            {currentPage === 'input' && (
                                <InputPage
                                    onAnalyze={handleAnalyzeComplete}
                                    onLoading={setIsLoading}
                                />
                            )}
                            {currentPage === 'results' && analysisResult && (
                                <ResultsPage
                                    selectedOptions={selectedOptions}
                                    onAddOption={handleAddOption}
                                    options={analysisResult.options}
                                />
                            )}
                            {currentPage === 'adr' && (
                                <AdrPage selectedOptions={selectedOptions} />
                            )}
                        </main>
                    </div>
                </>
            )}
        </div>
    );
}