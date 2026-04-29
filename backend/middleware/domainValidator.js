const allowedDomains = ['gehu.ac.in', 'geu.ac.in'];

const validateEmailDomain = (req, res, next) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain || !allowedDomains.includes(domain)) {
    return res.status(400).json({
      success: false,
      message: `Only @gehu.ac.in or @geu.ac.in email addresses are allowed to register.`
    });
  }
  next();
};

module.exports = { validateEmailDomain };
