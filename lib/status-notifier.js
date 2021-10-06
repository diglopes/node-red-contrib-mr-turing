function createStatusNotifier(node) {

    function clear() {
        node.status({})
    }
    
    function questioning() {
        node.status({ text: "questioning", fill: "yellow", shape: "dot" })
    }

    function login() {
        node.status({ text: "logging in", fill: "blue", shape: "dot" })
    }

    function error(msg) {
        node.status({ text: msg || "error", fill: "red", shape: "ring" })
    }

    return {
        node,
        clear,
        questioning,
        login,
        error
    }
}

module.exports = createStatusNotifier