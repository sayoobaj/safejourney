/**
 * SafeJourney Incident Scraper
 * Scrapes security incidents from Nigerian news sources
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Nigerian states for matching
const STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
]

// Keywords for incident classification
const KEYWORDS = {
  KIDNAPPING: ['kidnap', 'abduct', 'hostage', 'ransom'],
  BANDITRY: ['bandit', 'bandits', 'cattle rustl', 'herder'],
  TERRORISM: ['boko haram', 'iswap', 'terrorist', 'insurgent', 'bomb', 'ied'],
  ARMED_ROBBERY: ['robbery', 'robber', 'armed men', 'gunmen attack'],
}

interface ScrapedIncident {
  title: string
  description: string
  source: string
  sourceUrl: string
  date: Date
  state?: string
  type: 'KIDNAPPING' | 'BANDITRY' | 'TERRORISM' | 'ARMED_ROBBERY' | 'OTHER'
  killed?: number
  kidnapped?: number
  injured?: number
}

// Extract state from text
function extractState(text: string): string | undefined {
  const lowerText = text.toLowerCase()
  for (const state of STATES) {
    if (lowerText.includes(state.toLowerCase())) {
      return state
    }
  }
  return undefined
}

// Classify incident type
function classifyIncident(text: string): ScrapedIncident['type'] {
  const lowerText = text.toLowerCase()
  
  for (const [type, keywords] of Object.entries(KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return type as ScrapedIncident['type']
      }
    }
  }
  return 'OTHER'
}

// Extract numbers for casualties
function extractNumber(text: string, patterns: string[]): number {
  const lowerText = text.toLowerCase()
  
  for (const pattern of patterns) {
    // Match "X killed" or "killed X"
    const regex = new RegExp(`(\\d+)\\s*(?:people\\s*)?${pattern}|${pattern}\\s*(\\d+)`, 'i')
    const match = lowerText.match(regex)
    if (match) {
      return parseInt(match[1] || match[2]) || 0
    }
  }
  return 0
}

// Fetch RSS feed
async function fetchRSS(url: string): Promise<string> {
  const res = await fetch(url)
  return res.text()
}

// Parse RSS items (simple regex parser)
function parseRSSItems(xml: string): Array<{ title: string; description: string; link: string; pubDate: string }> {
  const items: Array<{ title: string; description: string; link: string; pubDate: string }> = []
  
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]
    
    const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] || 
                  itemXml.match(/<title>(.*?)<\/title>/)?.[1] || ''
    const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/)?.[1] || ''
    const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || ''
    const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
    
    items.push({ 
      title: title.replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
      description: description.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]*>/g, '').trim(),
      link: link.trim(),
      pubDate: pubDate.trim()
    })
  }
  
  return items
}

// Security-related keywords to filter news
const SECURITY_KEYWORDS = [
  'kill', 'attack', 'kidnap', 'abduct', 'bandit', 'terrorist', 'boko haram',
  'gunmen', 'robbery', 'murder', 'bomb', 'insurgent', 'ambush', 'raid',
  'hostage', 'ransom', 'militia', 'herder', 'farmer'
]

function isSecurityRelated(text: string): boolean {
  const lowerText = text.toLowerCase()
  return SECURITY_KEYWORDS.some(keyword => lowerText.includes(keyword))
}

// Scrape from RSS feeds
async function scrapeRSS(): Promise<ScrapedIncident[]> {
  const feeds = [
    { name: 'Premium Times', url: 'https://www.premiumtimesng.com/feed' },
    { name: 'Punch', url: 'https://punchng.com/feed/' },
    { name: 'Vanguard', url: 'https://www.vanguardngr.com/feed/' },
  ]
  
  const incidents: ScrapedIncident[] = []
  
  for (const feed of feeds) {
    try {
      console.log(`Fetching ${feed.name}...`)
      const xml = await fetchRSS(feed.url)
      const items = parseRSSItems(xml)
      
      for (const item of items) {
        const fullText = `${item.title} ${item.description}`
        
        // Only process security-related news
        if (!isSecurityRelated(fullText)) continue
        
        const state = extractState(fullText)
        if (!state) continue // Skip if no Nigerian state found
        
        incidents.push({
          title: item.title,
          description: item.description.slice(0, 500),
          source: feed.name,
          sourceUrl: item.link,
          date: new Date(item.pubDate),
          state,
          type: classifyIncident(fullText),
          killed: extractNumber(fullText, ['killed', 'dead', 'death']),
          kidnapped: extractNumber(fullText, ['kidnapped', 'abducted', 'taken']),
          injured: extractNumber(fullText, ['injured', 'wounded']),
        })
      }
      
      console.log(`Found ${incidents.length} incidents from ${feed.name}`)
    } catch (error) {
      console.error(`Error fetching ${feed.name}:`, error)
    }
  }
  
  return incidents
}

// Save incidents to database
async function saveIncidents(incidents: ScrapedIncident[]): Promise<number> {
  let saved = 0
  
  for (const incident of incidents) {
    try {
      // Check for duplicates by title similarity
      const existing = await prisma.incident.findFirst({
        where: {
          title: incident.title,
        }
      })
      
      if (existing) {
        console.log(`Skipping duplicate: ${incident.title.slice(0, 50)}...`)
        continue
      }
      
      await prisma.incident.create({
        data: {
          title: incident.title,
          description: incident.description,
          source: incident.source,
          sourceUrl: incident.sourceUrl,
          date: incident.date,
          state: incident.state!,
          type: incident.type,
          killed: incident.killed || 0,
          kidnapped: incident.kidnapped || 0,
          injured: incident.injured || 0,
          status: 'REPORTED',
        }
      })
      
      saved++
      console.log(`✓ Saved: ${incident.title.slice(0, 50)}...`)
    } catch (error) {
      console.error(`Error saving incident:`, error)
    }
  }
  
  return saved
}

// Main function
async function main() {
  console.log('🔍 SafeJourney Incident Scraper')
  console.log('================================\n')
  
  const incidents = await scrapeRSS()
  console.log(`\nFound ${incidents.length} security incidents\n`)
  
  if (incidents.length > 0) {
    const saved = await saveIncidents(incidents)
    console.log(`\n✅ Saved ${saved} new incidents to database`)
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)
