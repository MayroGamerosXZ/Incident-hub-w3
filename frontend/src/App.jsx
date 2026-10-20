import React, { useState, useEffect, useMemo } from 'react';
import IncidentFilters from './components/IncidentFilters.jsx';
import DistributionPanel from './components/DistributionPanel.jsx';
import DevOpsMonitor from './components/DevOpsMonitor.jsx';
import LoginPanel from './components/LoginPanel.jsx';
import SandboxMatrixConsole from './components/SandboxMatrixConsole.jsx';

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
  const [scrolled, setScrolled] = useState(false);
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

  // Partículas flotantes de CORE // ENTER
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

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    showToast(`[OK] Enclave Session Initialized: ${data.user.name} [${data.user.role}]`);
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
    backgroundColor: 'rgba(8, 11, 14, 0.88)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    zIndex: 100
  };

  const modalBoxStyle = {
    backgroundColor: '#11161b',
    border: '1px solid #222c37',
    borderTop: '3px solid #00f0ff',
    maxWidth: '560px',
    width: '100%',
    padding: '26px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.75)'
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: '#080b0e',
    border: '1px solid #222c37',
    padding: '10px 12px',
    color: '#e2e8f0',
    fontSize: '12.5px',
    fontFamily: 'JetBrains Mono, monospace',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '10.5px',
    fontWeight: '700',
    color: '#94a3b8',
    fontFamily: 'JetBrains Mono, monospace',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '6px'
  };

  if (!currentUser) {
    return <LoginPanel users={users} onLoginSuccess={handleLogin} />;
  }

  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#080b0e', color: '#e2e8f0', position: 'relative', overflowX: 'hidden' }}>

      {/* CAPA DE FONDO CORE // ENTER: TERMINAL GRID + AMBIENT LAMP + PARTICULAS */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div className="terminal-grid" style={{ position: 'absolute', inset: 0 }} />
        <div
          className="ambient-lamp"
          style={{
            position: 'absolute',
            left: '10%',
            top: '20%',
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

      {/* TOAST DE ALERTA Y CORREO EN TIEMPO REAL */}
      {toastMsg && (
        <div className="font-mono" style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#11161b',
          border: '1px solid #00f0ff',
          borderLeft: '4px solid #00f0ff',
          color: '#ffffff',
          padding: '13px 18px',
          boxShadow: '0 0 30px rgba(0, 240, 255, 0.35)',
          fontSize: '12px',
          zIndex: 300
        }}>
          {toastMsg}
        </div>
      )}

      {/* STICKY NAVBAR DINÁMICO CORE // ENTER */}
      <nav
        id="top-nav"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: scrolled ? '1px solid #222c37' : '1px solid rgba(34, 44, 55, 0.45)',
          backgroundColor: scrolled ? 'rgba(8, 11, 14, 0.92)' : 'rgba(8, 11, 14, 0.75)',
          backdropFilter: 'blur(12px)',
          padding: scrolled ? '12px 32px' : '18px 32px',
          transition: 'all 0.25s ease'
        }}
      >
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          {/* BRAND LOGO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <a href="#" className="font-mono" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: 700, letterSpacing: '0.1em', color: '#ffffff', textDecoration: 'none' }}>
              <span style={{ position: 'relative', display: 'inline-flex', width: '9px', height: '9px' }}>
                <span className="ping-dot" style={{ position: 'absolute', inset: 0, borderRadius: '9999px', backgroundColor: '#00f0ff', opacity: 0.75 }} />
                <span style={{ position: 'relative', display: 'inline-flex', width: '9px', height: '9px', borderRadius: '9999px', backgroundColor: '#00f0ff' }} />
              </span>
              CORE // INCIDENT HUB
            </a>

            <div className="font-mono" style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              <a href="#enclave-console" style={{ color: '#94a3b8', textDecoration: 'none' }}>Console</a>
              <a href="#devops" style={{ color: '#94a3b8', textDecoration: 'none' }}>CI/CD &amp; SMTP</a>
              <a href="#analytics" style={{ color: '#94a3b8', textDecoration: 'none' }}>Telemetry</a>
              <a href="#incidents-table" style={{ color: '#94a3b8', textDecoration: 'none' }}>Incidents</a>
            </div>
          </div>

          {/* RIGHT CAPSULE: ACTIVE OPERATOR + NEW INCIDENT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="font-mono" style={{
              border: '1px solid #222c37',
              backgroundColor: '#11161b',
              padding: '5px 10px',
              fontSize: '10px',
              color: '#ffb03a',
              letterSpacing: '0.08em'
            }}>
              LNKS // mbarriosg8@miumg.edu.gt
            </span>

            {/* ACTIVE USER CAPSULE (NO IMAGES) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#11161b',
              border: isAdmin ? '1px solid rgba(255, 176, 58, 0.55)' : '1px solid rgba(56, 189, 248, 0.45)',
              padding: '5px 10px'
            }}>
              <span className="font-mono" style={{
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: isAdmin ? 'rgba(255, 176, 58, 0.14)' : 'rgba(56, 189, 248, 0.14)',
                color: isAdmin ? '#ffb03a' : '#38bdf8',
                padding: '3px 7px',
                border: isAdmin ? '1px solid rgba(255, 176, 58, 0.4)' : '1px solid rgba(56, 189, 248, 0.4)'
              }}>
                {currentUser.initials || 'OP'}
              </span>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#ffffff' }}>
                  {currentUser.name}
                </div>
                <div className="font-mono" style={{ fontSize: '9.5px', color: isAdmin ? '#ffb03a' : '#38bdf8' }}>
                  {currentUser.role} // {currentUser.email}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-blue"
                style={{ padding: '4px 8px', fontSize: '9.5px', marginLeft: '4px' }}
                title="Cambiar de Operador / Cerrar Sesión"
              >
                🚪 Switch Role
              </button>
            </div>

            <button
              onClick={() => setShowNewModal(true)}
              className="btn-cyan keycap-glow"
              style={{ padding: '9px 16px' }}
            >
              ➕ New Incident
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENEDOR PRINCIPAL DE OPERACIONES */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1280px', margin: '0 auto', padding: '24px 32px 64px' }}>

        {/* BARRA DE CONTEXTO DE ROL Y FILTRO RÁPIDO DE ENCLAVE */}
        <div style={{
          backgroundColor: '#11161b',
          border: '1px solid #222c37',
          borderLeft: isAdmin ? '3px solid #ffb03a' : '3px solid #38bdf8',
          padding: '12px 18px',
          marginBottom: '22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ fontSize: '12.5px', color: '#cbd5e1' }}>
            {isAdmin ? (
              <>
                <strong className="font-mono" style={{ color: '#ffb03a' }}>[ADMIN ENCLAVE // SOVEREIGN OPERATOR]</strong>{' '}
                Acceso total habilitado sobre Incidentes, Azure DevOps Pipelines (Fallo ❌ / Solución ✅) y Alertas SMTP.
              </>
            ) : (
              <>
                <strong className="font-mono" style={{ color: '#38bdf8' }}>[LOCALIZED OPERATOR CAPSULE // {currentUser.specialty}]</strong>{' '}
                Vista segmentada y enfocada automáticamente en tu cola de trabajo asignada.
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {!isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => { setTechFilter(String(currentUser.id)); setCategoryFilter(''); }}
                  className={techFilter === String(currentUser.id) ? 'btn-cyan' : 'btn-blue'}
                  style={{ padding: '5px 10px', fontSize: '10px' }}
                >
                  🎯 Mis Asignados
                </button>
                {currentUser.defaultCategory && (
                  <button
                    type="button"
                    onClick={() => { setTechFilter(''); setCategoryFilter(currentUser.defaultCategory); }}
                    className={categoryFilter === currentUser.defaultCategory ? 'btn-cyan' : 'btn-blue'}
                    style={{ padding: '5px 10px', fontSize: '10px' }}
                  >
                    🏷️ Área {currentUser.defaultCategory}
                  </button>
                )}
              </>
            )}
            <button
              type="button"
              onClick={() => { setTechFilter(''); setCategoryFilter(''); setStatusFilter(''); setPriorityFilter(''); }}
              className={(!techFilter && !categoryFilter) ? 'btn-amber' : 'btn-blue'}
              style={{ padding: '5px 10px', fontSize: '10px' }}
            >
              🌐 Global Queue
            </button>
          </div>
        </div>

        {/* HERO + INTERACTIVE SANDBOX MATRIX CONSOLE (CORE // ENTER) */}
        <SandboxMatrixConsole
          currentUser={currentUser}
          azureStatus={azureStatus}
          notificationsData={notificationsData}
          stats={stats}
          onOpenNewModal={() => setShowNewModal(true)}
          onSimulateFailure={handleSimulateFailure}
          onTriggerAzureSync={handleTriggerAzureSync}
          onSendTestEmail={handleSendTestEmail}
          isAdmin={isAdmin}
        />

        {/* KPI DASHBOARD (AB#34) */}
        {stats && (
          <>
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>

              {/* 01: Total Incidentes */}
              <div className="isometric-card" style={{
                backgroundColor: '#161d24',
                padding: '20px 22px',
                border: '1px solid #222c37',
                borderLeft: '3px solid #38bdf8'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-mono" style={{ color: '#94a3b8', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Total Incidentes
                  </span>
                  <span className="font-mono" style={{ fontSize: '10px', color: '#64748b' }}>01 / KPI</span>
                </div>
                <div className="font-mono" style={{ fontSize: '36px', fontWeight: 700, color: '#ffffff', marginTop: '6px' }}>
                  {stats.total}
                </div>
                <div className="font-mono" style={{ fontSize: '10.5px', color: '#38bdf8', marginTop: '4px' }}>
                  GLOBAL MATRIX RECORDS
                </div>
              </div>

              {/* 02: Abiertos / En Proceso */}
              <div className="isometric-card" style={{
                backgroundColor: '#161d24',
                padding: '20px 22px',
                border: '1px solid #222c37',
                borderLeft: '3px solid #ffb03a'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-mono" style={{ color: '#94a3b8', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Abiertos / En Proceso
                  </span>
                  <span className="font-mono" style={{ fontSize: '10px', color: '#64748b' }}>02 / KPI</span>
                </div>
                <div className="font-mono" style={{ fontSize: '36px', fontWeight: 700, color: '#ffb03a', marginTop: '6px' }}>
                  {stats.abiertos}
                </div>
                <div className="font-mono" style={{ fontSize: '10.5px', color: '#ffb03a', marginTop: '4px' }}>
                  ACTIVE EXECUTION QUEUE
                </div>
              </div>

              {/* 03: Casos Criticos */}
              <div className="isometric-card" style={{
                backgroundColor: '#161d24',
                padding: '20px 22px',
                border: '1px solid #222c37',
                borderLeft: '3px solid #ef4444'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-mono" style={{ color: '#94a3b8', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Casos Críticos
                  </span>
                  <span className="font-mono" style={{ fontSize: '10px', color: '#64748b' }}>03 / KPI</span>
                </div>
                <div className="font-mono" style={{ fontSize: '36px', fontWeight: 700, color: '#f87171', marginTop: '6px' }}>
                  {stats.criticos}
                </div>
                <div className="font-mono" style={{ fontSize: '10.5px', color: '#f87171', marginTop: '4px' }}>
                  HIGH PRIORITY SLA BREACH
                </div>
              </div>

              {/* 04: Resueltos / Cerrados */}
              <div className="isometric-card" style={{
                backgroundColor: '#161d24',
                padding: '20px 22px',
                border: '1px solid #222c37',
                borderLeft: '3px solid #22c55e'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-mono" style={{ color: '#94a3b8', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Resueltos / Cerrados
                  </span>
                  <span className="font-mono" style={{ fontSize: '10px', color: '#64748b' }}>04 / KPI</span>
                </div>
                <div className="font-mono" style={{ fontSize: '36px', fontWeight: 700, color: '#4ade80', marginTop: '6px' }}>
                  {stats.cerrados}
                </div>
                <div className="font-mono" style={{ fontSize: '10.5px', color: '#4ade80', marginTop: '4px' }}>
                  VERIFIED RESOLUTION
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

            {/* 3 NODOS DE GRAFICOS SVG NATIVOS (0 VULNERABILIDADES) */}
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
        <section
          id="incidents-table"
          style={{
            backgroundColor: '#11161b',
            overflow: 'hidden',
            border: '1px solid #222c37',
            boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            borderBottom: '1px solid #222c37',
            backgroundColor: '#161d24'
          }}>
            <span className="font-mono" style={{ fontSize: '11px', color: '#00f0ff', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              INCIDENT COMPONENT MATRIX // ACTIVE RECORDS ({incidents.length})
            </span>
            <span className="font-mono" style={{ fontSize: '10.5px', color: '#64748b' }}>
              SPECIFICATION ALPHA // AB#8 - AB#15
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr className="font-mono" style={{ backgroundColor: '#080b0e', color: '#64748b', borderBottom: '1px solid #222c37', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <th style={{ padding: '13px 16px' }}>ID</th>
                <th style={{ padding: '13px 16px' }}>Título del Incidente</th>
                <th style={{ padding: '13px 16px' }}>Categoría</th>
                <th style={{ padding: '13px 16px' }}>Prioridad</th>
                <th style={{ padding: '13px 16px' }}>Estado</th>
                <th style={{ padding: '13px 16px' }}>Solicitante</th>
                <th style={{ padding: '13px 16px' }}>Fecha</th>
                <th style={{ padding: '13px 16px' }}>Operador Asignado</th>
                <th style={{ padding: '13px 16px', textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="font-mono" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>[LOADING INCIDENT MATRIX...]</td></tr>
              ) : incidents.length === 0 ? (
                <tr><td colSpan="9" className="font-mono" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>[0 RECORDS MATCH CURRENT QUERY FILTER]</td></tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id} style={{ borderBottom: '1px solid rgba(34, 44, 55, 0.65)', transition: 'background 150ms ease' }}>
                    <td className="font-mono" style={{ padding: '14px 16px', fontWeight: 700, color: '#38bdf8' }}>
                      #{inc.id}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#ffffff' }}>
                      {inc.title}
                    </td>
                    <td className="font-mono" style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '11.5px' }}>
                      {inc.category}
                    </td>
                    <td style={{ padding: '14px 16px' }} className={`priority-${inc.priority.toLowerCase()}`}>
                      {inc.priority}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {getStatusBadge(inc.status)}
                    </td>
                    <td className="font-mono" style={{ padding: '14px 16px', color: '#cbd5e1', fontSize: '11.5px' }}>
                      {inc.reported_by}
                    </td>
                    <td className="font-mono" style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
                      {new Date(inc.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px', color: inc.assigned_technician ? '#e2e8f0' : '#64748b', fontSize: '12.5px' }}>
                      {inc.assigned_technician ? inc.assigned_technician.name : 'Unassigned'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => openDetail(inc.id)}
                        className="btn-blue"
                        style={{ padding: '6px 14px', fontSize: '10.5px' }}
                      >
                        Inspect Node →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>

      {/* FOOTER ESTILO CORE // ENTER */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        borderTop: '1px solid rgba(34, 44, 55, 0.6)',
        backgroundColor: '#11161b',
        padding: '36px 32px 24px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '11px',
          color: '#64748b'
        }} className="font-mono">
          <div>
            <strong style={{ color: '#ffffff' }}>CORE // IT INCIDENT HUB v1.0.0</strong> &bull; UMG Análisis de Sistemas II &bull; Sandbox Verified (0 Vulnerabilities)
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ color: '#ffb03a' }}>SMTP TLS: mbarriosg8@miumg.edu.gt</span>
            <span style={{ color: '#38bdf8' }}>AGENT: mayro-local-agent</span>
          </div>
        </div>
      </footer>

      {/* MODAL REGISTRAR NUEVO INCIDENTE */}
      {showNewModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #222c37', paddingBottom: '12px' }}>
              <div>
                <span className="font-mono" style={{ fontSize: '10px', color: '#00f0ff', letterSpacing: '0.14em' }}>
                  NEW INCIDENT CAPSULE // AB#8
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                  Registrar Incidente + Alerta Gmail
                </h2>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}
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
                  placeholder="Ej. Falla de conexión en switch de operaciones"
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
                  className="btn-blue"
                  style={{ padding: '10px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-cyan keycap-glow"
                  style={{ padding: '10px 20px' }}
                >
                  Commit &amp; Notify Gmail →
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #222c37', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span className="font-mono" style={{ color: '#00f0ff', fontWeight: 700, fontSize: '11px' }}>
                  INCIDENT NODE #{selectedIncident.id} // {selectedIncident.category} // PRIORIDAD {selectedIncident.priority}
                </span>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                  {selectedIncident.title}
                </h2>
                <div className="font-mono" style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span>👤 <strong style={{ color: '#e2e8f0' }}>Solicitante:</strong> {selectedIncident.reported_by}</span>
                  <span>📅 <strong style={{ color: '#e2e8f0' }}>Registrado:</strong> {new Date(selectedIncident.created_at).toLocaleString()}</span>
                  <span>🏷️ <strong style={{ color: '#e2e8f0' }}>Estado:</strong> {selectedIncident.status}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '13.5px', marginBottom: '16px', backgroundColor: '#080b0e', border: '1px solid #222c37', padding: '14px', lineHeight: '1.6' }}>
              {selectedIncident.description}
            </p>

            {/* SECCIÓN TRANSICIÓN DE OPERACIÓN */}
            <div style={{ backgroundColor: '#080b0e', border: '1px solid #222c37', borderLeft: '3px solid #ffb03a', padding: '16px', marginBottom: '16px' }}>
              <div className="font-mono" style={{ fontSize: '11.5px', color: '#ffb03a', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                ⚙️ STATE OVERRIDE MATRIX (ALERTA A mbarriosg8@miumg.edu.gt)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                <div>
                  <label style={labelStyle}>Estado ({selectedIncident.status})</label>
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
                  <label style={labelStyle}>Operador Asignado</label>
                  <select
                    value={targetTech}
                    onChange={(e) => setTargetTech(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">-- Unassigned --</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  className="btn-cyan"
                  style={{ alignSelf: 'flex-end', padding: '11px 16px' }}
                >
                  Apply State
                </button>
              </div>
            </div>

            {/* HISTORIAL DE AUDITORÍA */}
            <div style={{ marginBottom: '16px' }}>
              <h3 className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '8px' }}>
                📜 Audit Telemetry Log
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                {selectedIncident.logs && selectedIncident.logs.map(log => (
                  <div key={log.id} className="font-mono" style={{ fontSize: '11.5px', backgroundColor: '#080b0e', padding: '8px 12px', borderLeft: '2px solid #38bdf8', borderTop: '1px solid #222c37', borderRight: '1px solid #222c37', borderBottom: '1px solid #222c37' }}>
                    <span style={{ color: '#64748b' }}>[{new Date(log.created_at).toLocaleTimeString()}]</span> Transition → <strong style={{ color: '#00f0ff' }}>{log.new_status}</strong> by <em style={{ color: '#ffb03a' }}>{log.changed_by}</em> ({log.change_reason})
                  </div>
                ))}
              </div>
            </div>

            {/* COMENTARIOS DE SEGUIMIENTO */}
            <div>
              <h3 className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '8px' }}>
                💬 Operator Console Notes
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto', marginBottom: '10px' }}>
                {selectedIncident.comments && selectedIncident.comments.map(c => (
                  <div key={c.id} style={{ fontSize: '12px', backgroundColor: '#080b0e', padding: '8px 12px', border: '1px solid #222c37' }}>
                    <strong className="font-mono" style={{ color: '#ffb03a' }}>{c.author_name}:</strong> {c.comment}
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Append technical telemetry note..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="submit"
                  className="btn-blue"
                  style={{ padding: '10px 16px' }}
                >
                  Append
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}