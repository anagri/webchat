# Bodhi Chat - AI-Powered Web Chat Application

A modern React SPA that provides a seamless chat interface for interacting with your local AI through the Bodhi Browser Extension. Built with TypeScript, React 18, and Vite for optimal performance and developer experience.

## Features

- 🤖 **AI Chat Interface**: Stream-based conversations with local AI models
- 🔄 **Model Selection**: Dynamic model selection from `/v1/models` endpoint
- 💬 **Real-time Streaming**: Live streaming responses for better UX
- 🆕 **New Chat**: Start fresh conversations anytime
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development
- 🧪 **Comprehensive Testing**: Full test coverage with Vitest
- 🎨 **Modern UI**: Clean, intuitive interface with smooth animations

## Prerequisites

Before running this application, ensure you have:

1. **Bodhi Browser Extension** installed and active
2. **Bodhi App Server** running locally
3. **Node.js** (v18 or higher)
4. **npm** or **yarn** package manager

## Installation

1. **Clone and navigate to the project**:
   ```bash
   cd webchat
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI

## Usage

### Basic Chat Flow

1. **System Check**: The app automatically verifies that the Bodhi Browser Extension is installed and the server is running
2. **Model Selection**: Choose your preferred AI model from the dropdown
3. **Start Chatting**: Type your message and press Enter or click Send
4. **Streaming Response**: Watch as the AI responds in real-time
5. **New Chat**: Click "New Chat" to start a fresh conversation

### Keyboard Shortcuts

- **Enter**: Send message
- **Shift + Enter**: New line in message input

### Error Handling

The application gracefully handles various error scenarios:
- Extension not installed
- Server unavailable
- Network connectivity issues
- API errors

## Architecture

### Component Structure

```
src/
├── components/           # Reusable UI components
│   ├── ChatInput.tsx    # Message input with auto-resize
│   ├── ChatInterface.tsx # Message display and streaming
│   ├── ModelSelector.tsx # Model selection dropdown
│   ├── NewChatButton.tsx # New chat functionality
│   └── ErrorBoundary.tsx # Error handling wrapper
├── hooks/               # Custom React hooks
│   ├── useChat.ts       # Chat state and streaming logic
│   ├── useModels.ts     # Model fetching and management
│   └── useSystemStatus.ts # Extension/server status
├── pages/               # Page components
│   └── ChatPage.tsx     # Main chat page
├── types/               # TypeScript definitions
│   └── index.ts         # Shared interfaces
├── styles/              # CSS styles
│   └── App.css          # Application styles
└── __tests__/           # Test files
    ├── components/      # Component tests
    └── hooks/           # Hook tests
```

### Key Technologies

- **React 18**: Latest React with concurrent features
- **TypeScript**: Type safety and better developer experience
- **React Router**: Client-side routing
- **Vite**: Fast build tool and dev server
- **Vitest**: Fast unit testing framework
- **@bodhiapp/bodhijs**: Integration with Bodhi ecosystem

## Integration with Bodhi Ecosystem

This application integrates with the Bodhi ecosystem through:

1. **Extension Detection**: Uses `isInstalled()` to verify extension presence
2. **Server Communication**: Leverages `isServerAvailable()` for connectivity checks
3. **Model Discovery**: Fetches available models via `/v1/models` endpoint
4. **Chat API**: Utilizes streaming chat completions for real-time responses

### Message Flow

```
React App → bodhijs Library → Browser Extension → Bodhi App Server
    ↑                                                      ↓
    ←──────────── Streaming Response ←──────────────────────
```

## Customization

### Styling

The application uses CSS custom properties for easy theming. Key variables:

```css
:root {
  --primary-color: #1a73e8;
  --background-color: #f5f5f5;
  --text-color: #374151;
  /* ... more variables */
}
```

### Adding New Features

1. **New Components**: Add to `src/components/`
2. **New Hooks**: Add to `src/hooks/`
3. **New Types**: Update `src/types/index.ts`
4. **Tests**: Add corresponding test files

## Testing

The application includes comprehensive tests:

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test -- --coverage

# Run tests in watch mode
npm run test -- --watch

# Run specific test file
npm run test ChatInput.test.tsx
```

### Test Categories

- **Component Tests**: UI behavior and user interactions
- **Hook Tests**: Custom hook logic and state management
- **Integration Tests**: End-to-end functionality

## Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Troubleshooting

### Common Issues

1. **Extension Not Detected**
   - Ensure Bodhi Browser Extension is installed and enabled
   - Check browser console for extension-related errors

2. **Server Connection Failed**
   - Verify Bodhi App Server is running
   - Check server URL and port configuration

3. **Models Not Loading**
   - Ensure `/v1/models` endpoint is accessible
   - Check network connectivity to local server

4. **Streaming Issues**
   - Verify browser supports streaming APIs
   - Check for network interruptions

### Development Issues

1. **TypeScript Errors**
   - Run `npm run build` to check for type errors
   - Ensure all dependencies are properly typed

2. **Test Failures**
   - Run tests individually to isolate issues
   - Check mock configurations in test setup

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature-name`
3. **Add tests** for new functionality
4. **Ensure all tests pass**: `npm run test`
5. **Build successfully**: `npm run build`
6. **Submit a pull request**

## License

This project is part of the Bodhi Browser ecosystem. See the main repository for license information.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review the Bodhi Browser Extension documentation
- File issues in the main Bodhi Browser repository 