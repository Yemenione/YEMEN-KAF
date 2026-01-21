import { prisma } from "../lib/prisma";

async function verify() {
    const story = await prisma.page.findUnique({ where: { slug: "our-story" } });
    const farms = await prisma.page.findUnique({ where: { slug: "the-farms" } });

    console.log("Our Story Structured:", story?.structured_content ? "PRESENT" : "MISSING");
    if (story?.structured_content) console.log(JSON.stringify(story.structured_content).substring(0, 100) + "...");

    console.log("The Farms Structured:", farms?.structured_content ? "PRESENT" : "MISSING");
    if (farms?.structured_content) console.log(JSON.stringify(farms.structured_content).substring(0, 100) + "...");
}

verify();
