import { inngest } from "@repo/inngest";
async function test() {
  const start = Date.now();
  try {
    await inngest.send({
      name: "the-wharf/feature-request.created",
      data: {
        featureRequestId: "123",
        projectId: "456",
        title: "Test",
        content: "Test",
      }
    });
    console.log("Success in", Date.now() - start, "ms");
  } catch (e) {
    console.log("Failed in", Date.now() - start, "ms", e.message);
  }
}
test();
