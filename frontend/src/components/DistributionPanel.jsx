import React from 'react';

const STATUS_COLORS = {
  NUEVO: '#60A5FA',
  ASIGNADO: '#FBBF24',
  EN_PROCESO: '#F97316',
  RESUELTO: '#4ADE80',
  CERRADO: '#A3A3A3'
};

const PRIORITY_COLORS = {
  CRITICA: '#DC2626',
  ALTA: '#F59E0B',
  MEDIA: '#2563EB',
  BAJA: '#737373'
};

export default function DistributionPanel({ stats, currentUser }) {
  if (!stats) return null;

  const total = stats.total || 1;
  const eficiencia = Math.round(((stats.cerrados || 0) / total) * 100);

  // Preparar segmentos del Gráfico de Dona SVG (radio = 54, circunferencia = 339.29)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const estadosList = stats.porEstado || [
    { estado: 'NUEVO', total: 1 },
    { estado: 'ASIGNADO', total: 1 },
    { estado: 'EN_PROCESO', total: 1 },
    { estado: 'RESUELTO', total: 1 },
    { estado: 'CERRADO', total: 1 }
  ];

  let accumulatedPercent = 0;
  const donutSegments = estadosList.map((item) => {
    const pct = (item.total / total) * 100;
    const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += pct;
    return {
      ...item,
      pct: Math.round(pct),
      color: STATUS_COLORS[item.estado] || '#60A5FA',
      strokeDasharray,
      strokeDashoffset
    };
  });

  const prioridadList = stats.porPrioridad || [
    { prioridad: 'CRITICA', total: stats.criticos || 0 },
    { prioridad: 'ALTA', total: 1 },
    { prioridad: 'MEDIA', total: 1 },
    { prioridad: 'BAJA', total: 1 }
  ];

  return (
    <section style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
      gap: '16px',
      marginBottom: '20px'
    }}>
      {/* 1. GRÁFICO DE DONA SVG: CICLO DE VIDA (5 ESTADOS) */}
      <div style={{
        backgroundColor: '#141414',
        padding: '18px 20px',
        borderRadius: '4px',
        border: '1px solid #2E2E2E',
        borderTop: '3px solid #2563EB',
        boxShadow: '0 0 12px rgba(37, 99, 235, 0.12)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: '16px',
            color: '#60A5FA',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            margin: 0
          }}>
            🍩 Ciclo de Vida (5 Estados)
          </h3>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '10px',
            color: '#4ADE80',
            backgroundColor: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            padding: '2px 7px',
            borderRadius: '2px'
          }}>
            SVG NATIVO (0 DEPS)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
          {/* SVG DONUT */}
          <div style={{ position: 'relative', width: '136px', height: '136px', flexShrink: 0 }}>
            <svg width="136" height="136" viewBox="0 0 136 136" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="68"
                cy="68"
                r={radius}
                fill="transparent"
                stroke="#1F1F1F"
                strokeWidth="14"
              />
              {donutSegments.map((seg) => (
                seg.total > 0 && (
                  <circle
                    key={seg.estado}
                    cx="68"
                    cy="68"
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="14"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    style={{ transition: 'stroke-dasharray 0.35s ease' }}
                  />
                )
              ))}
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <span style={{ fontFamily: 'Anton, sans-serif', fontSize: '24px', color: '#FFFFFF', lineHeight: 1 }}>
                {eficiencia}%
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#A3A3A3', marginTop: '3px' }}>
                RESUELTOS
              </span>
            </div>
          </div>

          {/* LEYENDA DE ESTADOS */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px', minWidth: '140px' }}>
            {donutSegments.map((seg) => (
              <div key={seg.estado} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '2px',
                    backgroundColor: seg.color,
                    display: 'inline-block'
                  }} />
                  <span style={{ color: '#D4D4D4', fontWeight: '600', fontSize: '11.5px' }}>{seg.estado}</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#A3A3A3' }}>
                  <strong style={{ color: '#FFFFFF' }}>{seg.total}</strong> ({seg.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. GRÁFICO DE BARRAS: CRITICIDAD SLA & CATEGORÍAS */}
      <div style={{
        backgroundColor: '#141414',
        padding: '18px 20px',
        borderRadius: '4px',
        border: '1px solid #2E2E2E',
        borderTop: '3px solid #F59E0B',
        boxShadow: '0 0 12px rgba(245, 158, 11, 0.12)'
      }}>
        <h3 style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: '16px',
          color: '#FBBF24',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: '12px',
          marginTop: 0
        }}>
          📊 Barras de Severidad SLA y Categoría
        </h3>

        {/* BARRAS DE PRIORIDAD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
          {prioridadList.map((p) => {
            const pct = Math.round(((p.total || 0) / total) * 100);
            const barColor = PRIORITY_COLORS[p.prioridad] || '#2563EB';
            return (
              <div key={p.prioridad}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                  <span style={{ fontWeight: '700', color: '#D4D4D4' }}>PRIORIDAD {p.prioridad}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', color: barColor, fontWeight: '700' }}>
                    {p.total} casos ({pct}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '7px', backgroundColor: '#0A0A0A', borderRadius: '3px', overflow: 'hidden', border: '1px solid #262626' }}>
                  <div style={{
                    width: `${Math.max(pct, p.total > 0 ? 8 : 0)}%`,
                    height: '100%',
                    backgroundColor: barColor,
                    transition: 'width 0.35s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* MINI CHIPS DE CATEGORÍA */}
        <div style={{ borderTop: '1px solid #262626', paddingTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {stats.porCategoria && stats.porCategoria.map((item) => (
            <div key={item.categoria} style={{
              backgroundColor: '#0A0A0A',
              border: '1px solid #2E2E2E',
              borderRadius: '3px',
              padding: '4px 8px',
              fontSize: '10.5px',
              fontFamily: 'JetBrains Mono, monospace',
              color: '#D4D4D4'
            }}>
              {item.categoria}: <strong style={{ color: '#60A5FA' }}>{item.total}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* 3. GRÁFICO DE DESEMPEÑO Y CARGA POR INTEGRANTE */}
      <div style={{
        backgroundColor: '#141414',
        padding: '18px 20px',
        borderRadius: '4px',
        border: '1px solid #2E2E2E',
        borderTop: '3px solid #DC2626',
        boxShadow: '0 0 12px rgba(220, 38, 38, 0.12)'
      }}>
        <h3 style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: '16px',
          color: '#F87171',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: '12px',
          marginTop: 0
        }}>
          👨‍💻 Rendimiento por Especialista
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {stats.porTecnico && stats.porTecnico.map((tech) => {
            const isCurrentUser = currentUser && Number(currentUser.id) === Number(tech.id);
            const activeCount = tech.activos !== undefined ? tech.activos : tech.asignados;
            const resolvedCount = tech.resueltos || 0;
            const totalTech = Math.max(activeCount + resolvedCount, 1);
            const activeWidth = Math.min(((activeCount + resolvedCount) / Math.max(total, 1)) * 100, 100);

            return (
              <div
                key={tech.id}
                style={{
                  backgroundColor: isCurrentUser ? 'rgba(220, 38, 38, 0.12)' : '#0A0A0A',
                  border: isCurrentUser ? '1px solid #DC2626' : '1px solid #222222',
                  borderRadius: '4px',
                  padding: '7px 10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '10px',
                      fontWeight: '700',
                      backgroundColor: '#141414',
                      color: isCurrentUser ? '#F87171' : '#60A5FA',
                      border: '1px solid #2E2E2E',
                      padding: '2px 5px',
                      borderRadius: '2px'
                    }}>
                      {tech.initials || 'IT'}
                    </span>
                    <span style={{ color: '#FFFFFF', fontWeight: isCurrentUser ? '700' : '500', fontSize: '12px' }}>
                      {tech.nombre} {isCurrentUser && <span style={{ color: '#4ADE80', fontSize: '10px' }}>(TÚ)</span>}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10.5px', display: 'flex', gap: '6px' }}>
                    <span style={{ color: activeCount > 0 ? '#FB923C' : '#737373' }}>{activeCount} act.</span>
                    <span style={{ color: '#4ADE80' }}>{resolvedCount} res.</span>
                  </div>
                </div>

                <div style={{ width: '100%', height: '5px', backgroundColor: '#181818', borderRadius: '2px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{
                    width: `${(activeCount / totalTech) * activeWidth}%`,
                    backgroundColor: '#FB923C',
                    height: '100%'
                  }} />
                  <div style={{
                    width: `${(resolvedCount / totalTech) * activeWidth}%`,
                    backgroundColor: '#22C55E',
                    height: '100%'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}