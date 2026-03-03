const fetch = require("node-fetch");

const US = "http://34.16.46.22:8080";
const EUR = "http://34.38.24.54:8080";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function measureLatency(baseUrl, endpoint, method = "GET", body = null) {
  const start = Date.now();

  if (method === "POST") {
    await fetch(baseUrl + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } else {
    await fetch(baseUrl + endpoint);
  }

  const end = Date.now();
  return end - start;
}

async function partA() {
  console.log("Running Part IV-A (Latency Test)...");

  let usRegisterTimes = [];
  let usListTimes = [];
  let eurRegisterTimes = [];
  let eurListTimes = [];

  for (let i = 0; i < 10; i++) {
    let username = "latencyUser" + Date.now() + i;

    usRegisterTimes.push(
      await measureLatency(US, "/register", "POST", { username })
    );

    usListTimes.push(
      await measureLatency(US, "/list")
    );

    eurRegisterTimes.push(
      await measureLatency(EUR, "/register", "POST", { username: username + "_eu" })
    );

    eurListTimes.push(
      await measureLatency(EUR, "/list")
    );

    await sleep(100);
  }

  function avg(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  console.log("US Register Average (ms):", avg(usRegisterTimes));
  console.log("US List Average (ms):", avg(usListTimes));
  console.log("Europe Register Average (ms):", avg(eurRegisterTimes));
  console.log("Europe List Average (ms):", avg(eurListTimes));
}

async function partB() {
  console.log("\nRunning Part IV-B (Eventual Consistency Test)...");

  let misses = 0;

  for (let i = 0; i < 100; i++) {
    let username = "consistencyUser" + Date.now() + i;

    await fetch(US + "/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });

    let response = await fetch(EUR + "/list");
    let data = await response.json();

    if (!data.users.includes(username)) {
      misses++;
    }

    await sleep(50);
  }

  console.log("Misses out of 100:", misses);
}

async function main() {
  await partA();
  await partB();
}

main();