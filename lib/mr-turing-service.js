const axios = require("axios")
const constants = require("./constants")

const baseURL = constants.mrTuring.BASE_URL
const http = axios.create({ baseURL })

function createMrTuringService(cache, status, { email, password }) {
    function login() {
        status.login()
        return http.post("/login", {
            email,
            password
        }).then(({ data }) => {
            const DAY_IN_SECONDS = 86400
            cache.set(constants.cache.TOKEN_KEY, data.access_token, DAY_IN_SECONDS)
            return data
        })
    }

    async function _getToken() {
        if(!cache.has("MR_TURING_TOKEN")) {
            await login()
        }
        const token = cache.get(constants.cache.TOKEN_KEY)
        return token
    }
    
    async function getKnowledgeBases() {
        const token = await _getToken()
        return http.get("/knowledge-base", {
                headers: {
                    authorization:  `Bearer ${token}`
                }
            })
            .then(({ data }) => {
                return data
            })
    }
    
    async function ask(question, knowledgeBase) {
        const token = await _getToken()
        status.questioning()
        return http.post("/ask", {
            question,
            kb_id: [knowledgeBase],
            deep_search: true
            }, {
                headers: {
                    authorization:  `Bearer ${token}`
                }
            })
            .then(({ data }) => {
                return data
            })
    }

    return {
        login,
        getKnowledgeBases,
        ask
    }
}



module.exports = createMrTuringService