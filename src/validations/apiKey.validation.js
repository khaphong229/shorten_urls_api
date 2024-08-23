function apiKeyValidate(api_key) {
    const urlIndex = api_key.indexOf('&url=');

    if (urlIndex === -1) {
        return false;
    }

    return true;
}

module.exports = apiKeyValidate;
