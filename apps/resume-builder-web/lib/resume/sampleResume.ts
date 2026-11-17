import type { Resume } from "./types";

/** Starter content from Anthony Lin's resume. Section order is render order. */
export const sampleResume = {
  personal: {
    name: "Anthony Lin",
    tagline: "Prepared for Corona Fire Department",
    phone: "(408) 833-0801",
    email: "anthony.lin.198@gmail.com",
    location: "Eastvale, CA",
    photo:
      "https://media.licdn.com/dms/image/v2/D5603AQGqtRETk2BqNg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1703195261488?e=1795651200&v=beta&t=R9SzFNDNPqbJew4h_I5v5Km1CGMtxaJgs7M-0X522mk",
  },
  sections: [
    {
      type: "summary",
      title: "Professional Summary",
      items: [
        {
          text: "After five years in software engineering, I became an EMT with a goal to build a lifelong career in the fire service. I am committed to putting others before myself and becoming someone my community can always depend on.",
        },
      ],
    },
    {
      type: "certifications",
      title: "Certifications",
      items: [
        {
          name: "National Registry EMT (NREMT)",
          date: "Exp 03/2028",
          bullets: [],
        },
        {
          name: "Ambulance Driver Certificate, CA",
          date: "Exp 04/2028",
          bullets: [],
        },
        {
          name: "CPR/AED (AHA)",
          date: "Exp 04/2028",
          bullets: [],
        },
      ],
    },
    {
      type: "experience",
      title: "Experience",
      items: [
        {
          organization: "Premier Ambulance",
          position: "Emergency Medical Technician",
          location: "Riverside",
          date: "June 2026 - Present",
          bullets: [
            "Delivered compassionate BLS care during interfacility and emergency transports, building patient trust through calm, clear communication.",
            "Supported ALS and CCT transports, operated ambulances Code 3, and performed safe gurney operations and patient transfers.",
            "Completed a 2-week medical standby deployment supporting wildfire operations during Oregon's Hagen Fire.",
          ],
        },
        {
          organization: "Shimmer - YC21",
          position: "Founding Software Engineer",
          location: "Remote",
          date: "February 2024 - March 2026",
          bullets: [
            "First engineering hire at a fast-growing startup building a 1:1 coaching platform, operating in a high-pressure environment with significant ownership over product stability, feature delivery, and technical execution.",
            "Helped scale the platform to over $2M ARR through rapid product development, cross-functional collaboration, and consistent execution in a fast-paced startup environment.",
          ],
        },
        {
          organization: "Beam Benefits - Series E Startup",
          location: "Remote",
          roles: [
            {
              position: "Senior Software Engineer",
              date: "January 2023 - April 2023",
            },
            {
              position: "Software Engineer",
              date: "February 2021 - January 2023",
            },
          ],
          bullets: [
            "Contributed to engineering efforts at a Series E insurance benefits startup focused on modernizing employee dental, vision, and ancillary benefits through technology-driven solutions.",
            "Mentored and onboarded new engineers, helping foster a collaborative, supportive, and high-performing engineering culture.",
          ],
        },
        {
          organization: "City Sports (LA Fitness)",
          position: "Personal Trainer",
          location: "San Jose",
          date: "Summer 2019",
          bullets: [
            "Coached over 30 clients with diverse health backgrounds, through individualized fitness programs focused on strength development, weight loss, and injury recovery.",
            "Built strong rapport through active listening and clear communication, fostering trust and accountability.",
          ],
        },
      ],
    },
    {
      type: "education",
      title: "Education",
      items: [
        {
          institution: "West Coast EMT",
          degree: "EMT-B Certification",
          location: "Riverside",
          date: "Graduation: May 2026",
          bullets: ["Graduated top 5 in cohort"],
        },
        {
          institution: "University of California, Santa Barbara | 3.91 GPA",
          degree: "B.A. in Economics and Accounting",
          location: "Goleta, CA",
          date: "Graduation: Winter 2020",
          bullets: [
            "Dean’s Honors List and Teacher’s Assistant for Economics & Accounting Department",
          ],
        },
      ],
    },
    {
      type: "custom",
      title: "Hobbies and Interests",
      items: [
        {
          bullets: [
            "Marathon and triathlon training",
            "Recreational basketball (former hs point guard)",
            "Building technical programming projects",
            "Hikes and meditation",
          ],
        },
      ],
    },
  ],
} satisfies Resume;

export const sampleResumeJson = JSON.stringify(sampleResume, null, 2);
