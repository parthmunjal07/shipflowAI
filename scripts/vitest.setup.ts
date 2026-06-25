import { beforeEach } from "vitest";
import { truncateDatabase } from "./test-utils";

beforeEach(async () => {
  await truncateDatabase();
});
