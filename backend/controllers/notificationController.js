const Notification = require('../models/Notification');

exports.getNotifications = async function (req, res) {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false,
    });
    return res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async function (req, res) {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { isRead: true }
    );
    return res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllAsRead = async function (req, res) {
  try {
    await Notification.updateMany({ recipientId: req.user._id }, { isRead: true });
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
