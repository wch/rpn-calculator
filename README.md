# RPN Calculator

A modern, client-side **Reverse Polish Notation (RPN) Calculator** built with React, TypeScript, and shadcn/ui components. Features a professional interface with full keyboard support, error handling, and mobile optimization.

## What is RPN?

RPN (Reverse Polish Notation) is a mathematical notation where operators follow operands. Instead of typing `5 + 3`, you enter `5`, then `3`, then `+`. This stack-based approach eliminates the need for parentheses and follows the natural order of calculation.

**Example**: To calculate `(5 + 3) × 2`:
1. Enter `5` → Press Enter → Stack: `[5]`
2. Enter `3` → Press Enter → Stack: `[5, 3]` 
3. Press `+` → Stack: `[8]`
4. Enter `2` → Press Enter → Stack: `[8, 2]`
5. Press `×` → Stack: `[16]`

## Features

- **Traditional RPN Operations**: Basic arithmetic (+, −, ×, ÷)
- **Advanced Functions**: Square root (√), power (x²), swap
- **Stack Management**: Push, drop, duplicate, clear operations
- **Full Keyboard Support**: Type numbers and operations directly
- **Error Handling**: Clear messages for invalid operations
- **Mobile Optimized**: Touch-friendly interface with proper input modes
- **Professional UI**: Built with shadcn/ui components and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (16+ recommended)
- npm or yarn

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run watch

# In another terminal, serve the application
npm run serve
```

Visit `http://localhost:3000` to use the calculator.

### Build for Production

```bash
# Build optimized production version
npm run build-prod

# Serve the built files
npm run serve
```

## Usage

### Basic Operations

1. **Enter Numbers**: Type digits and press Enter to push to stack
2. **Perform Operations**: Click operation buttons or use keyboard shortcuts
3. **View Results**: Results appear immediately in the stack display

### Keyboard Shortcuts

| Key | Action |
|-----|---------|
| `0-9` | Enter digits |
| `.` | Decimal point |
| `+` `-` `*` `/` | Arithmetic operations |
| `Enter` | Push number to stack (or duplicate if input empty) |
| `Escape` | Clear everything |
| `Delete` | Drop top stack value |
| `Backspace` | Delete last entered digit |
| `S` | Square root |
| `P` | Power (x²) |
| `W` | Swap top two values |

### Stack Display

- Shows up to 4 most recent stack values
- Most recent value is at the top (position 1)
- Values are numbered for clarity
- Displays "Stack empty" when no values present

## Architecture

### Project Structure

```
rpn-calculator/
├── srcts/                   # TypeScript source code
│   ├── main.tsx            # Application entry point
│   ├── globals.css         # Global styles and Tailwind CSS
│   ├── RPNCalculator.ts    # Core calculator logic
│   ├── components/
│   │   ├── App.tsx         # Main calculator UI component
│   │   └── ui/             # shadcn/ui components
│   └── lib/
│       └── utils.ts        # Utility functions
├── dist/                   # Built application (generated)
├── build.ts                # Custom build script
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

### Core Components

#### RPNCalculator Class (`RPNCalculator.ts`)
- **Stack Management**: Maintains internal number stack
- **Operations**: Implements all mathematical operations
- **Error Handling**: Validates operations and provides error messages
- **Immutability**: Returns stack copies to prevent external mutation

```typescript
export class RPNCalculator {
  private stack: number[] = [];
  private errorMessage: string | null = null;
  
  push(value: string): boolean
  operation(op: string): void
  getStack(): number[]
  // ... other methods
}
```

#### App Component (`App.tsx`)
- **UI Logic**: Handles user interactions and display updates
- **State Management**: Uses React hooks with calculator instance
- **Keyboard Integration**: Global keyboard event handling
- **Error Display**: Shows calculator errors to user

#### Build System (`build.ts`)
- **esbuild Integration**: Fast TypeScript compilation and bundling
- **Tailwind Processing**: CSS processing with plugin
- **Watch Mode**: Efficient file watching with chokidar
- **Asset Management**: Copies HTML and handles source maps

### Technology Stack

- **React 19**: Modern React with latest JSX transform
- **TypeScript**: Full type safety with strict checking
- **shadcn/ui**: Professional, accessible UI components
- **Tailwind CSS v4**: Utility-first styling with modern features
- **esbuild**: Fast bundling and TypeScript compilation

### Data Flow

1. **User Input** → Number entry or button click
2. **Event Handler** → Processes input in App component
3. **Calculator Logic** → Updates stack in RPNCalculator class
4. **State Update** → React re-renders with new stack display
5. **UI Feedback** → Updated stack and error messages shown

## Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build for development |
| `npm run watch` | Development with file watching |
| `npm run build-prod` | Production build with minification |
| `npm run serve` | Serve built application |
| `npm run clean` | Remove build outputs |

### Adding New Features

1. **New Operations**: Add to `RPNCalculator.operation()` method
2. **UI Elements**: Add buttons in `App.tsx` component grid
3. **Keyboard Shortcuts**: Add to global keydown handler
4. **Styling**: Modify `globals.css` or component classes

### Build Configuration

The project uses a custom build system with:
- **TypeScript Compilation**: Strict type checking
- **esbuild Bundling**: Fast JavaScript bundling
- **Tailwind Processing**: CSS optimization and purging
- **File Watching**: Efficient development rebuilds

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers with touch support
- Progressive enhancement (works without JavaScript for display)

## License

MIT License - see package.json for details.