import React from 'react';

export default function IncidentFilters({
  searchTerm, setSearchTerm,
  statusFilter, setStatusFilter,
  priorityFilter, setPriorityFilter,
  categoryFilter, setCategoryFilter,
  techFilter, setTechFilter,
  users
}) {
  const inputStyle = {
    backgroundColor: '#0A0A0A',
    border: '1px solid #2E2E2E',
    borderRadius: '4px',
    padding: '8px 12px',
    color: '#F5F5F5',
    fontSize: '13px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    transition: 'border-color 150ms ease'
  };

  return (
    <section style={{
      backgroundColor: '#141414',
      border: '1px solid #2E2E2E',
      borderLeft: '4px solid #2563EB',
      borderRadius: '4px',
      padding: '16px',
      marginBottom: '20px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      alignItems: 'center',
      boxShadow: '0 0 10px rgba(37, 99, 235, 0.15)'
    }}>
      <input
        type="text"
        placeholder="🔍 Buscar por título, descripción o solicitante..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ ...inputStyle, flex: '1', minWidth: '240px' }}
      />

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        style={inputStyle}
      >
        <option value="">TODOS LOS ESTADOS</option>
        <option value="NUEVO">NUEVO</option>
        <option value="ASIGNADO">ASIGNADO</option>
        <option value="EN_PROCESO">EN_PROCESO</option>
        <option value="RESUELTO">RESUELTO</option>
        <option value="CERRADO">CERRADO</option>
      </select>

      <select
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value)}
        style={inputStyle}
      >
        <option value="">TODAS LAS PRIORIDADES</option>
        <option value="BAJA">BAJA</option>
        <option value="MEDIA">MEDIA</option>
        <option value="ALTA">ALTA</option>
        <option value="CRITICA">CRÍTICA</option>
      </select>

      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        style={inputStyle}
      >
        <option value="">TODAS LAS CATEGORÍAS</option>
        <option value="HARDWARE">HARDWARE</option>
        <option value="SOFTWARE">SOFTWARE</option>
        <option value="NETWORK">NETWORK</option>
        <option value="SECURITY">SECURITY</option>
        <option value="ACCESS">ACCESS</option>
      </select>

      <select
        value={techFilter}
        onChange={(e) => setTechFilter(e.target.value)}
        style={inputStyle}
      >
        <option value="">TODOS LOS TÉCNICOS</option>
        {users && users.map(u => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>
    </section>
  );
}