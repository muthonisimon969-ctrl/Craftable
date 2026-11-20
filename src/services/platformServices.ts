// Modular integration contracts for Zuno AI platform capabilities.
// Exposes honest connection state without faking unconfigured services.

export interface IntegrationModuleStatus {
  id: 'ai_engine' | 'project_storage' | 'auth' | 'credits';
  title: string;
  state: 'connected' | 'local' | 'unconfigured' | 'standby';
  summary: string;
  endpointOrDriver: string;
}

export interface AuthSessionAdapter {
  getMode: () => 'guest_local' | 'authenticated';
  getUserLabel: () => string;
}

export interface CreditLedgerAdapter {
  isEnforced: () => boolean;
  getPolicyLabel: () => string;
}

export const defaultAuthAdapter: AuthSessionAdapter = {
  getMode: () => 'guest_local',
  getUserLabel: () => 'Local Workspace User',
};

export const defaultCreditAdapter: CreditLedgerAdapter = {
  isEnforced: () => false,
  getPolicyLabel: () => 'Owner-managed API quota (no credit billing backend connected)',
};

export function getPlatformArchitectureStatus(isServerAiReady: boolean): IntegrationModuleStatus[] {
  return [
    {
      id: 'ai_engine',
      title: 'Zuno AI Server Gateway',
      state: isServerAiReady ? 'connected' : 'unconfigured',
      summary: isServerAiReady
        ? 'Connected via server-only /api/craft gateway with key rotation & multimodal support.'
        : 'Server keys not configured yet. Owners can add keys in Admin Control (/admin).',
      endpointOrDriver: 'POST /api/craft',
    },
    {
      id: 'project_storage',
      title: 'Project & Asset Storage',
      state: 'local',
      summary:
        'Projects, conversations, and created visuals persist locally in IndexedDB with localStorage fallback.',
      endpointOrDriver: 'IndexedDB (craftable_studio_db)',
    },
    {
      id: 'auth',
      title: 'User Authentication Hook',
      state: 'standby',
      summary:
        'Structured AuthSessionAdapter ready for OAuth / account login when multi-user sync is enabled. Owner /admin uses signed HttpOnly cookies.',
      endpointOrDriver: 'AuthSessionAdapter + /api/admin',
    },
    {
      id: 'credits',
      title: 'Credit & Usage Ledger Hook',
      state: 'standby',
      summary:
        'CreditLedgerAdapter interface prepared for per-user usage accounting without fake credit balances.',
      endpointOrDriver: 'CreditLedgerAdapter',
    },
  ];
}
