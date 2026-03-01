const AuditLog = require('../models/AuditLog');

async function logAudit({ userId, userName, action, resource, resourceId, details, detail, ip, userAgent }){
  try {
    await AuditLog.create({
      userId: userId || null,
      userName: userName || 'System',
      action,
      resource: resource || '',
      resourceId: resourceId || '',
      details: details || detail || '',
      ip: ip || '',
      userAgent: userAgent || '',
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

module.exports = { logAudit };
