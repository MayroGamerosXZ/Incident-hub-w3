import React from 'react';

export default function DistributionPanel({ stats }) {
  if (!stats) return null;

  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '20px' }}>
      {/* Distribucion por Categoria (Blue-Coded) */}
      <div style={{
        backgroundColor: '#141414',
        padding: '16px 20px',
        borderRadius: '4px',
        border: '1px solid #2E2E2E',
        borderLeft: '4px solid #2563EB',
        boxShadow: '0 0 10px rgba(37, 99, 235, 0.15)'
      }}>
        <h3 style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: '16px',
          color: '#60A5FA',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>📊</span> Distribución por Categoría
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {stats.porCategoria && stats.porCategoria.map((item) => (
            <div key={item.categoria} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
              <span style={{ color: '#D4D4D4', fontWeight: '500' }}>{item.categoria}</span>
              <span style={{
                backgroundColor: '#0A0A0A',
                color: '#60A5FA',
                border: '1px solid #2E2E2E',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '2px',
                fontWeight: '700'
              }}>
                {item.total} CASOS
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Distribucion por Tecnico (Red-Coded) */}
      <div style={{
        backgroundColor: '#141414',
        padding: '16px 20px',
        borderRadius: '4px',
        border: '1px solid #2E2E2E',
        borderLeft: '4px solid #DC2626',
        boxShadow: '0 0 10px rgba(220, 38, 38, 0.15)'
      }}>
        <h3 style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: '16px',
          color: '#F87171',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>👨‍💻</span> Carga Activa por Técnico
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {stats.porTecnico && stats.porTecnico.map((tech) => (
            <div key={tech.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
              <span style={{ color: '#D4D4D4', fontWeight: '500' }}>{tech.nombre}</span>
              <span style={{
                backgroundColor: '#0A0A0A',
                color: tech.asignados > 0 ? '#FB923C' : '#737373',
                border: '1px solid #2E2E2E',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '2px',
                fontWeight: '700'
              }}>
                {tech.asignados} ACTIVOS
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}