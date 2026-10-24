/**
 * Servicio de Notificaciones y Alertas por Correo (Gmail / Google Workspace SMTP)
 * Configurado para: mbarriosg8@miumg.edu.gt (Mayro Geovanni Barrios Gameros - DevOps Lead)
 * Cumple Regla 9: Cero credenciales expuestas en código fuente y escapado anti-XSS (OWASP A03)
 */
const tls = require('node:tls');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });
const { escapeHtml } = require('../middleware/securityMiddleware');

const DEFAULT_RECIPIENT = process.env.ALERT_RECIPIENT || 'mbarriosg8@miumg.edu.gt';
const DEFAULT_SENDER = process.env.GMAIL_USER || 'mbarriosg8@miumg.edu.gt';
const EMAIL_HEADER_SAFE_RE = /^[^\s@<>,\r\n]+@[^\s@<>,\r\n]+\.[^\s@<>,\r\n]+$/;

function sanitizeHeaderValue(val) {
  return String(val ?? '').replace(/[\r\n]+/g, ' ').trim();
}

// Configuración dinámica en tiempo de ejecución (leída desde backend/.env)
let smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  user: DEFAULT_SENDER,
  pass: process.env.GMAIL_APP_PASSWORD || '',
  recipient: DEFAULT_RECIPIENT
};

let nextNotificationId = 3;

// Bitácora en memoria de correos procesados para trazabilidad en la UI y auditoría
let notificationHistory = [
  {
    id: 1,
    to: DEFAULT_RECIPIENT,
    from: `IT Incident Hub Alerts <${DEFAULT_SENDER}>`,
    subject: '[CRÍTICA] Incidente #2: Servidor de base de datos con alto uso de CPU',
    event_type: 'INCIDENT_CRITICAL_ALERT',
    incident_id: 2,
    priority: 'CRITICA',
    status: 'DELIVERED',
    transport: 'GMAIL_WORKSPACE_RELAY',
    timestamp: new Date('2026-10-14T10:15:30Z').toISOString(),
    html_preview: buildEmailHtml({
      id: 2,
      title: 'Servidor de base de datos con alto uso de CPU',
      description: 'PostgreSQL reporta 98% de consumo sostenido de CPU en queries.',
      category: 'SOFTWARE',
      priority: 'CRITICA',
      status: 'EN_PROCESO',
      reported_by: 'monitoring@empresa.com',
      assigned_technician: 'Diego Ramirez (DB)'
    }, 'ALERTA DE INCIDENTE CRÍTICO')
  },
  {
    id: 2,
    to: DEFAULT_RECIPIENT,
    from: `Azure Pipelines CI/CD <${DEFAULT_SENDER}>`,
    subject: '[AZURE PIPELINES] Build #12 Succeeded - Artefacto incident-hub-drop v1.0.0',
    event_type: 'PIPELINE_BUILD_SUCCESS',
    incident_id: null,
    priority: 'ALTA',
    status: 'DELIVERED',
    transport: 'AZURE_DEVOPS_HOOK',
    timestamp: new Date('2026-10-14T23:20:00Z').toISOString(),
    html_preview: buildPipelineEmailHtml({
      buildNumber: 'Build #12',
      result: 'succeeded',
      branch: 'main',
      commit: 'fdbe890',
      agent: 'mayro-local-agent (Pool: Default)',
      artifact: 'incident-hub-drop (v1.0.0)'
    })
  }
];

function buildEmailHtml(incident = {}, actionTitle = 'NOTIFICACIÓN DE INCIDENTE') {
  const priorityColor =
    incident.priority === 'CRITICA' ? '#DC2626' :
    incident.priority === 'ALTA' ? '#F97316' :
    incident.priority === 'MEDIA' ? '#EAB308' : '#22C55E';

  const safeTitle = escapeHtml(incident.title);
  const safeDesc = escapeHtml(incident.description);
  const safeCategory = escapeHtml(incident.category);
  const safePriority = escapeHtml(incident.priority);
  const safeStatus = escapeHtml(incident.status);
  const safeReportedBy = escapeHtml(incident.reported_by);
  const safeId = escapeHtml(incident.id);
  const safeActionTitle = escapeHtml(actionTitle);
  const safeRecipient = escapeHtml(smtpConfig ? smtpConfig.recipient : DEFAULT_RECIPIENT);

  return `
    <div style="background-color:#0A0A0A;color:#F5F5F5;font-family:'Inter',Arial,sans-serif;padding:24px;border:1px solid #2E2E2E;border-radius:4px;max-width:620px;margin:0 auto;">
      <div style="border-bottom:2px solid #DC2626;padding-bottom:12px;margin-bottom:16px;">
        <span style="background:#DC2626;color:#FFF;padding:3px 8px;font-weight:bold;font-size:11px;border-radius:2px;">IT INCIDENT HUB v1.0.0</span>
        <h2 style="margin:8px 0 0 0;color:#FFFFFF;font-size:18px;text-transform:uppercase;">${safeActionTitle}</h2>
      </div>
      <p style="color:#A3A3A3;font-size:13px;margin-bottom:16px;">
        Notificación oficial despachada a <strong>${safeRecipient}</strong> (DevOps &amp; Cloud Lead - UMG).
      </p>
      <table style="width:100%;border-collapse:collapse;background:#141414;border:1px solid #2E2E2E;font-size:13px;margin-bottom:16px;">
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#A3A3A3;width:35%;">ID de Ticket:</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#60A5FA;font-weight:bold;">#${safeId}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#A3A3A3;">Título:</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#FFFFFF;font-weight:bold;">${safeTitle}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#A3A3A3;">Prioridad / Categoría:</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;">
            <span style="color:${priorityColor};font-weight:bold;">${safePriority}</span> &bull; <span style="color:#D4D4D4;">${safeCategory}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#A3A3A3;">Estado Actual:</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#4ADE80;font-weight:bold;">${safeStatus}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#A3A3A3;">Reportado Por:</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#D4D4D4;">${safeReportedBy}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;color:#A3A3A3;">Descripción:</td>
          <td style="padding:8px 12px;color:#D4D4D4;">${safeDesc}</td>
        </tr>
      </table>
      <div style="font-size:11px;color:#737373;border-top:1px solid #2E2E2E;padding-top:10px;">
        Trazabilidad Azure DevOps: Organización <strong>DevOps-UMG-Mayro</strong> &bull; Proyecto <strong>incident-hub (AB#4 - AB#34)</strong>
      </div>
    </div>
  `.trim();
}

function buildPipelineEmailHtml(buildInfo = {}) {
  const isFailed = (buildInfo.result || buildInfo.status || '').toLowerCase() === 'failed';
  const accentColor = isFailed ? '#DC2626' : '#2563EB';
  const statusText = isFailed ? '❌ FAILED (BLOQUEADO POR QUALITY GATE)' : '✅ SUCCEEDED (RESTAURADO Y VERIFICADO)';
  const statusColor = isFailed ? '#F87171' : '#4ADE80';
  const safeBuildNumber = escapeHtml(buildInfo.buildNumber);
  const safeBranch = escapeHtml(buildInfo.branch);
  const safeCommit = escapeHtml(buildInfo.commit);
  const safeAgent = escapeHtml(buildInfo.agent);
  const safeErrorDetail = escapeHtml(buildInfo.errorDetail);
  const safeArtifact = escapeHtml(buildInfo.artifact);
  const safeRecipient = escapeHtml(smtpConfig ? smtpConfig.recipient : DEFAULT_RECIPIENT);
  const safeWorkItems = escapeHtml((buildInfo.workItems || ['AB#22', 'AB#24']).join(', '));

  const headerTitle = isFailed
    ? `🚨 ALERTA DE FALLO EN PIPELINE (${safeBuildNumber})`
    : `✅ SOLUCIÓN Y PIPELINE EXITOSO (${safeBuildNumber})`;

  return `
    <div style="background-color:#0A0A0A;color:#F5F5F5;font-family:'Inter',Arial,sans-serif;padding:24px;border:1px solid #2E2E2E;border-radius:4px;max-width:620px;margin:0 auto;">
      <div style="border-bottom:2px solid ${accentColor};padding-bottom:12px;margin-bottom:16px;">
        <span style="background:${accentColor};color:#FFF;padding:3px 8px;font-weight:bold;font-size:11px;border-radius:2px;">AZURE PIPELINES CI/CD</span>
        <h2 style="margin:8px 0 0 0;color:#FFFFFF;font-size:18px;">${headerTitle}</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#141414;border:1px solid #2E2E2E;font-size:13px;margin-bottom:16px;">
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#A3A3A3;width:35%;">Estado del Build:</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:${statusColor};font-weight:bold;">${statusText}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#A3A3A3;">Rama / Commit:</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#60A5FA;font-family:monospace;">${safeBranch} (${safeCommit})</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#A3A3A3;">Agente Ejecutor:</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#FFFFFF;">${safeAgent}</td>
        </tr>
        ${safeErrorDetail ? `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#F87171;font-weight:bold;">Causa del Fallo:</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#FCA5A5;font-family:monospace;font-size:12px;">${safeErrorDetail}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:8px 12px;color:#A3A3A3;">Artefacto de Release:</td>
          <td style="padding:8px 12px;color:#FBBF24;font-weight:bold;">📦 ${safeArtifact}</td>
        </tr>
      </table>
      <div style="font-size:11px;color:#737373;">
        Notificación enviada a: <strong>${safeRecipient}</strong> &bull; Azure Boards: <strong>${safeWorkItems}</strong>
      </div>
    </div>
  `.trim();
}

/**
 * Envío nativo por TLS a smtp.gmail.com:465 con prevención de CRLF injection y dot-stuffing RFC 5321
 */
function sendRawSmtpTls({ host, port, user, pass, to, subject, html }) {
  return new Promise((resolve, reject) => {
    const cleanUser = sanitizeHeaderValue(user);
    const cleanTo = sanitizeHeaderValue(to);
    const cleanSubject = sanitizeHeaderValue(subject);

    if (!EMAIL_HEADER_SAFE_RE.test(cleanUser) || !EMAIL_HEADER_SAFE_RE.test(cleanTo)) {
      return reject(new Error('Dirección de correo inválida o intento de inyección de cabeceras SMTP'));
    }

    const cleanPass = String(pass).replace(/\s+/g, '');
    // RFC 5321 Sección 4.5.2: Dot-stuffing para evitar cierre prematuro de bloque DATA
    const dotStuffedHtml = String(html).replace(/\r?\n/g, '\r\n').replace(/^\./gm, '..');

    const commands = [
      `EHLO incident-hub.local\r\n`,
      `AUTH LOGIN\r\n`,
      `${Buffer.from(cleanUser).toString('base64')}\r\n`,
      `${Buffer.from(cleanPass).toString('base64')}\r\n`,
      `MAIL FROM:<${cleanUser}>\r\n`,
      `RCPT TO:<${cleanTo}>\r\n`,
      `DATA\r\n`,
      [
        `From: "IT Incident Hub DevOps" <${cleanUser}>`,
        `To: <${cleanTo}>`,
        `Date: ${new Date().toUTCString()}`,
        `Subject: =?UTF-8?B?${Buffer.from(cleanSubject).toString('base64')}?=`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=UTF-8`,
        ``,
        dotStuffedHtml,
        `.`,
        ``
      ].join('\r\n')
    ];

    let step = 0;
    let buffer = '';
    let resolved = false;

    const socket = tls.connect({ host, port, servername: host }, () => {});

    socket.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        if (/^\d{3} /.test(line)) {
          const code = parseInt(line.substring(0, 3), 10);
          if (code >= 400) {
            socket.destroy();
            if (!resolved) {
              resolved = true;
              reject(new Error(`SMTP Error ${code}: ${line}`));
            }
            return;
          }

          if (step < commands.length) {
            const cmd = commands[step];
            step++;
            socket.write(cmd);
          } else if (!resolved) {
            resolved = true;
            socket.write(`QUIT\r\n`);
            socket.end();
            resolve({ sent: true, transport: 'SMTP_TLS_GMAIL_REAL' });
          }
        }
      }
    });

    socket.setTimeout(10000, () => {
      socket.destroy();
      if (!resolved) {
        resolved = true;
        reject(new Error('SMTP Connection Timeout'));
      }
    });

    socket.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });
  });
}

async function sendIncidentNotification(incident, eventType = 'INCIDENT_CREATED', customActionTitle = null) {
  const actionTitle = customActionTitle || (
    eventType === 'INCIDENT_CREATED' ? 'NUEVO INCIDENTE REGISTRADO' :
    eventType === 'INCIDENT_STATUS_CHANGED' ? `CAMBIO DE ESTADO A ${incident.status}` :
    'ALERTA OPERATIVA DE INCIDENTE'
  );

  const subject = `[${incident.priority}] Incidente #${incident.id}: ${incident.title} (${incident.status})`;
  const html = buildEmailHtml(incident, actionTitle);

  const hasSmtpCredentials = Boolean(smtpConfig.pass && smtpConfig.pass.trim().length > 0);
  let transportUsed = 'LOCAL_OUTBOX_SIMULATION';
  let deliveryStatus = 'SIMULATED_OUTBOX_NO_SMTP';

  if (hasSmtpCredentials && process.env.NODE_ENV !== 'test') {
    try {
      await sendRawSmtpTls({
        host: smtpConfig.host,
        port: smtpConfig.port,
        user: smtpConfig.user,
        pass: smtpConfig.pass,
        to: smtpConfig.recipient,
        subject,
        html
      });
      transportUsed = 'SMTP_GMAIL_REAL_TLS';
      deliveryStatus = 'SENT_TO_GMAIL_INBOX';
    } catch (err) {
      console.error('[SMTP Warning]:', err.message);
      transportUsed = 'OUTBOX_FALLBACK_RESILIENT';
      deliveryStatus = 'SMTP_DELIVERY_FAILED';
    }
  }

  const record = {
    id: nextNotificationId++,
    to: smtpConfig.recipient,
    from: `IT Incident Hub Alerts <${smtpConfig.user}>`,
    subject,
    event_type: eventType,
    incident_id: incident.id,
    priority: incident.priority,
    status: deliveryStatus,
    transport: transportUsed,
    timestamp: new Date().toISOString(),
    html_preview: html
  };

  notificationHistory.unshift(record);
  return record;
}

async function sendPipelineNotification(buildInfo) {
  const isFailed = (buildInfo.result || buildInfo.status || '').toLowerCase() === 'failed';
  const subject = isFailed
    ? `🚨 [FALLO EN PIPELINE ❌] ${buildInfo.buildNumber} FAILED - ${buildInfo.branch} (AB#22)`
    : `✅ [SOLUCIÓN APLICADA] ${buildInfo.buildNumber} SUCCEEDED - ${buildInfo.branch} (AB#30)`;
  const html = buildPipelineEmailHtml(buildInfo);

  const hasSmtpCredentials = Boolean(smtpConfig.pass && smtpConfig.pass.trim().length > 0);
  let transportUsed = 'LOCAL_OUTBOX_SIMULATION';
  let deliveryStatus = 'SIMULATED_OUTBOX_NO_SMTP';

  if (hasSmtpCredentials && process.env.NODE_ENV !== 'test') {
    try {
      await sendRawSmtpTls({
        host: smtpConfig.host,
        port: smtpConfig.port,
        user: smtpConfig.user,
        pass: smtpConfig.pass,
        to: smtpConfig.recipient,
        subject,
        html
      });
      transportUsed = 'SMTP_GMAIL_REAL_TLS';
      deliveryStatus = 'SENT_TO_GMAIL_INBOX';
    } catch (err) {
      console.error('[SMTP Warning]:', err.message);
      transportUsed = 'AZURE_OUTBOX_RESILIENT';
      deliveryStatus = 'SMTP_DELIVERY_FAILED';
    }
  }

  const record = {
    id: nextNotificationId++,
    to: smtpConfig.recipient,
    from: `Azure Pipelines CI/CD <${smtpConfig.user}>`,
    subject,
    event_type: isFailed ? 'PIPELINE_BUILD_FAILED' : 'PIPELINE_BUILD_NOTIFICATION',
    incident_id: null,
    priority: isFailed ? 'CRITICA' : 'ALTA',
    status: deliveryStatus,
    transport: transportUsed,
    timestamp: new Date().toISOString(),
    html_preview: html
  };

  notificationHistory.unshift(record);
  return record;
}

function getNotifications() {
  return {
    recipient: smtpConfig.recipient,
    sender: smtpConfig.user,
    smtp_configured: Boolean(smtpConfig.pass && smtpConfig.pass.trim().length > 0),
    total_sent: notificationHistory.length,
    notifications: notificationHistory
  };
}

function updateSmtpConfig({ recipient, user, appPassword }) {
  if (recipient) {
    const cleanRecipient = sanitizeHeaderValue(recipient);
    if (!EMAIL_HEADER_SAFE_RE.test(cleanRecipient)) {
      const err = new Error('Formato de correo recipient inválido');
      err.statusCode = 400;
      throw err;
    }
    smtpConfig.recipient = cleanRecipient;
  }
  if (user) {
    const cleanUser = sanitizeHeaderValue(user);
    if (!EMAIL_HEADER_SAFE_RE.test(cleanUser)) {
      const err = new Error('Formato de correo sender user inválido');
      err.statusCode = 400;
      throw err;
    }
    smtpConfig.user = cleanUser;
  }
  if (appPassword !== undefined) {
    smtpConfig.pass = sanitizeHeaderValue(appPassword);
  }
  return {
    recipient: smtpConfig.recipient,
    sender: smtpConfig.user,
    smtp_configured: Boolean(smtpConfig.pass && smtpConfig.pass.trim().length > 0)
  };
}

module.exports = {
  DEFAULT_RECIPIENT,
  sendIncidentNotification,
  sendPipelineNotification,
  getNotifications,
  updateSmtpConfig,
  buildEmailHtml,
  buildPipelineEmailHtml
};
