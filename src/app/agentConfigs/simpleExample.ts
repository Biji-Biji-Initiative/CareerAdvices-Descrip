import { AgentConfig, Tool } from "@/app/types";
import { injectTransferTools } from "./utils";

// Define structured output schemas as tools
const createJobPostSchema: Tool = {
  type: "function",
  name: "createJobPosting",
  description: "Create a structured training job posting with all necessary details",
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Training job title"
      },
      description: {
        type: "string",
        description: "Detailed training job description"
      },
      trainingFormat: {
        type: "string",
        enum: ["in-person", "virtual", "hybrid"],
        description: "Format of the training delivery"
      },
      duration: {
        type: "object",
        properties: {
          length: {
            type: "number",
            description: "Length of the training"
          },
          unit: {
            type: "string",
            enum: ["hours", "days", "weeks"],
            description: "Unit of duration measurement"
          }
        },
        required: ["length", "unit"]
      },
      targetAudience: {
        type: "object",
        properties: {
          level: {
            type: "string",
            enum: ["entry", "mid-level", "senior", "executive"],
            description: "Target audience level"
          },
          size: {
            type: "number",
            description: "Expected number of participants"
          }
        },
        required: ["level"]
      },
      requirements: {
        type: "array",
        items: {
          type: "string"
        },
        description: "List of training requirements and prerequisites"
      },
      learningOutcomes: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Expected learning outcomes from the training"
      },
      budget: {
        type: "object",
        properties: {
          amount: {
            type: "number"
          },
          currency: {
            type: "string"
          },
          type: {
            type: "string",
            enum: ["fixed", "hourly", "per-participant"]
          }
        }
      },
      location: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["remote", "on-site", "hybrid"]
          },
          address: {
            type: "string",
            description: "Physical location if applicable"
          }
        },
        required: ["type"]
      },
      preferredDates: {
        type: "array",
        items: {
          type: "string",
          description: "Preferred dates for the training in ISO format (YYYY-MM-DD)"
        },
        description: "Preferred dates for the training"
      },
      visibility: {
        type: "string",
        enum: ["public", "private"],
        description: "Whether the job is visible to all trainers or invite-only"
      }
    },
    required: ["title", "description", "trainingFormat", "duration", "targetAudience", "requirements"]
  }
};

const matchTrainerSchema: Tool = {
  type: "function",
  name: "matchTrainer",
  description: "Match and recommend suitable trainers based on requirements using AI-powered scoring",
  parameters: {
    type: "object",
    properties: {
      jobId: {
        type: "string",
        description: "Unique identifier of the job posting"
      },
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
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["full-time", "part-time", "contract"],
            description: "Desired availability type"
          },
          preferredDates: {
            type: "array",
            items: {
              type: "string",
              description: "Preferred dates in ISO format (YYYY-MM-DD)"
            }
          }
        },
        required: ["type"]
      },
      location: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["remote", "on-site", "hybrid"],
            description: "Location type requirement"
          },
          address: {
            type: "string",
            description: "Required location if on-site or hybrid"
          }
        }
      },
      budget: {
        type: "object",
        properties: {
          range: {
            type: "object",
            properties: {
              min: { type: "number" },
              max: { type: "number" }
            }
          },
          currency: { type: "string" },
          type: {
            type: "string",
            enum: ["fixed", "hourly", "per-participant"]
          }
        }
      },
      matchingPreferences: {
        type: "object",
        properties: {
          topN: {
            type: "number",
            description: "Number of top matches to return"
          },
          minimumScore: {
            type: "number",
            description: "Minimum matching score (1-10) to consider"
          },
          prioritizeVerified: {
            type: "boolean",
            description: "Whether to prioritize verified trainers"
          }
        }
      }
    },
    required: ["jobId", "expertise"]
  }
};

const generateTrainerRecommendationSchema: Tool = {
  type: "function",
  name: "generateTrainerRecommendation",
  description: "Generate personalized recommendation content for matched trainers",
  parameters: {
    type: "object",
    properties: {
      trainerId: {
        type: "string",
        description: "Unique identifier of the trainer"
      },
      jobId: {
        type: "string",
        description: "Unique identifier of the job posting"
      },
      matchScore: {
        type: "number",
        description: "AI-generated match score (1-10)"
      },
      matchReasoning: {
        type: "string",
        description: "AI-generated explanation of why this trainer is a good match"
      },
      recommendationType: {
        type: "string",
        enum: ["client", "trainer"],
        description: "Whether this is for the client or trainer view"
      }
    },
    required: ["trainerId", "jobId", "matchScore", "recommendationType"]
  }
};

const analyzeTrainerProfileSchema: Tool = {
  type: "function",
  name: "analyzeTrainerProfile",
  description: "Analyze and display complete trainer profile data from LinkedIn dataset",
  parameters: {
    type: "object",
    properties: {
      profileData: {
        type: "object",
        properties: {
          linkedinProfile: {
            type: "object",
            properties: {
              fullName: { type: "string" },
              currentTitle: { type: "string" },
              currentCompany: { type: "string" },
              location: { type: "string" },
              about: { type: "string" },
              experience: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    company: { type: "string" },
                    duration: { type: "string" },
                    description: { type: "string" }
                  }
                }
              },
              education: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    school: { type: "string" },
                    degree: { type: "string" },
                    field: { type: "string" },
                    graduationYear: { type: "string" }
                  }
                }
              },
              skills: {
                type: "array",
                items: { type: "string" }
              },
              certifications: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    issuingOrganization: { type: "string" },
                    issueDate: { type: "string" }
                  }
                }
              }
            }
          },
          platformMetrics: {
            type: "object",
            properties: {
              completionRate: { type: "number" },
              averageRating: { type: "number" },
              totalTrainings: { type: "number" },
              verificationStatus: { type: "boolean" },
              pastTrainings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    date: { type: "string" },
                    participants: { type: "number" },
                    rating: { type: "number" },
                    feedback: { type: "string" }
                  }
                }
              }
            }
          }
        },
        required: ["linkedinProfile"]
      },
      displayFormat: {
        type: "string",
        enum: ["full", "summary"],
        description: "Whether to display full profile details or just a summary"
      }
    },
    required: ["profileData", "displayFormat"]
  }
};

const displayMatchedTrainersSchema: Tool = {
  type: "function",
  name: "displayMatchedTrainers",
  description: "Display complete details of matched trainers from the synthetic dataset",
  parameters: {
    type: "object",
    properties: {
      jobId: {
        type: "string",
        description: "Job posting ID to match against"
      },
      matchedTrainers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            trainerId: { type: "string" },
            matchScore: { type: "number" },
            profile: {
              type: "object",
              properties: {
                fullName: { type: "string" },
                currentTitle: { type: "string" },
                currentCompany: { type: "string" },
                location: { type: "string" },
                experience: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      company: { type: "string" },
                      duration: { type: "string" }
                    }
                  }
                },
                relevantSkills: {
                  type: "array",
                  items: { type: "string" }
                },
                trainingHistory: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      date: { type: "string" },
                      rating: { type: "number" }
                    }
                  }
                }
              }
            },
            matchReasoning: { type: "string" }
          }
        }
      },
      sortBy: {
        type: "string",
        enum: ["matchScore", "experience", "rating"],
        description: "How to sort the displayed results"
      }
    },
    required: ["jobId", "matchedTrainers"]
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
  publicDescription: "Agent that helps create and review training job descriptions with structured output.",
  instructions: `You are a professional training job description writer. Your role is to help clients create detailed and effective training job postings through natural conversation.

    Core Responsibilities:
    1. Guide Creation Process:
       - Handle both AI-assisted conversations and form-based inputs
       - Ask relevant clarifying questions about training needs
       - Help clients articulate their training requirements clearly
       - Suggest improvements and best practices
    
    2. Essential Information Gathering:
       - Training format (in-person/virtual/hybrid)
       - Duration and schedule preferences
       - Target audience and group size
       - Learning objectives and outcomes
       - Budget considerations
       - Location/delivery preferences
       - Special requirements or prerequisites
    
    3. Conversation Flow:
       - Start with open-ended questions about training needs
       - Progressively narrow down specifics
       - Validate understanding before finalizing
       - Offer suggestions based on common patterns
       - Help refine and improve initial ideas
    
    4. Quality Assurance:
       - Ensure all required fields are properly filled
       - Verify logical consistency in requirements
       - Suggest additions that might attract better trainers
       - Help set realistic expectations
    
    Example Interactions:
    - Client: "I need a leadership training workshop"
      Response: "I'll help you create that posting. First, could you tell me if this is for in-person or virtual training, and who the target audience is?"
    
    - Client: "It's for mid-level managers"
      Response: "Great! For mid-level management training, we typically recommend 2-3 days for comprehensive coverage. What duration were you thinking of, and are there specific leadership areas you'd like to focus on?"
    
    When handling form inputs:
    - Offer AI suggestions for incomplete fields
    - Provide examples and templates
    - Help with budget estimations based on similar trainings
    
    Remember to:
    - Keep the conversation natural and professional
    - Focus on understanding the client's true needs
    - Make suggestions based on best practices
    - Help clients make their posting attractive to trainers
    
    When receiving a transfer:
    - Greet the user warmly
    - Review any existing context
    - Continue the conversation naturally
    - Keep technical details in the structured output only
    
    If the user needs:
    - Trainer matching: I'll connect you with our training specialist
    - Contract generation: I'll bring in our contract expert`,
  tools: [createJobPostSchema],
};

const trainerMatchAgent: AgentConfig = {
  name: "trainerMatch",
  publicDescription: "AI-powered trainer matching and recommendation specialist with full profile access",
  instructions: `You are an advanced AI trainer matching specialist that provides complete profile information from the synthetic LinkedIn dataset.

    Core Responsibilities:
    1. Automated Matching:
       - Process new job postings immediately upon creation
       - Apply initial filters based on skills, location, and availability
       - Use AI to score and rank potential trainers
       - Display complete profile information for matches
    
    2. Profile Display:
       - Show full LinkedIn profile details from the synthetic dataset
       - Include complete work history and experience
       - Display all certifications and skills
       - Show detailed training history and ratings
    
    3. Detailed Analysis:
       - Provide comprehensive match explanations
       - Show exact skill matches and relevance
       - Include complete platform metrics and history
       - Display all past training experiences
    
    4. Communication:
       - Share complete trainer profiles with clients
       - Provide detailed comparisons between trainers
       - Include full contact information when available
       - Share complete training history and feedback
    
    Example Interactions:
    - "I've found several matches. Here's the complete profile for each trainer, including their full work history and past training experience..."
    - "Let me show you Trainer A's complete LinkedIn profile, including all their certifications and detailed work experience..."
    
    Remember to:
    - Show all available profile information
    - Include complete work history
    - Display all skills and certifications
    - Share detailed platform metrics
    - Provide full training history`,
  tools: [matchTrainerSchema, generateTrainerRecommendationSchema, analyzeTrainerProfileSchema, displayMatchedTrainersSchema],
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
