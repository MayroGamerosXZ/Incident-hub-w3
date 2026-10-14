import React from 'react';

export default function IncidentFilters({
  searchTerm, setSearchTerm,
  statusFilter, setStatusFilter,
  priorityFilter, setPriorityFilter,
  categoryFilter, setCategoryFilter,
  techFilter, setTechFilter,
  users
}) {
  return (
    <section style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
      <input
        type="text"
        placeholder="🔍 Buscar por título, descripción o solicitante..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ flex: '1', minWidth: '220px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '0.55rem 0.75rem', color: '#fff' }}
      />

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '0.55rem 0.75rem', color: '#fff' }}
      >
        <option value="">Todos los Estados</option>
        <option value="NUEVO">NUEVO</option>
        <option value="ASIGNADO">ASIGNADO</option>
        <option value="EN_PROCESO">EN_PROCESO</option>
        <option value="RESUELTO">RESUELTO</option>
        <option value="CERRADO">CERRADO</option>
      </select>

      <select
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value)}
        style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '0.55rem 0.75rem', color: '#fff' }}
      >
        <option value="">Todas las Prioridades</option>
        <option value="BAJA">BAJA</option>
        <option value="MEDIA">MEDIA</option>
        <option value="ALTA">ALTA</option>
        <option value="CRITICA">CRÍTICA</option>
      </select>

      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '0.55rem 0.75rem', color: '#fff' }}
      >
        <option value="">Todas las Categorías</option>
        <option value="HARDWARE">HARDWARE</option>
        <option value="SOFTWARE">SOFTWARE</option>
        <option value="NETWORK">NETWORK</option>
        <option value="SECURITY">SECURITY</option>
        <option value="ACCESS">ACCESS</option>
      </select>

      <select
        value={techFilter}
        onChange={(e) => setTechFilter(e.target.value)}
        style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '0.55rem 0.75rem', color: '#fff' }}
      >
        <option value="">Todos los Técnicos</option>
        {users && users.map(u => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>
    </section>
  );
}