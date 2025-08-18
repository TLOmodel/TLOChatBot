import type { Conversation } from '@/lib/types';

export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    title: 'Exploring React Hooks',
    preview: 'AI: `useEffect` is for side effects...',
    messages: [
      {
        id: 'msg1',
        author: 'user',
        content: 'Hey, can you explain React Hooks to me?',
        timestamp: '10:30 AM',
      },
      {
        id: 'msg2',
        author: 'ai',
        userPrompt: 'Hey, can you explain React Hooks to me?',
        content:
          'Of course! React Hooks are functions that let you “hook into” React state and lifecycle features from function components. They were introduced in React 16.8.\n\nHere are some of the most common ones:\n- `useState`: Lets you add React state to function components.\n- `useEffect`: Lets you perform side effects in function components.\n- `useContext`: Lets you subscribe to React context without introducing nesting.\n\nWould you like a code example for `useState`?',
        timestamp: '10:31 AM',
      },
      {
        id: 'msg3',
        author: 'user',
        content: 'Yes, please show me a `useState` example.',
        timestamp: '10:32 AM',
      },
      {
        id: 'msg4',
        author: 'ai',
        userPrompt: 'Yes, please show me a `useState` example.',
        content:
          "Sure thing! Here's a simple counter component using `useState`:\n\n```javascript\nimport React, { useState } from 'react';\n\nfunction Counter() {\n  // Declare a new state variable, which we'll call \"count\"\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}\n```\n\nIn this example, `useState` returns a pair: the *current* state value and a function that lets you update it. We call this function from an event handler to update the state.",
        timestamp: '10:33 AM',
      },
    ],
  },
  {
    id: 'conv2',
    title: 'Next.js 13 vs 14',
    preview: 'You: What are the main differences?',
    messages: [
      {
        id: 'msg5',
        author: 'user',
        content: 'What are the main differences between Next.js 13 and Next.js 14?',
        timestamp: '11:00 AM',
      },
      {
        id: 'msg6',
        author: 'ai',
        userPrompt: 'What are the main differences between Next.js 13 and Next.js 14?',
        content: 'Next.js 14 is primarily a performance and stability-focused release, building on the major architectural changes introduced in Next.js 13, like the App Router. Key improvements include:\n\n- **Turbopack:** Up to 53% faster local server startup.\n- **Server Actions:** Now stable, allowing you to write server-side code directly in your React components.\n- **Partial Prerendering (Preview):** A new experimental feature for dynamic content with a static shell.\n\nThink of it as a refinement of version 13 rather than a complete overhaul.',
        timestamp: '11:01 AM',
      },
    ],
  },
  {
    id: 'conv3',
    title: 'CSS Grid Layout',
    preview: 'AI: CSS Grid is a powerful layout system...',
    messages: [],
  },
];
