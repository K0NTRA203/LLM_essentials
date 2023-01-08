const http = require('http');
const sqlite3 = require('sqlite3').verbose();

const hostname = '127.0.0.1';
const port = 3001;

let results = null;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');

  // Open a connection to the database
  const db = new sqlite3.Database('database.db');

  // Query the database for new entries
  function queryDB(db, res) {
    db.all("SELECT * FROM chat_messages", (err, rows) => {
      if (err) {
        console.error(err.message);
      } else {
        // Store the results in a global variable
        results = JSON.stringify(rows);
      }
    });
  }
  function handlePostRequest(req, res) {
      // Extract the conversation_id, parent_message_id, and user_prompt from the request body
      const { conversation_id, parent_message_id, user_prompt } = req.body;

      // Open a connection to the database
      const db = new sqlite3.Database('database.db');

      // Insert the new chat message into the database
      const insertSql = 'INSERT INTO chat_messages (conversation_id, parent_message_id, user_prompt) VALUES (?, ?, ?)';
      db.run(insertSql, [conversation_id, parent_message_id, user_prompt], (err) => {
        if (err) {
          console.error(err.message);
          res.sendStatus(500);
        } else {
          res.sendStatus(200);
        }
      });
    }

  if (req.method === 'GET') {
      queryDB(db,res);
  } else if (req.method === 'POST') {
      handlePostRequest(req,res)
  };
  queryDB(db,res);
  // Send the stored results to the client every half a second
  setTimeout(() => {
    res.end(results);
  }, 500);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});