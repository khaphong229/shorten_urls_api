function getNameApiKey(api_key) {
    return api_key.split('/')[2].split('.')[0];
}

module.exports = getNameApiKey;
