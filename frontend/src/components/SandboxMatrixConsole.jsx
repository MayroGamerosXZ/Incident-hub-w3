import React, { useEffect, useRef } from 'react';

export default function SandboxMatrixConsole({
  currentUser,
  azureStatus,
  notificationsData,
  stats,
  onOpenNewModal,
  onSimulateFailure,
  onTriggerAzureSync,
  onSendTestEmail,
  isAdmin
}) {
  const typewriterRef = useRef(null);

  useEffect(() => {
    const sequences = [
      'npm test --suite=api.test.js --quality-gate=strict',
      'az pipelines run --project incident-hub --branch main',
      'smtp_tls_dispatch --to=mbarriosg8@miumg.edu.gt --port=465',
      'verify_traceability --boards="AB#4..AB#34" --vulns=0'
    ];
    let sequenceIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timeout;

    const tick = () => {
      const el = typewriterRef.current;
      if (!el) return;

      const current = sequences[sequenceIndex];

      if (!deleting) {
        characterIndex += 1;
        el.textContent = current.slice(0, characterIndex);
        if (characterIndex >= current.length) {
          deleting = true;
          timeout = window.setTimeout(tick, 1800);
          return;
        }
        timeout = window.setTimeout(tick, 75);
      } else {
        characterIndex -= 1;
        el.textContent = current.slice(0, Math.max(characterIndex, 0));
        if (characterIndex <= 0) {
          deleting = false;
          sequenceIndex = (sequenceIndex + 1) % sequences.length;
        }
        timeout = window.setTimeout(tick, deleting ? 35 : 110);
      }
    };

    timeout = window.setTimeout(tick, 700);
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, []);

  const latestBuild = azureStatus?.latestBuild || {};
  const isFailed = (latestBuild.result || '').toLowerCase() === 'failed';

  return (
    <section
      id="enclave-console"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '24px',
        marginBottom: '28px',
        alignItems: 'stretch'
      }}
    >
      {/* COLUMNA IZQUIERDA: THE ENCLAVE ARCHITECTURE HERO */}
      <div
        className="isometric-card"
        style={{
          backgroundColor: '#11161b',
          border: '1px solid #222c37',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid #222c37',
            backgroundColor: '#080b0e',
            padding: '6px 14px',
            marginBottom: '18px'
          }}>
            <span style={{ color: '#ffb03a', fontSize: '12px' }}>✦</span>
            <span className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#cbd5e1' }}>
              Enclosed DevOps Sandbox // AB#4 - AB#34
            </span>
          </div>

          <h2 style={{
            fontSize: '34px',
            fontWeight: 700,
            lineHeight: 1.12,
            color: '#ffffff',
            marginBottom: '14px'
          }}>
            Operate Deep Inside <br />
            <span className="text-gradient-matrix font-mono">
              The Incident Matrix.
            </span>
          </h2>

          <p style={{
            fontSize: '14px',
            fontWeight: 300,
            lineHeight: 1.65,
            color: '#94a3b8',
            marginBottom: '22px'
          }}>
            Cámara de ejecución aislada para control de incidentes TI, sincronizada en tiempo real con <strong style={{ color: '#e2e8f0' }}>Azure DevOps Pipelines ({azureStatus?.selfHostedAgent?.name || 'mayro-local-agent'})</strong> y despacho automático TLS hacia <strong style={{ color: '#ffb03a' }}>{notificationsData?.recipient || 'mbarriosg8@miumg.edu.gt'}</strong>.
          </p>
        </div>

        <div>
          {/* 4 PILARES DE TELEMETRIA DEL ENCLAVE */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '14px',
            marginBottom: '22px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(34, 44, 55, 0.7)'
          }}>
            <div style={{ borderLeft: '2px solid #38bdf8', paddingLeft: '12px' }}>
              <div className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                8 / 8 PASS
              </div>
              <div style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                Unit Test Suite
              </div>
            </div>

            <div style={{ borderLeft: '2px solid #ffb03a', paddingLeft: '12px' }}>
              <div className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                0 VULNS
              </div>
              <div style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                Security Audit
              </div>
            </div>

            <div style={{ borderLeft: '2px solid #00f0ff', paddingLeft: '12px' }}>
              <div className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                TLS :465
              </div>
              <div style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                SMTP Gmail UMG
              </div>
            </div>
          </div>

          {/* BOTONES TACTILES KEYCAP */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              type="button"
              onClick={onOpenNewModal}
              className="btn-cyan keycap-glow"
              style={{ padding: '12px 20px' }}
            >
              ➕ Initialize Incident
            </button>
            <a
              href="#incidents-table"
              className="btn-blue"
              style={{ padding: '12px 18px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              Review Active Queue ↓
            </a>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: INTERACTIVE SANDBOX MATRIX TERMINAL */}
      <div
        className="isometric-card"
        style={{
          backgroundColor: '#080b0e',
          border: isFailed ? '1px solid rgba(239, 68, 68, 0.65)' : '1px solid #222c37',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden'
        }}
      >
        {/* BARRA SUPERIOR DE TERMINAL */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #222c37',
          backgroundColor: '#11161b',
          padding: '11px 16px',
          userSelect: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '999px', backgroundColor: 'rgba(239, 68, 68, 0.5)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '999px', backgroundColor: 'rgba(234, 179, 8, 0.5)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '999px', backgroundColor: 'rgba(34, 197, 94, 0.5)' }} />
            <span className="font-mono" style={{ marginLeft: '8px', fontSize: '11.5px', color: '#64748b' }}>
              enclave_devops_kernel_v4.sh
            </span>
          </div>
          <span className="font-mono" style={{ fontSize: '10px', color: '#ffb03a', letterSpacing: '0.1em' }}>
            TTY // {currentUser?.role || 'OPERATOR'}
          </span>
        </div>

        {/* CUERPO DE LA CONSOLA */}
        <div
          className="font-mono"
          style={{
            padding: '20px',
            fontSize: '12.5px',
            lineHeight: 1.65,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            flex: 1
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: '#38bdf8' }}>{currentUser?.initials?.toLowerCase() || 'op'}@umg-nexus:~$</span>
            <span style={{ color: '#cbd5e1' }}>init --container=incident_hub_enclave --role={currentUser?.role}</span>
          </div>

          <div style={{ color: '#64748b', fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div>[ OK ] Mounting Azure Self-Hosted Agent ({azureStatus?.selfHostedAgent?.name || 'mayro-local-agent'})...</div>
            <div>[ OK ] Binding SMTP TLS 465 notification array ({notificationsData?.total_sent || 0} alerts dispatched)...</div>
            <div>[ OK ] Enforcing RBAC Matrix for {currentUser?.email} ({currentUser?.specialty || currentUser?.role})...</div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#38bdf8' }}>{currentUser?.initials?.toLowerCase() || 'op'}@umg-nexus:~$</span>
            <span style={{ color: '#cbd5e1' }}>cat telemetry_snapshot.log</span>
          </div>

          <div style={{
            border: isFailed ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(34, 44, 55, 0.9)',
            backgroundColor: 'rgba(22, 29, 36, 0.65)',
            padding: '12px 14px',
            color: isFailed ? '#f87171' : '#ffb03a',
            fontSize: '11.5px',
            lineHeight: 1.55
          }}>
            &quot;PIPELINE: {latestBuild.buildNumber || 'Build #12'} [{(latestBuild.result || 'SUCCEEDED').toUpperCase()}] &bull; ACTIVE INCIDENTS: {stats?.abiertos ?? 0} OPEN / {stats?.criticos ?? 0} CRITICAL &bull; GMAIL TARGET: {notificationsData?.recipient || 'mbarriosg8@miumg.edu.gt'}&quot;
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
            <span style={{ color: '#38bdf8' }}>{currentUser?.initials?.toLowerCase() || 'op'}@umg-nexus:~$</span>
            <span ref={typewriterRef} className="cursor-blink" style={{ color: '#ffffff' }} />
          </div>
        </div>

        {/* BARRA INFERIOR DE MACROS FISICAS (KEY BINDINGS) */}
        <div style={{
          borderTop: '1px solid #222c37',
          backgroundColor: '#11161b',
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <span className="font-mono" style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            MATRIX KEY BINDINGS:
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onSendTestEmail}
              className="btn-amber"
              style={{ padding: '5px 10px', fontSize: '10px' }}
            >
              [M1] Test Gmail
            </button>
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={onSimulateFailure}
                  className="btn-red"
                  style={{ padding: '5px 10px', fontSize: '10px' }}
                >
                  [M2] Fallo CI ❌
                </button>
                <button
                  type="button"
                  onClick={onTriggerAzureSync}
                  className="btn-cyan"
                  style={{ padding: '5px 10px', fontSize: '10px' }}
                >
                  [M3] Fix CI ✅
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
