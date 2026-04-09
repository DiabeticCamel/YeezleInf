exports.handler = async function(event) {
    const trackId = event.queryStringParameters.trackId

    const response = await fetch(`https://open.spotify.com/embed/track/${trackId}`)
    let html = await response.text()

   const hideScript = `
<script>
    function hideElements() {
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
            'canvas',
            '[data-testid="cover-art-image"]',
            '[aria-label*="album"]',
            '[aria-label*="cover"]',
        ]
        
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.setProperty('display', 'none', 'important')
            })
        })

        // force background to solid dark color to hide the dynamic background
        document.body.style.setProperty('background', 'rgb(18, 18, 18)', 'important')
        document.body.style.setProperty('background-image', 'none', 'important')
        
        // target any element with a background-image inline style
        document.querySelectorAll('*').forEach(el => {
            const style = window.getComputedStyle(el)
            if (style.backgroundImage && style.backgroundImage !== 'none') {
                el.style.setProperty('background-image', 'none', 'important')
                el.style.setProperty('background', 'rgb(18, 18, 18)', 'important')
            }
        })
    }

    hideElements()
    setInterval(hideElements, 100)
    
    const observer = new MutationObserver(hideElements)
    observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
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
