const axios = require("axios")
const constants = require("./constants")

const baseURL = constants.mrTuring.BASE_URL
const http = axios.create({ baseURL })

function createMrTuringService() {
    function login(email, password) {
        return http.post("/login", {
            email,
            password
        }).then(({ data }) => {
            this._accessToken = data.access_token
            return data
        })
    }
    
    function getKnowledgeBases() {
        return http.get("/knowledge-base", {
                headers: {
                    authorization:  `Bearer ${this._accessToken}`
                }
            })
            .then(({ data }) => {
                return data
            })
    }
    
    function ask(question, knowledgeBase) {
        return http.post("/ask", {
            question,
            kb_id: [knowledgeBase],
            deep_search: true
            }, {
                headers: {
                    authorization:  `Bearer ${this._accessToken}`
                }
            })
            .then(({ data }) => {
                return data
            })
    }

    return {
        _accessToken: null,
        login,
        getKnowledgeBases,
        ask
    }
}



module.exports = createMrTuringService