const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const jsonPath = path.join(ROOT, 'growth/data/publications.json');
const targetPath = path.join(ROOT, 'src/data/marketingPublicationsData.ts');

const items = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const tsCode = `export interface PublicationItem {
  id: string;
  date: string;
  channel: 'tiktok' | 'youtube' | 'telegram' | 'facebook' | 'instagram';
  channelAccount: string;
  format: 'short_video' | 'post' | 'story' | 'storytelling' | 'poll';
  title: string;
  campaignTitle?: string;
  version?: string;
  videoPath?: string;
  imagePath?: string;
  caption?: string;
  targetDeepLink: string;
  promoCode: string;
  fullUrlWithPromo: string;
  livePostUrl: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived' | 'ready_for_upload' | 'ready';
  notes?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const MARKETING_PUBLICATIONS: PublicationItem[] = ${JSON.stringify(items, null, 2)};
`;

fs.writeFileSync(targetPath, tsCode, 'utf8');
console.log('Successfully synced', items.length, 'publications to src/data/marketingPublicationsData.ts');
