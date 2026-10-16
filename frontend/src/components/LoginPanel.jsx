import React, { useState } from 'react';

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
    backgroundColor: '#0A0A0A',
    border: '1px solid #2E2E2E',
    borderRadius: '4px',
    padding: '10px 12px',
    color: '#F5F5F5',
    fontSize: '13px',
    fontFamily: 'JetBrains Mono, monospace',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0A0A0A',
      color: '#F5F5F5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '980px',
        width: '100%',
        backgroundColor: '#141414',
        border: '1px solid #2E2E2E',
        borderTop: '4px solid #DC2626',
        borderRadius: '4px',
        boxShadow: '0 0 35px rgba(220, 38, 38, 0.25)',
        overflow: 'hidden'
      }}>
        {/* CABECERA SUPERIOR */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid #2E2E2E',
          backgroundColor: '#0E0E0E',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#141414',
              border: '1px solid #DC2626',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Anton, sans-serif',
              fontSize: '20px',
              color: '#DC2626',
              boxShadow: '0 0 10px rgba(220, 38, 38, 0.4)'
            }}>
              IH
            </div>
            <div>
              <h1 style={{ fontFamily: 'Anton, sans-serif', fontSize: '24px', color: '#FFFFFF', letterSpacing: '0.8px', margin: 0 }}>
                IT INCIDENT HUB — CONTROL DE ACCESO POR ROL
              </h1>
              <div style={{ fontSize: '12px', color: '#A3A3A3', marginTop: '2px' }}>
                Autenticación Operativa &bull; Trazabilidad Azure DevOps (AB#4 - AB#34) &bull; Alertas Gmail UMG
              </div>
            </div>
          </div>

          <span style={{
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            color: '#4ADE80',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            fontWeight: '700',
            padding: '4px 10px',
            borderRadius: '2px'
          }}>
            0 VULNERABILIDADES (RBAC ACTIVO)
          </span>
        </div>

        {/* CUERPO PRINCIPAL: 2 COLUMNAS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
          padding: '28px'
        }}>
          {/* COLUMNA IZQUIERDA: LOGIN MANUAL */}
          <div style={{
            backgroundColor: '#0A0A0A',
            border: '1px solid #2E2E2E',
            borderRadius: '4px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: '18px',
                color: '#FFFFFF',
                letterSpacing: '0.6px',
                marginBottom: '6px'
              }}>
                🔐 INICIO DE SESIÓN INSTITUCIONAL
              </div>
              <p style={{ fontSize: '12.5px', color: '#A3A3A3', marginBottom: '18px', lineHeight: '1.5' }}>
                Ingresa con tu correo asignado en el proyecto o selecciona una tarjeta a la derecha para ingresar con 1 clic según el rol operativo.
              </p>

              {error && (
                <div style={{
                  backgroundColor: 'rgba(220, 38, 38, 0.15)',
                  border: '1px solid #DC2626',
                  color: '#F87171',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono, monospace',
                  marginBottom: '14px'
                }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#A3A3A3', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Correo del Operador / Administrador
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
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#A3A3A3', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Código de Acceso de Rol
                  </label>
                  <input
                    type="password"
                    required
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="ADMIN-2026 o TECH-2026"
                    style={inputStyle}
                  />
                  <div style={{ fontSize: '11px', color: '#737373', marginTop: '5px', fontFamily: 'JetBrains Mono, monospace' }}>
                    Claves: Admin = <strong style={{ color: '#F87171' }}>ADMIN-2026</strong> | Técnicos = <strong style={{ color: '#60A5FA' }}>TECH-2026</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-red"
                  style={{ padding: '12px', fontSize: '13px', marginTop: '6px', width: '100%' }}
                >
                  {submitting ? 'Verificando Rol...' : '🚀 Ingresar al Panel Operativo'}
                </button>
              </form>
            </div>

            <div style={{
              marginTop: '20px',
              paddingTop: '14px',
              borderTop: '1px solid #1F1F1F',
              fontSize: '11.5px',
              color: '#A3A3A3',
              lineHeight: '1.5'
            }}>
              <strong style={{ color: '#FFFFFF' }}>Diferenciación de Permisos:</strong><br />
              &bull; <span style={{ color: '#F87171', fontWeight: '700' }}>ADMIN (Mayro Gameros):</span> Control total de Pipeline CI/CD (Simular Fallo ❌ y Solución ✅), Bandeja SMTP y vista global.<br />
              &bull; <span style={{ color: '#60A5FA', fontWeight: '700' }}>TÉCNICOS (5 Especialistas):</span> Vista enfocada automáticamente en su categoría y cola de trabajo asignada.
            </div>
          </div>

          {/* COLUMNA DERECHA: ACCESO RÁPIDO 1 CLIC POR USUARIO */}
          <div>
            <div style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: '18px',
              color: '#60A5FA',
              letterSpacing: '0.6px',
              marginBottom: '6px'
            }}>
              ⚡ ACCESO RÁPIDO POR INTEGRANTE (1 CLIC)
            </div>
            <p style={{ fontSize: '12.5px', color: '#A3A3A3', marginBottom: '14px' }}>
              Haz clic sobre cualquier usuario del equipo para entrar directamente con su perfil y permisos:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {teamList.map((u) => {
                const isAdmin = u.role === 'ADMIN';
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickSelect(u)}
                    style={{
                      backgroundColor: '#0A0A0A',
                      border: isAdmin ? '1px solid #DC2626' : '1px solid #2E2E2E',
                      borderLeft: isAdmin ? '4px solid #DC2626' : '4px solid #2563EB',
                      borderRadius: '4px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 150ms ease',
                      boxShadow: isAdmin ? '0 0 12px rgba(220, 38, 38, 0.2)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '4px',
                        backgroundColor: isAdmin ? 'rgba(220, 38, 38, 0.2)' : 'rgba(37, 99, 235, 0.2)',
                        border: isAdmin ? '1px solid #DC2626' : '1px solid #2563EB',
                        color: isAdmin ? '#F87171' : '#60A5FA',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: '700',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {u.initials || 'IT'}
                      </div>
                      <div>
                        <div style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '13px' }}>
                          {u.name}
                        </div>
                        <div style={{ color: '#A3A3A3', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', marginTop: '2px' }}>
                          {u.email} &bull; <span style={{ color: isAdmin ? '#F87171' : '#60A5FA' }}>{u.specialty || u.role}</span>
                        </div>
                      </div>
                    </div>

                    <span style={{
                      backgroundColor: isAdmin ? 'rgba(220, 38, 38, 0.18)' : 'rgba(37, 99, 235, 0.18)',
                      color: isAdmin ? '#F87171' : '#60A5FA',
                      border: isAdmin ? '1px solid rgba(220, 38, 38, 0.45)' : '1px solid rgba(37, 99, 235, 0.45)',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '2px',
                      whiteSpace: 'nowrap'
                    }}>
                      {isAdmin ? 'ADMIN TOTAL' : `ROL: ${u.defaultCategory || 'TECH'}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
