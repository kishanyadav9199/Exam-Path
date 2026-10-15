import mongoose from "mongoose";
import { config } from "./config/env.js";
import { Exam, Part } from "./models/index.js";

const catalog = [
  {
    title: "RRB NTPC",
    slug: "rrb-ntpc",
    category: "Railway",
    price: 399,
    description: "Railway NTPC practice tests and exam-wise preparation.",
    parts: [
      "General Awareness",
      "Mathematics",
      "General Intelligence & Reasoning",
    ],
  },
  {
    title: "Railway Group D",
    slug: "railway-group-d",
    category: "Railway",
    price: 299,
    description: "Railway Group D practice series.",
    parts: ["General Science", "Mathematics", "Reasoning", "General Awareness"],
  },
  {
    title: "RRB ALP",
    slug: "rrb-alp",
    category: "Railway",
    price: 349,
    description: "Assistant Loco Pilot practice series.",
    parts: ["Mathematics", "Reasoning", "General Science", "General Awareness"],
  },
  {
    title: "RRB Technician",
    slug: "rrb-technician",
    category: "Railway",
    price: 299,
    description: "Railway Technician exam practice.",
    parts: ["Mathematics", "Reasoning", "General Science", "General Awareness"],
  },
  {
    title: "SSC CGL",
    slug: "ssc-cgl",
    category: "SSC",
    price: 499,
    description: "SSC CGL tier-wise competitive practice tests.",
    parts: [
      "General Intelligence & Reasoning",
      "General Awareness",
      "Quantitative Aptitude",
      "English Comprehension",
    ],
  },
  {
    title: "SSC CHSL",
    slug: "ssc-chsl",
    category: "SSC",
    price: 399,
    description: "SSC CHSL exam practice series.",
    parts: [
      "Reasoning",
      "General Awareness",
      "Quantitative Aptitude",
      "English Language",
    ],
  },
  {
    title: "SSC MTS",
    slug: "ssc-mts",
    category: "SSC",
    price: 299,
    description: "SSC MTS practice tests.",
    parts: ["Numerical Ability", "Reasoning", "General Awareness", "English"],
  },
  {
    title: "SSC GD Constable",
    slug: "ssc-gd",
    category: "SSC",
    price: 349,
    description: "SSC GD Constable preparation and mock tests.",
    parts: ["Reasoning", "General Knowledge", "Mathematics", "Hindi & English"],
  },
  {
    title: "SSC CPO",
    slug: "ssc-cpo",
    category: "SSC",
    price: 399,
    description: "SSC CPO exam preparation series.",
    parts: [
      "Reasoning",
      "General Awareness",
      "Quantitative Aptitude",
      "English",
    ],
  },
  {
    title: "IBPS PO",
    slug: "ibps-po",
    category: "Banking",
    price: 499,
    description: "Bank PO prelims and mains practice.",
    parts: [
      "Reasoning Ability",
      "Quantitative Aptitude",
      "English Language",
      "Banking Awareness",
    ],
  },
  {
    title: "IBPS Clerk",
    slug: "ibps-clerk",
    category: "Banking",
    price: 399,
    description: "Bank clerk practice series.",
    parts: [
      "Reasoning",
      "Numerical Ability",
      "English Language",
      "General Awareness",
    ],
  },
  {
    title: "SBI PO",
    slug: "sbi-po",
    category: "Banking",
    price: 499,
    description: "SBI PO practice tests.",
    parts: [
      "Reasoning Ability",
      "Quantitative Aptitude",
      "English Language",
      "Banking Awareness",
    ],
  },
  {
    title: "CTET",
    slug: "ctet",
    category: "Teaching",
    price: 399,
    description: "CTET Paper I and II preparation.",
    parts: [
      "Child Development & Pedagogy",
      "Language I & II",
      "Mathematics",
      "Environmental Studies / Science",
    ],
  },
  {
    title: "DSSSB TGT Computer Science",
    slug: "dsssb-tgt-computer",
    category: "Teaching",
    price: 449,
    description: "DSSSB TGT Computer Science test series.",
    parts: ["Hindi & English", "GK & GS", "Computer"],
  },
  {
    title: "Bihar Police Constable",
    slug: "bihar-police-constable",
    category: "Police",
    price: 299,
    description: "Bihar Police Constable practice series.",
    parts: ["Hindi", "General Knowledge", "Mathematics", "Science"],
  },
  {
    title: "UP Police Constable",
    slug: "up-police-constable",
    category: "Police",
    price: 299,
    description: "UP Police Constable practice series.",
    parts: ["General Knowledge", "Hindi", "Numerical Ability", "Reasoning"],
  },
  {
    title: "MP Patwari",
    slug: "mp-patwari",
    category: "State Exams",
    price: 349,
    description: "MP Patwari preparation and mock tests.",
    parts: ["General Knowledge", "Hindi", "Mathematics", "Computer"],
  },
  {
    title: "State PSC General Studies",
    slug: "state-psc-gs",
    category: "State Exams",
    price: 499,
    description: "General studies practice for state PSC examinations.",
    parts: [
      "History & Culture",
      "Geography",
      "Polity",
      "Economy & Current Affairs",
    ],
  },
];

try {
  await mongoose.connect(config.mongoUri);
  let created = 0;
  for (const item of catalog) {
    let exam = await Exam.findOne({ slug: item.slug });
    if (!exam) {
      exam = await Exam.create({
        title: item.title,
        slug: item.slug,
        category: item.category,
        pricePaise: item.price * 100,
        durationDays: 180,
        description: item.description,
      });
      created++;
    } else {
      let changed = false;
      if (!exam.category || exam.category === "Other") {
        exam.category = item.category;
        changed = true;
      }
      if (!exam.pricePaise) {
        exam.pricePaise = item.price * 100;
        changed = true;
      }
      if (!exam.durationDays) {
        exam.durationDays = 180;
        changed = true;
      }
      if (!exam.description && item.description) {
        exam.description = item.description;
        changed = true;
      }
      if (changed) await exam.save();
    }
    if ((await Part.countDocuments({ exam: exam._id })) === 0) {
      await Part.insertMany(
        item.parts.map((title, order) => ({ exam: exam._id, title, order })),
      );
    }
  }
  console.log(
    `Catalog ready. Created ${created} new series; existing series were preserved.`,
  );
} catch (error) {
  console.error("Catalog seeding failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
