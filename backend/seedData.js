import mongoose from "mongoose";
import bcrypt from "bcrypt";
import "dotenv/config";

import User from "./models/User.js";
import Hackathon from "./models/Hackathon.js";
import Team from "./models/Team.js";
import Registration from "./models/Registration.js";
import Submission from "./models/Submission.js";
import Review from "./models/Review.js";

const seedDatabase = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        console.log("Clearing existing database collections...");
        await Promise.all([
            User.deleteMany({}),
            Hackathon.deleteMany({}),
            Team.deleteMany({}),
            Registration.deleteMany({}),
            Submission.deleteMany({}),
            Review.deleteMany({}),
        ]);
        console.log("Collections cleared.");

        const defaultPassword = await bcrypt.hash("password123", 10);
        const adminPassword = await bcrypt.hash("admin123", 10);

        // 1. Create Admin
        const admin = await User.create({
            firstName: "Super",
            lastName: "Admin",
            email: "admin@gmail.com",
            password: adminPassword,
            role: "admin",
            phone: "+1234567890",
        });

        // 2. Create 3 Organizers
        const organizers = await User.create([
            {
                firstName: "Elena",
                lastName: "Rostova",
                email: "organizer1@example.com",
                password: defaultPassword,
                role: "organizer",
                organization: "TechForge Global",
                designation: "Head of Developer Ecosystem",
            },
            {
                firstName: "Marcus",
                lastName: "Vance",
                email: "organizer2@example.com",
                password: defaultPassword,
                role: "organizer",
                organization: "NextGen Innovators Foundation",
                designation: "Program Director",
            },
            {
                firstName: "Sophia",
                lastName: "Chen",
                email: "organizer3@example.com",
                password: defaultPassword,
                role: "organizer",
                organization: "CyberSphere Labs",
                designation: "Lead Event Manager",
            },
        ]);

        // 3. Create 5 Judges
        const judges = await User.create([
            {
                firstName: "Dr. Alexander",
                lastName: "Wright",
                email: "judge1@example.com",
                password: defaultPassword,
                role: "judge",
                company: "OpenAI Research",
                designation: "Principal AI Engineer",
                expertise: ["Machine Learning", "LLMs", "Python"],
            },
            {
                firstName: "Sarah",
                lastName: "Jenkins",
                email: "judge2@example.com",
                password: defaultPassword,
                role: "judge",
                company: "Stripe",
                designation: "Senior Staff Architect",
                expertise: ["FinTech", "Distributed Systems", "Security"],
            },
            {
                firstName: "Devon",
                lastName: "Larratt",
                email: "judge3@example.com",
                password: defaultPassword,
                role: "judge",
                company: "Ethereum Foundation",
                designation: "Core Researcher",
                expertise: ["Web3", "Smart Contracts", "Solidity"],
            },
            {
                firstName: "Priya",
                lastName: "Sharma",
                email: "judge4@example.com",
                password: defaultPassword,
                role: "judge",
                company: "Google Cloud",
                designation: "UX & Product Lead",
                expertise: ["UI/UX Design", "Product Strategy", "Frontend"],
            },
            {
                firstName: "Hiroshi",
                lastName: "Tanaka",
                email: "judge5@example.com",
                password: defaultPassword,
                role: "judge",
                company: "CrowdStrike",
                designation: "Chief Security Specialist",
                expertise: ["Cybersecurity", "Zero Trust", "DevOps"],
            },
        ]);

        // 4. Create 12 Participants
        const participantData = [
            { firstName: "Aarav", lastName: "Patel", email: "participant1@example.com", college: "IIT Bombay" },
            { firstName: "Rhea", lastName: "Sen", email: "participant2@example.com", college: "BITS Pilani" },
            { firstName: "Vikram", lastName: "Singh", email: "participant3@example.com", college: "DTU Delhi" },
            { firstName: "Ananya", lastName: "Iyer", email: "participant4@example.com", college: "NIT Trichy" },
            { firstName: "Karan", lastName: "Mehta", email: "participant5@example.com", college: "IIT Delhi" },
            { firstName: "Sneha", lastName: "Reddy", email: "participant6@example.com", college: "IIT Madras" },
            { firstName: "Rohan", lastName: "Gupta", email: "participant7@example.com", college: "IIIT Hyderabad" },
            { firstName: "Meera", lastName: "Nair", email: "participant8@example.com", college: "VIT Vellore" },
            { firstName: "Aditya", lastName: "Verma", email: "participant9@example.com", college: "SRM University" },
            { firstName: "Pooja", lastName: "Joshi", email: "participant10@example.com", college: "IIT Kharagpur" },
            { firstName: "Kabir", lastName: "Deshmukh", email: "participant11@example.com", college: "Manipal University" },
            { firstName: "Tanya", lastName: "Kapoor", email: "participant12@example.com", college: "IIT Roorkee" },
        ];

        const participants = await User.create(
            participantData.map((p) => ({
                ...p,
                password: defaultPassword,
                role: "participant",
                skills: ["React", "Node.js", "Python", "TailwindCSS"],
            }))
        );

        console.log(`Users Created: 1 Admin, ${organizers.length} Organizers, ${judges.length} Judges, ${participants.length} Participants.`);

        // Dates helper
        const now = new Date();
        const futureDate = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        const pastDate = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        // 5. Create 5 Hackathons
        const hackathons = await Hackathon.create([
            {
                title: "AI & Autonomous Agents Hack 2026",
                description: "Build cutting-edge AI agents, RAG workflows, and multi-modal assistants using modern LLM frameworks.",
                theme: "Artificial Intelligence & ML",
                mode: "Online",
                prizePool: 150000,
                maxTeamSize: 4,
                startDate: pastDate(5),
                endDate: futureDate(15),
                registrationDeadline: futureDate(5),
                organizer: organizers[0]._id,
                assignedJudges: [judges[0]._id, judges[1]._id, judges[3]._id],
                isRegistrationOpen: true,
                status: "ongoing",
            },
            {
                title: "FinTech Innovation Summit",
                description: "Reinvent global payment solutions, automated credit scoring, and decentralized cross-border settlements.",
                theme: "Finance Technology & Banking",
                mode: "Online",
                prizePool: 100000,
                maxTeamSize: 4,
                startDate: pastDate(2),
                endDate: futureDate(10),
                registrationDeadline: futureDate(2),
                organizer: organizers[0]._id,
                assignedJudges: [judges[1]._id, judges[3]._id],
                isRegistrationOpen: true,
                status: "ongoing",
            },
            {
                title: "Web3 & Decentralized Web Hack",
                description: "Design high-performance smart contracts, zero-knowledge proof applications, and DAO governance tools.",
                theme: "Blockchain & Cryptography",
                mode: "Offline",
                venue: "Convention Center, Bangalore",
                prizePool: 200000,
                maxTeamSize: 4,
                startDate: pastDate(1),
                endDate: futureDate(20),
                registrationDeadline: futureDate(8),
                organizer: organizers[1]._id,
                assignedJudges: [judges[2]._id, judges[4]._id],
                isRegistrationOpen: true,
                status: "ongoing",
            },
            {
                title: "GreenTech & Climate Solutions",
                description: "Engineer sustainable tech for carbon footprint monitoring, renewable energy grids, and circular economy tracking.",
                theme: "Sustainability & CleanTech",
                mode: "Online",
                prizePool: 80000,
                maxTeamSize: 3,
                startDate: pastDate(10),
                endDate: futureDate(10),
                registrationDeadline: pastDate(2),
                organizer: organizers[1]._id,
                assignedJudges: [judges[0]._id, judges[3]._id, judges[4]._id],
                isRegistrationOpen: false,
                status: "ongoing",
            },
            {
                title: "CyberDefense & ZeroTrust Hack 2026",
                description: "Challenge cybersecurity vulnerabilities, implement automated intrusion detection systems, and build zero-trust networks.",
                theme: "Cybersecurity & Cloud Safety",
                mode: "Offline",
                venue: "Tech Campus, Hyderabad",
                prizePool: 120000,
                maxTeamSize: 4,
                startDate: futureDate(5),
                endDate: futureDate(25),
                registrationDeadline: futureDate(12),
                organizer: organizers[2]._id,
                assignedJudges: [judges[0]._id, judges[1]._id, judges[4]._id],
                isRegistrationOpen: true,
                status: "upcoming",
            },
        ]);

        console.log(`Created ${hackathons.length} Hackathons assigned to organizers and judges.`);

        // 6. Create Teams & Registrations
        const team1 = await Team.create({
            teamName: "Neural Ninjas",
            hackathon: hackathons[0]._id,
            leader: participants[0]._id,
            members: [participants[0]._id, participants[1]._id, participants[2]._id, participants[3]._id],
            inviteCode: "NEURAL1",
        });

        const team2 = await Team.create({
            teamName: "Algorithmic Alliance",
            hackathon: hackathons[0]._id,
            leader: participants[4]._id,
            members: [participants[4]._id, participants[5]._id, participants[6]._id, participants[7]._id],
            inviteCode: "ALGOA2",
        });

        const team3 = await Team.create({
            teamName: "PayFlow Innovators",
            hackathon: hackathons[1]._id,
            leader: participants[8]._id,
            members: [participants[8]._id, participants[9]._id, participants[10]._id, participants[11]._id],
            inviteCode: "PAYFLW3",
        });

        const team4 = await Team.create({
            teamName: "EcoTrackers",
            hackathon: hackathons[3]._id,
            leader: participants[0]._id,
            members: [participants[0]._id, participants[4]._id, participants[8]._id],
            inviteCode: "ECOTRK4",
        });

        const team5 = await Team.create({
            teamName: "ZeroTrust Pioneers",
            hackathon: hackathons[4]._id,
            leader: participants[1]._id,
            members: [participants[1]._id, participants[5]._id, participants[9]._id],
            inviteCode: "ZEROTR5",
        });

        console.log("Created 5 Teams.");

        // 7. Create Registrations
        const reg1 = await Registration.create({
            team: team1._id,
            hackathon: hackathons[0]._id,
            status: "approved",
            registeredBy: participants[0]._id,
        });

        const reg2 = await Registration.create({
            team: team2._id,
            hackathon: hackathons[0]._id,
            status: "approved",
            registeredBy: participants[4]._id,
        });

        const reg3 = await Registration.create({
            team: team3._id,
            hackathon: hackathons[1]._id,
            status: "approved",
            registeredBy: participants[8]._id,
        });

        const reg4 = await Registration.create({
            team: team4._id,
            hackathon: hackathons[3]._id,
            status: "approved",
            registeredBy: participants[0]._id,
        });

        const reg5 = await Registration.create({
            team: team5._id,
            hackathon: hackathons[4]._id,
            status: "pending",
            registeredBy: participants[1]._id,
        });

        console.log("Created 5 Team Registrations.");

        // 8. Create Submissions for Approved Teams
        const sub1 = await Submission.create({
            team: team1._id,
            hackathon: hackathons[0]._id,
            projectName: "AutoAgent AI - Autonomous Coding Assistant",
            problemStatement: "Software developers spend 40% of their time debugging repetitive syntax errors and resolving dependency conflicts.",
            solution: "An autonomous agent powered by LLMs that detects bugs in real-time, writes self-correcting test suites, and auto-fixes pull requests.",
            githubRepo: "https://github.com/example/autoagent-ai",
            liveDemoUrl: "https://autoagent-ai-demo.vercel.app",
            techStack: ["React", "Python", "FastAPI", "OpenAI API", "TailwindCSS"],
            status: "Under Review",
        });

        const sub2 = await Submission.create({
            team: team2._id,
            hackathon: hackathons[0]._id,
            projectName: "VisionRAG - Multi-modal Document Intelligence",
            problemStatement: "Complex medical and financial PDFs with charts and complex diagrams cannot be parsed accurately by traditional OCR text chunking.",
            solution: "VisionRAG utilizes multi-modal embeddings to process chart visuals and structured tables directly into semantic vector indices.",
            githubRepo: "https://github.com/example/vision-rag",
            liveDemoUrl: "https://visionrag.demo.app",
            techStack: ["Next.js", "Python", "LangChain", "Pinecone", "PyTorch"],
            status: "Under Review",
        });

        const sub3 = await Submission.create({
            team: team3._id,
            hackathon: hackathons[1]._id,
            projectName: "CrossPay - Real-Time Instant Settlement",
            problemStatement: "Cross-border business payments take 3 to 5 business days with heavy intermediary bank transaction fees.",
            solution: "CrossPay leverages stablecoin liquidity pools to execute instant, low-fee cross-border payouts with automated invoice compliance.",
            githubRepo: "https://github.com/example/crosspay-fintech",
            liveDemoUrl: "https://crosspay-demo.com",
            techStack: ["Node.js", "React", "MongoDB", "Stripe API", "Solidity"],
            status: "Under Review",
        });

        const sub4 = await Submission.create({
            team: team4._id,
            hackathon: hackathons[3]._id,
            projectName: "GreenLedger - Carbon Emission Supply Chain",
            problemStatement: "Enterprise Scope 3 carbon emission accounting is prone to double-counting and manual Excel reporting errors.",
            solution: "GreenLedger provides automated IoT sensor data ingestion to record verifiable carbon metric logs.",
            githubRepo: "https://github.com/example/greenledger",
            liveDemoUrl: "https://greenledger.climate.org",
            techStack: ["React", "Express", "MongoDB", "Chart.js"],
            status: "Approved",
        });

        console.log("Created 4 Project Submissions.");

        // 9. Create Reviews by Assigned Judges
        // Hackathon 1 judges: Judge 1, Judge 2, Judge 4 (Dr. Alexander Wright, Sarah Jenkins, Priya Sharma)
        const criteriaList = [
            { criterion: "Innovation", marksGiven: 9 },
            { criterion: "Technical Complexity", marksGiven: 8 },
            { criterion: "UI/UX", marksGiven: 9 },
            { criterion: "Functionality", marksGiven: 10 },
        ];

        await Review.create([
            {
                submission: sub1._id,
                judge: judges[0]._id, // Dr. Alexander Wright
                scores: [
                    { criterion: "Innovation", marksGiven: 9 },
                    { criterion: "Technical Complexity", marksGiven: 9 },
                    { criterion: "UI/UX", marksGiven: 8 },
                    { criterion: "Functionality", marksGiven: 10 },
                ],
                totalScore: 36,
                feedback: "Exceptional architecture! The autonomous feedback loop for unit tests is very impressive.",
            },
            {
                submission: sub1._id,
                judge: judges[1]._id, // Sarah Jenkins
                scores: [
                    { criterion: "Innovation", marksGiven: 8 },
                    { criterion: "Technical Complexity", marksGiven: 9 },
                    { criterion: "UI/UX", marksGiven: 9 },
                    { criterion: "Functionality", marksGiven: 9 },
                ],
                totalScore: 35,
                feedback: "Great production readiness and clean UI interface. Very practical real-world usage.",
            },
            {
                submission: sub2._id,
                judge: judges[0]._id, // Dr. Alexander Wright
                scores: [
                    { criterion: "Innovation", marksGiven: 8 },
                    { criterion: "Technical Complexity", marksGiven: 7 },
                    { criterion: "UI/UX", marksGiven: 8 },
                    { criterion: "Functionality", marksGiven: 8 },
                ],
                totalScore: 31,
                feedback: "Good multi-modal parsing concept. Latency could be further optimized.",
            },
            {
                submission: sub3._id,
                judge: judges[1]._id, // Sarah Jenkins
                scores: [
                    { criterion: "Innovation", marksGiven: 9 },
                    { criterion: "Technical Complexity", marksGiven: 9 },
                    { criterion: "UI/UX", marksGiven: 9 },
                    { criterion: "Functionality", marksGiven: 10 },
                ],
                totalScore: 37,
                feedback: "Flawless cross-border settlement demo. Outstanding security considerations.",
            },
        ]);

        console.log("Created Reviews & Calculated Leaderboards.");

        console.log("\n=======================================================");
        console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
        console.log("=======================================================");
        console.log("Default Login Passwords:");
        console.log("  Admin:       admin@gmail.com / admin123");
        console.log("  Organizers:  organizer1@example.com / password123");
        console.log("               organizer2@example.com / password123");
        console.log("               organizer3@example.com / password123");
        console.log("  Judges:      judge1@example.com / password123");
        console.log("               judge2@example.com / password123");
        console.log("               judge3@example.com / password123");
        console.log("  Participant: participant1@example.com / password123");
        console.log("=======================================================\n");

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

seedDatabase();
