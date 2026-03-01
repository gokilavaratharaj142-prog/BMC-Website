const Lead = require('../models/Lead');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Session = require('../models/Session');

async function getOverview(userId){
  const leadCount = await Lead.countDocuments();
  const feedbackCount = await Feedback.countDocuments();
  const userCount = await User.countDocuments();
  
  // Get active sessions (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activeSessions = await Session.countDocuments({ 
    lastActivity: { $gte: oneDayAgo },
    isActive: true 
  });
  
  // Get current user info
  let user = null;
  if(userId) {
    user = await User.findById(userId).select('username role lastActive loginCount');
  }
  
  return {
    leads: leadCount || 0,
    feedback: feedbackCount || 0,
    users: userCount || 0,
    activeSessions: activeSessions || 0,
    user: user
  };
}

async function getLeadsByDay(days = 7){
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const leads = await Lead.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  return leads.map(r => ({ day: r._id, total: r.total }));
}

module.exports = { getOverview, getLeadsByDay };
