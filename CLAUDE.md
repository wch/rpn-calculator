# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a standalone client-side RPN (Reverse Polish Notation) Calculator built with React, TypeScript, and shadcn/ui components. The application demonstrates professional UI development patterns using modern React practices, Tailwind CSS, and a custom build system with esbuild.

The calculator implements traditional RPN stack-based operations with keyboard shortcuts, error handling, and a responsive interface optimized for both desktop and mobile use.

## Build Commands

- `npm run build` - Build TypeScript and bundle JavaScript/CSS for production
- `npm run watch` - Watch mode for development (rebuilds on file changes)
- `npm run build-prod` - Production build with minification
- `npm run build-standalone` - Build standalone version in `dist/` directory
- `npm run serve` - Serve the built application on localhost:3000
- `npm run clean` - Remove all build outputs

## Development Workflow

For active development:
1. `npm install` - Install dependencies
2. `npm run watch` - Start development build with file watching
3. `npm run serve` - (in separate terminal) Serve the app locally
4. Visit `http://localhost:3000`

The build system uses chokidar for efficient file watching (avoiding high CPU usage from esbuild's native watcher) and automatically copies the HTML file to the dist directory.

## Architecture

### Source Structure

- **srcts/main.tsx**: Application entry point, mounts React app to DOM
- **srcts/components/App.tsx**: Main calculator component with UI logic and event handling
- **srcts/RPNCalculator.ts**: Core calculator logic class with stack operations
- **srcts/components/ui/**: shadcn/ui base components (Button, Card, Input, Separator)
- **srcts/lib/utils.ts**: Utility functions including `cn` helper for Tailwind class merging
- **srcts/globals.css**: Global styles, Tailwind CSS imports, and CSS variables
- **build.ts**: Custom build script using esbuild with Tailwind processing

### Key Architectural Patterns

1. **Separation of Concerns**: UI logic in App.tsx, calculator logic in RPNCalculator.ts
2. **Immutable State**: Calculator returns stack copies to prevent mutation
3. **Error Handling**: Centralized error state management with user-friendly messages
4. **Keyboard Integration**: Global keyboard shortcuts with input field awareness
5. **Responsive Design**: Mobile-optimized touch interface with proper button sizing

### Calculator Logic (RPNCalculator.ts)

- **Stack Operations**: push(), pop(), peek(), clear(), drop(), duplicate()
- **Arithmetic Operations**: +, -, *, / with proper error handling
- **Advanced Functions**: sqrt(), pow() (x²), swap()
- **Error Management**: Validates operations, handles division by zero, negative sqrt
- **State Restoration**: Operations maintain stack integrity on errors

### UI Architecture (App.tsx)

- **State Management**: Uses React hooks with useRef for calculator instance
- **Event Handling**: Separate handlers for digits, operations, and special keys  
- **Display Logic**: Shows last 4 stack values with proper formatting
- **Input Validation**: Restricts input to valid decimal numbers
- **Keyboard Support**: Comprehensive keyboard shortcuts (0-9, +*/-, Enter, Escape, etc.)

## Build System

### Custom esbuild Configuration (build.ts)

- **Dual Mode**: Supports both watch and one-time builds
- **Tailwind Integration**: Uses `esbuild-plugin-tailwindcss` for CSS processing
- **File Watching**: chokidar-based watching for better performance
- **Asset Management**: Automatically copies HTML files to output directory
- **Development Features**: Source maps and linked debugging in non-production builds

### TypeScript Configuration

- **Path Aliases**: `@/*` maps to `srcts/*` for clean imports
- **Strict Mode**: Full TypeScript strict checking enabled
- **Modern Target**: ES2022 with DOM libraries for React development
- **JSX**: Configured for React 19's new JSX transform

## shadcn/ui Integration

### Components Used
- **Card**: Main container with header and content areas
- **Button**: Calculator buttons with variant styling (outline, secondary, destructive)
- **Input**: Number input field with proper mobile keyboard support
- **Separator**: Visual separation between UI sections

### Styling System
- **CSS Variables**: Theme colors defined in globals.css for light/dark support
- **Tailwind CSS v4**: Latest Tailwind with modern CSS features
- **Responsive Design**: Grid layouts that adapt to screen sizes
- **Component Variants**: Uses class-variance-authority for consistent styling

### Theme Configuration
- **Color System**: Neutral base with primary/secondary/destructive variants
- **Spacing**: Uses Tailwind spacing scale with custom grid layouts
- **Typography**: Font family falls back to system fonts for performance

## Key Features

### Calculator Functionality
- **Traditional RPN**: Enter numbers, then operations (5 Enter 3 + = 8)
- **Stack Display**: Shows up to 4 most recent values with position indicators
- **Error Feedback**: Clear error messages for invalid operations
- **Keyboard Shortcuts**: Full keyboard support matching traditional calculators

### User Experience  
- **Mobile Optimization**: Touch-friendly buttons, proper input modes
- **Visual Feedback**: Different button variants for number/operation/action types
- **Progressive Enhancement**: Works without JavaScript for basic display
- **Loading State**: Proper loading spinner while JavaScript initializes

## Development Tips

### Adding New Operations
1. Add operation logic in `RPNCalculator.ts` `operation()` method
2. Add UI button in `App.tsx` calculator grid
3. Add keyboard shortcut in global keydown handler
4. Test error cases and stack state management

### Styling Changes
- Modify `globals.css` for theme colors and CSS variables
- Use existing shadcn/ui component variants when possible
- Test responsive behavior on mobile devices
- Maintain consistent spacing using Tailwind utilities

### Performance Considerations
- Calculator state uses useRef to avoid unnecessary re-renders
- Stack operations return copies to maintain immutability
- Build system optimized for fast rebuilds during development
- CSS is processed and bundled efficiently with Tailwind

## Testing Strategy

No automated tests are currently configured. Manual testing should focus on:
- Stack operations and RPN calculation correctness
- Error handling for edge cases (division by zero, empty stack)
- Keyboard shortcuts and input validation
- Mobile touch interface and responsive layout
- Build system functionality across different environments