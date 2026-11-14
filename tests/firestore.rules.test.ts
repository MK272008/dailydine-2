import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { readFile } from "node:fs/promises";
import { beforeAll, afterAll, describe, it } from "vitest";

let testEnvironment: RulesTestEnvironment;

beforeAll(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId: "daily-dine-f511e",
    firestore: {
      rules: await readFile("firestore.rules", "utf8"),
    },
  });
});

afterAll(async () => {
  await testEnvironment?.cleanup();
});

describe("Firestore authorization rules", () => {
  it("allows a signed-in user to create their own profile", async () => {
    const context = testEnvironment.authenticatedContext("user-1");
    await assertSucceeds(
      setDoc(doc(context.firestore(), "users/user-1"), {
        id: "user-1",
        role: "OWNER",
        displayName: "Owner",
      }),
    );
  });

  it("does not allow a user to read another user's profile", async () => {
    const context = testEnvironment.authenticatedContext("user-1");
    await testEnvironment.withSecurityRulesDisabled(async (adminContext) => {
      await setDoc(doc(adminContext.firestore(), "users/user-2"), {
        id: "user-2",
        role: "OWNER",
        displayName: "Other",
      });
    });

    await assertFails(getDoc(doc(context.firestore(), "users/user-2")));
  });
});
