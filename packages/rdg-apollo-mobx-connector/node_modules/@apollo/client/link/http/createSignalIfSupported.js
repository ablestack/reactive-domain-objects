var createSignalIfSupported = function () {
    if (typeof AbortController === 'undefined')
        return { controller: false, signal: false };
    var controller = new AbortController();
    var signal = controller.signal;
    return { controller: controller, signal: signal };
};

export { createSignalIfSupported };
//# sourceMappingURL=createSignalIfSupported.js.map
