import * as Prisma from "@prisma/client";
console.log(Object.keys(Prisma).filter(k => k.toLowerCase().includes("prd")));
