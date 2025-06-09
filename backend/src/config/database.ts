import { PrismaClient } from "@prisma/client";

declare global{
    var __prisma: PrismaClient | undefined;
}

let prisma : PrismaClient;
if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient();
} else {
    if (!global.__prisma) {
        global.__prisma = new PrismaClient({
            // log databse related events
            // log: ['query', 'info', 'warn', 'error']
        });
    }
    // if __prisma exists then assign it to prisma
    prisma = global.__prisma;
}

//graceful shutdown to close the database connection 
const gracefulShutdown = async () => {

    console.log("Garcefully shutting down Prisma ...");
    await prisma.$disconnect();
    console.log("PRISMA DISCONNECT");
    process.exit(0);
};

// handle process termination signals
process.on('SIGINT', gracefulShutdown); //single interrupt ie ctrl+c
process.on('SIGTERM', gracefulShutdown) //termination signal from the system

export default prisma;