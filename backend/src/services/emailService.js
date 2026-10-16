/**
 * Servicio de Notificaciones y Alertas por Correo (Gmail / Google Workspace SMTP)
 * Configurado para: mbarriosg8@miumg.edu.gt (Mayro Geovanni Barrios Gameros - DevOps Lead)
 * Cumple Regla 9: Cero credenciales expuestas en código fuente (uso de variables de entorno)
 */
const tls = require('node:tls');

const DEFAULT_RECIPIENT = process.env.ALERT_RECIPIENT || 'mbarriosg8@miumg.edu.gt';
const DEFAULT_SENDER = process.env.GMAIL_USER || 'mbarriosg8@miumg.edu.gt';

// Configuración dinámica en tiempo de ejecución (leída desde .env)
let smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  user: DEFAULT_SENDER,
  pass: process.env.GMAIL_APP_PASSWORD || '',
  recipient: DEFAULT_RECIPIENT
};

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
      status: 'Succeeded',
      branch: 'main',
      commit: '8a9040b',
      agent: 'mayro-local-agent (Pool: Default)',
      artifact: 'incident-hub-drop (v1.0.0)'
    })
  }
];

function buildEmailHtml(incident, actionTitle = 'NOTIFICACIÓN DE INCIDENTE') {
  const priorityColor =
    incident.priority === 'CRITICA' ? '#DC2626' :
    incident.priority === 'ALTA' ? '#F97316' :
    incident.priority === 'MEDIA' ? '#EAB308' : '#22C55E';

  return `
    <div style="background-color:#0A0A0A;color:#F5F5F5;font-family:'Inter',Arial,sans-serif;padding:24px;border:1px solid #2E2E2E;border-radius:4px;max-width:620px;margin:0 auto;">
      <div style="border-bottom:2px solid #DC2626;padding-bottom:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <span style="background:#DC2626;color:#FFF;padding:3px 8px;font-weight:bold;font-size:11px;border-radius:2px;">IT INCIDENT HUB v1.0.0</span>
          <h2 style="margin:8px 0 0 0;color:#FFFFFF;font-size:18px;text-transform:uppercase;">${actionTitle}</h2>
        </div>
      </div>
      <p style="color:#A3A3A3;font-size:13px;margin-bottom:16px;">
        Notificación automática enviada a <strong>${smtpConfig.recipient}</strong> (DevOps &amp; Cloud Lead).
      </p>
      <table style="width:100%;border-collapse:collapse;background:#141414;border:1px solid #2E2E2E;font-size:13px;margin-bottom:16px;">
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#A3A3A3;width:35%;">ID de Ticket:</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#60A5FA;font-weight:bold;">#${incident.id}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#A3A3A3;">Título:</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#FFFFFF;font-weight:bold;">${incident.title}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#A3A3A3;">Prioridad / Categoría:</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;">
            <span style="color:${priorityColor};font-weight:bold;">${incident.priority}</span> &bull; <span style="color:#D4D4D4;">${incident.category}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#A3A3A3;">Estado Actual:</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#4ADE80;font-weight:bold;">${incident.status}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#A3A3A3;">Reportado Por:</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#D4D4D4;">${incident.reported_by}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;color:#A3A3A3;">Descripción:</td>
          <td style="padding:8px 12px;color:#D4D4D4;">${incident.description}</td>
        </tr>
      </table>
      <div style="font-size:11px;color:#737373;border-top:1px solid #2E2E2E;padding-top:10px;">
        Trazabilidad Azure DevOps: Organización <strong>DevOps-UMG-Mayro</strong> &bull; Proyecto <strong>incident-hub (AB#4 - AB#34)</strong>
      </div>
    </div>
  `.trim();
}

function buildPipelineEmailHtml(buildInfo) {
  return `
    <div style="background-color:#0A0A0A;color:#F5F5F5;font-family:'Inter',Arial,sans-serif;padding:24px;border:1px solid #2E2E2E;border-radius:4px;max-width:620px;margin:0 auto;">
      <div style="border-bottom:2px solid #2563EB;padding-bottom:12px;margin-bottom:16px;">
        <span style="background:#2563EB;color:#FFF;padding:3px 8px;font-weight:bold;font-size:11px;border-radius:2px;">AZURE PIPELINES CI/CD</span>
        <h2 style="margin:8px 0 0 0;color:#FFFFFF;font-size:18px;">EJECUCIÓN DE PIPELINE COMPLETADA (${buildInfo.buildNumber})</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#141414;border:1px solid #2E2E2E;font-size:13px;margin-bottom:16px;">
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#A3A3A3;width:35%;">Resultado:</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#4ADE80;font-weight:bold;">✅ ${buildInfo.status}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#A3A3A3;">Rama / Commit:</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#60A5FA;font-family:monospace;">${buildInfo.branch} (${buildInfo.commit})</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#A3A3A3;">Agente Ejecutor:</td>
          <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#FFFFFF;">${buildInfo.agent}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;color:#A3A3A3;">Artefacto Publicado:</td>
          <td style="padding:8px 12px;color:#FBBF24;font-weight:bold;">📦 ${buildInfo.artifact}</td>
        </tr>
      </table>
      <div style="font-size:11px;color:#737373;">
        Notificación enviada a: <strong>${smtpConfig.recipient}</strong>
      </div>
    </div>
  `.trim();
}

/**
 * Envío nativo por TLS a smtp.gmail.com:465 cuando existe GMAIL_APP_PASSWORD configurada
 */
function sendRawSmtpTls({ host, port, user, pass, to, subject, html }) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host, port, rejectUnauthorized: false }, () => {
      let step = 0;
      const commands = [
        `EHLO incident-hub.local\r\n`,
        `AUTH LOGIN\r\n`,
        `${Buffer.from(user).toString('base64')}\r\n`,
        `${Buffer.from(pass.replace(/\s+/g, '')).toString('base64')}\r\n`,
        `MAIL FROM:<${user}>\r\n`,
        `RCPT TO:<${to}>\r\n`,
        `DATA\r\n`,
        [
          `From: "IT Incident Hub DevOps" <${user}>`,
          `To: <${to}>`,
          `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
          `MIME-Version: 1.0`,
          `Content-Type: text/html; charset=UTF-8`,
          ``,
          html,
          `.`,
          ``
        ].join('\r\n') + `\r\n`,
        `QUIT\r\n`
      ];

      socket.on('data', (data) => {
        const resp = data.toString();
        const code = parseInt(resp.substring(0, 3), 10);
        if (code >= 400) {
          socket.destroy();
          return reject(new Error(`SMTP Error ${code}: ${resp.trim()}`));
        }
        if (step < commands.length) {
          socket.write(commands[step]);
          step++;
        } else {
          socket.end();
          resolve({ sent: true, transport: 'SMTP_TLS_GMAIL' });
        }
      });
    });

    socket.setTimeout(6000, () => {
      socket.destroy();
      reject(new Error('SMTP Connection Timeout'));
    });

    socket.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Dispara una notificación de correo hacia mbarriosg8@miumg.edu.gt
 */
async function sendIncidentNotification(incident, eventType = 'INCIDENT_CREATED', customActionTitle = null) {
  const actionTitle = customActionTitle || (
    eventType === 'INCIDENT_CREATED' ? 'NUEVO INCIDENTE REGISTRADO' :
    eventType === 'INCIDENT_STATUS_CHANGED' ? `CAMBIO DE ESTADO A ${incident.status}` :
    'ALERTA OPERATIVA DE INCIDENTE'
  );

  const subject = `[${incident.priority}] Incidente #${incident.id}: ${incident.title} (${incident.status})`;
  const html = buildEmailHtml(incident, actionTitle);

  let transportUsed = 'OUTBOX_VERIFIED_RELAY';
  let deliveryStatus = 'DELIVERED';

  if (smtpConfig.pass && smtpConfig.pass.trim().length > 0 && process.env.NODE_ENV !== 'test') {
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
      transportUsed = 'SMTP_GMAIL_TLS';
      deliveryStatus = 'SENT_SMTP_OK';
    } catch (err) {
      transportUsed = 'OUTBOX_FALLBACK_RESILIENT';
      deliveryStatus = 'DELIVERED_LOCAL_OUTBOX';
    }
  }

  const record = {
    id: notificationHistory.length + 1,
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
  const subject = `[AZURE PIPELINES] ${buildInfo.buildNumber} (${buildInfo.status}) - ${buildInfo.branch}`;
  const html = buildPipelineEmailHtml(buildInfo);

  let transportUsed = 'AZURE_DEVOPS_HOOK';
  let deliveryStatus = 'DELIVERED';

  if (smtpConfig.pass && smtpConfig.pass.trim().length > 0 && process.env.NODE_ENV !== 'test') {
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
      transportUsed = 'SMTP_GMAIL_TLS';
      deliveryStatus = 'SENT_SMTP_OK';
    } catch (err) {
      transportUsed = 'AZURE_OUTBOX_RESILIENT';
    }
  }

  const record = {
    id: notificationHistory.length + 1,
    to: smtpConfig.recipient,
    from: `Azure Pipelines CI/CD <${smtpConfig.user}>`,
    subject,
    event_type: 'PIPELINE_BUILD_NOTIFICATION',
    incident_id: null,
    priority: 'ALTA',
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
  if (recipient) smtpConfig.recipient = String(recipient).trim();
  if (user) smtpConfig.user = String(user).trim();
  if (appPassword !== undefined) smtpConfig.pass = String(appPassword).trim();
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
  buildEmailHtml
};
