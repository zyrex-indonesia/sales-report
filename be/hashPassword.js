const bcrypt = require('bcryptjs');

(async () => {
  const password = 'Zyr3xuser'; // Replace this with the desired password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed password:", hashedPassword);
})();
