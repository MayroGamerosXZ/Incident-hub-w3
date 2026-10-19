import React, { useState } from 'react';

export default function DevOpsMonitor({
  azureStatus,
  notificationsData,
  onTriggerAzureSync,
  onSimulateFailure,
  onSendTestEmail,
  onSaveSmtpConfig,
  syncingAzure,
  simulatingFailure,
  sendingEmail,
  isAdmin = true
}) {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [appPassInput, setAppPassInput] = useState('');
  const [recipientInput, setRecipientInput] = useState(
    notificationsData?.recipient || 'mbarriosg8@miumg.edu.gt'
  );

  if (!azureStatus || !notificationsData) return null;

  const latest = azureStatus.latestBuild || {};
  const isLatestFailed = (latest.result || '').toLowerCase() === 'failed';
  const notifications = notificationsData.notifications || [];

  const handleConfigSubmit = (e) => {
    e.preventDefault();
    onSaveSmtpConfig({
      recipient: recipientInput,
      user: recipientInput,
      appPassword: appPassInput
    });
    setShowSmtpModal(false);
  };

  return (
    <section
      id="devops"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}
    >
      {/* PANEL 1: MONITOR AZURE DEVOPS & PROCESOS DE SUBIDA */}
      <div
        className="isometric-card"
        style={{
          backgroundColor: '#161d24',
          border: '1px solid #222c37',
          borderLeft: isLatestFailed ? '3px solid #ef4444' : '3px solid #38bdf8',
          padding: '22px'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          paddingBottom: '12px',
          borderBottom: '1px solid #222c37',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            <span className="font-mono" style={{ fontSize: '10px', color: isLatestFailed ? '#f87171' : '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.14em', display: 'block' }}>
              CI/CD PIPELINE ENCLAVE // {azureStatus.boardsSummary?.range}
            </span>
            <h3 style={{
              fontSize: '19px',
              fontWeight: 700,
              color: '#ffffff',
              marginTop: '2px'
            }}>
              Azure DevOps &amp; Self-Hosted Agent
            </h3>
            <div className="font-mono" style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              Org: {azureStatus.organization} / {azureStatus.project}
            </div>
          </div>

          {isAdmin ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={onSimulateFailure}
                disabled={simulatingFailure || syncingAzure}
                className="btn-red"
                style={{ padding: '8px 12px', fontSize: '10.5px' }}
                title="Simula el Fallo Controlado en el Pipeline (ROJO) y envía alerta a Gmail"
              >
                {simulatingFailure ? '⏳ Fallando...' : '💥 Simular Fallo CI'}
              </button>
              <button
                type="button"
                onClick={onTriggerAzureSync}
                disabled={syncingAzure || simulatingFailure}
                className="btn-cyan"
                style={{ padding: '8px 12px', fontSize: '10.5px' }}
                title="Aplica el Fix / Solución en el Pipeline (VERDE) y envía alerta a Gmail"
              >
                {syncingAzure ? '⏳ Restaurando...' : '🔧 Disparar Solución / Fix'}
              </button>
            </div>
          ) : (
            <span className="font-mono" style={{
              backgroundColor: '#080b0e',
              border: '1px solid #222c37',
              color: '#94a3b8',
              fontSize: '10px',
              padding: '5px 10px'
            }}>
              🔒 CONTROL PIPELINE: SOLO ADMIN
            </span>
          )}
        </div>

        {/* Estado del último Build y Agente */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
          gap: '10px',
          marginBottom: '14px',
          backgroundColor: '#080b0e',
          padding: '12px 14px',
          border: isLatestFailed ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid #222c37'
        }}>
          <div>
            <div className="font-mono" style={{ fontSize: '9.5px', color: '#64748b', textTransform: 'uppercase' }}>Último Pipeline</div>
            <div className="font-mono" style={{
              fontSize: '12px',
              color: isLatestFailed ? '#f87171' : '#4ade80',
              fontWeight: 700,
              marginTop: '3px'
            }}>
              {isLatestFailed ? '❌' : '✅'} {latest.buildNumber} ({latest.result?.toUpperCase()})
            </div>
          </div>
          <div>
            <div className="font-mono" style={{ fontSize: '9.5px', color: '#64748b', textTransform: 'uppercase' }}>Self-Hosted Agent</div>
            <div className="font-mono" style={{ fontSize: '12px', color: '#00f0ff', marginTop: '3px' }}>
              ● {azureStatus.selfHostedAgent?.name}
            </div>
          </div>
          <div>
            <div className="font-mono" style={{ fontSize: '9.5px', color: '#64748b', textTransform: 'uppercase' }}>Rama / Commit</div>
            <div className="font-mono" style={{ fontSize: '11.5px', color: '#ffb03a', marginTop: '3px' }}>
              {latest.branch} @ {latest.commit}
            </div>
          </div>
        </div>

        {/* Historial reciente de ejecuciones */}
        <div className="font-mono" style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>
          PIPELINE EXECUTION MATRIX:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '135px', overflowY: 'auto' }}>
          {azureStatus.builds && azureStatus.builds.slice(0, 4).map((b) => (
            <div
              key={b.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#080b0e',
                padding: '7px 12px',
                borderLeft: b.result === 'succeeded' ? '2px solid #22c55e' : '2px solid #ef4444',
                borderTop: '1px solid rgba(34, 44, 55, 0.45)',
                borderRight: '1px solid rgba(34, 44, 55, 0.45)',
                borderBottom: '1px solid rgba(34, 44, 55, 0.45)',
                fontSize: '12px'
              }}
            >
              <div>
                <strong className="font-mono" style={{ color: b.result === 'succeeded' ? '#4ade80' : '#f87171', fontSize: '11.5px' }}>
                  {b.buildNumber}
                </strong>
                <span className="font-mono" style={{ color: '#cbd5e1', marginLeft: '8px', fontSize: '11px' }}>
                  {b.branch} ({b.commit})
                </span>
              </div>
              <div className="font-mono" style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                {b.duration} // {b.result === 'succeeded' ? 'PASSED' : 'FAILED'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PANEL 2: NOTIFICACIONES DE CORREO GMAIL / UMG */}
      <div
        className="isometric-card"
        style={{
          backgroundColor: '#161d24',
          border: '1px solid #222c37',
          borderLeft: '3px solid #ffb03a',
          padding: '22px'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          paddingBottom: '12px',
          borderBottom: '1px solid #222c37',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            <span className="font-mono" style={{ fontSize: '10px', color: '#ffb03a', textTransform: 'uppercase', letterSpacing: '0.14em', display: 'block' }}>
              SMTP TLS 465 RELAY // GOOGLE WORKSPACE UMG
            </span>
            <h3 style={{
              fontSize: '19px',
              fontWeight: 700,
              color: '#ffffff',
              marginTop: '2px'
            }}>
              Alertas Gmail ({notificationsData.recipient})
            </h3>
            <div className="font-mono" style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              Estado: <span style={{ color: '#4ade80', fontWeight: 700 }}>ACTIVO ({notificationsData.total_sent} alertas)</span>
              {notificationsData.smtp_configured ? ' • TLS Directo' : ' • Bandeja Verificada'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowSmtpModal(true)}
                className="btn-blue"
                style={{ padding: '7px 10px', fontSize: '10.5px' }}
                title="Configurar Contraseña de Aplicación Google SMTP"
              >
                ⚙️ SMTP
              </button>
            )}
            <button
              type="button"
              onClick={onSendTestEmail}
              disabled={sendingEmail}
              className="btn-amber"
              style={{ padding: '7px 12px', fontSize: '10.5px' }}
            >
              {sendingEmail ? '⏳ Enviando...' : '📨 Probar Alerta'}
            </button>
          </div>
        </div>

        <div className="font-mono" style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>
          OUTBOUND TELEMETRY LOG ({notificationsData.recipient}):
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '195px', overflowY: 'auto' }}>
          {notifications.slice(0, 6).map((n) => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#080b0e',
                padding: '8px 12px',
                borderLeft: n.priority === 'CRITICA' ? '2px solid #ef4444' : '2px solid #38bdf8',
                borderTop: '1px solid rgba(34, 44, 55, 0.45)',
                borderRight: '1px solid rgba(34, 44, 55, 0.45)',
                borderBottom: '1px solid rgba(34, 44, 55, 0.45)',
                fontSize: '12px',
                gap: '8px'
              }}
            >
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                <span className="font-mono" style={{
                  fontSize: '10px',
                  color: '#00f0ff',
                  marginRight: '6px',
                  fontWeight: 700
                }}>
                  [SENT]
                </span>
                <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{n.subject}</span>
                <div className="font-mono" style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  To: {n.to} // {new Date(n.timestamp).toLocaleTimeString()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEmail(n)}
                className="btn-blue"
                style={{ padding: '5px 10px', fontSize: '10px', whiteSpace: 'nowrap' }}
              >
                👁️ Inspect
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL PREVIEW DEL CORREO ENVIADO */}
      {selectedEmail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(8, 11, 14, 0.88)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 200
        }}>
          <div style={{
            backgroundColor: '#11161b',
            border: '1px solid #222c37',
            borderTop: '3px solid #00f0ff',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #222c37', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <span className="font-mono" style={{ fontSize: '10.5px', color: '#4ade80', fontWeight: 700 }}>
                  [OK] TELEMETRY DISPATCHED ({selectedEmail.transport})
                </span>
                <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                  {selectedEmail.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div className="font-mono" style={{
              backgroundColor: '#080b0e',
              border: '1px solid #222c37',
              padding: '10px 14px',
              marginBottom: '14px',
              fontSize: '11.5px'
            }}>
              <div><strong style={{ color: '#64748b' }}>FROM:</strong> <span style={{ color: '#e2e8f0' }}>{selectedEmail.from}</span></div>
              <div><strong style={{ color: '#64748b' }}>TO:</strong> <span style={{ color: '#00f0ff', fontWeight: 700 }}>{selectedEmail.to}</span></div>
              <div><strong style={{ color: '#64748b' }}>TIMESTAMP:</strong> <span style={{ color: '#ffb03a' }}>{new Date(selectedEmail.timestamp).toLocaleString()}</span></div>
            </div>

            <div
              style={{ border: '1px solid #222c37', overflow: 'hidden' }}
              dangerouslySetInnerHTML={{ __html: selectedEmail.html_preview }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                className="btn-cyan"
                style={{ padding: '9px 18px', fontSize: '11px' }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURACION OPCIONAL DE APP PASSWORD SMTP */}
      {showSmtpModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(8, 11, 14, 0.88)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 200
        }}>
          <div style={{
            backgroundColor: '#11161b',
            border: '1px solid #222c37',
            borderTop: '3px solid #ffb03a',
            maxWidth: '480px',
            width: '100%',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              ⚙️ SMTP TLS 465 Configuration (Regla 9)
            </h3>
            <p style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '14px', lineHeight: 1.5 }}>
              El correo destinatario predeterminado es <strong style={{ color: '#ffb03a' }}>mbarriosg8@miumg.edu.gt</strong>. Las credenciales residen de forma segura en <code>backend/.env</code> (ignorado por Git).
            </p>
            <form onSubmit={handleConfigSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="font-mono" style={{ display: 'block', fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Correo Destinatario / Remitente
                </label>
                <input
                  type="email"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#080b0e', border: '1px solid #222c37', padding: '10px', color: '#fff', fontSize: '12.5px', fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>
              <div>
                <label className="font-mono" style={{ display: 'block', fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Google App Password (16 caracteres)
                </label>
                <input
                  type="password"
                  placeholder="xxxx xxxx xxxx xxxx"
                  value={appPassInput}
                  onChange={(e) => setAppPassInput(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#080b0e', border: '1px solid #222c37', padding: '10px', color: '#fff', fontSize: '12.5px', fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowSmtpModal(false)}
                  className="btn-blue"
                  style={{ padding: '8px 14px' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-cyan" style={{ padding: '8px 16px' }}>
                  Save Matrix Config
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
