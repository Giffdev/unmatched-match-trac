export async function scrapeUnmatchedData() {
  try {
    const response = await fetch('https://unmatched.cards/umdb/decks')
    const html = await response.text()
    
    console.log('Fetched HTML length:', html.length)
    console.log('First 500 chars:', html.substring(0, 500))
    
    return html
  } catch (error) {
    console.error('Error fetching unmatched data:', error)
    return null
  }
}
