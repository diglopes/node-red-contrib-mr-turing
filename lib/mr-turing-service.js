const axios = require("axios")
const constants = require("./constants")

const baseURL = constants.mrTuring.BASE_URL
const http = axios.create({ baseURL })

function login(email, password) {
    return http.post("/login", {
        email,
        password
    }).then(({ data }) => {
        return data
    })
}


module.exports = {
    login
}