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
    backgroundColor: '#080b0e',
    border: '1px solid #222c37',
    padding: '10px 14px',
    color: '#e2e8f0',
    fontSize: '12px',
    fontFamily: 'JetBrains Mono, monospace',
    outline: 'none',
    transition: 'border-color 150ms ease'
  };

  return (
    <section style={{
      backgroundColor: '#11161b',
      border: '1px solid #222c37',
      borderLeft: '3px solid #38bdf8',
      padding: '16px 20px',
      marginBottom: '20px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      alignItems: 'center'
    }}>
      <span className="font-mono" style={{ fontSize: '10.5px', color: '#ffb03a', textTransform: 'uppercase', letterSpacing: '0.12em', marginRight: '4px' }}>
        QUERY MATRIX //
      </span>

      <input
        type="text"
        placeholder="SEARCH // título, descripción o solicitante..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ ...inputStyle, flex: '1', minWidth: '240px' }}
      />

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        style={inputStyle}
      >
        <option value="">STATUS: ALL</option>
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
        <option value="">PRIORITY: ALL</option>
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
        <option value="">CATEGORY: ALL</option>
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
        <option value="">OPERATOR: ALL</option>
        {users && users.map(u => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>
    </section>
  );
}