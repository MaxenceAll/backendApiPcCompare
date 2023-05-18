const bcrypt = require('bcrypt');

async function test() {
  const password = '1234';
  const hashedPassword = await bcrypt.hash(password, 10);
  const passwordMatch = await bcrypt.compare(password, hashedPassword);
  console.log(passwordMatch); 
}

test();