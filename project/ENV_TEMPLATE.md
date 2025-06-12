# Environment Variables Setup

To run this project, you need to create a `.env` file in the project root with the following variables:

```env
# Supabase Configuration (optional - for analytics/logging)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Keys for NFT data fetching
VITE_OPENSEA_API_KEY=your_opensea_api_key_here
VITE_RESERVOIR_API_KEY=your_reservoir_api_key_here
VITE_RESERVOIR_API_URL=https://api-base.reservoir.tools
```

## How to get API keys:

1. **OpenSea API Key**: Visit [OpenSea API Documentation](https://docs.opensea.io/reference/api-keys)
2. **Reservoir API Key**: Visit [Reservoir Tools](https://reservoir.tools/)
3. **Supabase** (optional): Only needed if you want analytics - visit [Supabase](https://supabase.com)

## Setup Steps:

1. Copy the template above
2. Create a `.env` file in the project root
3. Replace the placeholder values with your actual API keys
4. Run `npm install` and `npm run dev` 