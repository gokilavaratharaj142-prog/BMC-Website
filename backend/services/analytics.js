const { query } = require('../db');

async function getOverview(){
  const [leadCount] = await query('SELECT COUNT(*) as total FROM leads');
  const [feedbackCount] = await query('SELECT COUNT(*) as total FROM feedback');
  const [userCount] = await query('SELECT COUNT(*) as total FROM users');
  return {
    leads: leadCount?.total || 0,
    feedback: feedbackCount?.total || 0,
    users: userCount?.total || 0,
  };
}

async function getLeadsByDay(days = 7){
  const rows = await query(
    `SELECT DATE(created_at) as day, COUNT(*) as total
     FROM leads
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY DATE(created_at)
     ORDER BY day ASC`,
    [days]
  );
  return rows;
}

module.exports = { getOverview, getLeadsByDay };
