const AuditLog = require('../models/AuditLog');

async function logAudit({ userId, action, detail, ip }){
  await AuditLog.create({
    userId: userId || null,
    action,
    detail: detail || '',
    ip: ip || ''
  });
}

module.exports = { logAudit };
