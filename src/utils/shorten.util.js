
async function shortenUrl(original_url, api_key) {
    const apiUrl = api_key + original_url
    
    try {
        const response = await fetch(apiUrl)
        const result = await response.json()

        if (result.status !== 'success') {
            console.log(result.message)
        } else {
            return result.shortenedUrl
        }
    } catch (error) {
        console.error('Error:', error)
    }
}

module.exports = shortenUrl
