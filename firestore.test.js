const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const { test, before, after, beforeEach } = require("node:test");
const fs = require("node:fs");

let testEnv;
const PROJECT_ID = process.env.GCP_PROJECT || "demo-no-project";
const ALICE_UID = "alice_123";
const BOB_UID = "bob_456";

const [emulatorHost, emulatorPortStr] = (
  process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8085"
).split(":");
const emulatorPort = parseInt(emulatorPortStr, 10);

function pastTimestamp() {
  return new Date(Date.now() - 2000);
}

function validProjectPayload(uid) {
  const ts = pastTimestamp();
  return {
    userId: uid,
    title: "SaaS Analytics",
    description: "Interactive metrics dashboard",
    initialPrompt: "Build a SaaS analytics dashboard",
    templateType: "dashboard",
    isStarred: false,
    version: 1,
    htmlCode: "<div><h1>Dashboard</h1></div>",
    cssCode: "body { font-family: sans-serif; }",
    jsCode: "console.log('ready');",
    createdAt: ts,
    updatedAt: ts,
  };
}

before(async () => {
  const rules = fs.readFileSync("./firestore.rules", "utf8");
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: emulatorHost,
      port: emulatorPort,
    },
  });
});

after(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
});

test("Unauthenticated user cannot list or create projects", async () => {
  const unauthDb = testEnv.unauthenticatedContext().firestore();
  await assertFails(
    unauthDb.collection("users").doc(ALICE_UID).collection("projects").get()
  );
  await assertFails(
    unauthDb
      .collection("users")
      .doc(ALICE_UID)
      .collection("projects")
      .doc("proj_1")
      .set({ title: "Hack" })
  );
});

test("Owner can create, read, list, update, and delete own project", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  const docRef = aliceDb
    .collection("users")
    .doc(ALICE_UID)
    .collection("projects")
    .doc("proj_1");

  await assertSucceeds(docRef.set(validProjectPayload(ALICE_UID)));
  await assertSucceeds(docRef.get());
  await assertSucceeds(
    aliceDb.collection("users").doc(ALICE_UID).collection("projects").get()
  );

  await assertSucceeds(
    docRef.update({
      isStarred: true,
      updatedAt: pastTimestamp(),
    })
  );

  await assertSucceeds(
    docRef.update({
      version: 2,
      htmlCode: "<div><h1>Dashboard v2</h1></div>",
      updatedAt: pastTimestamp(),
    })
  );

  await assertSucceeds(docRef.delete());
});

test("Cross-user access is denied", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  await assertSucceeds(
    aliceDb
      .collection("users")
      .doc(ALICE_UID)
      .collection("projects")
      .doc("proj_alice")
      .set(validProjectPayload(ALICE_UID))
  );

  const bobDb = testEnv.authenticatedContext(BOB_UID).firestore();
  await assertFails(
    bobDb
      .collection("users")
      .doc(ALICE_UID)
      .collection("projects")
      .doc("proj_alice")
      .get()
  );
  await assertFails(
    bobDb.collection("users").doc(ALICE_UID).collection("projects").get()
  );
  await assertFails(
    bobDb
      .collection("users")
      .doc(ALICE_UID)
      .collection("projects")
      .doc("proj_alice")
      .update({ isStarred: true, updatedAt: pastTimestamp() })
  );
});

test("Shadow update with ghost field or invalid templateType fails", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  const docRef = aliceDb
    .collection("users")
    .doc(ALICE_UID)
    .collection("projects")
    .doc("proj_shadow");

  await assertSucceeds(docRef.set(validProjectPayload(ALICE_UID)));

  await assertFails(
    docRef.update({
      isStarred: true,
      isAdmin: true,
      updatedAt: pastTimestamp(),
    })
  );

  await assertFails(
    docRef.update({
      templateType: "invalid_type",
      updatedAt: pastTimestamp(),
    })
  );
});

test("Messages require existing parent project and reject updates", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  const projectRef = aliceDb
    .collection("users")
    .doc(ALICE_UID)
    .collection("projects")
    .doc("proj_chat");

  const orphanMsgRef = projectRef.collection("messages").doc("msg_orphan");
  await assertFails(
    orphanMsgRef.set({
      userId: ALICE_UID,
      projectId: "proj_chat",
      role: "user",
      content: "Hello",
      filesChanged: [],
      versionTag: 1,
      createdAt: pastTimestamp(),
    })
  );

  await assertSucceeds(projectRef.set(validProjectPayload(ALICE_UID)));

  const msgRef = projectRef.collection("messages").doc("msg_1");
  await assertSucceeds(
    msgRef.set({
      userId: ALICE_UID,
      projectId: "proj_chat",
      role: "assistant",
      content: "Built initial dashboard.",
      filesChanged: ["index.html", "styles.css"],
      versionTag: 1,
      createdAt: pastTimestamp(),
    })
  );

  await assertFails(msgRef.update({ content: "Tampered" }));
});
