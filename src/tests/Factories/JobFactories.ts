import { IJob } from "@/interfaces/IJob";

export const makeJob = (override?: Partial<IJob>) => {
  return {
    title: "Software Engineer",
    description:
      "A generic job description is a standardized document outlining the core duties, responsibilities, and qualifications for a, functional, or common role, used to ensure consistency in hiring, evaluation, and compensation across an organization. These templates typically include a job title, purpose, key responsibilities, requirements, and reporting structure. ",
    category: "Computer science",
    skillsRequired: ["React", "Node", "express", "mongo"],
    budget: 2400,
    deadline: new Date("2026 / 6 / 25"),

    ...override
  };
};
