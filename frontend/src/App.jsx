import React, { useState, useEffect } from 'react';
import IncidentFilters from './components/IncidentFilters.jsx';
import DistributionPanel from './components/DistributionPanel.jsx';
import DevOpsMonitor from './components/DevOpsMonitor.jsx';
import LoginPanel from './components/LoginPanel.jsx';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ih_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [azureStatus, setAzureStatus] = useState(null);
  const [notificationsData, setNotificationsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncingAzure, setSyncingAzure] = useState(false);
  const [simulatingFailure, setSimulatingFailure] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Filtros (Estado, Prioridad, Categoria, Tecnico y Busqueda)
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [techFilter, setTechFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Formulario nuevo incidente
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('SOFTWARE');
  const [newPriority, setNewPriority] = useState('MEDIA');
  const [newReportedBy, setNewReportedBy] = useState('mbarriosg8@miumg.edu.gt');

  // Formulario detalle / cambio de estado
  const [targetStatus, setTargetStatus] = useState('');
  const [targetTech, setTargetTech] = useState('');
  const [newComment, setNewComment] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 4500);
  };

  const applyUserRoleContext = (user) => {
    if (!user) return;
    setNewReportedBy(user.email || 'mbarriosg8@miumg.edu.gt');
    if (user.role === 'ADMIN') {
      setTechFilter('');
      setCategoryFilter('');
    } else {
      // Orientar vista automáticamente al trabajo del técnico
      setTechFilter(String(user.id));
      setCategoryFilter('');
    }
  };

  const handleLogin = async ({ userId, email, accessCode }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email, accessCode })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error de autenticación');
    }
    setCurrentUser(data.user);
    sessionStorage.setItem('ih_active_user', JSON.stringify(data.user));
    applyUserRoleContext(data.user);
    showToast(`🔐 Sesión iniciada: ${data.user.name} [${data.user.role}]`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('ih_active_user');
    setTechFilter('');
    setCategoryFilter('');
    setStatusFilter('');
    setPriorityFilter('');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (techFilter) params.append('assigned_to_id', techFilter);
      if (searchTerm) params.append('search', searchTerm);

      const [incRes, userRes, statsRes, azureRes, notifRes] = await Promise.all([
        fetch(`${API_BASE}/incidents?${params.toString()}`).then(r => r.json()),
        fetch(`${API_BASE}/users`).then(r => r.json()),
        fetch(`${API_BASE}/dashboard/stats`).then(r => r.json()),
        fetch(`${API_BASE}/azure/status`).then(r => r.json()),
        fetch(`${API_BASE}/notifications`).then(r => r.json())
      ]);

      setIncidents(incRes);
      setUsers(userRes);
      setStats(statsRes);
      setAzureStatus(azureRes);
      setNotificationsData(notifRes);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter, categoryFilter, techFilter, searchTerm]);

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          category: newCategory,
          priority: newPriority,
          reported_by: newReportedBy
        })
      });
      if (res.ok) {
        const created = await res.json();
        setShowNewModal(false);
        setNewTitle('');
        setNewDesc('');
        fetchData();
        showToast(`📧 Incidente #${created.id} creado y alerta enviada a ${created.notification_sent?.to || 'mbarriosg8@miumg.edu.gt'}`);
      }
    } catch (err) {
      alert('Error al registrar incidente');
    }
  };

  const openDetail = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/incidents/${id}`);
      const data = await res.json();
      setSelectedIncident(data);
      setTargetStatus(data.status);
      setTargetTech(data.assigned_to_id || '');
    } catch (err) {
      alert('Error al cargar detalle');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedIncident) return;
    try {
      const res = await fetch(`${API_BASE}/incidents/${selectedIncident.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          assigned_to_id: targetTech || null,
          changed_by: currentUser ? currentUser.name : 'Mayro Gameros (DevOps Lead)',
          change_reason: `Transición operativa por ${currentUser ? currentUser.role : 'ADMIN'}`
        })
      });
      if (res.ok) {
        const updated = await res.json();
        openDetail(selectedIncident.id);
        fetchData();
        showToast(`📧 Estado actualizado a ${updated.status} y notificación enviada a ${updated.notification_sent?.to || 'mbarriosg8@miumg.edu.gt'}`);
      }
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedIncident) return;
    try {
      const res = await fetch(`${API_BASE}/incidents/${selectedIncident.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: currentUser ? currentUser.name : 'Mayro Gameros (DevOps Lead)',
          comment: newComment
        })
      });
      if (res.ok) {
        setNewComment('');
        openDetail(selectedIncident.id);
      }
    } catch (err) {
      alert('Error al agregar comentario');
    }
  };

  const handleTriggerAzureSync = async () => {
    try {
      setSyncingAzure(true);
      const res = await fetch(`${API_BASE}/azure/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Solución Aplicada y Restauración de Pipeline CI/CD a Verde'
        })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchData();
        showToast(`✅ Solución Aplicada: ${data.build?.buildNumber} Succeeded y correo enviado a ${data.notification_sent?.to || 'mbarriosg8@miumg.edu.gt'}`);
      }
    } finally {
      setSyncingAzure(false);
    }
  };

  const handleSimulateFailure = async () => {
    try {
      setSimulatingFailure(true);
      const res = await fetch(`${API_BASE}/azure/simulate-failure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Simulación de Fallo Controlado en Pipeline CI (ERR_ASSERTION: 1 !== -1)'
        })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchData();
        showToast(`🚨 Fallo en Pipeline Detectado (${data.build?.buildNumber}) y alerta enviada a ${data.notification_sent?.to || 'mbarriosg8@miumg.edu.gt'}`);
      }
    } finally {
      setSimulatingFailure(false);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      setSendingEmail(true);
      const res = await fetch(`${API_BASE}/notifications/test`, {
        method: 'POST'
      });
      if (res.ok) {
        const record = await res.json();
        await fetchData();
        showToast(`📨 Alerta de prueba despachada con éxito a ${record.to}`);
      }
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSaveSmtpConfig = async (cfg) => {
    const res = await fetch(`${API_BASE}/notifications/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg)
    });
    if (res.ok) {
      await fetchData();
      showToast(`⚙️ Configuración de notificaciones actualizada (${cfg.recipient})`);
    }
  };

  const getStatusBadge = (st) => {
    const cls = `badge badge-${st.toLowerCase()}`;
    return <span className={cls}>{st}</span>;
  };

  const modalOverlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    zIndex: 100
  };

  const modalBoxStyle = {
    backgroundColor: '#141414',
    border: '1px solid #2E2E2E',
    borderTop: '3px solid #DC2626',
    borderRadius: '4px',
    maxWidth: '540px',
    width: '100%',
    padding: '24px',
    boxShadow: '0 0 24px rgba(220, 38, 38, 0.35)'
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: '#0A0A0A',
    border: '1px solid #2E2E2E',
    borderRadius: '4px',
    padding: '8px 12px',
    color: '#F5F5F5',
    fontSize: '13px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#A3A3A3',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '4px'
  };

  if (!currentUser) {
    return <LoginPanel users={users} onLoginSuccess={handleLogin} />;
  }

  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#F5F5F5', padding: '24px 32px' }}>

      {/* TOAST DE ALERTA Y CORREO EN TIEMPO REAL */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#141414',
          border: '1px solid #22C55E',
          borderLeft: '4px solid #22C55E',
          color: '#FFFFFF',
          padding: '12px 18px',
          borderRadius: '4px',
          boxShadow: '0 0 20px rgba(34, 197, 94, 0.45)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px',
          zIndex: 300
        }}>
          {toastMsg}
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #2E2E2E',
        paddingBottom: '16px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              width: '36px',
              height: '36px',
              backgroundColor: '#141414',
              border: '1px solid #DC2626',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Anton, sans-serif',
              fontSize: '18px',
              color: '#DC2626',
              boxShadow: '0 0 8px rgba(220, 38, 38, 0.4)'
            }}>
              IH
            </div>
            <h1 style={{ fontFamily: 'Anton, sans-serif', fontSize: '28px', color: '#FFFFFF', letterSpacing: '0.5px' }}>
              IT Incident Hub
            </h1>
            <span style={{
              backgroundColor: 'rgba(220, 38, 38, 0.15)',
              color: '#F87171',
              border: '1px solid rgba(220, 38, 38, 0.4)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: '2px'
            }}>
              v1.0.0 (PROD)
            </span>
            <span style={{
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              color: '#60A5FA',
              border: '1px solid rgba(37, 99, 235, 0.4)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: '2px'
            }}>
              AZURE BOARDS: AB#4 - AB#34
            </span>
            <span style={{
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: '#4ADE80',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: '2px'
            }}>
              ALERTAS: mbarriosg8@miumg.edu.gt ✅
            </span>
          </div>
          <p style={{ color: '#A3A3A3', fontSize: '13px', marginTop: '6px' }}>
            Centro de Operaciones y Gestión Continua de Incidentes &bull; Conectado con Azure DevOps CI/CD y Notificaciones Gmail UMG
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* TARJETA DE SESIÓN ACTIVA (SIN IMÁGENES) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#141414',
            border: isAdmin ? '1px solid #DC2626' : '1px solid #2563EB',
            padding: '6px 12px',
            borderRadius: '4px'
          }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              fontWeight: '700',
              backgroundColor: isAdmin ? 'rgba(220, 38, 38, 0.2)' : 'rgba(37, 99, 235, 0.2)',
              color: isAdmin ? '#F87171' : '#60A5FA',
              padding: '4px 7px',
              borderRadius: '3px'
            }}>
              {currentUser.initials || 'IT'}
            </span>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: isAdmin ? '#F87171' : '#60A5FA' }}>
                {currentUser.role} &bull; {currentUser.email}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                backgroundColor: '#0A0A0A',
                border: '1px solid #2E2E2E',
                color: '#A3A3A3',
                fontSize: '11px',
                padding: '5px 9px',
                borderRadius: '3px',
                cursor: 'pointer',
                marginLeft: '4px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600'
              }}
              title="Volver al Panel de Inicio de Sesión / Cambiar de Rol"
            >
              🚪 Cambiar Rol
            </button>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="btn-red"
            style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>➕</span> Nuevo Incidente
          </button>
        </div>
      </header>

      {/* BARRA DE CONTEXTO DE ROL Y FILTRO RÁPIDO DE TRABAJO */}
      <div style={{
        backgroundColor: '#141414',
        border: '1px solid #2E2E2E',
        borderLeft: isAdmin ? '4px solid #DC2626' : '4px solid #2563EB',
        borderRadius: '4px',
        padding: '10px 16px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ fontSize: '12.5px', color: '#D4D4D4' }}>
          {isAdmin ? (
            <>
              <strong style={{ color: '#F87171', fontFamily: 'JetBrains Mono, monospace' }}>[MODO ADMINISTRADOR GLOBAL]</strong>{' '}
              Tienes acceso completo a todos los tickets, al control de fallos/soluciones en Azure Pipelines y a la configuración SMTP.
            </>
          ) : (
            <>
              <strong style={{ color: '#60A5FA', fontFamily: 'JetBrains Mono, monospace' }}>[VISTA ORIENTADA A TÉCNICO: {currentUser.specialty}]</strong>{' '}
              El tablero filtra prioritariamente los incidentes asignados a tu usuario o especialidad.
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {!isAdmin && (
            <>
              <button
                type="button"
                onClick={() => { setTechFilter(String(currentUser.id)); setCategoryFilter(''); }}
                style={{
                  backgroundColor: techFilter === String(currentUser.id) ? '#2563EB' : '#0A0A0A',
                  color: '#FFFFFF',
                  border: '1px solid #2563EB',
                  borderRadius: '3px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              >
                🎯 Mis Asignados
              </button>
              {currentUser.defaultCategory && (
                <button
                  type="button"
                  onClick={() => { setTechFilter(''); setCategoryFilter(currentUser.defaultCategory); }}
                  style={{
                    backgroundColor: categoryFilter === currentUser.defaultCategory ? '#2563EB' : '#0A0A0A',
                    color: '#FFFFFF',
                    border: '1px solid #2563EB',
                    borderRadius: '3px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}
                >
                  🏷️ Área {currentUser.defaultCategory}
                </button>
              )}
            </>
          )}
          <button
            type="button"
            onClick={() => { setTechFilter(''); setCategoryFilter(''); setStatusFilter(''); setPriorityFilter(''); }}
            style={{
              backgroundColor: (!techFilter && !categoryFilter) ? 'rgba(34, 197, 94, 0.2)' : '#0A0A0A',
              color: (!techFilter && !categoryFilter) ? '#4ADE80' : '#A3A3A3',
              border: '1px solid #2E2E2E',
              borderRadius: '3px',
              padding: '4px 10px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            🌐 Ver Todos los Incidentes
          </button>
        </div>
      </div>

      {/* KPI DASHBOARD (AB#34) */}
      {stats && (
        <>
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>

            {/* Total Incidentes (Blue) */}
            <div style={{
              backgroundColor: '#141414',
              padding: '16px 20px',
              borderRadius: '4px',
              border: '1px solid #2E2E2E',
              borderLeft: '4px solid #2563EB',
              boxShadow: '0 0 10px rgba(37, 99, 235, 0.15)'
            }}>
              <div style={{ color: '#A3A3A3', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Total Incidentes
              </div>
              <div style={{ fontFamily: 'Anton, sans-serif', fontSize: '36px', color: '#FFFFFF', marginTop: '4px' }}>
                {stats.total}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#60A5FA', marginTop: '4px' }}>
                Registros Globales
              </div>
            </div>

            {/* Abiertos / En Proceso (Warning) */}
            <div style={{
              backgroundColor: '#141414',
              padding: '16px 20px',
              borderRadius: '4px',
              border: '1px solid #2E2E2E',
              borderLeft: '4px solid #F59E0B',
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.15)'
            }}>
              <div style={{ color: '#A3A3A3', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Abiertos / En Proceso
              </div>
              <div style={{ fontFamily: 'Anton, sans-serif', fontSize: '36px', color: '#FBBF24', marginTop: '4px' }}>
                {stats.abiertos}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#F59E0B', marginTop: '4px' }}>
                Requieren Atención
              </div>
            </div>

            {/* Casos Criticos (Red) */}
            <div style={{
              backgroundColor: '#141414',
              padding: '16px 20px',
              borderRadius: '4px',
              border: '1px solid #2E2E2E',
              borderLeft: '4px solid #DC2626',
              boxShadow: '0 0 12px rgba(220, 38, 38, 0.25)'
            }}>
              <div style={{ color: '#A3A3A3', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Casos Críticos
              </div>
              <div style={{ fontFamily: 'Anton, sans-serif', fontSize: '36px', color: '#F87171', marginTop: '4px', textShadow: '0 0 8px rgba(220, 38, 38, 0.5)' }}>
                {stats.criticos}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#F87171', marginTop: '4px' }}>
                Prioridad Máxima SLA
              </div>
            </div>

            {/* Resueltos / Cerrados (Green) */}
            <div style={{
              backgroundColor: '#141414',
              padding: '16px 20px',
              borderRadius: '4px',
              border: '1px solid #2E2E2E',
              borderLeft: '4px solid #22C55E',
              boxShadow: '0 0 10px rgba(34, 197, 94, 0.15)'
            }}>
              <div style={{ color: '#A3A3A3', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Resueltos / Cerrados
              </div>
              <div style={{ fontFamily: 'Anton, sans-serif', fontSize: '36px', color: '#4ADE80', marginTop: '4px' }}>
                {stats.cerrados}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#4ADE80', marginTop: '4px' }}>
                Completados con Éxito
              </div>
            </div>
          </section>

          {/* MONITOR DE AZURE DEVOPS & BANDEJA DE NOTIFICACIONES GMAIL */}
          <DevOpsMonitor
            azureStatus={azureStatus}
            notificationsData={notificationsData}
            onTriggerAzureSync={handleTriggerAzureSync}
            onSimulateFailure={handleSimulateFailure}
            onSendTestEmail={handleSendTestEmail}
            onSaveSmtpConfig={handleSaveSmtpConfig}
            syncingAzure={syncingAzure}
            simulatingFailure={simulatingFailure}
            sendingEmail={sendingEmail}
            isAdmin={isAdmin}
          />

          <DistributionPanel stats={stats} currentUser={currentUser} />
        </>
      )}

      {/* BARRA DE FILTROS MULTICRITERIO (AB#12) */}
      <IncidentFilters
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
        categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
        techFilter={techFilter} setTechFilter={setTechFilter}
        users={users}
      />

      {/* TABLA DE INCIDENTES */}
      <section style={{
        backgroundColor: '#141414',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid #2E2E2E',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#0E0E0E', color: '#A3A3A3', borderBottom: '2px solid #2E2E2E' }}>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>ID</th>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Título del Incidente</th>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Categoría</th>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Prioridad</th>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Estado</th>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Técnico Asignado</th>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'right' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#A3A3A3' }}>Cargando incidentes...</td></tr>
            ) : incidents.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#737373' }}>No se encontraron incidentes con los filtros seleccionados.</td></tr>
            ) : (
              incidents.map((inc) => (
                <tr key={inc.id} style={{ borderBottom: '1px solid #1E1E1E', transition: 'background 150ms ease' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontWeight: '700', color: '#60A5FA' }}>
                    #{inc.id}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#FFFFFF' }}>
                    {inc.title}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#A3A3A3' }}>
                    {inc.category}
                  </td>
                  <td style={{ padding: '12px 16px' }} className={`priority-${inc.priority.toLowerCase()}`}>
                    {inc.priority}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {getStatusBadge(inc.status)}
                  </td>
                  <td style={{ padding: '12px 16px', color: inc.assigned_technician ? '#F5F5F5' : '#737373', fontSize: '12.5px' }}>
                    {inc.assigned_technician ? inc.assigned_technician.name : 'Sin asignar'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => openDetail(inc.id)}
                      className="btn-blue"
                      style={{ padding: '6px 14px', fontSize: '11px' }}
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* MODAL REGISTRAR NUEVO INCIDENTE */}
      {showNewModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #2E2E2E', paddingBottom: '12px' }}>
              <h2 style={{ fontFamily: 'Anton, sans-serif', fontSize: '20px', color: '#FFFFFF', letterSpacing: '0.5px' }}>
                REGISTRAR NUEVO INCIDENTE (CON ALERTA A GMAIL)
              </h2>
              <button
                onClick={() => setShowNewModal(false)}
                style={{ background: 'none', border: 'none', color: '#737373', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIncident} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Título del Incidente *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Falla de conexión en impresora de RRHH"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Descripción Detallada *</label>
                <textarea
                  required
                  rows="3"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explica qué ocurrió, sistemas afectados e impacto observado..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Categoría *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="HARDWARE">HARDWARE</option>
                    <option value="SOFTWARE">SOFTWARE</option>
                    <option value="NETWORK">NETWORK</option>
                    <option value="SECURITY">SECURITY</option>
                    <option value="ACCESS">ACCESS</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Prioridad *</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="BAJA">BAJA</option>
                    <option value="MEDIA">MEDIA</option>
                    <option value="ALTA">ALTA</option>
                    <option value="CRITICA">CRÍTICA</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Reportado Por (Correo del Solicitante) *</label>
                <input
                  type="email"
                  required
                  value={newReportedBy}
                  onChange={(e) => setNewReportedBy(e.target.value)}
                  placeholder="mbarriosg8@miumg.edu.gt"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #2E2E2E',
                    color: '#A3A3A3',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-red"
                  style={{ padding: '8px 20px' }}
                >
                  Guardar y Notificar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DEL INCIDENTE Y AUDITORÍA */}
      {selectedIncident && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #2E2E2E', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#60A5FA', fontWeight: '700', fontSize: '12px' }}>
                  INCIDENTE #{selectedIncident.id}
                </span>
                <h2 style={{ fontFamily: 'Anton, sans-serif', fontSize: '22px', color: '#FFFFFF', marginTop: '4px' }}>
                  {selectedIncident.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                style={{ background: 'none', border: 'none', color: '#737373', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: '#D4D4D4', fontSize: '13.5px', marginBottom: '16px', backgroundColor: '#0A0A0A', border: '1px solid #2E2E2E', padding: '12px', borderRadius: '4px', lineHeight: '1.5' }}>
              {selectedIncident.description}
            </p>

            {/* SECCIÓN TRANSICIÓN DE OPERACIÓN */}
            <div style={{ backgroundColor: '#0A0A0A', border: '1px solid #2E2E2E', borderLeft: '4px solid #2563EB', borderRadius: '4px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'Anton, sans-serif', fontSize: '15px', color: '#60A5FA', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚙️</span> TRANSICIÓN DE OPERACIÓN (NOTIFICA A mbarriosg8@miumg.edu.gt)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                <div>
                  <label style={labelStyle}>Estado: {selectedIncident.status}</label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="NUEVO">NUEVO</option>
                    <option value="ASIGNADO">ASIGNADO</option>
                    <option value="EN_PROCESO">EN_PROCESO</option>
                    <option value="RESUELTO">RESUELTO</option>
                    <option value="CERRADO">CERRADO</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Técnico Asignado</label>
                  <select
                    value={targetTech}
                    onChange={(e) => setTargetTech(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">-- Sin Asignar --</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  className="btn-red"
                  style={{ alignSelf: 'flex-end', padding: '9px 16px', fontSize: '12px' }}
                >
                  Actualizar
                </button>
              </div>
            </div>

            {/* HISTORIAL DE AUDITORÍA */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#A3A3A3', marginBottom: '8px' }}>
                📜 Historial de Estados (Auditoría)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                {selectedIncident.logs && selectedIncident.logs.map(log => (
                  <div key={log.id} style={{ fontSize: '12px', backgroundColor: '#0A0A0A', padding: '8px 12px', borderRadius: '4px', borderLeft: '3px solid #2563EB', fontFamily: 'Inter, sans-serif' }}>
                    <span style={{ color: '#737373', fontFamily: 'JetBrains Mono, monospace' }}>{new Date(log.created_at).toLocaleTimeString()}:</span> Transición a <strong style={{ color: '#60A5FA' }}>{log.new_status}</strong> por <em>{log.changed_by}</em> ({log.change_reason})
                  </div>
                ))}
              </div>
            </div>

            {/* COMENTARIOS DE SEGUIMIENTO */}
            <div>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#A3A3A3', marginBottom: '8px' }}>
                💬 Comentarios de Seguimiento
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto', marginBottom: '10px' }}>
                {selectedIncident.comments && selectedIncident.comments.map(c => (
                  <div key={c.id} style={{ fontSize: '12px', backgroundColor: '#0A0A0A', padding: '8px 12px', borderRadius: '4px', border: '1px solid #1E1E1E' }}>
                    <strong style={{ color: '#F87171' }}>{c.author_name}:</strong> {c.comment}
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Agregar una nota técnica..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="submit"
                  className="btn-blue"
                  style={{ padding: '8px 16px', fontSize: '11px' }}
                >
                  Comentar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}