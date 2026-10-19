import React from 'react';

const STATUS_COLORS = {
  NUEVO: '#38bdf8',
  ASIGNADO: '#ffb03a',
  EN_PROCESO: '#00f0ff',
  RESUELTO: '#22c55e',
  CERRADO: '#64748b'
};

const PRIORITY_COLORS = {
  CRITICA: '#ef4444',
  ALTA: '#ffb03a',
  MEDIA: '#38bdf8',
  BAJA: '#22c55e'
};

export default function DistributionPanel({ stats, currentUser }) {
  if (!stats) return null;

  const total = stats.total || 1;
  const eficiencia = Math.round(((stats.cerrados || 0) / total) * 100);

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
      color: STATUS_COLORS[item.estado] || '#38bdf8',
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
    <section
      id="analytics"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}
    >
      {/* 01 / NODE: GRÁFICO DE DONA SVG (CICLO DE VIDA 5 ESTADOS) */}
      <div
        className="isometric-card"
        style={{
          backgroundColor: '#161d24',
          border: '1px solid #222c37',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <span className="font-mono" style={{ fontSize: '10px', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                TELEMETRY MATRIX
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                Ciclo de Vida (5 Estados)
              </h3>
            </div>
            <span className="font-mono" style={{ fontSize: '10.5px', color: '#64748b' }}>01 / NODE</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '136px', height: '136px', flexShrink: 0 }}>
              <svg width="136" height="136" viewBox="0 0 136 136" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="68"
                  cy="68"
                  r={radius}
                  fill="transparent"
                  stroke="#080b0e"
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
                <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
                  {eficiencia}%
                </span>
                <span className="font-mono" style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px', letterSpacing: '0.08em' }}>
                  RESOLVED
                </span>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px', minWidth: '140px' }}>
              {donutSegments.map((seg) => (
                <div key={seg.estado} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: seg.color,
                      display: 'inline-block'
                    }} />
                    <span className="font-mono" style={{ color: '#cbd5e1', fontSize: '11px' }}>{seg.estado}</span>
                  </div>
                  <span className="font-mono" style={{ fontSize: '11px', color: '#94a3b8' }}>
                    <strong style={{ color: '#ffffff' }}>{seg.total}</strong> ({seg.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="font-mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #222c37' }}>
          Status: Native SVG Render (0 External Deps)
        </div>
      </div>

      {/* 02 / NODE: BARRAS DE SEVERIDAD SLA Y CATEGORÍAS */}
      <div
        className="isometric-card"
        style={{
          backgroundColor: '#161d24',
          border: '1px solid #222c37',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <span className="font-mono" style={{ fontSize: '10px', color: '#ffb03a', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                SLA MODULATOR
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                Severidad SLA &amp; Categorías
              </h3>
            </div>
            <span className="font-mono" style={{ fontSize: '10.5px', color: '#64748b' }}>02 / NODE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '14px' }}>
            {prioridadList.map((p) => {
              const pct = Math.round(((p.total || 0) / total) * 100);
              const barColor = PRIORITY_COLORS[p.prioridad] || '#38bdf8';
              return (
                <div key={p.prioridad}>
                  <div className="font-mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: '#cbd5e1' }}>PRIORITY // {p.prioridad}</span>
                    <span style={{ color: barColor, fontWeight: 700 }}>
                      {p.total} [{pct}%]
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#080b0e', border: '1px solid #222c37' }}>
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

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {stats.porCategoria && stats.porCategoria.map((item) => (
              <div
                key={item.categoria}
                className="font-mono"
                style={{
                  backgroundColor: '#080b0e',
                  border: '1px solid #222c37',
                  padding: '4px 8px',
                  fontSize: '10px',
                  color: '#94a3b8'
                }}
              >
                {item.categoria}: <strong style={{ color: '#00f0ff' }}>{item.total}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="font-mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #222c37' }}>
          Status: Calibrated SLA Thresholds
        </div>
      </div>

      {/* 03 / NODE: RENDIMIENTO POR ESPECIALISTA */}
      <div
        className="isometric-card"
        style={{
          backgroundColor: '#161d24',
          border: '1px solid #222c37',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <span className="font-mono" style={{ fontSize: '10px', color: '#00f0ff', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                OPERATOR ARRAY
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                Rendimiento por Especialista
              </h3>
            </div>
            <span className="font-mono" style={{ fontSize: '10.5px', color: '#64748b' }}>03 / NODE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                    backgroundColor: isCurrentUser ? 'rgba(56, 189, 248, 0.1)' : '#080b0e',
                    border: isCurrentUser ? '1px solid #00f0ff' : '1px solid #222c37',
                    padding: '6px 10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span className="font-mono" style={{
                        fontSize: '9.5px',
                        fontWeight: 700,
                        backgroundColor: '#11161b',
                        color: isCurrentUser ? '#00f0ff' : '#ffb03a',
                        border: '1px solid #222c37',
                        padding: '1px 5px'
                      }}>
                        {tech.initials || 'OP'}
                      </span>
                      <span style={{ color: '#ffffff', fontWeight: isCurrentUser ? 700 : 400 }}>
                        {tech.nombre} {isCurrentUser && <span className="font-mono" style={{ color: '#00f0ff', fontSize: '9.5px' }}>[ACTIVE]</span>}
                      </span>
                    </div>
                    <div className="font-mono" style={{ fontSize: '10px', display: 'flex', gap: '6px' }}>
                      <span style={{ color: activeCount > 0 ? '#ffb03a' : '#64748b' }}>{activeCount} act</span>
                      <span style={{ color: '#4ade80' }}>{resolvedCount} res</span>
                    </div>
                  </div>

                  <div style={{ width: '100%', height: '4px', backgroundColor: '#11161b', display: 'flex' }}>
                    <div style={{
                      width: `${(activeCount / totalTech) * activeWidth}%`,
                      backgroundColor: '#ffb03a',
                      height: '100%'
                    }} />
                    <div style={{
                      width: `${(resolvedCount / totalTech) * activeWidth}%`,
                      backgroundColor: '#22c55e',
                      height: '100%'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="font-mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #222c37' }}>
          Status: Bound via RBAC Layer 2
        </div>
      </div>
    </section>
  );
}