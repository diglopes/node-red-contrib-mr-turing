function createStatusNotifier(node) {

    function clear() {
        node.status({})
    }
    
    function questioning() {
        node.status({ text: "questioning", fill: "yellow", shape: "dot" })
    }

    function login() {
        node.status({ text: "logging in", fill: "yellow", shape: "dot" })
    }

    return {
        node,
        clear,
        questioning,
        login
    }
}

module.exports = createStatusNotifier