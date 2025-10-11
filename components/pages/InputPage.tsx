import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface Endpoint {
  id: string;
  name: string;
  avgRps: string;
  peakRps: string;
  p50: string;
  p95: string;
}

interface ExternalIntegration {
  id: string;
  name: string;
  criticality: string;
  callType: string;
  timeout: string;
  retries: string;
  idempotencyKey: string;
}

interface DatabaseEnvironment {
  id: string;
  database: string;
  version: string;
  cloud: string;
}

export function InputPage({ onAnalyze }: { onAnalyze: () => void }) {
  const [isValid, setIsValid] = useState(true);
  const [ignoreLoad, setIgnoreLoad] = useState(false);
  const [stepType, setStepType] = useState<'new' | 'refactoring'>('refactoring');
  const [considerations, setConsiderations] = useState<{ id: string; value: string }[]>([
    { id: '1', value: '' }
  ]);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([
    { id: '1', name: '매칭 신청', avgRps: '120', peakRps: '450', p50: '800', p95: '1500' },
    { id: '2', name: '매칭 수락', avgRps: '80', peakRps: '300', p50: '1200', p95: '2400' },
  ]);
  const [externals, setExternals] = useState<ExternalIntegration[]>([
    { id: '1', name: 'sms_provider', criticality: 'non-critical', callType: 'sync', timeout: '1000', retries: '1', idempotencyKey: 'matchRequestId' },
    { id: '2', name: 'recommendation_api', criticality: 'non-critical', callType: 'sync', timeout: '800', retries: '0', idempotencyKey: '' },
  ]);
  const [databases, setDatabases] = useState<DatabaseEnvironment[]>([
    { id: '1', database: 'mysql', version: '8.0', cloud: 'aws-ec2' },
  ]);

  useEffect(() => {
    // Auto-save simulation
    const timer = setTimeout(() => {
      toast.success('자동 저장 완료');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const addEndpoint = () => {
    setEndpoints([...endpoints, { 
      id: Date.now().toString(), 
      name: '', 
      avgRps: '', 
      peakRps: '', 
      p50: '', 
      p95: '' 
    }]);
  };

  const removeEndpoint = (id: string) => {
    setEndpoints(endpoints.filter(e => e.id !== id));
  };

  const addExternal = () => {
    setExternals([...externals, { 
      id: Date.now().toString(), 
      name: '', 
      criticality: 'non-critical', 
      callType: 'sync', 
      timeout: '', 
      retries: '0', 
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
      cloud: 'aws-ec2' 
    }]);
  };

  const removeDatabase = (id: string) => {
    if (databases.length > 1) {
      setDatabases(databases.filter(d => d.id !== id));
    }
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
            <RadioGroup defaultValue="monolithic">
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
                    <Select defaultValue={db.database}>
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
                    <Input defaultValue={db.version} />
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
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="current-state">현재 기능 상태(as-is) *</Label>
                <Textarea 
                  id="current-state" 
                  defaultValue="매칭 신청 API가 SMS 전송을 동기로 처리하여 p95 응답시간이 1500ms"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desired-state">희망 개선 사항(to-be) *</Label>
                <Textarea 
                  id="desired-state" 
                  defaultValue="SMS 발송을 비동기로 분리하여 p95 응답시간 800ms 이하로 개선"
                  rows={2}
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
                  defaultValue={index === 0 && stepType === 'refactoring' ? '외부 SMS API 실패 시에도 매칭은 성공 처리되어야 함' : ''}
                  rows={1}
                  className="flex-1"
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
                <Input defaultValue={external.name} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>중요도</Label>
                  <Select defaultValue={external.criticality}>
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
                  <Select defaultValue={external.callType}>
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
                <Input defaultValue={external.idempotencyKey} placeholder="API에 대한 설명을 입력하세요" />
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
                  onClick={onAnalyze}
                  disabled={!isValid}
                >
                  Analyze
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
