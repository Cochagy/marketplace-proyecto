const bcrypt = require('bcryptjs');

const encripta = async (password) => {
    const salt = await bcrypt.genSalt(10);
     return bcrypt.hash(password, salt);   
}

const compara = async (password, password_encriptada) => {
    return await bcrypt.compare(password, password_encriptada)
}

module.exports = {
    encripta,
    compara

}  