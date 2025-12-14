const requireShift = async (req, res, next) => {
  const user = req.user;

  // Allow unrestricted access to managers and owners
  if (user.role === "owner" || user.role === "manager") {
    return next();
  }

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const shift = await StaffShift.findOne({ staffId: user.id, date: today });

  if (!shift) return res.status(403).json({ message: "No shift assigned today" });

  const start = new Date(`${today}T${shift.startTime}:00`);
  const end = new Date(`${today}T${shift.endTime}:00`);

  if (now < start || now > end) {
    return res.status(403).json({ message: "Access denied: outside shift hours" });
  }

  next();
};