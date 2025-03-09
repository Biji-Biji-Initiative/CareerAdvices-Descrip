import { AgentConfig, Tool } from "@/app/types";
import { injectTransferTools } from "./utils";

// Define structured output schemas as tools
const createJobPostSchema: Tool = {
  type: "function",
  name: "createJobPosting",
  description: "Create a structured job posting with all necessary details",
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Job title"
      },
      description: {
        type: "string",
        description: "Detailed job description"
      },
      requirements: {
        type: "array",
        items: {
          type: "string"
        },
        description: "List of job requirements"
      },
      benefits: {
        type: "array",
        items: {
          type: "string"
        },
        description: "List of job benefits"
      }
    },
    required: ["title", "description", "requirements"]
  }
};

const matchTrainerSchema: Tool = {
  type: "function",
  name: "matchTrainer",
  description: "Match and recommend suitable trainers based on requirements",
  parameters: {
    type: "object",
    properties: {
      expertise: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Required areas of expertise"
      },
      experience: {
        type: "number",
        description: "Minimum years of experience required"
      },
      availability: {
        type: "string",
        enum: ["full-time", "part-time", "contract"],
        description: "Desired availability type"
      }
    },
    required: ["expertise"]
  }
};

const generateContractSchema: Tool = {
  type: "function",
  name: "generateContract",
  description: "Generate contract terms based on agreement details",
  parameters: {
    type: "object",
    properties: {
      contractType: {
        type: "string",
        enum: ["employment", "training", "consulting"],
        description: "Type of contract"
      },
      terms: {
        type: "object",
        properties: {
          duration: {
            type: "string",
            description: "Contract duration"
          },
          compensation: {
            type: "object",
            properties: {
              amount: {
                type: "number"
              },
              currency: {
                type: "string"
              },
              frequency: {
                type: "string",
                enum: ["hourly", "monthly", "yearly"]
              }
            },
            required: ["amount", "currency", "frequency"]
          }
        },
        required: ["duration", "compensation"]
      }
    },
    required: ["contractType", "terms"]
  }
};

// Define agents
const jobPostAgent: AgentConfig = {
  name: "jobPost",
  publicDescription: "Agent that helps create and review job descriptions with structured output.",
  instructions: `You are a professional job description writer. Interact naturally with users while helping them create, review, or improve job descriptions.

    Engage in natural conversation and provide helpful guidance. When finalizing a job description, use the createJobPosting function to generate the structured output, but continue speaking naturally with the user.

    Your tasks include:
    1. Having natural conversations about job requirements and details
    2. Providing suggestions and improvements in a conversational way
    3. Asking clarifying questions when needed
    4. Using clear, friendly language
    
    While you'll use the createJobPosting function to generate structured data, keep your conversation natural and human-like.
    Example responses:
    - "That's a great start for the ML Engineer role! I can help you refine it. What specific ML frameworks are you looking for?"
    - "I notice you haven't mentioned the preferred years of experience. Would you like to specify that?"
    
    When receiving a transfer:
    - Greet the user warmly
    - Continue the conversation naturally
    - Keep the technical details in the structured output only
    
    If the user needs:
    - Trainer matching: I'll connect you with our training specialist
    - Contract generation: I'll bring in our contract expert`,
  tools: [createJobPostSchema],
};

const trainerMatchAgent: AgentConfig = {
  name: "trainerMatch",
  publicDescription: "Agent that matches and recommends suitable trainers.",
  instructions: `You are a friendly trainer matching specialist. Have natural conversations with users while helping them find the right trainers.

    Engage in casual, helpful dialogue while gathering requirements. Use the matchTrainer function for structured data, but keep your conversation natural.

    Your approach should be:
    1. Have friendly discussions about their training needs
    2. Ask questions conversationally about requirements
    3. Provide recommendations in an easy-to-understand way
    
    Example responses:
    - "I see you're looking for an ML expert! Could you tell me more about the specific areas you want to focus on?"
    - "Based on what you've told me, I think I know some trainers who would be perfect for this. Would you like to hear about them?"
    
    When receiving a transfer:
    - Start with a warm greeting
    - Keep the conversation flowing naturally
    - Use the structured output behind the scenes
    
    If the user needs:
    - Job posting help: I'll connect you with our job description specialist
    - Contract generation: I'll bring in our contract expert`,
  tools: [matchTrainerSchema],
};

const contractAgent: AgentConfig = {
  name: "contract",
  publicDescription: "Agent that generates and manages contract terms.",
  instructions: `You are a helpful contract specialist who speaks in plain, clear language. While you'll generate structured contract data, your conversation should be natural and easy to understand.

    Have friendly discussions about contract needs while using the generateContract function for formal output. Your approach should be:
    1. Discuss contract requirements conversationally
    2. Explain terms in simple, clear language
    3. Guide users through options naturally
    
    Example responses:
    - "Let's talk about what you need in this contract. What kind of duration are you thinking about?"
    - "I'll help you set up those compensation terms. Would you prefer hourly or monthly payment?"
    
    When receiving a transfer:
    - Welcome the user warmly
    - Keep explanations simple and clear
    - Handle technical details in the background
    
    If the user needs:
    - Job posting help: I'll connect you with our job description specialist
    - Trainer matching: I'll connect you with our training expert`,
  tools: [generateContractSchema],
};

// Set up bidirectional transfers
jobPostAgent.downstreamAgents = [trainerMatchAgent, contractAgent];
trainerMatchAgent.downstreamAgents = [jobPostAgent, contractAgent];
contractAgent.downstreamAgents = [jobPostAgent, trainerMatchAgent];

// add the transfer tool to point to downstreamAgents
const agents = injectTransferTools([jobPostAgent, trainerMatchAgent, contractAgent]);

export default agents;
