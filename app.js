const express = require("express");
const bodyParser = require("body-parser");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json()); // парсер повинен використовуватись раніше за методи пост, які розміщені нижче

app.use("/api/places", placesRoutes); // використовуємо middleware, який написан в places-routes.js

app.use("/api/users", usersRoutes);

//Бед реквест за замовченням: цей реквест буде працювати, якщо не було отримано будь якого респонсу з попередніх роутів
app.use((req, res, next) => {
  const error = new HttpError("Couldnt find this route", 404);
  throw error; // не забуваємо робити throw або return.
});

app.use((error, req, res, next) => {
  // при створенні middleware з чотирьма параметрами, експрес розпіняє його як спецальну функцію - error handler
  if (res.headerSent) {
    // res.headerSent - перевіряє, чи відправили ми вже якись response на запит
    return next(error); //якщо вже відправили, то передаємо запит далі і прериваємо дію цього middleware
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown erroe occured!" });
});

app.listen(5000);

// Всі реквести, як йдуть через браузерну строку вводу - це реквести ГЕТ по дефолту
