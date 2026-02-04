const { query } = require('../db');

async function logAudit({ userId, action, detail, ip }){
  await query(
    'INSERT INTO audit_logs (user_id, action, detail, ip, created_at) VALUES (?, ?, ?, ?, NOW())',
    [userId || null, action, detail || '', ip || '']
  );
}

module.exports = { logAudit };
