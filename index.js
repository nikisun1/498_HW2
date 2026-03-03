const { Datastore } = require("@google-cloud/datastore");
const express = require("express");

const app = express();
const datastore = new Datastore();

app.use(express.json());

// helper
async function clearAll() {
  const query = datastore.createQuery("User");
  const [users] = await datastore.runQuery(query);
  const keys = users.map((u) => u[datastore.KEY]);
  if (keys.length > 0) {
    await datastore.delete(keys);
  }
}

// greeting
app.get("/greeting", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

// register 
app.post("/register", async (req, res) => {
  const username = req.body.username;

  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  const userKey = datastore.key(["User", username]);

  await datastore.save({
    key: userKey,
    data: { username: username }
  });

  res.status(200).json({ message: "User registered" });
});

// list 
app.get("/list", async (req, res) => {
  const query = datastore.createQuery("User");
  const [users] = await datastore.runQuery(query);

  const usernames = users.map((u) => u.username);

  res.json({ users: usernames });
});

// clear
app.post("/clear", async (req, res) => {
  await clearAll();
  res.json({ message: "Cleared" });
});

app.get("/clear", async (req, res) => {
  await clearAll();
  res.json({ message: "Cleared" });
});

app.listen(8080, "0.0.0.0", () => {
  console.log("Server running on port 8080");
});