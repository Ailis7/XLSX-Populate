import pg from "pg";
const { Client } = pg;
// пароль от постгреса, просто буква "p" английская

const db = new Client({
  user: "postgres",
  host: "localhost",
  database: "command_db",
  password: "p",
  port: 5432,
});

db.connect();

const addCommandToDB = async (sportlvlName, cubName) => {
  return await new Promise((resolve) => {
    db.query(
      `SELECT * FROM sportLevelCommand slc WHERE slc.commandName = '${sportlvlName}'`,
      (err, firstData) => {
        if (err) throw new Error(err);
        if (firstData.rows.length === 0) {
          db.query(
            `INSERT INTO sportLevelCommand (commandName) VALUES ('${sportlvlName}')`,
            (err2) => {
              if (err2) throw new Error(err2);
              db.query(
                `SELECT * FROM sportLevelCommand slc WHERE slc.commandName = '${sportlvlName}'`,
                (err3, secondData) => {
                  if (err3) throw new Error(err3);
                  const { id } = secondData.rows[0];
                  db.query(
                    `INSERT INTO cubCommands (commandName, sportLevelCommandId) VALUES ('${cubName}', '${id}')`,
                    (err4) => {
                      if (err4) throw new Error(err4);
                      resolve("success");
                    }
                  );
                }
              );
            }
          );
        } else {
          const { id } = firstData.rows[0];
          db.query(
            `SELECT * from sportLevelCommand slc
            INNER JOIN cubCommands cc ON cc.sportLevelCommandId = slc.id
            WHERE slc.commandName = '${sportlvlName}' AND cc.commandName = '${cubName}'`,
            (err5, data) => {
              if (err5) throw new Error(err5);
              if (data.rows.length > 0) {
                resolve("error");
              } else {
                db.query(
                  `INSERT INTO cubCommands (commandName, sportLevelCommandId) VALUES ('${cubName}', '${id}')`,
                  (err6) => {
                    if (err6) throw new Error(err6);
                    resolve("success");
                  }
                );
              }
            }
          );
        }
      }
    );
  });
  // db.query(
  //   `INSERT memory_table ("sportLevel_command", cub_command) VALUES ('${sportlvlName}', '{${arr}}')`,
  //   (err, data) => {
  //     if (err) throw new Error(err);
  //     console.log(data);
  //     db.end();
  //   }
  // );
};

const getCommandArrFromDB = async (commandName) => {
  commandName = commandName.replace(/'/g, " ");
  return await new Promise((resolve) => {
    db.query(
      `SELECT * FROM sportLevelCommand slc WHERE slc.commandName = '${commandName}'`,
      (err, slvlData) => {
        if (err) {
          throw new Error("Ошибка от БАЗЫЫЫ", err);
        }
        if (slvlData.rows.length === 0) {
          resolve(null);
        } else {
          db.query(
            `SELECT * from sportLevelCommand slc
            INNER JOIN cubCommands cc ON cc.sportLevelCommandId = slc.id
            WHERE slc.commandName = '${commandName}'`,
            (err5, data) => {
              if (err5) throw new Error(err5);
              resolve(data.rows);
            }
          );
        }
      }
    );
  });
  // db.query(
  //   `SELECT cub_command FROM memory_table WHERE "sportLevel_command" = '${commandName}'`,
  //   (err, data) => {
  //     if (err) throw new Error(err);
  //     console.log(data);
  //     db.end();
  //   }
  // );
};

export default db;
export { addCommandToDB, getCommandArrFromDB };
