import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { agentName, newInstructions } = await request.json();

    // Read the current file content
    const filePath = path.join(process.cwd(), 'src', 'app', 'agentConfigs', 'simpleExample.ts');
    const fileContent = await fs.readFile(filePath, 'utf-8');

    // Find the agent's instructions section and replace it
    const agentSection = new RegExp(`const ${agentName}:\\s*AgentConfig\\s*=\\s*{[^}]*instructions:\\s*\`[^\`]*\``, 'g');
    const updatedContent = fileContent.replace(agentSection, (match) => {
      return match.replace(/instructions:\s*\`[^\`]*\`/, `instructions: \`${newInstructions}\``);
    });

    // Write the updated content back to the file
    await fs.writeFile(filePath, updatedContent, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating agent prompt:', error);
    return NextResponse.json({ success: false, error: 'Failed to update agent prompt' }, { status: 500 });
  }
} 