const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "db.json");

// read on every call so changes written by json-server show up without restarting
function readDb() {
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

// editing goes through json-server on localhost:5000, which only exists locally
const canEdit = !process.env.VERCEL;

function requireEditable(req, res, next) {
  if (!canEdit) {
    return res.status(403).send("編輯功能僅限本機");
  }
  next();
}

module.exports = {
  readDb,
  canEdit,
  requireEditable,
};
