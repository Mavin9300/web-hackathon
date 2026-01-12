
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  // Min 6 chars
  return password && password.length >= 6;
};

export const validateUsername = (username) => {
  // Min 3 chars
  return username && username.length >= 3;
};
