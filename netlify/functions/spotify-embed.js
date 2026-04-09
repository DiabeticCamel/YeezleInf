exports.handler = async function(event) {
    const trackId = event.queryStringParameters.trackId

    const response = await fetch(`https://open.spotify.com/embed/track/${trackId}`)
    let html = await response.text()

    const hideScript = `
    <script>
        function hideElements() {
            // hide everything first
            document.body.style.overflow = 'hidden'
            
            const selectors = [
                '[data-testid="track-name"]',
                '[data-testid="artist-name"]', 
                '[data-testid="cover-art"]',
                '[data-testid="subtitle"]',
                'a[href*="/artist/"]',
                'a[href*="/track/"]',
                'a[href*="/album/"]',
                'img',
            ]
            
            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    el.style.setProperty('display', 'none', 'important')
                })
            })
        }

        // run immediately
        hideElements()
        
        // run repeatedly as spotify loads content dynamically
        setInterval(hideElements, 100)
        
        // also run on any DOM changes
        const observer = new MutationObserver(hideElements)
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        })
    <\/script>`

    html = html.replace('</body>', hideScript + '</body>')

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*'
        },
        body: html
    }
}
