# LLM Parameter Explorer

A full-stack web application for experimenting with Large Language Model parameters and analyzing response quality. This tool helps users understand how temperature and top_p parameters affect LLM responses by generating multiple variations and providing detailed quality metrics.

## Features

- 🎯 **Interactive Parameter Tuning**: Adjust temperature (0-2) and top_p (0-1) ranges with intuitive sliders
- 🤖 **Multiple Response Generation**: Generate up to 10 response variations with different parameter combinations
- 📊 **Quality Metrics Analysis**: Five custom metrics evaluate response quality:
  - **Coherence**: Sentence structure, punctuation, and logical flow
  - **Lexical Diversity**: Vocabulary richness and word variety
  - **Completeness**: Content adequacy and structural elements
  - **Readability**: Ease of understanding based on Flesch-Kincaid principles
  - **Length Appropriateness**: Response length vs. prompt expectations
- 📈 **Side-by-Side Comparison**: Compare multiple responses to understand parameter impact
- 💾 **Experiment Persistence**: PostgreSQL/SQLite database stores all experiments and responses
- 📚 **Experiment History**: Dedicated history page with full experiment management
- 🔄 **Smart Navigation**: Seamless navigation between main page and history with automatic tab switching
- 📤 **Export Functionality**: Export experiments as JSON or CSV
- 🎨 **Modern UI/UX**: Built with shadcn/ui, fully responsive and accessible

## Tech Stack

### Frontend
- **Next.js 15** (App Router with React Server Components)
- **React 19** with TypeScript
- **TanStack Query** for state management and data fetching
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful, accessible components

### Backend
- **Next.js API Routes** (TypeScript)
- **OpenAI API** (GPT-3.5-turbo)
- **PostgreSQL/SQLite** with automatic environment detection
- **Database Abstraction Layer** for seamless deployment
- **Zod** for request validation

## Architecture & Key Decisions

### Architectural Approach

**Full-Stack Next.js Application**
- **Decision**: Used Next.js 15 with App Router for unified frontend/backend development
- **Rationale**: Simplifies deployment, enables server-side rendering, and provides built-in API routes
- **Trade-off**: Single framework dependency vs. microservices flexibility

**Data Flow Architecture**
```
User Input → ExperimentForm → API Route → OpenAI API → Metrics Calculation → Database → UI Update
```

**Component Structure**
- **Container Pattern**: Main page orchestrates all components
- **Custom Hooks**: TanStack Query hooks encapsulate data fetching logic
- **Composition**: Reusable UI components with shadcn/ui foundation

### Key Technical Decisions

**Database Choice: Hybrid PostgreSQL/SQLite**
- **Decision**: PostgreSQL for production, SQLite for development
- **Rationale**: Automatic environment detection enables seamless deployment to Vercel
- **Trade-off**: Added complexity vs. production-ready scalability

**State Management: TanStack Query**
- **Decision**: TanStack Query over Redux/Zustand
- **Rationale**: Excellent caching, background updates, and server state synchronization
- **Trade-off**: Learning curve vs. powerful features

**UI Framework: shadcn/ui + Tailwind**
- **Decision**: shadcn/ui components with Tailwind CSS
- **Rationale**: Beautiful, accessible components with utility-first styling
- **Trade-off**: Opinionated design system vs. custom flexibility

**Quality Metrics: Programmatic vs. LLM-based**
- **Decision**: Custom programmatic metrics over using another LLM
- **Rationale**: Reliability, speed, cost-effectiveness, and transparency
- **Trade-off**: Sophistication vs. predictability and performance

## UI/UX Design Rationale

### Design Philosophy

**Modern, Professional Interface**
- **Goal**: Create a tool that feels professional and trustworthy for researchers
- **Approach**: Clean, minimal design with purposeful use of color and space
- **Inspiration**: Scientific tools and data analysis platforms

### Color Palette & Visual Design

**Primary Colors**
- **Blue (#3B82F6)**: Trust, reliability, primary actions
- **Purple (#8B5CF6)**: Innovation, creativity, secondary actions
- **Gradient**: Blue-to-purple gradients for visual hierarchy and modern feel

**Semantic Colors**
- **Green (#10B981)**: Success, high-quality responses (85-100 score)
- **Yellow (#F59E0B)**: Warning, moderate quality (50-69 score)
- **Red (#EF4444)**: Error, low quality (0-49 score)
- **Gray Scale**: Neutral tones for text and backgrounds

**Visual Effects**
- **Glass Morphism**: Semi-transparent cards with backdrop blur for modern aesthetic
- **Gradients**: Subtle gradients for depth and visual interest
- **Shadows**: Layered shadows for hierarchy and depth perception

### User Journey & Information Architecture

**Primary User Flow**
1. **Landing** → Clear value proposition and immediate access to experiment creation
2. **Experiment Setup** → Intuitive parameter configuration with real-time feedback
3. **Generation** → Clear loading states and progress indication
4. **Analysis** → Comprehensive results with visual metrics and comparison tools
5. **Export** → Easy data export for further analysis

**Information Hierarchy**
- **Primary**: Experiment creation and results analysis
- **Secondary**: History management and comparison tools
- **Tertiary**: Help documentation and advanced features

### Responsive Design Strategy

**Mobile-First Approach**
- **Breakpoints**: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- **Navigation**: Collapsible history dropdown for mobile space optimization
- **Touch Targets**: Minimum 44px touch targets for mobile usability
- **Content**: Stacked layouts on mobile, side-by-side on desktop

### Accessibility Considerations

**WCAG 2.1 AA Compliance**
- **Color Contrast**: Minimum 4.5:1 ratio for text
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Semantic HTML and ARIA labels
- **Focus Indicators**: Clear focus states for all interactive elements

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Setup

1. **Clone and navigate to the project:**
   ```bash
   cd llm-parameter-explorer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   # Optional: Add DATABASE_URL for PostgreSQL (production)
   # DATABASE_URL=postgresql://username:password@host:port/database
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Creating an Experiment

1. **Enter a Prompt**: Type your prompt in the text area (up to 2000 characters)
2. **Configure Parameters**:
   - Set temperature range (controls randomness/creativity)
   - Set top_p range (controls output diversity)
   - Choose number of variations (1-10)
3. **Generate**: Click "Generate Responses" to create multiple variations
4. **Review Results**: Responses are ranked by overall quality score

### Analyzing Results

Each response displays:
- Parameter values used (temperature, top_p)
- Overall quality score (0-100)
- Detailed metrics with visual progress bars
- Score explanations for each metric

**Visual Indicators:**
- 🟢 Green (85-100): Excellent quality
- 🔵 Blue (70-84): Good quality
- 🟡 Yellow (50-69): Moderate quality
- 🔴 Red (0-49): Poor quality

### Comparing Responses

1. Select multiple responses using checkboxes
2. Navigate to the "Compare" tab
3. View side-by-side parameter and metric comparisons
4. Analyze content differences

### Exporting Data

1. Click the "Export" button in the results view
2. Choose format:
   - **JSON**: Complete data structure with all details
   - **CSV**: Spreadsheet-friendly format for analysis

### Experiment History

- All experiments are automatically saved
- **Main Page**: Shows 3 most recent experiments in sidebar
- **View All Button**: Navigate to dedicated history page when more than 3 experiments exist
- **History Page**: Full experiment list with search and management
- **Smart Navigation**: Click any experiment to return to main page with results tab active
- **Enhanced UX**: Smooth hover effects and improved visual feedback
- Delete experiments you no longer need

## Project Structure

```
llm-parameter-explorer/
├── app/
│   ├── api/
│   │   ├── generate/           # Main generation endpoint
│   │   ├── experiments/        # CRUD operations
│   │   └── export/             # Export functionality
│   ├── history/                # History page route
│   │   └── page.tsx            # Dedicated history page
│   ├── page.tsx                # Main application page
│   ├── layout.tsx              # Root layout with providers
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── ExperimentForm.tsx      # Input form for experiments
│   ├── ResponseCard.tsx        # Individual response display
│   ├── MetricsDisplay.tsx      # Quality metrics visualization
│   ├── ComparisonView.tsx      # Side-by-side comparison
│   ├── ExperimentHistory.tsx   # Past experiments list (3 items + View All)
│   └── ExportButton.tsx        # Export dialog
├── hooks/
│   └── useExperiments.ts       # TanStack Query hooks
├── lib/
│   ├── database.ts             # Database abstraction layer
│   ├── db-postgres.ts          # PostgreSQL implementation
│   ├── db-sqlite.ts            # SQLite implementation
│   ├── metrics.ts              # Quality metrics calculations
│   ├── openai.ts               # OpenAI API client
│   ├── providers.tsx           # React Query provider
│   └── utils.ts                # Utility functions
├── types/
│   └── index.ts                # TypeScript type definitions
└── data/
    └── experiments.db          # SQLite database (auto-created, local only)
```

## Quality Metrics Explained

### 1. Coherence Score (0-100)
Evaluates text structure and flow by analyzing:
- Proper capitalization at sentence starts
- Consistent punctuation usage
- Sentence length variance (avoiding robotic uniformity)
- Paragraph structure for multi-paragraph responses

### 2. Lexical Diversity (0-100)
Measures vocabulary richness using:
- Type-Token Ratio (unique words / total words)
- Vocabulary variety assessment
- Repetition detection

### 3. Completeness Score (0-100)
Assesses content adequacy through:
- Word and sentence count appropriateness
- Structural elements (introduction, transitions, conclusion)
- Detail level vs. prompt complexity

### 4. Readability Score (0-100)
Based on Flesch-Kincaid readability principles:
- Average words per sentence
- Average syllables per word
- Overall text complexity

### 5. Length Appropriateness (0-100)
Compares response length to prompt expectations:
- Analyzes prompt complexity and type
- Detects brevity requests
- Identifies questions requiring detailed responses

## Error Handling

The application handles various error scenarios:

- **Invalid API Key**: Clear message with setup instructions
- **Rate Limiting**: Graceful error with retry suggestion
- **Network Failures**: User-friendly error messages
- **Invalid Inputs**: Form validation with specific error messages
- **Database Errors**: Fallback behavior and error logging

## Performance Considerations

- **Database**: Indexed queries for fast experiment retrieval
- **Caching**: TanStack Query with optimized cache invalidation for fresh data
- **Optimistic Updates**: Instant UI feedback on mutations
- **Pagination**: Experiments list supports pagination (default 50)
- **Navigation Performance**: Cache invalidation ensures fresh data when navigating from history

## Accessibility Features

- Semantic HTML elements
- ARIA labels and descriptions
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Responsive design (mobile, tablet, desktop)

## Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key for GPT-3.5-turbo | Yes | - |
| `DATABASE_URL` | PostgreSQL connection string (production) | No | Uses SQLite locally |
| `NODE_ENV` | Environment mode (development/production) | No | development |
| `NEXT_PUBLIC_APP_URL` | Public URL for production deployment | No | http://localhost:3000 |

## Deployment Choices

### Hosting Platform Options

**Recommended: Vercel**
- **Rationale**: Seamless Next.js deployment with zero configuration
- **Benefits**: Automatic deployments, edge functions, built-in analytics
- **Environment**: Production-ready with environment variable management

**Alternative: Netlify**
- **Rationale**: Excellent for static sites with serverless functions
- **Benefits**: Form handling, split testing, edge functions
- **Considerations**: Requires build configuration for Next.js

**Self-Hosted: Docker**
- **Rationale**: Full control over environment and scaling
- **Benefits**: Consistent deployment across environments
- **Requirements**: Docker, reverse proxy (nginx), SSL certificates

### Environment Configuration

**Production Environment Variables**
```env
OPENAI_API_KEY=your_production_api_key
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**Development Environment**
```env
OPENAI_API_KEY=your_development_api_key
NODE_ENV=development
```

**Security Considerations**
- API keys stored as environment variables (never in code)
- HTTPS required for production
- Rate limiting implemented for API endpoints
- Input validation and sanitization

## Assumptions Made

### Technical Assumptions

**LLM Provider: OpenAI GPT-3.5-turbo**
- **Assumption**: OpenAI API is available and reliable
- **Rationale**: Most mature and widely adopted LLM API
- **Fallback**: Error handling for API failures and rate limits
- **Alternative**: Could be extended to support other providers (Anthropic, Google)

**Database: Hybrid PostgreSQL/SQLite**
- **Assumption**: PostgreSQL for production, SQLite for development
- **Rationale**: Automatic environment detection enables seamless deployment
- **Benefit**: Production-ready with Vercel compatibility
- **Fallback**: SQLite for local development and testing

**Browser Support: Modern Browsers**
- **Assumption**: Users have modern browsers with ES6+ support
- **Rationale**: Focus on core functionality over legacy browser support
- **Coverage**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Design Assumptions

**User Expertise: Technical Users**
- **Assumption**: Users understand LLM parameters (temperature, top_p)
- **Rationale**: Target audience is researchers and developers
- **Support**: Help documentation and tooltips provided
- **Alternative**: Could add beginner-friendly explanations

**Use Case: Research and Experimentation**
- **Assumption**: Primary use is parameter experimentation, not production LLM usage
- **Rationale**: Tool is designed for analysis and comparison
- **Limitation**: Not optimized for high-volume production use
- **Extension**: Could be adapted for production monitoring

**Data Privacy: Local Storage**
- **Assumption**: Users are comfortable with local data storage
- **Rationale**: SQLite database stored locally
- **Benefit**: No data transmission to external servers (except OpenAI)
- **Alternative**: Could add cloud storage options

### Performance Assumptions

**Response Volume: Moderate**
- **Assumption**: Users generate 1-10 responses per experiment
- **Rationale**: Focus on quality analysis over quantity
- **Optimization**: Efficient database queries and caching
- **Scaling**: Could handle 100+ responses with minor optimizations

**Concurrent Users: Single User**
- **Assumption**: Application designed for single-user scenarios
- **Rationale**: Assessment scope and SQLite limitations
- **Extension**: Multi-user support would require database migration
- **Alternative**: Could add user authentication and cloud storage

## Database

The application uses a hybrid database approach:

### Local Development (SQLite)
- Location: `data/experiments.db` (auto-created)
- Tables: `experiments`, `responses`
- Automatic initialization on first run
- Foreign key constraints for data integrity

### Production (PostgreSQL)
- Uses `DATABASE_URL` environment variable
- Automatic table creation and indexing
- Connection pooling for optimal performance
- SSL support for secure connections

### Database Abstraction Layer
- Automatic environment detection
- Seamless switching between SQLite and PostgreSQL
- Identical API for both database types
- Production-ready with Vercel compatibility

## API Endpoints

### POST `/api/generate`
Generate responses with parameter variations
- **Body**: `{ prompt, temperatureMin, temperatureMax, topPMin, topPMax, variations }`
- **Returns**: Experiment with all generated responses and metrics

### GET `/api/experiments`
List all experiments
- **Query**: `?limit=50&offset=0`
- **Returns**: Array of experiments

### GET `/api/experiments/[id]`
Get single experiment with responses
- **Returns**: Experiment with responses array

### DELETE `/api/experiments/[id]`
Delete an experiment
- **Returns**: Success status

### GET `/api/export/[id]`
Export experiment
- **Query**: `?format=json|csv`
- **Returns**: File download

## Troubleshooting

### OpenAI API Key Issues
- Ensure `.env.local` file exists in root directory
- Verify API key is valid at https://platform.openai.com/api-keys
- Restart development server after adding/changing env variables

### Database Issues

**SQLite (Local Development)**
- Delete `data/experiments.db` to reset database
- Check file permissions in `data/` directory

**PostgreSQL (Production)**
- Verify `DATABASE_URL` environment variable is set correctly
- Check database connection and permissions
- Ensure tables are created (automatic on first API call)

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use a different port
npm run dev -- -p 3001
```

## Recent Updates

### Version 2.1 - Enhanced UX & Production Stability
- **Improved Hover Effects**: Enhanced delete button styling with smooth color transitions and proper contrast
- **Caching Fixes**: Resolved production caching issues with TanStack Query configuration
- **Navigation Reliability**: Fixed infinite loading states when navigating from history page
- **Production Stability**: Improved error handling and data consistency in deployment environment

### Version 2.0 - Production Ready
- **PostgreSQL Support**: Added full PostgreSQL compatibility for production deployment
- **Database Abstraction**: Automatic environment detection between SQLite and PostgreSQL
- **History Page**: Dedicated `/history` route with full experiment management
- **Smart Navigation**: Seamless navigation between main page and history with URL parameters
- **Vercel Compatibility**: Fixed serverless deployment issues with proper database initialization
- **Enhanced UX**: "View All" button in experiment history sidebar for better navigation

### Key Improvements
- **Production Deployment**: Ready for Vercel with PostgreSQL database
- **Better Organization**: Separate history page for managing large numbers of experiments
- **Improved Navigation**: URL-based navigation with automatic tab switching
- **Database Reliability**: Automatic table creation and connection management
- **Performance**: Connection pooling and optimized database operations
- **UI Polish**: Smooth animations, better hover states, and improved visual feedback
- **Data Consistency**: Fixed caching issues ensuring fresh data on navigation

## Future Enhancements

Potential features for future development:
- Additional LLM providers (Anthropic Claude, Google Gemini)
- More quality metrics (sentiment, tone, factual accuracy)
- Batch processing for multiple prompts
- Advanced filtering and search in history
- Custom metric configuration
- Response diffing visualization
- API rate limit tracking
- User authentication and cloud storage
- Real-time collaboration features
- Advanced experiment analytics and insights

## License

This project is part of a technical assessment.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Powered by [OpenAI](https://openai.com/)
