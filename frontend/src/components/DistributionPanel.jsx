import React from 'react';

export default function DistributionPanel({ stats }) {
  if (!stats) return null;

  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
      {/* Distribucion por Categoria */}
      <div style={{ backgroundColor: '#1e293b', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #334155' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📊</span> Distribución por Categoría
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {stats.porCategoria && stats.porCategoria.map((item) => (
            <div key={item.categoria} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <span style={{ color: '#cbd5e1', fontWeight: '500' }}>{item.categoria}</span>
              <span style={{ backgroundColor: '#0f172a', color: '#38bdf8', padding: '0.15rem 0.55rem', borderRadius: '999px', fontWeight: '700' }}>
                {item.total} casos
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Distribucion por Tecnico */}
      <div style={{ backgroundColor: '#1e293b', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #334155' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#10b981', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>👨‍💻</span> Carga Activa por Técnico
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {stats.porTecnico && stats.porTecnico.map((tech) => (
            <div key={tech.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <span style={{ color: '#cbd5e1', fontWeight: '500' }}>{tech.nombre}</span>
              <span style={{ backgroundColor: '#0f172a', color: tech.asignados > 0 ? '#f59e0b' : '#94a3b8', padding: '0.15rem 0.55rem', borderRadius: '999px', fontWeight: '700' }}>
                {tech.asignados} activos
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}