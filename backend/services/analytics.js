const Lead = require('../models/Lead');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

async function getOverview(){
  const leadCount = await Lead.countDocuments();
  const feedbackCount = await Feedback.countDocuments();
  const userCount = await User.countDocuments();
  return {
    leads: leadCount || 0,
    feedback: feedbackCount || 0,
    users: userCount || 0,
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
