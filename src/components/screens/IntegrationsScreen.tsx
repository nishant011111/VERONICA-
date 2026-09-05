import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Link as LinkIcon, Cloud, Mail, Calendar, ShieldAlert, CheckCircle, Github } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const IntegrationsScreen: React.FC = () => {
  const { integrations, updateIntegration, addActivityEvent } = useApp();
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = (id: string, name: string) => {
    setConnecting(id);
    // Simulate connection delay
    setTimeout(() => {
      updateIntegration(id, { status: 'connected', accountEmail: 'user@example.com' });
      addActivityEvent({
        type: 'system',
        title: 'Integration Connected',
        description: `Successfully connected ${name} to your Veronica ecosystem.`
      });
      setConnecting(null);
    }, 1500);
  };

  const handleDisconnect = (id: string, name: string) => {
    if (confirm(`Are you sure you want to disconnect ${name}? This will revoke Veronica's access.`)) {
      updateIntegration(id, { status: 'disconnected', accountEmail: undefined });
      addActivityEvent({
        type: 'system',
        title: 'Integration Disconnected',
        description: `Disconnected ${name} from your Veronica ecosystem.`
      });
    }
  };

  const getProviderInfo = (provider: string) => {
    switch(provider) {
      case 'google_drive': 
        return { icon: <Cloud className="w-5 h-5 text-emerald-500" />, name: 'Google Drive', desc: 'Sync files and attachments' };
      case 'google_calendar': 
        return { icon: <Calendar className="w-5 h-5 text-blue-500" />, name: 'Google Calendar', desc: 'Sync timetable and deadlines' };
      case 'github': 
        return { icon: <Github className="w-5 h-5 text-slate-800 dark:text-white" />, name: 'GitHub', desc: 'Link academic repositories' };
      default: 
        return { icon: <LinkIcon className="w-5 h-5" />, name: provider, desc: '' };
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <LinkIcon className="w-6 h-6 text-indigo-500" />
            Integration Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connect Veronica to your external apps and services securely
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map(integration => {
          const info = getProviderInfo(integration.provider);
          return (
            <Card key={integration.id} glass className="p-5 border border-slate-200 dark:border-slate-800 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{info.name}</h3>
                    <p className="text-[10px] text-slate-500">{info.desc}</p>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-6 flex-1">
                {integration.status === 'connected' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Connected as {integration.accountEmail}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      Veronica has limited read/write access.
                    </div>
                  </div>
                ) : (
                  <p>Connect this service to extend your ecosystem capabilities securely. No data is shared without permission.</p>
                )}
              </div>
              
              {integration.status === 'connected' ? (
                <Button 
                  variant="outline" 
                  className="w-full text-xs font-semibold py-2 text-rose-500 border-rose-500/20 hover:bg-rose-500/10"
                  onClick={() => handleDisconnect(integration.id, info.name)}
                >
                  Disconnect
                </Button>
              ) : (
                <Button 
                  variant="secondary" 
                  className="w-full text-xs font-semibold py-2"
                  onClick={() => handleConnect(integration.id, info.name)}
                  disabled={connecting === integration.id}
                >
                  {connecting === integration.id ? 'Connecting...' : `Connect ${info.name}`}
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
