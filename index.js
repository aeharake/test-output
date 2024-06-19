const { execSync, exec } = require("child_process");
const fs = require("fs");

let only = [];
let skip = [];

const conditions = {
  isDirectory: (folder) => fs.statSync(TEST_DIR + "/" + folder).isDirectory(),
  only: (folder) => only.length === 0 || only.includes(folder),
  skip: (folder) => !skip.includes(folder),
  onlyStartingWithFolder: (folder) => folder.startsWith("folder"),
};

// Test path
const TEST_DIR = "./dir";
// Output .txt files
const OUTPUT_DIR = "./output";

const listFolders = () =>
  fs
    .readdirSync(TEST_DIR)
    .filter(
      (f) =>
        conditions.isDirectory(f) &&
        conditions.onlyStartingWithFolder(f) &&
        conditions.only(f) &&
        conditions.skip(f)
    );

const CMD = `echo %s`;

const execPromise = (folder) => {
  return new Promise((resolve, reject) => {
    const command =
      CMD.replace("%s", folder) + ` > ${OUTPUT_DIR}/${folder}.txt`;
    exec(command, { stdio: "inherit" }, (err, stdout, stderr) => {
      if (err) reject(err);
      if (stderr) reject(stderr);
      resolve(folder);
    });
  });
};

function it(title, callback) {
  try {
    callback();
    console.log(`✅ ${title}`);
  } catch (error) {
    console.error(`❌ ${title}`);
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`${actual} is not equal to ${expected}`);
      }
    },
  };
}

function runtests() {
  it("should return all the folders starting with folder when only and skip list are empty", async () => {
    skip = [];
    only = [];
    const promises = await Promise.all(
      listFolders().map((folder) => execPromise(folder))
    );
    expect(promises.length).toBe(3);
  });
  it("should return only the folders that are not in the skip list when only list is empty", async () => {
    skip = ["folder1"];
    only = [];
    const promises = await Promise.all(
      listFolders().map((folder) => execPromise(folder))
    );
    expect(promises.length).toBe(2);
  });
  it("should return only the folders that are in the only list when skip is not empty", async () => {
    only = ["folder1"];
    skip = ["folder2"];
    const promises = await Promise.all(
      listFolders().map((folder) => execPromise(folder))
    );
    expect(promises.length).toBe(only.length);
  });
  it("should return only the folders that are in the only list when skip is empty", async () => {
    only = ["folder1"];
    skip = [];
    const promises = await Promise.all(
      listFolders().map((folder) => execPromise(folder))
    );
    expect(promises.length).toBe(only.length);
  });
}

// uncomment to run tests
// runtests();
function run() {
  const promises = listFolders().map((folder) => execPromise(folder));
  return Promise.all(promises);
}
run().then(() => console.log("done"));