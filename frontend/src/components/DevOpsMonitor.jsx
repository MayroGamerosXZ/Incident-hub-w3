import React, { useState } from 'react';

export default function DevOpsMonitor({
  azureStatus,
  notificationsData,
  onTriggerAzureSync,
  onSendTestEmail,
  onSaveSmtpConfig,
  syncingAzure,
  sendingEmail
}) {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [appPassInput, setAppPassInput] = useState('');
  const [recipientInput, setRecipientInput] = useState(
    notificationsData?.recipient || 'mbarriosg8@miumg.edu.gt'
  );

  if (!azureStatus || !notificationsData) return null;

  const latest = azureStatus.latestBuild || {};
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
    <section style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
      gap: '16px',
      marginBottom: '20px'
    }}>
      {/* PANEL 1: MONITOR AZURE DEVOPS & PROCESOS DE SUBIDA (BLUE-CODED) */}
      <div style={{
        backgroundColor: '#141414',
        border: '1px solid #2E2E2E',
        borderLeft: '4px solid #2563EB',
        borderRadius: '4px',
        padding: '16px 20px',
        boxShadow: '0 0 12px rgba(37, 99, 235, 0.18)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          paddingBottom: '10px',
          borderBottom: '1px solid #2E2E2E',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            <h3 style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: '17px',
              color: '#60A5FA',
              letterSpacing: '0.8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>☁️</span> MONITOR AZURE DEVOPS &amp; SUBIDAS CI/CD
            </h3>
            <div style={{ fontSize: '11px', color: '#A3A3A3', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
              Org: {azureStatus.organization} / {azureStatus.project} ({azureStatus.boardsSummary?.range})
            </div>
          </div>

          <button
            type="button"
            onClick={onTriggerAzureSync}
            disabled={syncingAzure}
            className="btn-blue"
            style={{ padding: '6px 12px', fontSize: '11px' }}
          >
            {syncingAzure ? '⏳ Sincronizando...' : '🔄 Verificar Subida en Azure'}
          </button>
        </div>

        {/* Estado del último Build y Agente */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px',
          marginBottom: '12px',
          backgroundColor: '#0A0A0A',
          padding: '10px 12px',
          borderRadius: '4px',
          border: '1px solid #2E2E2E'
        }}>
          <div>
            <div style={{ fontSize: '10px', color: '#A3A3A3', textTransform: 'uppercase', fontWeight: '700' }}>Último Pipeline</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12.5px', color: '#4ADE80', fontWeight: '700', marginTop: '2px' }}>
              ✅ {latest.buildNumber} ({latest.result?.toUpperCase()})
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#A3A3A3', textTransform: 'uppercase', fontWeight: '700' }}>Self-Hosted Agent</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#FFFFFF', marginTop: '2px' }}>
              🟢 {azureStatus.selfHostedAgent?.name}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#A3A3A3', textTransform: 'uppercase', fontWeight: '700' }}>Rama / Commit / Artefacto</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11.5px', color: '#60A5FA', marginTop: '2px' }}>
              {latest.branch} @ {latest.commit} &bull; 📦 v1.0.0
            </div>
          </div>
        </div>

        {/* Historial reciente de ejecuciones */}
        <div style={{ fontSize: '11px', color: '#A3A3A3', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
          Historial Reciente de Subidas y Pipelines:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '130px', overflowY: 'auto' }}>
          {azureStatus.builds && azureStatus.builds.slice(0, 4).map((b) => (
            <div
              key={b.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#0A0A0A',
                padding: '6px 10px',
                borderRadius: '2px',
                borderLeft: b.result === 'succeeded' ? '3px solid #22C55E' : '3px solid #DC2626',
                fontSize: '12px'
              }}
            >
              <div>
                <strong style={{ fontFamily: 'JetBrains Mono, monospace', color: b.result === 'succeeded' ? '#4ADE80' : '#F87171' }}>
                  {b.buildNumber}
                </strong>
                <span style={{ color: '#D4D4D4', marginLeft: '8px' }}>
                  {b.branch} ({b.commit})
                </span>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#A3A3A3' }}>
                {b.duration} &bull; {b.result === 'succeeded' ? 'PASSED' : 'FAILED'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PANEL 2: NOTIFICACIONES DE CORREO GMAIL / UMG (RED-CODED) */}
      <div style={{
        backgroundColor: '#141414',
        border: '1px solid #2E2E2E',
        borderLeft: '4px solid #DC2626',
        borderRadius: '4px',
        padding: '16px 20px',
        boxShadow: '0 0 12px rgba(220, 38, 38, 0.18)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          paddingBottom: '10px',
          borderBottom: '1px solid #2E2E2E',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            <h3 style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: '17px',
              color: '#F87171',
              letterSpacing: '0.8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>📧</span> ALERTAS AUTOMÁTICAS GMAIL ({notificationsData.recipient})
            </h3>
            <div style={{ fontSize: '11px', color: '#A3A3A3', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
              Estado: <span style={{ color: '#4ADE80', fontWeight: '700' }}>ACTIVO ({notificationsData.total_sent} alertas enviadas)</span>
              {notificationsData.smtp_configured ? ' • SMTP TLS Directo' : ' • Bandeja verificada + Relay'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setShowSmtpModal(true)}
              style={{
                backgroundColor: '#0A0A0A',
                color: '#A3A3A3',
                border: '1px solid #2E2E2E',
                borderRadius: '4px',
                padding: '6px 10px',
                fontSize: '11px',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600'
              }}
              title="Configurar Contraseña de Aplicación Google SMTP"
            >
              ⚙️ SMTP
            </button>
            <button
              type="button"
              onClick={onSendTestEmail}
              disabled={sendingEmail}
              className="btn-red"
              style={{ padding: '6px 12px', fontSize: '11px' }}
            >
              {sendingEmail ? '⏳ Enviando...' : '📨 Probar Alerta al Correo'}
            </button>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: '#A3A3A3', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
          Bandeja de Salida en Tiempo Real hacia {notificationsData.recipient}:
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '195px', overflowY: 'auto' }}>
          {notifications.slice(0, 6).map((n) => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#0A0A0A',
                padding: '8px 10px',
                borderRadius: '2px',
                borderLeft: n.priority === 'CRITICA' ? '3px solid #DC2626' : '3px solid #2563EB',
                fontSize: '12px',
                gap: '8px'
              }}
            >
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px',
                  color: '#4ADE80',
                  marginRight: '6px',
                  fontWeight: '700'
                }}>
                  [ENVIADO]
                </span>
                <span style={{ color: '#F5F5F5', fontWeight: '500' }}>{n.subject}</span>
                <div style={{ fontSize: '10.5px', color: '#737373', fontFamily: 'JetBrains Mono, monospace' }}>
                  Para: {n.to} &bull; {new Date(n.timestamp).toLocaleTimeString()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEmail(n)}
                className="btn-blue"
                style={{ padding: '4px 8px', fontSize: '10px', whiteSpace: 'nowrap' }}
              >
                👁️ Ver Correo
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
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 200
        }}>
          <div style={{
            backgroundColor: '#141414',
            border: '1px solid #2E2E2E',
            borderTop: '3px solid #DC2626',
            borderRadius: '4px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '20px',
            boxShadow: '0 0 24px rgba(220, 38, 38, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #2E2E2E', paddingBottom: '10px', marginBottom: '12px' }}>
              <div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#4ADE80', fontWeight: '700' }}>
                  ✅ NOTIFICACIÓN DESPACHADA ({selectedEmail.transport})
                </span>
                <h3 style={{ fontFamily: 'Anton, sans-serif', fontSize: '19px', color: '#FFFFFF', marginTop: '4px' }}>
                  {selectedEmail.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                style={{ background: 'none', border: 'none', color: '#A3A3A3', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{
              backgroundColor: '#0A0A0A',
              border: '1px solid #2E2E2E',
              padding: '10px 12px',
              borderRadius: '4px',
              marginBottom: '14px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              <div><strong style={{ color: '#A3A3A3' }}>De:</strong> <span style={{ color: '#F5F5F5' }}>{selectedEmail.from}</span></div>
              <div><strong style={{ color: '#A3A3A3' }}>Para:</strong> <span style={{ color: '#60A5FA', fontWeight: '700' }}>{selectedEmail.to}</span></div>
              <div><strong style={{ color: '#A3A3A3' }}>Fecha:</strong> <span style={{ color: '#D4D4D4' }}>{new Date(selectedEmail.timestamp).toLocaleString()}</span></div>
            </div>

            <div
              style={{ border: '1px solid #2E2E2E', borderRadius: '4px', overflow: 'hidden' }}
              dangerouslySetInnerHTML={{ __html: selectedEmail.html_preview }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                className="btn-red"
                style={{ padding: '8px 18px', fontSize: '12px' }}
              >
                Cerrar Vista de Correo
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
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 200
        }}>
          <div style={{
            backgroundColor: '#141414',
            border: '1px solid #2E2E2E',
            borderTop: '3px solid #2563EB',
            borderRadius: '4px',
            maxWidth: '480px',
            width: '100%',
            padding: '20px'
          }}>
            <h3 style={{ fontFamily: 'Anton, sans-serif', fontSize: '18px', color: '#FFFFFF', marginBottom: '8px' }}>
              ⚙️ CONFIGURACIÓN DE CORREO GMAIL / UMG (REGLA 9)
            </h3>
            <p style={{ fontSize: '12px', color: '#A3A3A3', marginBottom: '14px' }}>
              El correo destinatario predeterminado es <strong>mbarriosg8@miumg.edu.gt</strong>. Si deseas envío SMTP TLS directo a tu bandeja externa además de la bandeja en vivo, ingresa tu Contraseña de Aplicación de Google (16 caracteres) o defínela en <code>backend/.env</code>.
            </p>
            <form onSubmit={handleConfigSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#A3A3A3', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Correo Destinatario / Remitente
                </label>
                <input
                  type="email"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#0A0A0A', border: '1px solid #2E2E2E', borderRadius: '4px', padding: '8px 10px', color: '#FFF', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#A3A3A3', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Google App Password (16 caracteres - Opcional)
                </label>
                <input
                  type="password"
                  placeholder="xxxx xxxx xxxx xxxx"
                  value={appPassInput}
                  onChange={(e) => setAppPassInput(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#0A0A0A', border: '1px solid #2E2E2E', borderRadius: '4px', padding: '8px 10px', color: '#FFF', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowSmtpModal(false)}
                  style={{ backgroundColor: 'transparent', border: '1px solid #2E2E2E', color: '#A3A3A3', padding: '7px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-blue" style={{ padding: '7px 16px', fontSize: '12px' }}>
                  Guardar Configuración
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
