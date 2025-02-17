# Key Files for Realtime API Agents Interface

## Core Components
- `src/app/App.tsx` - Main application component containing ChatHub
- `src/app/types.ts` - TypeScript interfaces and types

## Agent Configuration
- `src/app/agentConfigs/index.ts` - Agent configuration exports
- `src/app/agentConfigs/simpleExample.ts` - Example agent definitions
- `src/app/agentConfigs/utils.ts` - Agent utility functions
- `src/app/agentConfigs/voiceAgentMetaprompt.txt` - Voice agent configuration template

## API and Connections
- `src/app/api/session/route.ts` - Session management
- `src/app/lib/realtimeConnection.ts` - WebRTC connection handling

## Event Handling
- `src/app/hooks/useHandleServerEvent.ts` - Server event handling logic 