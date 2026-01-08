// Bangladesh DNS with CORS Fix
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/dns-json'
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers })
  }

  // DNS query endpoint
  if (url.pathname === '/dns-query') {
    const name = url.searchParams.get('name') || 'google.com'
    
    // BDIX Optimized IPs
    const bdixMap = {
      'youtube.com': '180.87.36.25',
      'facebook.com': '157.240.198.35',
      'google.com': '142.250.183.206',
      'prothomalo.com': '103.101.91.10'
    }

    // Check BDIX
    if (bdixMap[name]) {
      return new Response(JSON.stringify({
        Status: 0,
        Answer: [{
          name: name,
          type: 1,
          TTL: 600,
          data: bdixMap[name]
        }]
      }), { headers })
    }

    // Forward to Cloudflare DNS
    try {
      const dnsResponse = await fetch(`https://cloudflare-dns.com/dns-query?name=${name}`)
      const data = await dnsResponse.json()
      
      return new Response(JSON.stringify(data), { headers })
    } catch (error) {
      return new Response(JSON.stringify({
        Status: 2,
        error: error.message
      }), { headers })
    }
  }

  // Home page
  return new Response(`
    <html>
    <body>
      <h1>Bangladesh DNS Server</h1>
      <p>DNS Query: /dns-query?name=google.com</p>
      <p>CORS: Enabled for all origins</p>
    </body>
    </html>
  `, { headers: { 'Content-Type': 'text/html' } })
}
