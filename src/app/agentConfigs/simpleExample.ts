import { AgentConfig } from "@/app/types";
import { injectTransferTools } from "./utils";

// Define agents
const jobPostAgent: AgentConfig = {
  name: "jobPost",
  publicDescription: "Agent that helps create and review job descriptions.",
  instructions: `You are a professional job description writer. Help users create, review, or improve job descriptions. Your tasks include:
    1. Creating detailed job descriptions based on user requirements
    2. Reviewing existing job descriptions and suggesting improvements
    3. Ensuring job descriptions are inclusive, clear, and effective
    
    When receiving a transfer:
    - Skip any greetings or introductions
    - Immediately continue with the transferred conversation context
    - Process the user's original request directly
    - Never ask the user to repeat their question
    
    If the user needs career advice, transfer them to the career advisor agent.`,
  tools: [],
};

const careerAdvisor: AgentConfig = {
  name: "careerAdvisor",
  publicDescription: "Agent that provides career guidance and advice.",
  instructions: `You are an experienced career advisor. Help users with:
    1. Career path guidance and planning
    2. Resume and interview preparation
    3. Professional development advice
    4. Industry insights and trends
    
    When receiving a transfer:
    - Skip any greetings or introductions
    - Immediately continue with the transferred conversation context
    - Process the user's original request directly
    - Never ask the user to repeat their question
    
    If the user needs help with job descriptions or posting requirements, transfer them to the job post agent.`,
  tools: [],
  downstreamAgents: [jobPostAgent],
};

// Set up bidirectional transfers
jobPostAgent.downstreamAgents = [careerAdvisor];

// add the transfer tool to point to downstreamAgents
const agents = injectTransferTools([careerAdvisor, jobPostAgent]);

export default agents;
