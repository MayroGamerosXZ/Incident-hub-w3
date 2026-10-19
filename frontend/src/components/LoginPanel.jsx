import React, { useState, useMemo } from 'react';

const DEFAULT_TEAM = [
  { id: 1, name: 'Mayro Gameros (DevOps Lead)', email: 'mbarriosg8@miumg.edu.gt', role: 'ADMIN', specialty: 'GLOBAL / DEVOPS CI-CD', defaultCategory: '', initials: 'MG', accessCode: 'ADMIN-2026' },
  { id: 2, name: 'Carlos Mendoza (Especialista Redes)', email: 'cmendoza@miumg.edu.gt', role: 'TECHNICIAN', specialty: 'INFRAESTRUCTURA DE RED', defaultCategory: 'NETWORK', initials: 'CM', accessCode: 'TECH-2026' },
  { id: 3, name: 'Sofia Gomez (Analista Seguridad)', email: 'sgomez@miumg.edu.gt', role: 'TECHNICIAN', specialty: 'CIBERSEGURIDAD & VPN', defaultCategory: 'SECURITY', initials: 'SG', accessCode: 'TECH-2026' },
  { id: 4, name: 'Diego Ramirez (Arquitecto BD/SW)', email: 'dramirez@miumg.edu.gt', role: 'TECHNICIAN', specialty: 'SOFTWARE & BASE DE DATOS', defaultCategory: 'SOFTWARE', initials: 'DR', accessCode: 'TECH-2026' },
  { id: 5, name: 'Laura Torres (Soporte Hardware)', email: 'ltorres@miumg.edu.gt', role: 'TECHNICIAN', specialty: 'HARDWARE & EQUIPOS', defaultCategory: 'HARDWARE', initials: 'LT', accessCode: 'TECH-2026' },
  { id: 6, name: 'Andres Morales (Gestión Accesos)', email: 'amorales@miumg.edu.gt', role: 'TECHNICIAN', specialty: 'DIRECTORIO ACTIVO & IAM', defaultCategory: 'ACCESS', initials: 'AM', accessCode: 'TECH-2026' }
];

export default function LoginPanel({ users = [], onLoginSuccess }) {
  const teamList = users.length > 0 ? users : DEFAULT_TEAM;
  const [email, setEmail] = useState('mbarriosg8@miumg.edu.gt');
  const [accessCode, setAccessCode] = useState('ADMIN-2026');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const particles = useMemo(
    () => [
      { left: '14%', size: 3, duration: '4.5s', delay: '0s' },
      { left: '39%', size: 2, duration: '3.8s', delay: '1.2s' },
      { left: '67%', size: 4, duration: '5.2s', delay: '2.4s' },
      { left: '83%', size: 2.5, duration: '4.2s', delay: '0.7s' },
      { left: '58%', size: 2, duration: '4.9s', delay: '3.1s' }
    ],
    []
  );

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onLoginSuccess({ email, accessCode });
    } catch (err) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickSelect = async (user) => {
    setError('');
    setEmail(user.email);
    setAccessCode(user.accessCode || (user.role === 'ADMIN' ? 'ADMIN-2026' : 'TECH-2026'));
    setSubmitting(true);
    try {
      await onLoginSuccess({
        userId: user.id,
        email: user.email,
        accessCode: user.accessCode || 'UMG-2026'
      });
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: '#080b0e',
    border: '1px solid #222c37',
    padding: '12px 14px',
    color: '#ffffff',
    fontSize: '12.5px',
    fontFamily: 'JetBrains Mono, monospace',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease'
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#080b0e',
      color: '#e2e8f0',
      position: 'relative',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* CAPA DE FONDO CORE // ENTER: TERMINAL GRID + AMBIENT LAMP + PARTICULAS */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div className="terminal-grid" style={{ position: 'absolute', inset: 0 }} />
        <div
          className="ambient-lamp"
          style={{
            position: 'absolute',
            left: '10%',
            top: '15%',
            width: '50vw',
            height: '50vw',
            borderRadius: '9999px',
            filter: 'blur(64px)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '-5%',
            bottom: '10%',
            width: '40vw',
            height: '40vw',
            borderRadius: '9999px',
            backgroundColor: 'rgba(56, 189, 248, 0.05)',
            filter: 'blur(120px)'
          }}
        />
        {particles.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: p.duration,
              animationDelay: p.delay
            }}
          />
        ))}
      </div>

      {/* NAVBAR SUPERIOR CORE // ENTER */}
      <nav style={{
        position: 'relative',
        zIndex: 20,
        borderBottom: '1px solid #222c37',
        backgroundColor: 'rgba(8, 11, 14, 0.88)',
        backdropFilter: 'blur(12px)',
        padding: '18px 32px'
      }}>
        <div style={{ maxWidth: '1220px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div className="font-mono" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: 700, letterSpacing: '0.1em', color: '#ffffff' }}>
            <span style={{ position: 'relative', display: 'inline-flex', width: '9px', height: '9px' }}>
              <span className="ping-dot" style={{ position: 'absolute', inset: 0, borderRadius: '9999px', backgroundColor: '#00f0ff', opacity: 0.75 }} />
              <span style={{ position: 'relative', display: 'inline-flex', width: '9px', height: '9px', borderRadius: '9999px', backgroundColor: '#00f0ff' }} />
            </span>
            CORE // INCIDENT HUB
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="font-mono" style={{
              border: '1px solid #222c37',
              backgroundColor: '#11161b',
              padding: '5px 12px',
              fontSize: '10.5px',
              color: '#ffb03a',
              letterSpacing: '0.1em'
            }}>
              LNKS // SECURE (0 VULNS)
            </span>
            <span className="font-mono" style={{
              border: '1px solid rgba(56, 189, 248, 0.35)',
              backgroundColor: '#11161b',
              padding: '5px 12px',
              fontSize: '10.5px',
              color: '#38bdf8',
              letterSpacing: '0.1em'
            }}>
              AZURE BOARDS: AB#4 - AB#34
            </span>
          </div>
        </div>
      </nav>

      {/* CUERPO PRINCIPAL DEL LOGIN */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1220px',
        width: '100%',
        margin: '0 auto',
        padding: '36px 28px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {/* ENCABEZADO HERO */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid #222c37',
            backgroundColor: 'rgba(17, 22, 27, 0.85)',
            padding: '6px 14px',
            marginBottom: '14px'
          }}>
            <span style={{ color: '#ffb03a' }}>●</span>
            <span className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#cbd5e1' }}>
              Enclosed RBAC Authentication Matrix
            </span>
          </div>

          <h1 style={{ fontSize: '42px', fontWeight: 700, lineHeight: 1.1, color: '#ffffff', marginBottom: '10px' }}>
            Step Inside <span className="text-gradient-matrix font-mono">The Operations Enclave.</span>
          </h1>
          <p style={{ maxWidth: '680px', fontSize: '14.5px', fontWeight: 300, color: '#94a3b8', lineHeight: 1.6 }}>
            Selecciona un nodo de operador a la derecha con 1 clic o autentícate manualmente. Cada cápsula de usuario adapta los permisos de Azure DevOps CI/CD, alertas Gmail (<span className="font-mono" style={{ color: '#ffb03a' }}>mbarriosg8@miumg.edu.gt</span>) y colas de incidentes.
          </p>
        </div>

        {/* GRID DE 2 COLUMNAS: CONSOLA DE LOGIN + NODOS DE OPERADOR */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* COLUMNA IZQUIERDA: CONSOLA DE AUTENTICACIÓN MANUAL */}
          <div
            className="isometric-card"
            style={{
              backgroundColor: '#11161b',
              border: '1px solid #222c37',
              padding: '28px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #222c37', paddingBottom: '12px' }}>
              <div>
                <span className="font-mono" style={{ fontSize: '10.5px', color: '#ffb03a', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block' }}>
                  TERMINAL AUTH // TTY-0
                </span>
                <h2 style={{ fontSize: '21px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                  Credenciales del Operador
                </h2>
              </div>
              <span className="font-mono" style={{ fontSize: '11px', color: '#38bdf8' }}>[RBAC v4]</span>
            </div>

            {error && (
              <div className="font-mono" style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid #ef4444',
                color: '#f87171',
                padding: '10px 12px',
                fontSize: '11.5px',
                marginBottom: '16px'
              }}>
                [ERR_AUTH]: {error}
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="font-mono" style={{ display: 'block', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', marginBottom: '6px' }}>
                  Correo Institucional (Operator ID)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mbarriosg8@miumg.edu.gt"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="font-mono" style={{ display: 'block', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', marginBottom: '6px' }}>
                  Enclave Access Key
                </label>
                <input
                  type="password"
                  required
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="ADMIN-2026 o TECH-2026"
                  style={inputStyle}
                />
                <div className="font-mono" style={{ fontSize: '10.5px', color: '#64748b', marginTop: '6px' }}>
                  Keys: Admin = <span style={{ color: '#ffb03a' }}>ADMIN-2026</span> // Técnicos = <span style={{ color: '#38bdf8' }}>TECH-2026</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-cyan keycap-glow"
                style={{ padding: '14px', width: '100%', marginTop: '4px' }}
              >
                {submitting ? 'INITIALIZING SESSION...' : 'INITIALIZE TERMINAL SESSION →'}
              </button>
            </form>

            <div className="font-mono" style={{
              marginTop: '22px',
              paddingTop: '14px',
              borderTop: '1px solid #222c37',
              fontSize: '11px',
              color: '#64748b',
              lineHeight: 1.6
            }}>
              <div><span style={{ color: '#ffb03a' }}>[ADMIN NODE]</span> Control total de Pipeline CI/CD (Fallo ❌ / Solución ✅), SMTP TLS y vista global.</div>
              <div style={{ marginTop: '4px' }}><span style={{ color: '#38bdf8' }}>[TECH NODES]</span> Cápsula aislada por especialidad con filtro automático de casos asignados.</div>
            </div>
          </div>

          {/* COLUMNA DERECHA: NODOS CONFIGURADOS (1 CLIC) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
              <div>
                <span className="font-mono" style={{ fontSize: '10.5px', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block' }}>
                  CONFIGURED OPERATOR NODES
                </span>
                <h2 style={{ fontSize: '21px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                  Acceso Rápido por Rol (1 Clic)
                </h2>
              </div>
              <span className="font-mono" style={{ fontSize: '11px', color: '#64748b' }}>6 ACTIVE CAPSULES</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {teamList.map((u, idx) => {
                const isAdmin = u.role === 'ADMIN';
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickSelect(u)}
                    className="isometric-card"
                    style={{
                      backgroundColor: '#161d24',
                      border: isAdmin ? '1px solid rgba(255, 176, 58, 0.55)' : '1px solid #222c37',
                      padding: '16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <div className="font-mono" style={{
                        width: '38px',
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isAdmin ? '1px solid rgba(255, 176, 58, 0.5)' : '1px solid rgba(56, 189, 248, 0.35)',
                        backgroundColor: isAdmin ? 'rgba(255, 176, 58, 0.12)' : 'rgba(56, 189, 248, 0.1)',
                        color: isAdmin ? '#ffb03a' : '#38bdf8',
                        fontSize: '13px',
                        fontWeight: 700
                      }}>
                        {u.initials || 'OP'}
                      </div>
                      <span className="font-mono" style={{ fontSize: '10px', color: isAdmin ? '#ffb03a' : '#64748b' }}>
                        0{idx + 1} / {isAdmin ? 'ADMIN NODE' : 'TECH NODE'}
                      </span>
                    </div>

                    <div>
                      <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#ffffff', marginBottom: '3px' }}>
                        {u.name}
                      </div>
                      <div className="font-mono" style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {u.email}
                      </div>
                    </div>

                    <div className="font-mono" style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: isAdmin ? '#ffb03a' : '#38bdf8',
                      borderTop: '1px solid rgba(34, 44, 55, 0.8)',
                      paddingTop: '8px',
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>{u.specialty || u.role}</span>
                      <span>ENTER →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER CORE // ENTER */}
      <footer className="font-mono" style={{
        position: 'relative',
        zIndex: 10,
        borderTop: '1px solid rgba(34, 44, 55, 0.5)',
        backgroundColor: '#11161b',
        padding: '14px 32px',
        fontSize: '10.5px',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <span>© 2026 CORE // IT INCIDENT HUB. SANDBOX VERIFIED.</span>
        <span>ALERT TARGET: mbarriosg8@miumg.edu.gt // TLS 465</span>
      </footer>
    </div>
  );
}
