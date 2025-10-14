import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { analyzeWithOpenAI, AnalysisRequest, AnalysisResult } from '@/services/openai';

interface ExternalIntegration {
  id: string;
  name: string;
  criticality: string;
  callType: string;
  idempotencyKey: string;
}

interface DatabaseEnvironment {
  id: string;
  database: string;
  version: string;
}

export function InputPage({ onAnalyze }: { onAnalyze: (result?: AnalysisResult) => void }) {
  const [isValid, setIsValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [stepType, setStepType] = useState<'new' | 'refactoring'>('refactoring');
  const [considerations, setConsiderations] = useState<{ id: string; value: string }[]>([
    { id: '1', value: '외부 SMS API 실패 시에도 매칭은 성공 처리되어야 함' }
  ]);
  const [externals, setExternals] = useState<ExternalIntegration[]>([
    { id: '1', name: 'sms_provider', criticality: 'non-critical', callType: 'sync', idempotencyKey: '매칭된 각 회원들에게 sms를 전송하는 외부 api' },
    { id: '2', name: 'recommendation_api', criticality: 'non-critical', callType: 'sync', idempotencyKey: 'db 상에 있는 회원들 중 이상형 데이터와 가장 유사한 회원을 추천해주는 api' },
  ]);
  const [databases, setDatabases] = useState<DatabaseEnvironment[]>([
    { id: '1', database: 'mysql', version: '8.0' },
  ]);

  // 폼 요소에 대한 참조 생성
  const frameworkRef = useRef<HTMLSelectElement>(null);
  const versionRef = useRef<HTMLInputElement>(null);
  const languageRef = useRef<HTMLSelectElement>(null);
  const runtimeRef = useRef<HTMLInputElement>(null);
  const architectureRef = useRef<HTMLElement>(null);
  const cloudRef = useRef<HTMLSelectElement>(null);
  const featureSummaryRef = useRef<HTMLTextAreaElement>(null);
  const currentStateRef = useRef<HTMLTextAreaElement>(null);
  const desiredStateRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-save simulation
    const timer = setTimeout(() => {
      toast.success('자동 저장 완료');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const addExternal = () => {
    setExternals([...externals, {
      id: Date.now().toString(),
      name: '',
      criticality: 'non-critical',
      callType: 'sync',
      idempotencyKey: ''
    }]);
  };

  const removeExternal = (id: string) => {
    setExternals(externals.filter(e => e.id !== id));
  };

  const addConsideration = () => {
    setConsiderations([...considerations, { id: Date.now().toString(), value: '' }]);
  };

  const removeConsideration = (id: string) => {
    if (considerations.length > 1) {
      setConsiderations(considerations.filter(c => c.id !== id));
    }
  };

  const addDatabase = () => {
    setDatabases([...databases, {
      id: Date.now().toString(),
      database: 'mysql',
      version: '',
    }]);
  };

  const removeDatabase = (id: string) => {
    if (databases.length > 1) {
      setDatabases(databases.filter(d => d.id !== id));
    }
  };

  /**
   * 폼 데이터를 수집하여 분석 요청 객체를 생성합니다.
   */
  const collectFormData = (): AnalysisRequest => {
    // DOM에서 현재 선택된 값들 가져오기
    const framework = document.getElementById('framework') as HTMLSelectElement;
    const version = document.getElementById('version') as HTMLInputElement;
    const language = document.getElementById('language') as HTMLSelectElement;
    const runtime = document.getElementById('runtime') as HTMLInputElement;
    const cloud = document.getElementById('cloud') as HTMLSelectElement;

    // 아키텍처 값 가져오기 (라디오 버튼)
    const architectureRadios = document.querySelectorAll('input[type="radio"][name="architecture"]');
    let architectureValue = 'monolithic'; // 기본값
    architectureRadios.forEach((radio: Element) => {
      if ((radio as HTMLInputElement).checked) {
        architectureValue = (radio as HTMLInputElement).value;
      }
    });

    // 데이터베이스 정보 수집
    const dbData = databases.map(db => ({
      database: db.database,
      version: db.version,
    }));

    // 고려사항 수집 (텍스트 영역에서 값 가져오기)
    const considerationValues = considerations.map(c => {
      const textarea = document.querySelector(`textarea[data-consideration-id="${c.id}"]`) as HTMLTextAreaElement;
      return textarea ? textarea.value : c.value || '';
    }).filter(Boolean);

    // 외부 연동 정보 수집
    const externalData = externals.map(ext => ({
      name: ext.name,
      criticality: ext.criticality,
      callType: ext.callType,
      description: ext.idempotencyKey // API 설명으로 사용
    }));

    // 스텝 타입에 따른 필드 수집
    let goalData: AnalysisRequest['goal'];

    if (stepType === 'new') {
      const featureSummary = document.getElementById('feature-summary') as HTMLTextAreaElement;
      goalData = {
        stepType: 'new',
        featureSummary: featureSummary?.value || '',
        considerations: considerationValues
      };
    } else {
      const currentState = document.getElementById('current-state') as HTMLTextAreaElement;
      const desiredState = document.getElementById('desired-state') as HTMLTextAreaElement;
      goalData = {
        stepType: 'refactoring',
        currentState: currentState?.value || '',
        desiredState: desiredState?.value || '',
        considerations: considerationValues
      };
    }
    return {
      environment: {
        framework: framework?.value || 'spring-boot',
        version: version?.value || '2.7.1',
        language: language?.value || 'java',
        runtime: runtime?.value || '11',
        architecture: architectureValue,
        cloud: cloud?.value || 'aws-ec2',
        databases: dbData
      },
      goal: goalData,
      externalIntegrations: externalData
    };
  };

  /**
   * Analyze 버튼 클릭 시 실행되는 함수
   */
  const handleAnalyzeClick = async () => {
    try {
      setIsLoading(true);

      // 폼 데이터 수집
      const formData = collectFormData();

      // 데이터 유효성 검사
      if (!validateFormData(formData)) {
        setIsValid(false);
        toast.error('필수 입력값을 모두 입력해주세요');
        return;
      }

      // OpenAI API 호출
      const result = await analyzeWithOpenAI(formData);

      // 분석 완료 후 콜백 실행
      toast.success('분석이 완료되었습니다');
      onAnalyze(result);
    } catch (error) {
      console.error('분석 중 오류 발생:', error);
      toast.error('분석 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 폼 데이터의 유효성을 검사합니다.
   */
  const validateFormData = (data: AnalysisRequest): boolean => {
    // 필수 환경 정보 검사
    if (!data.environment.framework ||
        !data.environment.version ||
        !data.environment.language ||
        !data.environment.runtime) {
      return false;
    }

    // 데이터베이스 정보 검사
    if (data.environment.databases.length === 0 ||
        !data.environment.databases[0].database) {
      return false;
    }

    // 스텝 타입에 따른 필수 필드 검사
    if (data.goal.stepType === 'new') {
      if (!data.goal.featureSummary) return false;
    } else {
      if (!data.goal.currentState || !data.goal.desiredState) return false;
    }

    return true;
  };

  return (
      <div className="max-w-[960px] mx-auto p-8 pb-32">
        {/* Section 01: 프로젝트 환경 */}
        <section id="env" className="mb-12 scroll-mt-8">
          <h2 className="mb-6 pb-3 border-b border-border">01) 프로젝트 환경</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="framework">프레임워크 *</Label>
                <Select defaultValue="spring-boot">
                  <SelectTrigger id="framework">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spring-boot">Spring Boot</SelectItem>
                    <SelectItem value="django">Django</SelectItem>
                    <SelectItem value="express">Express</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">버전 *</Label>
                <Input id="version" defaultValue="2.7.x" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">언어 *</Label>
                <Select defaultValue="java">
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="kotlin">Kotlin</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="runtime">런타임 *</Label>
                <Input id="runtime" defaultValue="11" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>아키텍처 *</Label>
              <RadioGroup defaultValue="monolithic" name="architecture">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monolithic" id="arch-mono" />
                  <Label htmlFor="arch-mono" className="cursor-pointer">모놀리식</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="modular" id="arch-mod" />
                  <Label htmlFor="arch-mod" className="cursor-pointer">모듈러</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="microservices" id="arch-micro" />
                  <Label htmlFor="arch-micro" className="cursor-pointer">마이크로서비스</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cloud">클라우드 환경 *</Label>
              <Select defaultValue="aws-ec2">
                <SelectTrigger id="cloud">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aws-ec2">AWS EC2</SelectItem>
                  <SelectItem value="aws-ecs">AWS ECS</SelectItem>
                  <SelectItem value="gcp">GCP</SelectItem>
                  <SelectItem value="azure">Azure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>데이터베이스</Label>
              {databases.map((db, index) => (
                  <div key={db.id} className="p-4 border border-border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">데이터베이스 {index + 1}</span>
                      {databases.length > 1 && (
                          <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDatabase(db.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>데이터베이스 *</Label>
                        <Select
                            defaultValue={db.database}
                            onValueChange={(value) => {
                              const updatedDatabases = [...databases];
                              const index = updatedDatabases.findIndex(d => d.id === db.id);
                              if (index !== -1) {
                                updatedDatabases[index] = { ...updatedDatabases[index], database: value };
                                setDatabases(updatedDatabases);
                              }
                            }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mysql">MySQL</SelectItem>
                            <SelectItem value="postgresql">PostgreSQL</SelectItem>
                            <SelectItem value="mongodb">MongoDB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>버전 *</Label>
                        <Input
                            defaultValue={db.version}
                            onChange={(e) => {
                              const updatedDatabases = [...databases];
                              const index = updatedDatabases.findIndex(d => d.id === db.id);
                              if (index !== -1) {
                                updatedDatabases[index] = { ...updatedDatabases[index], version: e.target.value };
                                setDatabases(updatedDatabases);
                              }
                            }}
                        />
                      </div>
                    </div>
                  </div>
              ))}

              <Button variant="outline" size="sm" onClick={addDatabase}>
                <Plus className="h-4 w-4 mr-2" />
                데이터베이스 추가
              </Button>
            </div>
          </div>
        </section>

        {/* Section 02: 기능 변경/목표 */}
        <section id="goal" className="mb-12 scroll-mt-8">
          <h2 className="mb-6 pb-3 border-b border-border">02) 기능 변경/목표</h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>스텝 *</Label>
              <RadioGroup value={stepType} onValueChange={(value) => setStepType(value as 'new' | 'refactoring')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="step-new" />
                  <Label htmlFor="step-new" className="cursor-pointer">신규</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="refactoring" id="step-refactor" />
                  <Label htmlFor="step-refactor" className="cursor-pointer">리팩토링</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Conditional fields based on step type */}
            {stepType === 'new' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="feature-summary">기능 요약 *</Label>
                    <Textarea
                        id="feature-summary"
                        placeholder="신규 기능에 대한 설명을 입력하세요"
                        rows={2}
                        ref={featureSummaryRef}
                    />
                  </div>
                </>
            ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="current-state">현재 기능 상태(as-is) *</Label>
                    <Textarea
                        id="current-state"
                        defaultValue="매칭 신청 API가 외부 API인 SMS 전송 API를 동기로 처리하여 시간 소요가 크며, SMS 전송 실패 시 매칭 신청까지 실패 됨"
                        rows={2}
                        ref={currentStateRef}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desired-state">희망 개선 사항(to-be) *</Label>
                    <Textarea
                        id="desired-state"
                        defaultValue="매칭 신청 API의 속도를 개선하고, SMS 전송이 실패하더라도 매칭 신청 API는 성공 되게끔 개선"
                        rows={2}
                        ref={desiredStateRef}
                    />
                  </div>
                </>
            )}

            {/* Considerations - repeatable for both types */}
            <div className="space-y-4">
              <Label>고려사항</Label>
              {considerations.map((consideration, index) => (
                  <div key={consideration.id} className="flex gap-2 items-start">
                    <Textarea
                        placeholder="고려사항을 입력하세요"
                        defaultValue={consideration.value}
                        rows={1}
                        className="flex-1"
                        data-consideration-id={consideration.id}
                        onChange={(e) => {
                          const updatedConsiderations = [...considerations];
                          const index = updatedConsiderations.findIndex(c => c.id === consideration.id);
                          if (index !== -1) {
                            updatedConsiderations[index] = { ...updatedConsiderations[index], value: e.target.value };
                            setConsiderations(updatedConsiderations);
                          }
                        }}
                    />
                    {considerations.length > 1 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeConsideration(consideration.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                  </div>
              ))}
              <Button variant="outline" size="sm" onClick={addConsideration}>
                <Plus className="h-4 w-4 mr-2" />
                고려사항 추가
              </Button>
            </div>
          </div>
        </section>

        {/* Section 03: 외부 연동 */}
        <section id="external" className="mb-12 scroll-mt-8">
          <h2 className="mb-6 pb-3 border-b border-border">03) 외부 연동</h2>

          <div className="space-y-4">
            {externals.map((external, index) => (
                <div key={external.id} className="p-4 border border-border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">외부 연동 {index + 1}</span>
                    {externals.length > 1 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExternal(external.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>이름</Label>
                    <Input
                        defaultValue={external.name}
                        onChange={(e) => {
                          const updatedExternals = [...externals];
                          const index = updatedExternals.findIndex(ext => ext.id === external.id);
                          if (index !== -1) {
                            updatedExternals[index] = { ...updatedExternals[index], name: e.target.value };
                            setExternals(updatedExternals);
                          }
                        }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>중요도</Label>
                      <Select
                          defaultValue={external.criticality}
                          onValueChange={(value) => {
                            const updatedExternals = [...externals];
                            const index = updatedExternals.findIndex(ext => ext.id === external.id);
                            if (index !== -1) {
                              updatedExternals[index] = { ...updatedExternals[index], criticality: value };
                              setExternals(updatedExternals);
                            }
                          }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">치명</SelectItem>
                          <SelectItem value="non-critical">비치명</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>호출 방식</Label>
                      <Select
                          defaultValue={external.callType}
                          onValueChange={(value) => {
                            const updatedExternals = [...externals];
                            const index = updatedExternals.findIndex(ext => ext.id === external.id);
                            if (index !== -1) {
                              updatedExternals[index] = { ...updatedExternals[index], callType: value };
                              setExternals(updatedExternals);
                            }
                          }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sync">동기</SelectItem>
                          <SelectItem value="async">비동기</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>API 설명</Label>
                    <Input
                        defaultValue={external.idempotencyKey}
                        placeholder="API에 대한 설명을 입력하세요"
                        onChange={(e) => {
                          const updatedExternals = [...externals];
                          const index = updatedExternals.findIndex(ext => ext.id === external.id);
                          if (index !== -1) {
                            updatedExternals[index] = { ...updatedExternals[index], idempotencyKey: e.target.value };
                            setExternals(updatedExternals);
                          }
                        }}
                    />
                  </div>
                </div>
            ))}

            <Button variant="outline" size="sm" onClick={addExternal}>
              <Plus className="h-4 w-4 mr-2" />
              외부 연동 추가
            </Button>
          </div>
        </section>

        {/* Fixed CTA at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
          <div className="max-w-[960px] mx-auto flex justify-end">
            <TooltipProvider>
              <Tooltip open={!isValid ? undefined : false}>
                <TooltipTrigger asChild>
                  <Button
                      size="lg"
                      onClick={handleAnalyzeClick}
                      disabled={!isValid || isLoading}
                  >
                    {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          분석 중...
                        </>
                    ) : (
                        "Analyze"
                    )}
                  </Button>
                </TooltipTrigger>
                {!isValid && (
                    <TooltipContent>
                      <p>필수 입력값을 모두 입력해주세요</p>
                    </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
  );
}