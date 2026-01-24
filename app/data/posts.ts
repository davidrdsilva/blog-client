import type { Post } from "@/app/types/post";

export const posts: Post[] = [
    {
        id: "1",
        title: "The Nature of Consciousness",
        subtitle: "Exploring what it means to be aware and how consciousness shapes our reality",
        description:
            "Exploring what it means to be aware and how consciousness shapes our reality and understanding of existence.",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
        date: new Date("2024-01-15"),
        author: "David",
        content: {
            blocks: [
                {
                    type: "paragraph",
                    data: {
                        text: "Consciousness remains one of the most profound mysteries in philosophy and science. What does it mean to be aware? How does our subjective experience arise from the physical processes of the brain?",
                    },
                },
                {
                    type: "header",
                    data: {
                        text: "The Hard Problem",
                        level: 2,
                    },
                },
                {
                    type: "paragraph",
                    data: {
                        text: "Philosopher David Chalmers coined the term 'hard problem of consciousness' to describe the difficulty of explaining how and why physical processes give rise to subjective experience. This stands in contrast to 'easy problems' like understanding how the brain processes information or controls behavior.",
                    },
                },
                {
                    type: "quote",
                    data: {
                        text: "The hard problem of consciousness is the problem of explaining how and why physical processes give rise to phenomenal experience.",
                        caption: "David Chalmers",
                    },
                },
                {
                    type: "header",
                    data: {
                        text: "Theories of Consciousness",
                        level: 2,
                    },
                },
                {
                    type: "list",
                    data: {
                        style: "unordered",
                        items: [
                            "Integrated Information Theory (IIT) - proposes that consciousness corresponds to integrated information",
                            "Global Workspace Theory - suggests consciousness arises from global information sharing in the brain",
                            "Higher-Order Thought Theory - consciousness requires higher-order thoughts about mental states",
                        ],
                    },
                },
                {
                    type: "paragraph",
                    data: {
                        text: "Each theory offers different insights, but none have fully solved the mystery. The debate continues, pushing the boundaries of our understanding.",
                    },
                },
            ],
            time: 1705276800000,
            version: "2.28.0",
        },
    },
    {
        id: "2",
        title: "Democracy in the Digital Age",
        subtitle: "How technology is reshaping political participation",
        description:
            "How social media and technology are reshaping political discourse and democratic participation worldwide.",
        image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop",
        date: new Date("2024-01-22"),
        author: "David",
        content: {
            blocks: [
                {
                    type: "paragraph",
                    data: {
                        text: "The digital revolution has fundamentally transformed how we engage with democracy. From social media campaigns to online voting systems, technology is reshaping the very foundations of political participation.",
                    },
                },
                {
                    type: "header",
                    data: {
                        text: "The Rise of Digital Platforms",
                        level: 2,
                    },
                },
                {
                    type: "paragraph",
                    data: {
                        text: "Social media platforms have become the new town squares where political discourse unfolds. These platforms enable unprecedented reach and engagement, but they also present new challenges.",
                    },
                },
                {
                    type: "image",
                    data: {
                        url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop",
                        caption: "Digital democracy in action",
                    },
                },
                {
                    type: "header",
                    data: {
                        text: "Key Challenges",
                        level: 2,
                    },
                },
                {
                    type: "list",
                    data: {
                        style: "ordered",
                        items: [
                            "Misinformation and fake news spread rapidly",
                            "Echo chambers reinforce existing beliefs",
                            "Privacy concerns with data collection",
                            "Algorithmic bias in content distribution",
                        ],
                    },
                },
                {
                    type: "quote",
                    data: {
                        text: "The internet is the first thing that humanity has built that humanity doesn't understand, the largest experiment in anarchy that we have ever had.",
                        caption: "Eric Schmidt",
                    },
                },
                {
                    type: "paragraph",
                    data: {
                        text: "Despite these challenges, digital platforms also offer opportunities for greater transparency, citizen engagement, and democratic innovation. The key is finding the right balance.",
                    },
                },
            ],
            time: 1705968000000,
            version: "2.28.0",
        },
    },
    {
        id: "3",
        title: "The Art of Game Design",
        subtitle: "Crafting experiences that captivate and inspire",
        description:
            "What makes a game truly engaging? A deep dive into mechanics, narrative, and player psychology.",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop",
        date: new Date("2024-02-01"),
        author: "David",
        content: {
            blocks: [
                {
                    type: "paragraph",
                    data: {
                        text: "Game design is an art form that combines psychology, storytelling, and interactive systems to create experiences that captivate players. What separates a good game from a great one?",
                    },
                },
                {
                    type: "header",
                    data: {
                        text: "Core Principles",
                        level: 2,
                    },
                },
                {
                    type: "list",
                    data: {
                        style: "unordered",
                        items: [
                            "Clear goals and meaningful choices",
                            "Balanced difficulty curve",
                            "Compelling narrative and world-building",
                            "Intuitive controls and feedback",
                            "Rewarding progression systems",
                        ],
                    },
                },
                {
                    type: "header",
                    data: {
                        text: "Player Psychology",
                        level: 2,
                    },
                },
                {
                    type: "paragraph",
                    data: {
                        text: "Understanding player motivation is crucial. The Self-Determination Theory identifies three core needs:",
                    },
                },
                {
                    type: "list",
                    data: {
                        style: "ordered",
                        items: [
                            "Autonomy - feeling in control of actions",
                            "Competence - experiencing growth and mastery",
                            "Relatedness - connecting with others or the game world",
                        ],
                    },
                },
                {
                    type: "image",
                    data: {
                        url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop",
                        caption: "The intersection of art and interactivity",
                    },
                },
                {
                    type: "quote",
                    data: {
                        text: "A game is a series of interesting choices.",
                        caption: "Sid Meier",
                    },
                },
            ],
            time: 1706745600000,
            version: "2.28.0",
        },
    },
    {
        id: "4",
        title: "Building Scalable Systems",
        subtitle: "Architecting for growth and performance",
        description:
            "Lessons learned from designing distributed systems that handle millions of requests per second.",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop",
        date: new Date("2024-02-10"),
        author: "David",
        content: {
            blocks: [
                {
                    type: "paragraph",
                    data: {
                        text: "Scalability isn't just about handling more traffic—it's about building systems that can grow gracefully while maintaining performance and reliability. Here are key principles I've learned from building distributed systems.",
                    },
                },
                {
                    type: "header",
                    data: {
                        text: "Horizontal vs Vertical Scaling",
                        level: 2,
                    },
                },
                {
                    type: "paragraph",
                    data: {
                        text: "Horizontal scaling (adding more machines) is generally preferred over vertical scaling (upgrading hardware) because it's more cost-effective and provides better fault tolerance.",
                    },
                },
                {
                    type: "header",
                    data: {
                        text: "Essential Patterns",
                        level: 2,
                    },
                },
                {
                    type: "list",
                    data: {
                        style: "unordered",
                        items: [
                            "Load balancing to distribute traffic",
                            "Caching strategies (Redis, CDN)",
                            "Database sharding and replication",
                            "Message queues for async processing",
                            "Microservices architecture",
                        ],
                    },
                },
                {
                    type: "code",
                    data: {
                        code: `// Example: Simple load balancer configuration
const servers = ['server1', 'server2', 'server3'];

function getServer() {
    const index = Math.floor(Math.random() * servers.length);
    return servers[index];
}`,
                    },
                },
                {
                    type: "paragraph",
                    data: {
                        text: "Remember: premature optimization is the root of all evil. Start simple, measure performance, and scale based on actual needs rather than anticipated ones.",
                    },
                },
            ],
            time: 1707523200000,
            version: "2.28.0",
        },
    },
    {
        id: "5",
        title: "Existentialism and Modern Life",
        description:
            "How existentialist philosophy helps us navigate the complexities and absurdities of contemporary existence.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
        date: new Date("2024-02-18"),
        author: "David",
    },
    {
        id: "6",
        title: "The Future of Work",
        description:
            "Examining how remote work, AI, and automation are transforming the traditional workplace paradigm.",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
        date: new Date("2024-02-25"),
        author: "David",
    },
    {
        id: "7",
        title: "Indie Game Development Journey",
        description:
            "My experience creating a game from scratch: the challenges, victories, and unexpected lessons learned.",
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop",
        date: new Date("2024-03-05"),
        author: "David",
    },
    {
        id: "8",
        title: "TypeScript Best Practices",
        subtitle: "Writing maintainable, type-safe code",
        description:
            "Advanced patterns and techniques for writing maintainable, type-safe code in large-scale applications.",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop",
        date: new Date("2024-03-12"),
        author: "David",
        content: {
            blocks: [
                {
                    type: "paragraph",
                    data: {
                        text: "TypeScript has become the standard for building large-scale JavaScript applications. Here are some best practices I've learned over years of working with TypeScript in production environments.",
                    },
                },
                {
                    type: "header",
                    data: {
                        text: "Type Safety First",
                        level: 2,
                    },
                },
                {
                    type: "paragraph",
                    data: {
                        text: "Always enable strict mode in your tsconfig.json. This catches potential bugs early and enforces better coding practices.",
                    },
                },
                {
                    type: "code",
                    data: {
                        code: `// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}`,
                    },
                },
                {
                    type: "header",
                    data: {
                        text: "Key Practices",
                        level: 2,
                    },
                },
                {
                    type: "list",
                    data: {
                        style: "unordered",
                        items: [
                            "Use interfaces for object shapes, types for unions/intersections",
                            "Avoid 'any' - use 'unknown' when type is truly unknown",
                            "Leverage utility types (Pick, Omit, Partial)",
                            "Use const assertions for literal types",
                            "Prefer type guards over type assertions",
                        ],
                    },
                },
                {
                    type: "code",
                    data: {
                        code: `// Good: Type guard
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Bad: Type assertion
const str = value as string;`,
                    },
                },
                {
                    type: "quote",
                    data: {
                        text: "TypeScript is JavaScript that scales.",
                        caption: "Microsoft",
                    },
                },
                {
                    type: "paragraph",
                    data: {
                        text: "Remember: TypeScript is a tool to help you write better code, not a burden. Embrace the type system and let it guide your development.",
                    },
                },
            ],
            time: 1710201600000,
            version: "2.28.0",
        },
    },
    {
        id: "9",
        title: "The Ethics of Technology",
        description:
            "Philosophical reflections on responsibility, privacy, and the moral implications of rapid technological advancement.",
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
        date: new Date("2024-03-20"),
        author: "David",
    },
    {
        id: "10",
        title: "Random Thoughts on Creativity",
        description:
            "Musings about where ideas come from, the creative process, and why constraints often lead to innovation.",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
        date: new Date("2024-03-28"),
        author: "David",
    },
    {
        id: "11",
        title: "React Server Components Explained",
        description:
            "Understanding the paradigm shift in React architecture and how server components change the way we build apps.",
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop",
        date: new Date("2024-04-05"),
        author: "David",
    },
    {
        id: "12",
        title: "The Meaning of Life",
        description:
            "A personal exploration of purpose, value, and what gives life meaning in an increasingly complex world.",
        image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop",
        date: new Date("2024-04-12"),
        author: "David",
    },
];
