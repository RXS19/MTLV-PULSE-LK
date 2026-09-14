import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Server,
  Layers,
  Info
} from 'lucide-react';
import { ConnectionStatusInfo } from '../types.js';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  connection: ConnectionStatusInfo;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  connection,
  onRefresh,
  isRefreshing,
}) => {
  if (!isOpen) return null;

  const tables = [
    {
      name: 'Usuarios Registrados',
      verified: connection.tablesStatus?.users?.success ?? connection.tablesVerified?.users ?? false,
      error: connection.tablesStatus?.users?.error,
      desc: 'Altas y fechas de registro de clientes',
    },
    {
      name: 'Inventario de Motos',
      verified: connection.tablesStatus?.motos?.success ?? connection.tablesVerified?.motos ?? false,
      error: connection.tablesStatus?.motos?.error,
      desc: 'Catálogo de motocicletas y estados de disponibilidad',
    },
    {
      name: 'Apartados Activos',
      verified: connection.tablesStatus?.apartados?.success ?? connection.tablesVerified?.apartados ?? false,
      error: connection.tablesStatus?.apartados?.error,
      desc: 'Apartados vigentes y fechas de vigencia',
    },
    {
      name: 'Ofertas Registradas',
      verified: connection.tablesStatus?.offers?.success ?? connection.tablesVerified?.offers ?? false,
      error: connection.tablesStatus?.offers?.error,
      desc: 'Ofertas recibidas, montos y estatus',
    },
    {
      name: 'Operaciones y Entregas',
      verified: connection.tablesStatus?.operation_tracking?.success ?? connection.tablesVerified?.operation_tracking ?? false,
      error: connection.tablesStatus?.operation_tracking?.error,
      desc: 'Seguimiento de etapas operativas y entregas completadas',
    },
  ];

  return (
    <div
      id="connection-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="connection-modal"
        className="bg-[#11141a] border border-[#262c3a] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c222e] bg-[#0d1015]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800/50 flex items-center justify-center">
              <Database className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">
                ESTADO DE CONEXIÓN POSTGRESQL
              </h3>
              <p className="text-[11px] text-zinc-400">
                PULSE • Diagnóstico de Conexión de Datos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="close-connection-modal"
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1c222e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              connection.connected
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                : 'bg-red-950/30 border-red-800/40 text-red-200'
            }`}
          >
            {connection.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {connection.connected ? 'CONEXIÓN ESTABLECIDA' : 'CONEXIÓN DESCONECTADA'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-current">
                  {connection.user}
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-1">
                {connection.connected
                  ? 'Conexión activa y verificada de solo lectura con la base de datos PostgreSQL.'
                  : connection.errorMessage || 'No se ha podido conectar a PostgreSQL con el usuario pulse_readonly.'}
              </p>
              {connection.errorType && (
                <div className="mt-2 text-[11px] font-mono bg-black/50 p-2 rounded border border-red-900/50 text-red-300">
                  <strong>Diagnóstico:</strong> {connection.errorType}
                </div>
              )}
            </div>
          </div>

          {/* Connection Parameters (Safe, no passwords) */}
          <div>
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-red-500" />
              Parámetros de Conexión
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#0c0e12] border border-[#1b202a]">
                <span className="text-[10px] text-zinc-400 uppercase block">Fuente</span>
                <span className="text-zinc-200 font-semibold">{connection.source}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0c0e12] border border-[#1b202a]">
                <span className="text-[10px] text-zinc-400 uppercase block">Usuario</span>
                <span className="text-emerald-400 font-semibold">{connection.user} (Read-Only)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0c0e12] border border-[#1b202a]">
                <span className="text-[10px] text-zinc-400 uppercase block">Host</span>
                <span className="text-zinc-200 truncate block">{connection.host}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0c0e12] border border-[#1b202a]">
                <span className="text-[10px] text-zinc-400 uppercase block">Puerto / SSL</span>
                <span className="text-zinc-200">
                  {connection.port} • {connection.ssl ? 'SSL Activado' : 'Sin SSL'}
                </span>
              </div>
            </div>
          </div>

          {/* Authorized Tables Status */}
          <div>
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-red-500" />
              Módulos Autorizados de Datos
            </h4>
            <div className="space-y-1.5">
              {tables.map((tbl, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-[#0c0e12] border border-[#1b202a] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {tbl.verified ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-mono font-semibold text-zinc-200">{tbl.name}</span>
                        <span className="text-[11px] text-zinc-400 block sm:inline sm:ml-2">
                          {tbl.desc}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        tbl.verified
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          : 'bg-red-950/60 text-red-400 border border-red-800/40'
                      }`}
                    >
                      {tbl.verified ? 'Verificada' : 'Error'}
                    </span>
                  </div>
                  {tbl.error && (
                    <div className="text-[10px] font-mono text-red-300 pl-6 bg-red-950/20 p-1.5 rounded border border-red-900/30">
                      {tbl.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Security & Readonly Policy Notice */}
          <div className="p-3 rounded-lg bg-[#141822] border border-[#222838] flex items-start gap-2.5 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Estricta lectura con pulse_readonly:</strong> Todas las consultas son exclusivamente operaciones <code className="text-zinc-200">SELECT</code> sobre las 5 tablas autorizadas, sin consultar metadatos ni ejecutar operaciones de modificación (<code className="text-zinc-400">INSERT, UPDATE, DELETE, ALTER, DROP, GRANT</code>). Las credenciales se protegen en variables de entorno server-side y nunca son expuestas al navegador.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1c222e] bg-[#0d1015] flex items-center justify-between">
          <div className="text-[11px] text-zinc-400 font-mono">
            Última actualización: <strong className="text-zinc-300">{connection.lastUpdated}</strong>
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            id="modal-test-connection-btn"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Probar Conexión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
