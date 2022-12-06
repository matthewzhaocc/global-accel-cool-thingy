import express from "express";

const app = express();

app.get("/", async (req, res) => {
  res
    .contentType("html")
    .send(
      `<h1>Welcome to this cool multi regional application, your current region is ${
        process.env.APP_REGION || "region-not-detected"
      }</h1>`
    );
});

app.listen(process.env.PORT || 3000);
