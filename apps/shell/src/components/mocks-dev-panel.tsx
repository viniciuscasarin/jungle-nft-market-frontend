import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Badge,
} from '@nft/shared-ui';
import {
  SCENARIO_IDS,
  scenarioRegistry,
  type ScenarioId,
  applyScenario,
  getMockDatabase,
  resetMockDatabase,
  getNetworkProfile,
  getClock,
} from '@nft/mocks-core';

export function MocksDevPanel(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId>('default');
  const [dbState, setDbState] = useState(() => getMockDatabase());

  const refreshState = useCallback(() => {
    const current = getMockDatabase();
    setDbState({ ...current });
    setSelectedScenario(current.scenarioId as ScenarioId);
  }, []);

  useEffect(() => {
    refreshState();

    // Check ?mocks-panel=1
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('mocks-panel') === '1') {
        setIsOpen(true);
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refreshState]);

  const handleApplyScenario = () => {
    applyScenario(selectedScenario);
    refreshState();
  };

  const handleReset = () => {
    resetMockDatabase();
    refreshState();
  };

  const handleExpireSession = () => {
    const db = getMockDatabase();
    for (const session of db.sessions) {
      session.expiresAt = new Date(Date.now() - 1000).toISOString();
    }
    refreshState();
  };

  const handleAdvanceClock1Hour = () => {
    getClock().advance(3600000);
    refreshState();
  };

  const activeDef = scenarioRegistry[selectedScenario] ?? scenarioRegistry.default;
  const activeProfile = getNetworkProfile();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        aria-describedby="mocks-panel-description"
        className="max-w-2xl max-h-[85vh] overflow-y-auto bg-surface-card border-border-default text-text-primary p-6"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-heading-20 font-bold flex items-center gap-2">
              🛠️ Mocks Dev Panel
            </DialogTitle>
            <div className="flex gap-2">
              {dbState.metadata.persistenceDegraded && (
                <Badge variant="warning">Memória Pura (Storage Degradado)</Badge>
              )}
              <Badge variant="outline">v{dbState.version}</Badge>
            </div>
          </div>
          <DialogDescription id="mocks-panel-description" className="text-caption-12 text-text-secondary">
            Controle de cenários de teste, injeção de rede e simulação temporal (Atalho:{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-border-default font-mono">
              Ctrl+Alt+M
            </kbd>
            )
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Scenario Selector */}
          <div className="space-y-2">
            <label htmlFor="scenario-select" className="text-body-14 font-medium block">
              Cenário Ativo
            </label>
            <select
              id="scenario-select"
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value as ScenarioId)}
              className="w-full bg-surface-raised border border-border-default rounded-md px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {SCENARIO_IDS.map((id) => (
                <option key={id} value={id}>
                  {scenarioRegistry[id]?.name ?? id}
                </option>
              ))}
            </select>
            <p className="text-caption-12 text-text-muted mt-1">
              {activeDef.description}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <span className="text-body-14 font-medium block">Ações Rápidas</span>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleApplyScenario}>
                Aplicar Cenário
              </Button>
              <Button size="sm" variant="outline" onClick={handleReset}>
                Reset Integral
              </Button>
              <Button size="sm" variant="outline" onClick={handleExpireSession}>
                Expirar Sessão
              </Button>
              <Button size="sm" variant="outline" onClick={handleAdvanceClock1Hour}>
                Avançar Relógio (+1h)
              </Button>
            </div>
          </div>

          {/* Diagnostics and Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-raised p-3 rounded-lg border border-border-default text-caption-12">
            <div>
              <span className="text-text-muted block">NFTs</span>
              <span className="font-semibold text-body-14">{dbState.nfts.length}</span>
            </div>
            <div>
              <span className="text-text-muted block">Pedidos</span>
              <span className="font-semibold text-body-14">{dbState.orders.length}</span>
            </div>
            <div>
              <span className="text-text-muted block">Sessões</span>
              <span className="font-semibold text-body-14">{dbState.sessions.length}</span>
            </div>
            <div>
              <span className="text-text-muted block">Regras de Rede</span>
              <span className="font-semibold text-body-14">{activeProfile.rules.length}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center sm:justify-between border-t border-border-default pt-4">
          <span className="text-tiny-10 text-text-muted font-mono">
            Relógio: {getClock().toISOString()}
          </span>
          <Button variant="secondary" size="sm" onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MocksDevPanel;
