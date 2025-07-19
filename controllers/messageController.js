const Message = require('../models/Message');
const User = require('../models/User');

// ✅ Send a message using receiver's mobile number and PIN (to determine chatType)
exports.sendMessage = async (req, res) => {
  const { receiverMobile, message, pin } = req.body;

  try {
    const receiver = await User.findOne({ mobile: receiverMobile });
    if (!receiver) return res.status(404).json({ msg: "User not found" });

    // Determine chat type from PIN
    let chatType = '';
    if (pin === receiver.pinPersonal) {
      chatType = 'personal';
    } else if (pin === receiver.pinGeneral) {
      chatType = 'general';
    } else {
      return res.status(401).json({ msg: "Invalid PIN" });
    }

    const newMsg = new Message({
      sender: req.user.userId,
      receiver: receiver._id,
      message,
      chatType
    });

    await newMsg.save();
    res.status(201).json({ msg: `Message sent to ${chatType} chat`, data: newMsg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all messages between two users and filter by chatType
exports.getMessages = async (req, res) => {
  const { userId1, userId2, type } = req.query; // type = 'personal' or 'general'

  try {
    const messages = await Message.find({
      $and: [
        {
          $or: [
            { sender: userId1, receiver: userId2 },
            { sender: userId2, receiver: userId1 }
          ]
        },
        { chatType: type }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
