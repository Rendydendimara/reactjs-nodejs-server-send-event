const express = require("express");
const sseExpress = require('sse-express');
const cors = require("cors");
const app = express();

app.use(cors());

const PORT = 8000;
const stocks = [
  { id: 1, ticker: "AAPL", price: 497.48 },
  { id: 2, ticker: "MSFT", price: 213.02 },
  { id: 3, ticker: "AMZN", price: 3284.72 },
];

function getRandomStock() {
  return Math.round(Math.random() * (2 - 0) + 0);

}
function getRandomPrice() {
  return Math.random() * (5000 - 20) + 20;
}

app.get("/stocks", function (req, res) {
  res.status(200).json({ success: true, data: stocks });
});

app.get("/realtime-price", sseExpress, function (req, res) {
  // res.writeHead(200, {
  //   "Connection": "keep-alive",
  //   "Content-Type": "text/event-stream", // Server-Sent Events must be of type text/event-stream
  //   "Cache-Control": "no-cache",
  // });

  setInterval(() => {
    res.sse('update', {
      data: JSON.stringify({ ...stocks[getRandomStock()], price: getRandomPrice() })
    }
    );
  }, 2000);

});


app.listen(PORT, function () {
  console.log(`Server is running on ${PORT}`);
});
