exports.handler = async function(event) {
    const trackId = event.queryStringParameters.trackId

    const response = await fetch(`https://open.spotify.com/embed/track/${trackId}`)
    let html = await response.text()

    // Remove the track name, artist, and album art
    html = html.replace(/<title>[^<]*<\/title>/, '<title>Mystery Song</title>')

    // Inject CSS to hide identifying elements
    const hideStyles = `
    <style>
        .encore-text-body-medium-bold,
        .Type__TypeElement-sc-goli3j,
        [data-testid="track-name"],
        [data-testid="artist-name"],
        [data-testid="cover-art"],
        .image-container,
        img {
            display: none !important;
            visibility: hidden !important;
        }
    </style>`

    html = html.replace('</head>', hideStyles + '</head>')

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*'
        },
        body: html
    }
}
