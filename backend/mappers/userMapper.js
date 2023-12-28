const userMapper = (user) => {
  const userWithoutPassword = { ...user._doc };
  delete userWithoutPassword.password;
  return userWithoutPassword;
};

module.exports = userMapper;
