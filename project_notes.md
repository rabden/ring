# Project Analysis Notes

## Project Overview
Ring IG is a modern AI image generation platform built with React and Vite, following Apple's design principles. It features:
- Multiple AI models for image generation
- Social features and user interaction
- Credit-based system
- Advanced image management

## Project Structure
- This is a React/Vite project with Tailwind CSS for styling
- Uses Supabase for backend and authentication
- Modern frontend tooling: ESLint, PostCSS, Tailwind
- Environment variables present (.env)

## Application Architecture

### Main Entry Points
1. `main.jsx`:
   - React 18 setup with StrictMode
   - Dark theme Toaster notifications
   - Root application mounting

2. `App.jsx`:
   - React Query for data fetching
   - React Router for navigation
   - Protected route system
   - Authentication flow
   - Theme provider (dark mode default)
   - Notification system

### Routes Structure
1. Public Routes:
   - `/image/:imageId` - Single image view
   - `/docs` - Documentation
   - `/login` - Authentication page

2. Protected Routes:
   - `/` - Image generator (main page)
   - `/profile/:userId` - Public profile view
   - `/userprofile` - User's own profile
   - `/inspiration` - Inspiration feed

3. Auth Routes:
   - `/auth/callback` - OAuth callback handling
   - `/login` - Login page with redirect

## Core Features
1. Image Generation:
   - Multiple AI models (Ring.1 turbo, Ring.1, Ring.1 hyper, Ultra)
   - Various quality tiers (HD, HD+, 4K)
   - Customizable settings (aspect ratios, inference steps, seed control)

2. Image Management:
   - Gallery system with infinite scroll
   - Masonry grid layout
   - Public/private toggle
   - NSFW content filtering

3. User System:
   - PKCE authentication flow
   - Profile management
   - Credit system
   - Social features (follow, like, share)

## Technical Architecture
```
src/
├── components/          # UI Components
├── config/             # Configuration files
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── integrations/       # External services
├── lib/               # Utility libraries
├── pages/             # Route components
├── styles/            # Additional styles
└── utils/             # Utility functions
```

## Key Files:
1. Frontend Setup:
   - `index.html`: Entry point
   - `vite.config.js`: Build configuration
   - `tailwind.config.js`: Styling configuration
   - `components.json`: shadcn/ui components configuration

2. Package Management:
   - `package.json`: Project dependencies and scripts
   - `bun.lockb`: Dependency lock file (using Bun package manager)

3. Configuration:
   - `.eslintrc.cjs`: Code linting rules
   - `postcss.config.js`: CSS processing
   - `jsconfig.json`: JavaScript configuration

## Next Steps to Investigate:
1. Review Supabase integration and auth flow
2. Examine image generation implementation
3. Look into credit system implementation
4. Check notification system setup

## Authentication System

### Supabase Integration
1. Configuration (`supabase.js`):
   - Uses PKCE flow type for secure authentication
   - Custom storage adapter for session management
   - Auto refresh token enabled
   - Debug mode in development

2. Auth Provider (`AuthProvider.jsx`):
   - Manages authentication state
   - Handles session persistence
   - Implements auth state change listeners
   - Provides auth context to application
   - Handles various auth events:
     - SIGNED_IN
     - SIGNED_OUT
     - TOKEN_REFRESHED
     - USER_UPDATED
     - USER_DELETED

3. Auth Features:
   - Session management with local storage
   - Automatic token refresh
   - Session validation
   - Secure logout process
   - Error handling and recovery
   - Query cache invalidation on auth state changes

4. Security Measures:
   - PKCE (Proof Key for Code Exchange) flow
   - Session verification
   - Secure token storage
   - Automatic cleanup of invalid sessions
   - Protected route system

### Auth Flow
1. Initial Load:
   - Check for stored session
   - Validate stored session with server
   - Set up auth state listener
   - Handle auth state changes

2. Session Management:
   - Persistent sessions in local storage
   - Automatic token refresh
   - Session validation on app load
   - Clean invalid sessions

3. Protected Routes:
   - Route protection with auth checks
   - Redirect to login when needed
   - Preserve intended destination
   - Loading states during auth checks

## Image Generation System

### Core Components
1. Image Generator Page (`ImageGenerator.jsx`):
   - Main interface for image generation
   - Handles user input and settings
   - Manages generation state
   - Supports image remixing
   - Handles credit system integration
   - Manages UI states and tabs

2. Generation Hook (`useImageGeneration.js`):
   - Core generation logic
   - API integration with HuggingFace
   - Credit management
   - Error handling and retries
   - Image storage and database integration

### Generation Process
1. Pre-generation Checks:
   - User authentication
   - Credit availability
   - Model compatibility
   - Quality limits validation
   - Input validation

2. Generation Flow:
   - Prompt modification based on model
   - Dimension calculation
   - API key management
   - Multiple image generation support
   - Progress tracking
   - Error handling and retries

3. Post-generation:
   - Image storage in Supabase
   - Database record creation
   - Credit deduction
   - UI updates and notifications

### Features
1. Image Settings:
   - Multiple quality tiers (HD, HD+, 4K)
   - Aspect ratio control
   - Seed management
   - Width and height customization
   - Model selection
   - Privacy settings

2. Advanced Features:
   - Prompt improvement
   - Image remixing
   - Batch generation
   - Private/Public toggle
   - NSFW content control

3. Credit System Integration:
   - Tiered pricing (1-3 credits per image)
   - Quality-based pricing
   - Bonus credits support
   - Pro user features

### Technical Implementation
1. API Integration:
   - HuggingFace API usage
   - API key rotation
   - Rate limit handling
   - Response validation

2. Storage:
   - Supabase storage for images
   - Organized file structure
   - Metadata storage
   - Access control

3. Error Handling:
   - API failure recovery
   - Invalid image detection
   - Credit validation
   - User feedback

## Credit System

### Core Components
1. User Credits Hook (`useUserCredits.js`):
   - Credit management and tracking
   - Bonus credits handling
   - Credit updates and mutations
   - Real-time credit monitoring
   - Refill time tracking

### Credit Types
1. Regular Credits:
   - Main currency for image generation
   - Used first before bonus credits
   - Managed via credit_count in profiles

2. Bonus Credits:
   - Secondary currency
   - Used after regular credits
   - Can be added separately
   - Managed via bonus_credits in profiles

### Credit Operations
1. Credit Costs:
   - HD: 1 credit
   - HD+: 2 credits
   - 4K: 3 credits
   - Multiplied by image count for batch generation

2. Credit Management:
   - Automatic deduction
   - Priority use of regular credits
   - Fallback to bonus credits
   - Credit validation before operations
   - Real-time balance updates

### Technical Implementation
1. Database Integration:
   - Stored in Supabase profiles table
   - Real-time updates
   - Atomic operations
   - Transaction safety

2. Query Management:
   - React Query for state management
   - 60-second refresh interval
   - Optimistic updates
   - Cache invalidation

3. Error Handling:
   - Insufficient credit checks
   - Profile validation
   - Operation failure recovery
   - User feedback

### Features
1. Credit Operations:
   - Credit deduction
   - Bonus credit addition
   - Credit balance checks
   - Credit cost calculation

2. Monitoring:
   - Real-time credit tracking
   - Last refill time tracking
   - Total credits calculation
   - Usage history

3. Integration:
   - Image generation system
   - Pro user features
   - Bonus credit promotions
   - Credit purchase system

## Notification System

### Core Components
1. Notification Context (`NotificationContext.jsx`):
   - Central notification management
   - Real-time updates
   - Unread count tracking
   - Notification actions
   - User-specific notifications

### Features
1. Notification Management:
   - Real-time notification updates
   - Mark as read functionality
   - Notification deletion
   - Unread count tracking
   - Sorted by creation time

2. Database Integration:
   - Supabase real-time subscriptions
   - User-specific filtering
   - Automatic updates
   - Persistent storage

3. User Experience:
   - Unread indicators
   - Real-time updates
   - Notification history
   - Action feedback

### Technical Implementation
1. Real-time Updates:
   - Supabase channels
   - PostgreSQL change notifications
   - User-specific subscriptions
   - Automatic reconnection

2. State Management:
   - React Context API
   - Local state synchronization
   - Optimistic updates
   - Cache management

3. Database Operations:
   - CRUD operations
   - Real-time filtering
   - User-specific queries
   - Error handling

### Integration Points
1. User System:
   - User-specific notifications
   - Authentication integration
   - Session management
   - Access control

2. UI Components:
   - Notification bell
   - Notification list
   - Unread indicators
   - Action buttons

3. Actions:
   - Mark as read
   - Delete notification
   - Fetch notifications
   - Update counts

### Notification Bell
1. Features:
   - Unread count indicator
   - Mobile/Desktop variants
   - Sheet-based popup
   - Responsive design

2. Implementation:
   - Context integration
   - Media query handling
   - State management
   - Backdrop blur effect

3. UI Elements:
   - Bell icon with badge
   - Side sheet panel
   - Header with count
   - Scrollable content

### Notification Item
1. Features:
   - Read/Unread states
   - Image preview
   - Multiple links
   - Timestamp display
   - Delete/Hide actions

2. Content Display:
   - Title and message
   - Image thumbnail
   - Action links
   - Creation time
   - Visual indicators

3. Interactions:
   - Mark as read
   - Delete/Hide
   - Link navigation
   - Image error handling

### Notification List
1. Features:
   - Empty state
   - Scrollable area
   - Item separation
   - Hover effects

2. Implementation:
   - Context consumption
   - Virtual scrolling
   - Dynamic height
   - Item rendering

3. UI/UX:
   - Empty state message
   - Smooth scrolling
   - Visual hierarchy
   - Consistent spacing

### Technical Integration
1. Context Usage:
   - Notification state
   - Action handlers
   - Read status
   - Count management

2. Data Structure:
   - Notification model
   - Image handling
   - Link parsing
   - Timestamp formatting

3. Responsive Design:
   - Mobile adaptations
   - Desktop optimizations
   - Layout changes
   - Touch interactions

## Model System

### Model Categories
1. General Models:
   - Turbo (SD-3.5Large-turbo) - Fast generation
   - Flux.1 Schnell - Balanced speed/quality
   - FLx.1 Dev - High-quality artistic
   - Realism turbo - Hyper-realistic
   - Illustration turbo - Simple doodles
   - 3D Render - 3D style images
   - Anime-Xl - Anime style
   - Midjourney - MJ v6 style
   - Vector Art - Vector graphics
   - Isometric - Isometric style
   - Outfit Generator - Fashion/clothing
   - Color Chaos - Modern art
   - Aura 9999+ - Aura effects
   - Flux.1 Pro (Premium) - Multi-model merge

2. NSFW Models:
   - Real - Realistic NSFW content
   - Anime - Anime-style NSFW content

### Model Configuration
1. Model Properties:
   - Name and category
   - API endpoint URL
   - Quality limitations
   - Premium status
   - Prompt modifications
   - Description and image

2. Model Features:
   - Quality restrictions
   - Premium access control
   - Automatic prompt enhancement
   - Category-based filtering
   - Custom prompt suffixes

### NSFW Content Management

1. State Management:
   - Global NSFW toggle
   - Model-specific NSFW flags
   - Automatic model switching
   - Content filtering
   - User preferences

2. NSFW Controls:
   - Enable/disable toggle
   - Category-based model selection
   - Automatic safe model fallback
   - Content warnings
   - Access restrictions

3. Implementation:
   - State persistence
   - Model category validation
   - Automatic model switching
   - User preference tracking
   - Content filtering rules

### Technical Implementation
1. Model Selection:
   - Category-based filtering
   - Quality-based restrictions
   - Premium access checks
   - NSFW state validation
   - Automatic model switching

2. Content Control:
   - NSFW state monitoring
   - Model category validation
   - Safe mode enforcement
   - Content filtering
   - Access management

3. Integration:
   - HuggingFace API integration
   - Model-specific prompt handling
   - Quality tier restrictions
   - Premium feature access
   - Content safety measures

### Model UI Implementation

1. Model Chooser Component:
   - Visual model selection interface
   - Model cards with images and descriptions
   - Category-based filtering (General/NSFW)
   - Premium model access control
   - Responsive popover design

2. Model Card Features:
   - Model image thumbnail
   - Model name and description
   - Premium status indicator
   - Active state indication
   - Disabled state for non-pro users

3. UI/UX Considerations:
   - Scrollable model list
   - Responsive layout
   - Visual feedback for selection
   - Premium model locks
   - Tooltips and help text

### Model Selection Logic

1. State Management:
   - Model selection tracking
   - NSFW state integration
   - Pro user status checks
   - Automatic model fallback
   - Category filtering

2. Access Control:
   - Premium model restrictions
   - NSFW content filtering
   - Pro user validation
   - Automatic model switching
   - Safe fallback mechanisms

3. User Experience:
   - Clear model categorization
   - Easy model switching
   - Premium feature indication
   - Category-based filtering
   - Visual state feedback

### Integration Points

1. Settings Integration:
   - Model selection in settings
   - Quality tier selection
   - NSFW toggle integration
   - Premium feature access
   - User preferences

2. UI Components:
   - Model chooser popover
   - Model cards
   - Premium indicators
   - Category filters
   - Selection controls

3. State Management:
   - Model configuration hook
   - Image generator state
   - Pro user state
   - NSFW state
   - Selection persistence

## Pages and Features

### Main Pages
1. Image Generator (`ImageGenerator.jsx`):
   - Core image generation interface
   - Model selection and settings
   - Generation controls
   - Credit management

2. Inspiration Feed (`Inspiration.jsx`):
   - Social image feed
   - Following/Top filters
   - Image interactions
   - NSFW content filtering
   - Search and filtering
   - Mobile-responsive design

3. User Profile (`UserProfile.jsx`):
   - Profile management
   - Avatar and display name editing
   - Credit tracking
   - Pro status indication
   - User statistics
   - Account settings

4. Documentation (`Documentation.jsx`):
   - Feature guides
   - Interactive examples
   - Model showcase
   - Tips and tricks
   - Resource links
   - Visual tutorials

### Feature Implementation

1. Social Features:
   - Follow system
   - Like functionality
   - Image sharing
   - User interactions
   - Activity tracking

2. Profile Management:
   - Avatar upload
   - Display name editing
   - Stats tracking
   - Credit management
   - Pro user features

3. Content Discovery:
   - Inspiration feed
   - Following feed
   - Top content
   - Search functionality
   - Content filtering

4. User Interface:
   - Responsive design
   - Mobile navigation
   - Desktop/Mobile headers
   - Image galleries
   - Interactive dialogs

### Technical Features

1. Image Handling:
   - Full-screen view
   - Image details dialog
   - Download functionality
   - Remix capability
   - Gallery layout

2. Navigation:
   - Route protection
   - Tab management
   - Mobile navigation
   - Header visibility
   - State persistence

3. User Experience:
   - Loading states
   - Error handling
   - Toast notifications
   - Responsive layouts
   - Interactive elements

4. Documentation:
   - Interactive examples
   - Visual guides
   - Model showcase
   - Feature demonstrations
   - Resource links

## Utility Functions

### Image Configuration
1. Aspect Ratios:
   - 15 predefined ratios
   - Dimension calculations
   - Ratio validation
   - Closest ratio finder
   - Quality tier settings

2. Quality Settings:
   - HD (1024px)
   - HD+ (1536px)
   - 4K (2048px)
   - Model-specific limits

### Prompt Enhancement
1. AI-Powered Improvement:
   - Yi-1.5-34B-Chat model
   - API key management
   - Descriptive enhancement
   - Error handling
   - Rate limiting

2. Implementation:
   - HuggingFace integration
   - System prompting
   - Response formatting
   - Token management
   - Temperature control

### Error Handling
1. Retry Logic:
   - Maximum retry attempts
   - Status-based intervals
   - Rate limit handling
   - Error categorization
   - Automatic recovery

2. API Response Handling:
   - Error message parsing
   - Status code handling
   - Retry intervals
   - API key rotation
   - Error logging

### Utility Categories
1. Image Utils:
   - Configuration management
   - Optimization
   - Download handling
   - Discard operations
   - Profile image handling

2. Profile Utils:
   - Avatar management
   - Profile updates
   - Image optimization
   - Storage handling
   - Error recovery

3. System Utils:
   - Retry mechanisms
   - API key management
   - Error handling
   - Response parsing
   - State management

## Component Structure

### Core Components
1. Image Generation:
   - ImageGeneratorContent
   - ImageGeneratorSettings
   - AspectRatioChooser
   - GeneratingImagesDrawer
   - GeneratingImagesDropdown

2. Image Display:
   - ImageGallery
   - ImageCard
   - ImageCardActions
   - FullScreenImageView
   - MobileImageView
   - SingleImageView

3. User Interface:
   - BottomNavbar
   - ProfileMenu
   - MobileProfileMenu
   - LoadingScreen
   - ActionButtons

### Feature Components
1. Image Management:
   - ImageDetailsDialog
   - ImageStatusIndicators
   - TruncatablePrompt
   - LikeButton
   - MyImages

2. Navigation:
   - BottomNavbar
   - MobileNotificationsMenu
   - ProfileMenu
   - MobileProfileMenu

3. Loading States:
   - LoadingScreen
   - SkeletonImage
   - SkeletonImageCard
   - NoResults

### Component Categories
1. Layout Components:
   - Header
   - Navbar
   - Filters
   - Settings
   - Animations

2. Feature Components:
   - Image Card
   - Image View
   - Notifications
   - Profile
   - Search

3. UI Components:
   - Theme Provider
   - Base UI Components
   - Animations
   - Interactive Elements

### Component Organization
1. Main Structure:
   - Core components
   - Feature modules
   - UI elements
   - Shared components

2. Feature Modules:
   - Image handling
   - User interface
   - Navigation
   - Notifications
   - Profile management

3. Shared Elements:
   - Loading states
   - Error displays
   - Interactive elements
   - Layout components
   - Utility components

## Header Components

### Desktop Header
1. Layout:
   - Fixed position at top
   - Full-width background
   - Gradient fade-out effect
   - Left-aligned content

2. Features:
   - Profile menu
   - Notification bell
   - Action buttons
   - Private filter toggle
   - Inspiration filters
   - Search bar

3. Implementation:
   - Responsive hiding (md:block)
   - Conditional filters
   - Route-based rendering
   - Flexible layout

### Mobile Header
1. Layout:
   - Fixed position
   - Slide animation
   - Stacked layout
   - Full-width design

2. Features:
   - Search bar
   - Private filter toggle
   - Inspiration filters
   - Visibility control

3. Implementation:
   - Hide on desktop
   - Slide transitions
   - Conditional rendering
   - Compact design

## Filter Components

### Inspiration Filters
1. Features:
   - Following/Top toggle
   - Mutually exclusive selection
   - Responsive sizing
   - Visual feedback

2. Implementation:
   - Button group design
   - State management
   - Responsive classes
   - Consistent styling

### Private Filter
1. Features:
   - Toggle private/public
   - Icon indication
   - Responsive text
   - Visual feedback

2. Implementation:
   - Icon + text layout
   - Conditional rendering
   - State management
   - Consistent styling

### Common Patterns
1. UI Elements:
   - Rounded buttons
   - Icon integration
   - Responsive text
   - Consistent spacing

2. Behavior:
   - Toggle functionality
   - State management
   - Route awareness
   - Mobile adaptations

## Search Component

### Search Bar
1. Features:
   - Expandable search input
   - Toggle visibility
   - Clear functionality
   - Real-time search
   - Responsive design

2. UI States:
   - Collapsed (icon only)
   - Expanded (input + clear)
   - Focus handling
   - Size adaptations

3. Implementation:
   - Local state management
   - Controlled input
   - Responsive sizing
   - Icon transitions
   - Auto-focus on expand

### Technical Details
1. State Management:
   - Search open state
   - Query value
   - Parent callbacks
   - Clear handling

2. Responsive Design:
   - Mobile optimization
   - Desktop adaptations
   - Size constraints
   - Icon scaling

3. User Experience:
   - Smooth transitions
   - Clear feedback
   - Easy clearing
   - Space efficiency

### Integration
1. Header Integration:
   - Consistent styling
   - Space management
   - Mobile adaptation
   - Layout flexibility

2. Component Design:
   - Self-contained state
   - Prop-based control
   - Event handling
   - Style consistency

## Action Components

### Action Buttons
1. Features:
   - Navigation controls
   - Active state indication
   - Generating images dropdown
   - Desktop-only display

2. Implementation:
   - Route-based active states
   - Consistent styling
   - Responsive hiding
   - Button group layout

3. Navigation:
   - My Images section
   - Inspiration section
   - Status tracking
   - Route management

### Aspect Ratio Chooser
1. Features:
   - Visual ratio preview
   - Premium ratio locks
   - Slider control
   - Pro mode support

2. Implementation:
   - Dynamic scaling
   - Centered slider
   - Premium filtering
   - Ratio validation

3. User Experience:
   - Visual feedback
   - Smooth transitions
   - Premium indicators
   - Default handling

4. Technical Details:
   - Ratio calculations
   - Slider normalization
   - Pro mode checks
   - Layout management

### Common Patterns
1. UI Elements:
   - Consistent sizing
   - Premium indicators
   - Visual feedback
   - Mobile awareness

2. State Management:
   - Route tracking
   - Premium status
   - User preferences
   - Active states

3. Responsive Design:
   - Desktop optimization
   - Mobile hiding
   - Layout adaptations
   - Size constraints

## Navigation Components

### Bottom Navbar
1. Features:
   - Mobile-only navigation
   - Tab-based routing
   - Notification badges
   - User profile access
   - Generating status

2. Implementation:
   - Fixed positioning
   - Safe area handling
   - Route management
   - State tracking

3. Interactions:
   - Tab switching
   - Long press actions
   - Status indicators
   - Profile menu

4. Technical Details:
   - Session handling
   - Animation states
   - Route syncing
   - Component memoization

## Image View Components

### SingleImageView
1. Core Features:
   - Route-based image viewing (`/image/:imageId`)
   - Responsive design (mobile/desktop)
   - Image loading states
   - Download functionality
   - Owner validation

2. Implementation:
   - React Query for data fetching
   - Supabase storage integration
   - Conditional rendering
   - Error handling
   - Loading states

### MobileImageView
1. Features:
   - Full-screen mobile layout
   - Double-tap like animation
   - Image actions (download, discard, remix)
   - Owner information
   - Like functionality
   - Share capabilities
   - Image details display

2. UI Elements:
   - Back button
   - Action buttons
   - Scrollable content
   - Image prompt section
   - Details section
   - Owner header

3. Interactions:
   - Double-tap to like
   - Copy prompt
   - Share image link
   - Download image
   - Remix image
   - Discard (for owners)

### FullScreenImageView
1. Features:
   - Modal-based desktop view
   - Split layout (image + details)
   - Double-click like animation
   - Comprehensive details panel
   - Action buttons
   - Owner information

2. Layout:
   - Left side: Full-height image
   - Right side: Details panel (400px)
   - Scrollable details area
   - Fixed header/actions

3. Functionality:
   - Image actions (download, discard, remix)
   - Like system
   - Share capabilities
   - Prompt copying
   - Owner validation
   - Image details display

### Common Features
1. Image Actions:
   - Download
   - Discard (owner only)
   - Remix
   - Like/Unlike
   - Share
   - Copy prompt

2. Display Elements:
   - Image prompt
   - Model details
   - Creation time
   - Image dimensions
   - Quality settings
   - Owner information

3. Technical Integration:
   - Supabase storage
   - React Query
   - Authentication
   - Like system
   - Share functionality
   - Responsive design

## Generation Status Components

### Generating Images Drawer
1. Features:
   - Mobile-focused interface
   - Progress tracking
   - Completion indicators
   - Auto-hide behavior
   - Scrollable list

2. Implementation:
   - Drawer component
   - Animation states
   - Timer management
   - Model integration

3. Status Display:
   - Generation count
   - Image details
   - Model info
   - Progress state
   - Completion message

4. Technical Details:
   - State tracking
   - Effect cleanup
   - Transition handling
   - Layout management

### Generating Images Dropdown
1. Features:
   - Desktop-focused interface
   - Compact display
   - Status indicators
   - Auto-hide behavior
   - Quick access

2. Implementation:
   - Dropdown menu
   - Animation states
   - Timer handling
   - Model integration

3. Status Display:
   - Count badge
   - Progress state
   - Image details
   - Model info
   - Completion state

4. Technical Details:
   - State management
   - Effect cleanup
   - Animation control
   - Layout handling

### Common Patterns
1. UI Elements:
   - Progress indicators
   - Status badges
   - Model labels
   - Action buttons
   - Scrollable areas

2. State Management:
   - Generation tracking
   - Completion states
   - Timer handling
   - Animation control

3. User Experience:
   - Auto-show/hide
   - Progress feedback
   - Completion indicators
   - Responsive design

4. Technical Integration:
   - Model configs
   - State syncing
   - Layout adaptation
   - Animation timing

### Image View Sub-Components

1. ImageDetailsSection:
   - Grid layout for details
   - Label/value pairs
   - Responsive design
   - Consistent styling
   - Dynamic detail items

2. ImageOwnerHeader:
   - Owner avatar and name
   - Pro user badge
   - Follow button
   - Privacy toggle
   - Like button and count
   - Profile navigation
   - Owner-specific actions

3. ImagePrivacyToggle:
   - Public/Private toggle
   - Owner-only visibility
   - Real-time updates
   - Database integration
   - Toast notifications
   - Icon indicators

4. ImagePromptSection:
   - Prompt display
   - Copy functionality
   - Share capability
   - Visual feedback
   - Truncatable text
   - Action buttons

### Technical Integration
1. Database Operations:
   - Privacy updates
   - Like tracking
   - Follow system
   - Query invalidation
   - Error handling

2. User Experience:
   - Visual feedback
   - Loading states
   - Error messages
   - Success notifications
   - Smooth transitions

3. Component Composition:
   - Modular design
   - Reusable elements
   - Consistent styling
   - Responsive layouts
   - Conditional rendering

## Gallery Components

### ImageGallery
1. Core Features:
   - Masonry grid layout
   - Responsive columns
   - Infinite scrolling
   - Date-based grouping
   - Privacy filtering
   - Loading states
   - Empty states

2. View Modes:
   - My Images (grouped by date)
   - Inspiration feed
   - Profile view
   - Search results

3. Date Groups:
   - Today
   - Yesterday
   - This Week
   - Last Week
   - This Month
   - Last Month
   - Earlier

4. Technical Features:
   - Intersection Observer
   - Dynamic breakpoints
   - Lazy loading
   - Pagination
   - Filter handling
   - Search integration

### Image Card Components

1. ImageCardMedia:
   - Optimized image loading
   - Aspect ratio preservation
   - Loading skeleton
   - Double-click actions
   - Heart animation
   - Lazy loading
   - Image optimization

2. ImageCardBadges:
   - Model name display
   - NSFW indicators
   - Responsive sizing
   - Semi-transparent background
   - Consistent styling

3. Common Features:
   - Loading states
   - Error handling
   - Click handlers
   - Responsive design
   - Animation support
   - Badge system

### Technical Integration

1. Image Optimization:
   - URL optimization
   - Quality settings
   - Width constraints
   - Lazy loading
   - Async decoding

2. User Interaction:
   - Click handling
   - Double-click actions
   - Loading feedback
   - Visual transitions
   - Animation states

3. Layout Management:
   - Dynamic grid
   - Responsive breakpoints
   - Aspect ratio control
   - Spacing system
   - Badge positioning

## Image Utilities and Configuration

### Image Configurations
1. Aspect Ratios:
   - 15 predefined ratios
   - Portrait ratios (9:21 to 1:1)
   - Square ratio (1:1)
   - Landscape ratios (5:4 to 21:9)
   - Dimension calculations
   - Validation functions

2. Quality Options:
   - HD (1024px)
   - HD+ (1536px)
   - 4K (2048px)
   - Model-specific limits
   - Premium restrictions

3. Model Configurations:
   - Name and category
   - Premium status
   - Tagline
   - Image preview
   - Prompt modifications

### Image Utilities
1. Dimension Calculations:
   - Aspect ratio enforcement
   - 16-pixel alignment
   - Maximum dimension limits
   - Width/height calculations
   - Ratio detection

2. Prompt Handling:
   - Model-specific modifications
   - Prompt suffixes
   - Configuration integration
   - Error handling
   - Validation

3. Helper Functions:
   - Closest ratio finder
   - Ratio validation
   - Dimension alignment
   - Size calculations
   - Configuration lookup

### Technical Implementation
1. Aspect Ratio Management:
   - Ratio calculations
   - Dimension mapping
   - Validation checks
   - Closest match finding
   - Configuration access

2. Quality Control:
   - Size restrictions
   - Premium features
   - Model limitations
   - Resolution control
   - Output validation

3. Model Integration:
   - Configuration lookup
   - Premium validation
   - Prompt modification
   - Error handling
   - Feature access

## Supabase Integration

### Image Storage
1. Storage Operations:
   - Image deletion
   - Storage path management
   - Error handling
   - Validation checks
   - Bucket management

2. Database Operations:
   - Record deletion
   - Image metadata
   - Storage path tracking
   - ID validation
   - Error handling

3. Complete Deletion:
   - Storage cleanup
   - Database cleanup
   - Sequential operations
   - Error recovery
   - Validation checks

### Technical Implementation
1. Storage Management:
   - Bucket organization
   - Path validation
   - Error handling
   - Cleanup operations
   - Access control

2. Database Integration:
   - Record management
   - Metadata tracking
   - Relationship handling
   - Query operations
   - Error handling

3. Error Handling:
   - Validation checks
   - Error messages
   - Recovery procedures
   - Sequential validation
   - Operation rollback

### Integration Points
1. Storage Service:
   - Image bucket
   - Path structure
   - Access control
   - Cleanup routines
   - Error handling

2. Database Service:
   - Image records
   - Metadata storage
   - Relationship tracking
   - Query optimization
   - Data validation

3. Application Integration:
   - Storage hooks
   - Database hooks
   - Error handling
   - State management
   - UI feedback

## Image Handlers

### Event Handlers
1. Image Generation:
   - Generate button
   - Enter key handling
   - Model validation
   - Error handling
   - State updates

2. Image Interaction:
   - Click handling
   - Full-screen view
   - Details dialog
   - Download action
   - Discard action

3. Image Remixing:
   - Prompt copying
   - Settings replication
   - Model adaptation
   - Quality adjustment
   - Aspect ratio handling

### Premium Features
1. Model Access:
   - Pro model validation
   - NSFW model handling
   - Default model fallback
   - Step count adjustment
   - Quality restrictions

2. Quality Control:
   - HD+ restriction
   - Premium ratios
   - Default fallbacks
   - Pro user validation
   - Model limitations

3. State Management:
   - Model selection
   - Quality settings
   - Aspect ratios
   - Step counts
   - Seed handling

### Technical Implementation
1. Event Management:
   - Click handlers
   - Keyboard events
   - State updates
   - Error handling
   - UI feedback

2. Feature Access:
   - Pro validation
   - Model access
   - Quality control
   - Ratio restrictions
   - Default handling

3. Integration Points:
   - Model configs
   - Pro user state
   - Query client
   - Session handling
   - Storage service

## Image Generator State Management

### Core Features
1. State Properties:
   - Generation settings (prompt, seed, dimensions)
   - Model settings (model, quality, aspect ratio)
   - UI state (tabs, dialogs, views)
   - NSFW settings
   - Privacy settings
   - Batch settings

2. State Operations:
   - Individual setters
   - Batch updates
   - Derived state
   - Side effects
   - State validation

3. Model Integration:
   - Model configuration
   - NSFW handling
   - Category validation
   - Automatic switching
   - State persistence

### Technical Implementation
1. State Structure:
   - Centralized state
   - Setter functions
   - Effect handlers
   - Model configs
   - State persistence

2. NSFW Handling:
   - Model switching
   - Category validation
   - Default fallbacks
   - State persistence
   - UI updates

3. Integration Points:
   - Model system
   - UI components
   - Generation system
   - Storage service
   - Database service

### User Experience
1. State Updates:
   - Real-time updates
   - Model switching
   - View changes
   - Dialog control
   - Setting changes

2. Performance:
   - State batching
   - Effect optimization
   - Memory usage
   - Update handling
   - State persistence

3. Visual Feedback:
   - Model changes
   - Setting updates
   - Dialog states
   - View transitions
   - Error states

## Core Hooks

### Image Generation Hook
1. Generation Logic:
   - Session validation
   - Credit checking
   - Model validation
   - Quality validation
   - Batch generation
   - API key management

2. Generation Process:
   - Prompt modification
   - Dimension calculation
   - API request handling
   - Response validation
   - Image storage
   - Database updates

3. Error Handling:
   - API key errors
   - Generation failures
   - Upload errors
   - Database errors
   - Credit validation
   - State cleanup

### Gallery Images Hook
1. Query Features:
   - Infinite scrolling
   - Pagination support
   - Dynamic filtering
   - Search integration
   - NSFW filtering
   - Privacy control

2. View Modes:
   - My Images view
   - Inspiration view
   - Following feed
   - Top content
   - Search results

3. Filter Support:
   - Style filtering
   - Model filtering
   - NSFW content
   - Private images
   - User filtering
   - Search queries

4. Technical Features:
   - React Query integration
   - Supabase queries
   - URL generation
   - State management
   - Error handling
   - Cache control

### Integration Points
1. Database Integration:
   - Image records
   - User data
   - Filter queries
   - Pagination
   - Sorting

2. Storage Integration:
   - Image uploads
   - URL generation
   - Path management
   - Access control
   - Error handling

3. State Management:
   - Query caching
   - Infinite queries
   - Loading states
   - Error states
   - Page tracking

## Prompt Improvement System

### Core Features
1. Prompt Enhancement:
   - AI-powered improvement
   - Credit validation
   - Loading states
   - Success feedback
   - Error handling

2. Credit Management:
   - Fixed cost system
   - Credit deduction
   - Bonus credit usage
   - Balance validation
   - Real-time updates

3. User Experience:
   - Loading indicators
   - Toast notifications
   - Error messages
   - Success feedback
   - State management

### Technical Implementation
1. Credit Operations:
   - Credit validation
   - Deduction logic
   - Bonus credit handling
   - Database updates
   - Cache invalidation

2. State Management:
   - Loading states
   - Error states
   - Success states
   - Credit tracking
   - Cache updates

3. Integration Points:
   - AI improvement API
   - Database service
   - React Query
   - Toast system
   - Credit system

### Error Handling
1. Validation:
   - Credit availability
   - User authentication
   - Input validation
   - Response validation
   - State validation

2. Error Recovery:
   - Credit rollback
   - State cleanup
   - User feedback
   - Error logging
   - Retry logic

3. User Feedback:
   - Toast messages
   - Loading states
   - Error displays
   - Success indicators
   - Credit updates

## Image Filtering System

### Core Features
1. Filter Categories:
   - Privacy filtering
   - NSFW content
   - User-specific
   - Style-based
   - Model-based
   - Search queries

2. View Modes:
   - Inspiration view
   - My Images view
   - Following feed
   - Top content
   - Mixed modes

3. Filter Logic:
   - Private image handling
   - NSFW content control
   - Following/Top filters
   - Style/Model filters
   - Search integration
   - Sort ordering

### Technical Implementation
1. Filter Processing:
   - Memoized filtering
   - Dynamic criteria
   - Composite filters
   - Performance optimization
   - Sort handling

2. Filter Rules:
   - Privacy rules
   - NSFW rules
   - User rules
   - Content rules
   - Search rules
   - Sort rules

3. Integration Points:
   - Gallery system
   - Search system
   - User system
   - Model system
   - View system

### User Experience
1. Filter Controls:
   - Privacy toggle
   - NSFW toggle
   - Style selection
   - Model selection
   - Search input
   - View modes

2. Filter Feedback:
   - Empty states
   - Loading states
   - Filter indicators
   - Result counts
   - Error states

3. Filter Performance:
   - Memoization
   - Batch processing
   - Lazy evaluation
   - Cache usage
   - State updates

## Image Remixing System

### Core Features
1. Remix Functionality:
   - Image selection
   - Parameter copying
   - Navigation handling
   - Authentication check
   - Responsive behavior

2. User Experience:
   - Mobile adaptation
   - Desktop adaptation
   - Toast notifications
   - State management
   - Navigation flow

3. Integration Points:
   - Image generation
   - Model system
   - Navigation system
   - Authentication
   - State management

### Technical Implementation
1. Remix Logic:
   - Session validation
   - Parameter handling
   - Route management
   - Callback handling
   - State updates

2. Navigation:
   - Route parameters
   - Hash management
   - Mobile routing
   - Desktop routing
   - State persistence

3. Error Handling:
   - Auth validation
   - Toast messages
   - State cleanup
   - Error recovery
   - User feedback

### User Interface
1. Remix Controls:
   - Remix button
   - Mobile layout
   - Desktop layout
   - Loading states
   - Success states

2. State Management:
   - Image selection
   - Parameter copying
   - Navigation state
   - Auth state
   - UI state

3. Feedback System:
   - Success messages
   - Error messages
   - Loading indicators
   - State indicators
   - Navigation feedback

## Image Loading System

### Core Features
1. Lazy Loading:
   - Visibility detection
   - Scroll monitoring
   - Resize handling
   - Load management
   - State tracking

2. Performance:
   - Viewport detection
   - Margin calculation
   - Event optimization
   - Memory management
   - Resource cleanup

3. State Management:
   - Load state
   - Visibility state
   - Source tracking
   - Reference handling
   - Event handling

### Technical Implementation
1. Visibility Logic:
   - Intersection checks
   - Margin handling
   - Event listeners
   - State updates
   - Cleanup routines

2. Loading Control:
   - Load triggering
   - Source management
   - State tracking
   - Error handling
   - Reset handling

3. Integration Points:
   - Storage service
   - Image components
   - Scroll system
   - Resize system
   - State system

### User Experience
1. Loading States:
   - Initial state
   - Loading state
   - Loaded state
   - Error state
   - Reset state

2. Performance:
   - Memory usage
   - Network usage
   - CPU usage
   - Event handling
   - State updates

3. Resource Management:
   - Event cleanup
   - Memory cleanup
   - State cleanup
   - Reference cleanup
   - Source cleanup

## Follow System

### Core Features
1. Follow Management:
   - Follow/Unfollow
   - Follow status
   - Following list
   - Follower counts
   - Profile updates

2. Notifications:
   - New follower alerts
   - Profile links
   - User avatars
   - Display names
   - Toast messages

3. State Management:
   - Follow status
   - Following list
   - Query caching
   - Cache invalidation
   - Error handling

### Technical Implementation
1. Follow Operations:
   - Status checks
   - Database updates
   - Count updates
   - Profile updates
   - Notification creation

2. Query Management:
   - React Query
   - Cache invalidation
   - Query updates
   - State tracking
   - Error handling

3. Integration Points:
   - User profiles
   - Notification system
   - Database service
   - Auth system
   - Toast system

### User Experience
1. Follow Actions:
   - Toggle follow
   - Status feedback
   - Loading states
   - Error states
   - Success states

2. Notifications:
   - Follow alerts
   - Profile links
   - Visual feedback
   - Error messages
   - Success messages

3. State Updates:
   - Real-time updates
   - Count updates
   - Profile updates
   - Cache updates
   - UI feedback

## Like System

### Core Features
1. Like Management:
   - Like/Unlike
   - Like status
   - Like tracking
   - Duplicate prevention
   - Notification creation

2. Notifications:
   - New like alerts
   - Image previews
   - User details
   - Image links
   - Toast messages

3. State Management:
   - Like status
   - User likes
   - Query caching
   - Cache invalidation
   - Error handling

### Technical Implementation
1. Like Operations:
   - Status checks
   - Database updates
   - Duplicate checks
   - Profile lookups
   - Notification creation

2. Query Management:
   - React Query
   - Cache invalidation
   - Query updates
   - State tracking
   - Error handling

3. Integration Points:
   - User profiles
   - Image system
   - Notification system
   - Database service
   - Storage service

### User Experience
1. Like Actions:
   - Toggle like
   - Status feedback
   - Loading states
   - Error states
   - Success states

2. Notifications:
   - Like alerts
   - Image previews
   - Visual feedback
   - Error messages
   - Success messages

3. State Updates:
   - Real-time updates
   - Count updates
   - Profile updates
   - Cache updates
   - UI feedback

## Pro User System

### Core Features
1. Pro Status:
   - Status tracking
   - Cache management
   - Error handling
   - Query optimization
   - State persistence

2. Pro Benefits:
   - Premium models
   - Quality options
   - Aspect ratios
   - Feature access
   - Priority support

3. State Management:
   - Pro status
   - Query caching
   - Cache invalidation
   - Error handling
   - Status updates

### Technical Implementation
1. Status Operations:
   - Status checks
   - Database queries
   - Cache control
   - Error handling
   - State updates

2. Query Management:
   - React Query
   - Cache duration
   - Stale time
   - Retry logic
   - Error recovery

3. Integration Points:
   - User profiles
   - Model system
   - Feature access
   - Database service
   - Auth system

### User Experience
1. Pro Features:
   - Model access
   - Quality control
   - Ratio selection
   - Feature unlocks
   - Priority access

2. Status Feedback:
   - Pro indicators
   - Feature locks
   - Error messages
   - Status updates
   - Access control

3. State Updates:
   - Real-time status
   - Cache updates
   - Profile updates
   - Feature access
   - UI feedback

## Scroll System

### Core Features
1. Scroll Direction:
   - Direction tracking
   - Visibility control
   - Threshold handling
   - Event management
   - State persistence

2. Performance:
   - Passive events
   - Cleanup handling
   - Memory management
   - Event optimization
   - State updates

3. State Management:
   - Scroll position
   - Visibility state
   - Direction state
   - Event handling
   - State updates

### Technical Implementation
1. Scroll Logic:
   - Direction detection
   - Threshold checks
   - Event listeners
   - State updates
   - Cleanup routines

2. Event Management:
   - Scroll events
   - Passive flags
   - Event cleanup
   - Memory handling
   - Performance optimization

3. Integration Points:
   - Header system
   - Navigation system
   - UI components
   - State system
   - Layout system

### User Experience
1. Scroll Behavior:
   - Smooth transitions
   - Header visibility
   - Navigation updates
   - Visual feedback
   - Performance

2. Performance:
   - Event handling
   - State updates
   - Memory usage
   - CPU usage
   - UI responsiveness

3. Visual Feedback:
   - Header states
   - Navigation states
   - Transition effects
   - UI updates
   - Layout changes

## Media Query System

### Core Features
1. Responsive Design:
   - Query matching
   - State tracking
   - Event handling
   - Cleanup management
   - State persistence

2. Performance:
   - Event optimization
   - State updates
   - Memory management
   - Cleanup handling
   - Resource management

3. State Management:
   - Match state
   - Query state
   - Event handling
   - State updates
   - Cleanup routines

### Technical Implementation
1. Query Logic:
   - Media matching
   - Event listeners
   - State updates
   - Cleanup handling
   - Error recovery

2. Event Management:
   - Media events
   - Event cleanup
   - Memory handling
   - Performance optimization
   - State synchronization

3. Integration Points:
   - Component system
   - Layout system
   - UI components
   - State system
   - Responsive design

### User Experience
1. Responsive Behavior:
   - Layout adaptation
   - Component updates
   - Visual feedback
   - Performance
   - Smooth transitions

2. Performance:
   - Event handling
   - State updates
   - Memory usage
   - CPU usage
   - UI responsiveness

3. Visual Feedback:
   - Layout changes
   - Component states
   - Transition effects
   - UI updates
   - State indicators

## Real-time Systems

### Real-time Profile
1. Core Features:
   - Profile change subscription
   - Real-time updates
   - Query invalidation
   - Channel management
   - Cleanup handling

2. Technical Implementation:
   - Supabase channels
   - PostgreSQL changes
   - Query client
   - Event handling
   - State updates

3. Integration Points:
   - User system
   - Pro system
   - Request system
   - Query system
   - State management

### Pro Request System
1. Core Features:
   - Request status tracking
   - Query management
   - Error handling
   - State persistence
   - Status updates

2. Technical Implementation:
   - Query client
   - Database queries
   - Error handling
   - State tracking
   - Cache control

3. Integration Points:
   - Pro system
   - User system
   - Database service
   - Query system
   - State management

### Follow Count System
1. Core Features:
   - Follower counting
   - Following counting
   - Query management
   - Error handling
   - State tracking

2. Technical Implementation:
   - Parallel queries
   - Count aggregation
   - Error handling
   - State tracking
   - Cache control

3. Integration Points:
   - Follow system
   - User system
   - Database service
   - Query system
   - State management

## Core Libraries and Configuration

### Query Client
1. Configuration:
   - 5-minute stale time
   - 30-minute cache time
   - 2 retry attempts
   - Window focus refetch
   - Global defaults

2. Features:
   - Query caching
   - Stale data handling
   - Retry logic
   - Focus management
   - Cache invalidation

3. Integration:
   - React Query
   - Global state
   - Cache control
   - Error handling
   - Performance optimization

### Utility Functions
1. Core Utils:
   - Class name merging
   - Tailwind utilities
   - Style management
   - Component helpers
   - UI utilities

2. Integration:
   - Tailwind CSS
   - clsx library
   - Style merging
   - Component styling
   - Dynamic classes

### Navigation Configuration
1. Core Routes:
   - Home (Image Generator)
   - Profile (Public Profile)
   - Hidden routes
   - Icon integration
   - Route mapping

2. Features:
   - Route definitions
   - Component mapping
   - Icon integration
   - Hidden routes
   - Navigation state

3. Integration:
   - React Router
   - Component system
   - Icon system
   - Route protection
   - Navigation state

## Model Configuration

### Available Models
1. General Models:
   - SD-3.5Large-turbo (Fast generation)
   - Flux.1 Schnell (Balanced)
   - FLx.1 Dev (High-quality)
   - Realism turbo (Hyper-realistic)
   - Illustration turbo (Simple doodles)
   - 3D Render (3D style)
   - Anime-Xl (Anime style)
   - Midjourney (MJ v6 style)
   - Vector Art (Vector graphics)
   - Isometric (Isometric style)
   - Outfit Generator (Fashion)
   - Color Chaos (Modern art)
   - Aura 9999+ (Aura effects)
   - Flux.1 Pro (Premium)

2. NSFW Models:
   - Real (Realistic NSFW)
   - Anime (Anime NSFW)

### Model Properties
1. Configuration:
   - Name and category
   - API endpoint URL
   - Quality limitations
   - Premium status
   - Prompt suffix
   - Tagline
   - Preview image

2. Features:
   - Quality restrictions
   - Premium access
   - Prompt modification
   - Category filtering
   - Visual preview

## Supabase Integration

### Core Components
1. Authentication:
   - Auth provider
   - Auth UI
   - Password input
   - Session management
   - Token handling

2. Image Utils:
   - Storage operations
   - Path management
   - URL generation
   - Error handling
   - Access control

3. Database Hooks:
   - Table operations
   - Real-time updates
   - Query management
   - Error handling
   - State sync

### Technical Implementation
1. Configuration:
   - API setup
   - Storage setup
   - Auth setup
   - Real-time setup
   - Error handling

2. Components:
   - Auth provider
   - Auth UI
   - Password input
   - Loading states
   - Error states

3. Hooks:
   - Auth hook
   - Table hook
   - Translation hook
   - Query hook
   - State hook

## Utility Functions

### Image Utils
1. Discard Utils:
   - Image deletion
   - Storage cleanup
   - Database cleanup
   - Error handling
   - State updates

2. Download Utils:
   - Image download
   - URL handling
   - Error handling
   - State updates
   - Progress tracking

3. Image Configs:
   - Aspect ratios
   - Quality settings
   - Dimension limits
   - Validation rules
   - Configuration access

4. Image Optimization:
   - URL optimization
   - Quality control
   - Size limits
   - Format handling
   - Cache control

### Profile Utils
1. Features:
   - Avatar management
   - Profile updates
   - Image handling
   - Error recovery
   - State updates

2. Implementation:
   - Storage operations
   - Database updates
   - Image processing
   - Error handling
   - State management

### System Utils
1. Prompt Improvement:
   - AI enhancement
   - API integration
   - Error handling
   - State management
   - Response parsing

2. Retry Utils:
   - Retry logic
   - Error recovery
   - Status handling
   - Timeout management
   - State tracking