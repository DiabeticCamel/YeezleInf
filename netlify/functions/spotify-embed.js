exports.handler = async function(event) {
    const trackId = event.queryStringParameters.trackId

    const response = await fetch(`https://open.spotify.com/embed/track/${trackId}`)
    let html = await response.text()

   const hideScript = `
<script>
    let frozen = false

    function hideElements() {
        if (frozen) return
        frozen = true

        const selectors = [
            '[data-testid="track-name"]',
            '[data-testid="artist-name"]',
            '[data-testid="cover-art"]',
            '[data-testid="cover-art-image"]',
            '[data-testid="subtitle"]',
            'a[href*="/artist/"]',
            'a[href*="/track/"]',
            'a[href*="/album/"]',
            'img',
            'canvas',
            '[aria-label*="album"]',
            '[aria-label*="cover"]',
        ]

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.setProperty('display', 'none', 'important')
            })
        })

        // only target elements that actually have a background-image
        // instead of all elements
        document.querySelectorAll('[style*="background"]').forEach(el => {
            el.style.setProperty('background-image', 'none', 'important')
            el.style.setProperty('background-color', 'rgb(18, 18, 18)', 'important')
        })

        document.body.style.setProperty('background', 'rgb(18, 18, 18)', 'important')

        frozen = false
    }

    // run once immediately
    hideElements()

    // run less frequently to avoid freezing
    setInterval(hideElements, 500)

    const observer = new MutationObserver(() => {
        hideElements()
    })

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
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
