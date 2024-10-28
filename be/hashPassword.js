const bcrypt = require('bcryptjs');

(async () => {
  const password = '12345'; // Replace this with the desired password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed password:", hashedPassword);
})();
